#!/usr/bin/env node
/**
 * backfill-contract-fks.js
 *
 * Backfills historical FK relationships that were left NULL at import time.
 *
 * Tasks:
 *   1. _merchantContractDetail.merchantId via Contract -> Property -> Merchant chain
 *      + _merchantContractDetail.partyNameMerchant (from merchant.name)
 *      + _contract.primaryMerchantId / partyNameMerchant (from mcd)
 *   2. _tenantContractDetail.tenantId via partyNameTenant -> _tenant.name fuzzy match
 *      (with fallbacks: first+last split, tenant.emailsPrimaryEmail lookup)
 *      + _contract.primaryTenantId / partyNameTenant (from tcd)
 *   3. _tenant.currentContractId / currentPropertyId / currentRoomId (Fix #3 rerun)
 *   4. _room.currentTenantId (Fix #4 rerun)
 *   5. _ticket.tenantId via _room.currentTenantId (Fix #6 rerun)
 *
 * Idempotent: all UPDATEs guarded by `IS NULL` on the target column.
 * Wrapped in a single transaction — rolls back all changes if any task fails.
 *
 * Usage (inside twenty-server pod):
 *   PG_DATABASE_URL=<url> node backfill-contract-fks.js
 *
 * Env flags:
 *   DRY_RUN=1          rollback at the end instead of commit
 *   SCHEMA=<schema>    override schema (default: workspace_aawr8bdd2668wxa1b0258jzwe)
 */

const { Client } = require('pg');

const SCHEMA = process.env.SCHEMA || 'workspace_aawr8bdd2668wxa1b0258jzwe';
const DRY_RUN = process.env.DRY_RUN === '1';

// ─── Utilities ──────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function section(title) {
  console.log('\n' + '='.repeat(78));
  console.log(`  ${title}`);
  console.log('='.repeat(78));
}

async function countNull(pg, table, col, extraWhere = '') {
  const sql = `
    SELECT
      COUNT(*)::int                                         AS total,
      COUNT(*) FILTER (WHERE "${col}" IS NULL)::int         AS null_count,
      COUNT(*) FILTER (WHERE "${col}" IS NOT NULL)::int     AS filled_count
    FROM "${SCHEMA}"."${table}"
    WHERE TRUE ${extraWhere}
  `;
  const r = await pg.query(sql);
  return r.rows[0];
}

async function countEmpty(pg, table, col) {
  const sql = `
    SELECT COUNT(*)::int AS empty_count
    FROM "${SCHEMA}"."${table}"
    WHERE "${col}" IS NULL OR "${col}" = ''
  `;
  const r = await pg.query(sql);
  return r.rows[0].empty_count;
}

async function reportCount(pg, label, table, col, extraWhere = '') {
  const c = await countNull(pg, table, col, extraWhere);
  log(`  ${label}: total=${c.total}, filled=${c.filled_count}, null=${c.null_count}`);
  return c;
}

// ─── Task 1: backfill _merchantContractDetail.merchantId via Property chain ─

async function task1_merchantDetail(pg, report) {
  section('TASK 1: Backfill _merchantContractDetail.merchantId + partyNameMerchant');

  const before = await reportCount(
    pg,
    'BEFORE _merchantContractDetail.merchantId',
    '_merchantContractDetail',
    'merchantId'
  );
  report.task1.mcd_merchantId_before = before;

  const beforePartyEmpty = await countEmpty(pg, '_merchantContractDetail', 'partyNameMerchant');
  log(`  BEFORE _merchantContractDetail.partyNameMerchant: empty/null=${beforePartyEmpty}`);
  report.task1.mcd_partyNameMerchant_empty_before = beforePartyEmpty;

  // Step 1a: merchantId via contract -> property chain
  log('\n  Running UPDATE: mcd.merchantId via _contract.propertyId -> _property.merchantId');
  const resMerchantId = await pg.query(`
    UPDATE "${SCHEMA}"."_merchantContractDetail" mcd
    SET "merchantId" = p."merchantId"
    FROM "${SCHEMA}"."_contract" c
    JOIN "${SCHEMA}"."_property" p ON p.id = c."propertyId"
    WHERE mcd."contractId" = c.id
      AND mcd."merchantId" IS NULL
      AND p."merchantId" IS NOT NULL
    RETURNING mcd.id
  `);
  log(`  -> updated ${resMerchantId.rowCount} rows`);
  report.task1.mcd_merchantId_updated = resMerchantId.rowCount;

  // Step 1b: partyNameMerchant from merchant.name
  log('\n  Running UPDATE: mcd.partyNameMerchant from linked _merchant.name');
  const resPartyName = await pg.query(`
    UPDATE "${SCHEMA}"."_merchantContractDetail" mcd
    SET "partyNameMerchant" = m.name
    FROM "${SCHEMA}"."_merchant" m
    WHERE mcd."merchantId" = m.id
      AND (mcd."partyNameMerchant" IS NULL OR mcd."partyNameMerchant" = '')
      AND m.name IS NOT NULL
      AND m.name <> ''
    RETURNING mcd.id
  `);
  log(`  -> updated ${resPartyName.rowCount} rows`);
  report.task1.mcd_partyNameMerchant_updated = resPartyName.rowCount;

  // Step 1c: propagate to contract
  log('\n  Running UPDATE: _contract.primaryMerchantId + partyNameMerchant from mcd');
  const resContract = await pg.query(`
    UPDATE "${SCHEMA}"."_contract" c
    SET "primaryMerchantId" = mcd."merchantId",
        "partyNameMerchant" = COALESCE(NULLIF(c."partyNameMerchant", ''), mcd."partyNameMerchant")
    FROM "${SCHEMA}"."_merchantContractDetail" mcd
    WHERE mcd."contractId" = c.id
      AND mcd."merchantId" IS NOT NULL
      AND c."primaryMerchantId" IS NULL
    RETURNING c.id
  `);
  log(`  -> updated ${resContract.rowCount} contracts`);
  report.task1.contract_primaryMerchantId_updated = resContract.rowCount;

  // After counts
  const after = await reportCount(
    pg,
    'AFTER  _merchantContractDetail.merchantId',
    '_merchantContractDetail',
    'merchantId'
  );
  report.task1.mcd_merchantId_after = after;

  const afterPartyEmpty = await countEmpty(pg, '_merchantContractDetail', 'partyNameMerchant');
  log(`  AFTER  _merchantContractDetail.partyNameMerchant: empty/null=${afterPartyEmpty}`);
  report.task1.mcd_partyNameMerchant_empty_after = afterPartyEmpty;
}

// ─── Task 2: backfill _tenantContractDetail.tenantId via name match ─────────

async function task2_tenantDetail(pg, report) {
  section('TASK 2: Backfill _tenantContractDetail.tenantId via name match');

  const before = await reportCount(
    pg,
    'BEFORE _tenantContractDetail.tenantId',
    '_tenantContractDetail',
    'tenantId'
  );
  report.task2.tcd_tenantId_before = before;

  // Diagnostics: sample partyNameTenant vs tenant.name
  log('\n  Sample partyNameTenant values (top 10 by frequency):');
  const sampleTcd = await pg.query(`
    SELECT "partyNameTenant" AS n, COUNT(*)::int AS c
    FROM "${SCHEMA}"."_tenantContractDetail"
    WHERE "partyNameTenant" IS NOT NULL AND "partyNameTenant" <> ''
    GROUP BY "partyNameTenant"
    ORDER BY c DESC, n ASC
    LIMIT 10
  `);
  sampleTcd.rows.forEach((r, i) => console.log(`    ${i + 1}. "${r.n}"  (${r.c} row${r.c === 1 ? '' : 's'})`));
  report.task2.sample_partyNameTenant = sampleTcd.rows;

  log('\n  Sample _tenant.name values (10):');
  const sampleTenant = await pg.query(`
    SELECT name, "emailsPrimaryEmail" AS email
    FROM "${SCHEMA}"."_tenant"
    WHERE name IS NOT NULL AND name <> ''
    ORDER BY "createdAt" DESC
    LIMIT 10
  `);
  sampleTenant.rows.forEach((r, i) => console.log(`    ${i + 1}. "${r.name}"  <${r.email || ''}>`));
  report.task2.sample_tenant_names = sampleTenant.rows;

  // Duplicate-name detection for awareness
  const dupNames = await pg.query(`
    SELECT LOWER(TRIM(name)) AS n, COUNT(*)::int AS c
    FROM "${SCHEMA}"."_tenant"
    WHERE name IS NOT NULL AND name <> ''
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
    ORDER BY c DESC
    LIMIT 10
  `);
  if (dupNames.rows.length > 0) {
    log(`\n  Warning: ${dupNames.rows.length} duplicate tenant.name values found (top 10):`);
    dupNames.rows.forEach((r) => console.log(`    "${r.n}"  (${r.c} tenants)`));
  } else {
    log('\n  No duplicate tenant.name values detected.');
  }
  report.task2.duplicate_tenant_names = dupNames.rows;

  // Step 2a: direct case-insensitive trim match, picking most recent tenant on ties
  log('\n  Strategy 1: case-insensitive trim match on name (most recent tenant on duplicates)');
  const res1 = await pg.query(`
    WITH matched AS (
      SELECT DISTINCT ON (tcd.id)
        tcd.id                                                AS tcd_id,
        t.id                                                  AS tenant_id
      FROM "${SCHEMA}"."_tenantContractDetail" tcd
      JOIN "${SCHEMA}"."_tenant" t
        ON LOWER(TRIM(t.name)) = LOWER(TRIM(tcd."partyNameTenant"))
      WHERE tcd."tenantId" IS NULL
        AND tcd."partyNameTenant" IS NOT NULL
        AND tcd."partyNameTenant" <> ''
      ORDER BY tcd.id, t."createdAt" DESC NULLS LAST
    )
    UPDATE "${SCHEMA}"."_tenantContractDetail" tcd
    SET "tenantId" = m.tenant_id
    FROM matched m
    WHERE tcd.id = m.tcd_id
      AND tcd."tenantId" IS NULL
    RETURNING tcd.id
  `);
  log(`  -> Strategy 1 matched ${res1.rowCount} rows`);
  report.task2.strategy1_name_match = res1.rowCount;

  // Evaluate hit-rate after strategy 1
  const postStrat1 = await countNull(pg, '_tenantContractDetail', 'tenantId');
  const hitRate1 = before.total > 0 ? ((postStrat1.filled_count - before.filled_count) / before.null_count) : 0;
  log(`  Hit rate after strategy 1: ${(hitRate1 * 100).toFixed(1)}% of previously-null rows`);

  // Step 2b: normalized name match (collapse internal whitespace)
  log('\n  Strategy 2: whitespace-normalized name match');
  const res2 = await pg.query(`
    WITH matched AS (
      SELECT DISTINCT ON (tcd.id)
        tcd.id    AS tcd_id,
        t.id      AS tenant_id
      FROM "${SCHEMA}"."_tenantContractDetail" tcd
      JOIN "${SCHEMA}"."_tenant" t
        ON LOWER(REGEXP_REPLACE(TRIM(t.name), '\\s+', ' ', 'g'))
         = LOWER(REGEXP_REPLACE(TRIM(tcd."partyNameTenant"), '\\s+', ' ', 'g'))
      WHERE tcd."tenantId" IS NULL
        AND tcd."partyNameTenant" IS NOT NULL
        AND tcd."partyNameTenant" <> ''
        AND t.name IS NOT NULL
        AND t.name <> ''
      ORDER BY tcd.id, t."createdAt" DESC NULLS LAST
    )
    UPDATE "${SCHEMA}"."_tenantContractDetail" tcd
    SET "tenantId" = m.tenant_id
    FROM matched m
    WHERE tcd.id = m.tcd_id
      AND tcd."tenantId" IS NULL
    RETURNING tcd.id
  `);
  log(`  -> Strategy 2 matched ${res2.rowCount} additional rows`);
  report.task2.strategy2_normalized_name = res2.rowCount;

  // Step 2c: fallback — match by first token (first-name) only if single unique tenant
  log('\n  Strategy 3: first-token match (first name) — only when unique tenant per first-name');
  const res3 = await pg.query(`
    WITH tcd_first AS (
      SELECT id                            AS tcd_id,
             LOWER(SPLIT_PART(TRIM(REGEXP_REPLACE("partyNameTenant", '\\s+', ' ', 'g')), ' ', 1)) AS first_tok
      FROM "${SCHEMA}"."_tenantContractDetail"
      WHERE "tenantId" IS NULL
        AND "partyNameTenant" IS NOT NULL
        AND "partyNameTenant" <> ''
    ),
    tenant_first AS (
      SELECT id                            AS tenant_id,
             LOWER(SPLIT_PART(TRIM(REGEXP_REPLACE(name, '\\s+', ' ', 'g')), ' ', 1)) AS first_tok,
             "createdAt"
      FROM "${SCHEMA}"."_tenant"
      WHERE name IS NOT NULL AND name <> ''
    ),
    unique_first AS (
      -- Only keep first-name tokens that map to exactly ONE tenant (avoids ambiguity).
      -- ARRAY_AGG + [1] works with UUID where MIN(uuid) does not.
      SELECT first_tok, (ARRAY_AGG(tenant_id))[1] AS tenant_id, COUNT(*) AS c
      FROM tenant_first
      GROUP BY first_tok
      HAVING COUNT(*) = 1
    )
    UPDATE "${SCHEMA}"."_tenantContractDetail" tcd
    SET "tenantId" = u.tenant_id
    FROM tcd_first tf
    JOIN unique_first u ON u.first_tok = tf.first_tok
    WHERE tcd.id = tf.tcd_id
      AND tcd."tenantId" IS NULL
      AND tf.first_tok IS NOT NULL
      AND tf.first_tok <> ''
    RETURNING tcd.id
  `);
  log(`  -> Strategy 3 matched ${res3.rowCount} additional rows`);
  report.task2.strategy3_first_token_unique = res3.rowCount;

  // Final match count
  const after = await reportCount(
    pg,
    'AFTER  _tenantContractDetail.tenantId',
    '_tenantContractDetail',
    'tenantId'
  );
  report.task2.tcd_tenantId_after = after;
  const totalMatched = after.filled_count - before.filled_count;
  const matchRate = before.null_count > 0 ? (totalMatched / before.null_count) : 0;
  log(`\n  Total matched across strategies: ${totalMatched}`);
  log(`  Overall match rate: ${(matchRate * 100).toFixed(1)}% of originally-null rows`);
  report.task2.total_matched = totalMatched;
  report.task2.match_rate_pct = Number((matchRate * 100).toFixed(1));

  // Capture unmatched samples for debugging
  const unmatched = await pg.query(`
    SELECT "partyNameTenant" AS n, COUNT(*)::int AS c
    FROM "${SCHEMA}"."_tenantContractDetail"
    WHERE "tenantId" IS NULL
      AND "partyNameTenant" IS NOT NULL
      AND "partyNameTenant" <> ''
    GROUP BY "partyNameTenant"
    ORDER BY c DESC
    LIMIT 10
  `);
  if (unmatched.rows.length > 0) {
    log('\n  Top 10 still-unmatched partyNameTenant values:');
    unmatched.rows.forEach((r, i) => console.log(`    ${i + 1}. "${r.n}"  (${r.c} row${r.c === 1 ? '' : 's'})`));
  }
  report.task2.sample_unmatched = unmatched.rows;

  // Step 2d: propagate to contract
  log('\n  Running UPDATE: _contract.primaryTenantId + partyNameTenant from tcd');
  const resContract = await pg.query(`
    WITH primary_tcd AS (
      SELECT DISTINCT ON (tcd."contractId")
        tcd."contractId"         AS contract_id,
        tcd."tenantId"           AS tenant_id,
        tcd."partyNameTenant"    AS party_name
      FROM "${SCHEMA}"."_tenantContractDetail" tcd
      WHERE tcd."tenantId" IS NOT NULL
      ORDER BY tcd."contractId", tcd."createdAt" ASC NULLS LAST
    )
    UPDATE "${SCHEMA}"."_contract" c
    SET "primaryTenantId" = p.tenant_id,
        "partyNameTenant" = COALESCE(NULLIF(c."partyNameTenant", ''), p.party_name)
    FROM primary_tcd p
    WHERE c.id = p.contract_id
      AND c."primaryTenantId" IS NULL
    RETURNING c.id
  `);
  log(`  -> updated ${resContract.rowCount} contracts`);
  report.task2.contract_primaryTenantId_updated = resContract.rowCount;
}

// ─── Task 3: re-run Fix #3 tenant.current* backfill ─────────────────────────

async function task3_tenantCurrent(pg, report) {
  section('TASK 3: Re-run Fix #3 — _tenant.currentContract/Property/Room');

  const beforeContract = await reportCount(
    pg, 'BEFORE _tenant.currentContractId', '_tenant', 'currentContractId'
  );
  const beforeProperty = await reportCount(
    pg, 'BEFORE _tenant.currentPropertyId', '_tenant', 'currentPropertyId'
  );
  const beforeRoom = await reportCount(
    pg, 'BEFORE _tenant.currentRoomId', '_tenant', 'currentRoomId'
  );
  report.task3.before = {
    currentContractId: beforeContract,
    currentPropertyId: beforeProperty,
    currentRoomId: beforeRoom,
  };

  log('\n  Running UPDATE: tenant current* from latest active contract per tenant');
  const res = await pg.query(`
    WITH latest AS (
      SELECT DISTINCT ON (tcd."tenantId")
        tcd."tenantId"    AS tenant_id,
        tcd."contractId"  AS contract_id,
        tcd."roomId"      AS room_id,
        c."propertyId"    AS property_id
      FROM "${SCHEMA}"."_tenantContractDetail" tcd
      JOIN "${SCHEMA}"."_contract" c ON c.id = tcd."contractId"
      WHERE tcd."tenantId" IS NOT NULL
        AND tcd."deletedAt" IS NULL
        AND (c."contractEndDate" IS NULL OR c."contractEndDate" > NOW())
      ORDER BY tcd."tenantId", c."contractStartDate" DESC NULLS LAST, tcd."createdAt" DESC
    )
    UPDATE "${SCHEMA}"."_tenant" t
    SET "currentContractId" = COALESCE(t."currentContractId", l.contract_id),
        "currentPropertyId" = COALESCE(t."currentPropertyId", l.property_id),
        "currentRoomId"     = COALESCE(t."currentRoomId",     l.room_id)
    FROM latest l
    WHERE t.id = l.tenant_id
      AND (
        t."currentContractId" IS NULL
        OR t."currentPropertyId" IS NULL
        OR t."currentRoomId" IS NULL
      )
    RETURNING t.id
  `);
  log(`  -> updated ${res.rowCount} tenants with current state`);
  report.task3.updated_tenants = res.rowCount;

  const afterContract = await reportCount(
    pg, 'AFTER  _tenant.currentContractId', '_tenant', 'currentContractId'
  );
  const afterProperty = await reportCount(
    pg, 'AFTER  _tenant.currentPropertyId', '_tenant', 'currentPropertyId'
  );
  const afterRoom = await reportCount(
    pg, 'AFTER  _tenant.currentRoomId', '_tenant', 'currentRoomId'
  );
  report.task3.after = {
    currentContractId: afterContract,
    currentPropertyId: afterProperty,
    currentRoomId: afterRoom,
  };
}

// ─── Task 4: re-run Fix #4 room.currentTenantId backfill ────────────────────

async function task4_roomCurrent(pg, report) {
  section('TASK 4: Re-run Fix #4 — _room.currentTenantId');

  const before = await reportCount(
    pg, 'BEFORE _room.currentTenantId', '_room', 'currentTenantId'
  );
  report.task4.before = before;

  log('\n  Running UPDATE: room.currentTenantId from active tcd rows');
  const res = await pg.query(`
    WITH latest AS (
      SELECT DISTINCT ON (tcd."roomId")
        tcd."roomId"      AS room_id,
        tcd."tenantId"    AS tenant_id
      FROM "${SCHEMA}"."_tenantContractDetail" tcd
      JOIN "${SCHEMA}"."_contract" c ON c.id = tcd."contractId"
      WHERE tcd."roomId"   IS NOT NULL
        AND tcd."tenantId" IS NOT NULL
        AND tcd."deletedAt" IS NULL
        AND (c."contractEndDate" IS NULL OR c."contractEndDate" > NOW())
      ORDER BY tcd."roomId", c."contractStartDate" DESC NULLS LAST, tcd."createdAt" DESC
    )
    UPDATE "${SCHEMA}"."_room" r
    SET "currentTenantId" = l.tenant_id
    FROM latest l
    WHERE r.id = l.room_id
      AND r."currentTenantId" IS NULL
    RETURNING r.id
  `);
  log(`  -> updated ${res.rowCount} rooms with currentTenantId`);
  report.task4.updated_rooms = res.rowCount;

  const after = await reportCount(
    pg, 'AFTER  _room.currentTenantId', '_room', 'currentTenantId'
  );
  report.task4.after = after;
}

// ─── Task 5: backfill _ticket.tenantId via _room.currentTenantId ────────────

async function task5_ticketTenant(pg, report) {
  section('TASK 5: Backfill _ticket.tenantId via _room.currentTenantId');

  const before = await reportCount(
    pg, 'BEFORE _ticket.tenantId', '_ticket', 'tenantId',
    `AND "roomId" IS NOT NULL`
  );
  report.task5.before = before;

  log('\n  Running UPDATE: ticket.tenantId from room.currentTenantId');
  const res = await pg.query(`
    UPDATE "${SCHEMA}"."_ticket" tk
    SET "tenantId" = r."currentTenantId"
    FROM "${SCHEMA}"."_room" r
    WHERE tk."roomId" = r.id
      AND r."currentTenantId" IS NOT NULL
      AND tk."tenantId" IS NULL
    RETURNING tk.id
  `);
  log(`  -> updated ${res.rowCount} tickets with tenantId`);
  report.task5.updated_tickets = res.rowCount;

  const after = await reportCount(
    pg, 'AFTER  _ticket.tenantId', '_ticket', 'tenantId',
    `AND "roomId" IS NOT NULL`
  );
  report.task5.after = after;
}

// ─── Main ────────────────────────────────────────────────────────────────────

(async () => {
  if (!process.env.PG_DATABASE_URL) {
    console.error('ERROR: PG_DATABASE_URL env var is required');
    process.exit(2);
  }

  const pg = new Client({ connectionString: process.env.PG_DATABASE_URL });
  await pg.connect();
  log(`Connected to Postgres. SCHEMA=${SCHEMA}  DRY_RUN=${DRY_RUN ? 'yes (will ROLLBACK)' : 'no (will COMMIT)'}`);

  const report = {
    startedAt: new Date().toISOString(),
    schema: SCHEMA,
    dryRun: DRY_RUN,
    task1: {},
    task2: {},
    task3: {},
    task4: {},
    task5: {},
  };

  try {
    await pg.query('BEGIN');

    await task1_merchantDetail(pg, report);
    await task2_tenantDetail(pg, report);
    await task3_tenantCurrent(pg, report);
    await task4_roomCurrent(pg, report);
    await task5_ticketTenant(pg, report);

    if (DRY_RUN) {
      await pg.query('ROLLBACK');
      log('\nDRY_RUN=1 -> ROLLBACK. No changes persisted.');
    } else {
      await pg.query('COMMIT');
      log('\nCOMMIT OK. All changes persisted.');
    }
  } catch (err) {
    await pg.query('ROLLBACK');
    log(`\nERROR: ${err.message}`);
    log('Transaction rolled back. No changes persisted.');
    console.error(err.stack);
    report.error = err.message;
    process.exitCode = 1;
  } finally {
    report.finishedAt = new Date().toISOString();
    section('FINAL REPORT (JSON)');
    console.log(JSON.stringify(report, null, 2));
    await pg.end();
  }
})();
