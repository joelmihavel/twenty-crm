/**
 * Flent Merchant Contracts Import Script
 *
 * Imports 322 merchant (landlord) contracts from /tmp/merchant-contracts-raw.json into:
 *   - _contract           (base)       - one row per source row
 *   - _merchantContractDetail (extension) - one row per source row
 *
 * Usage (inside twenty-server pod):
 *   node /tmp/import-merchant-contracts.js
 * Requires: PG_DATABASE_URL env var (auto-available in pod), /tmp/merchant-contracts-raw.json present.
 */

const { Pool } = require('pg');
const fs = require('fs');
const { randomUUID } = require('crypto');

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';
const SOURCE_FILE = '/tmp/merchant-contracts-raw.json';
const BATCH_SIZE = 100;

// ---- Enum mappings ----

// Source contract-type label -> _contract.contractType enum value.
// "Subletting Agreement" = subletting/lease-and-license arrangement -> L_AND_L.
// "Authorization Agreement" = authorization/management -> AUTHORISATION.
const CONTRACT_TYPE_MAP = {
  'subletting agreement': 'L_AND_L',
  'authorization agreement': 'AUTHORISATION',
  'authorisation agreement': 'AUTHORISATION',
};

const PAYMENT_CYCLE_MAP = {
  prepaid: 'PREPAID',
  postpaid: 'POSTPAID',
};

const AGREEMENT_STATUS_MAP = {
  active: 'ACTIVE',
  negotiation: 'NEGOTIATION',
  triggered: 'TRIGGERED',
};

// ---- Helpers ----

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function parseDateDMY(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s) return null;
  // DD-Mon-YY / DD-Mon-YYYY (e.g. "07-May-26")
  const mAlpha = s.match(/^(\d{1,2})[\/\-\s]([A-Za-z]{3,9})[\/\-\s](\d{2,4})$/);
  if (mAlpha) {
    let [, d, mon, y] = mAlpha;
    d = parseInt(d, 10);
    const mo = MONTH_MAP[mon.toLowerCase().slice(0, 3)];
    y = parseInt(y, 10);
    if (y < 100) y += 2000;
    if (!d || !mo || !y) return null;
    return `${y.toString().padStart(4, '0')}-${mo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }
  // Numeric DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;
  let [, d, mo, y] = m;
  d = parseInt(d, 10);
  mo = parseInt(mo, 10);
  y = parseInt(y, 10);
  if (y < 100) y += 2000;
  if (!d || !mo || !y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const iso = `${y.toString().padStart(4, '0')}-${mo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  return iso;
}

function parseNum(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function parseInt2(val) {
  const n = parseNum(val);
  return n === null ? null : Math.trunc(n);
}

function toMicros(amount) {
  if (amount === null || amount === undefined) return null;
  // Use string math to avoid precision loss on large values.
  // Amount can have decimals; multiply by 1_000_000.
  return BigInt(Math.round(amount * 1000000)).toString();
}

function addMonthsISO(isoDate, months) {
  if (!isoDate || months === null || months === undefined) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + Number(months));
  return `${dt.getUTCFullYear().toString().padStart(4, '0')}-${(dt.getUTCMonth() + 1).toString().padStart(2, '0')}-${dt.getUTCDate().toString().padStart(2, '0')}`;
}

// Heuristic for the "Increment Frequency" column which in source contains numbers
// like "11" or "22" (months). 11->ANNUAL, 22->BIENNIAL, else NONE.
function mapIncrementFrequency(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s === 'annual' || s === 'yearly' || s === '11' || s === '12') return 'ANNUAL';
  if (s === 'biennial' || s === '22' || s === '24') return 'BIENNIAL';
  if (s === 'none' || s === 'no' || s === 'na' || s === 'n/a') return 'NONE';
  return null;
}

// ---- Main ----

(async () => {
  const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });
  const raw = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const rows = raw.values.slice(1); // drop header

  // Property lookup
  const propRes = await pool.query(
    `SELECT pid, id FROM "${SCHEMA}"."_property"`,
  );
  const propMap = new Map();
  for (const r of propRes.rows) propMap.set(String(r.pid), r.id);

  // Existing merchant-contract names (to avoid duplicates on re-run). We identify
  // merchant-contract rows via createdByName = 'Flent Merchant Contracts Import'.
  const existing = await pool.query(
    `SELECT name FROM "${SCHEMA}"."_contract" WHERE "createdByName" = 'Flent Merchant Contracts Import'`,
  );
  const existingNames = new Set(existing.rows.map((r) => r.name));

  const stats = {
    totalRows: rows.length,
    skippedEmpty: 0,
    inserted: 0,
    errors: [],
    propertyMatched: 0,
    propertyMissing: 0,
    contractTypeCounts: {},
    paymentCycleCounts: {},
    agreementStatusCounts: {},
    incrementFrequencyCounts: {},
    unmappedContractTypes: {},
  };

  // Get starting position for _contract
  const posRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_contract"`,
  );
  let contractPos = Number(posRes.rows[0].max_pos) || 0;
  const mcdPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_merchantContractDetail"`,
  );
  let mcdPos = Number(mcdPosRes.rows[0].max_pos) || 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const padded = [...row];
      while (padded.length < 21) padded.push('');

      const pid = String(padded[0] || '').trim();
      const uuid = String(padded[1] || '').trim();
      const contractTypeRaw = String(padded[2] || '').trim();
      const securityDep = parseNum(padded[4]);
      const keyHandover = parseDateDMY(padded[5]);
      const startDate = parseDateDMY(padded[6]);
      const endDate = parseDateDMY(padded[7]);
      const baseRent = parseNum(padded[8]);
      const serviceTerm = parseInt2(padded[9]);
      const lockInDur = parseInt2(padded[10]);
      const noticePeriod = parseInt2(padded[11]);
      const incrementPct = parseNum(padded[12]);
      const incrementFreqRaw = padded[13];
      const mgmtFee = parseNum(padded[14]);
      const acqCost = parseNum(padded[15]);
      const paymentCycleRaw = String(padded[16] || '').trim();
      const paymentDeadline = parseDateDMY(padded[17]);
      const agreementPdf = String(padded[18] || '').trim();
      const agreementStatusRaw = String(padded[19] || '').trim();
      const inventoryList = String(padded[20] || '').trim();

      // Skip essentially-empty rows (no UUID and no contract type and no dates)
      if (!uuid && !contractTypeRaw && !startDate && !endDate) {
        stats.skippedEmpty++;
        continue;
      }

      // contractType (NOT NULL). Fallback to AUTHORISATION if missing - that is
      // the dominant value in this dataset. Track unmapped for reporting.
      let contractType = CONTRACT_TYPE_MAP[contractTypeRaw.toLowerCase()];
      if (!contractType) {
        if (contractTypeRaw) {
          stats.unmappedContractTypes[contractTypeRaw] =
            (stats.unmappedContractTypes[contractTypeRaw] || 0) + 1;
        }
        // If there are no dates either, skip; otherwise fallback
        if (!startDate && !endDate) {
          stats.skippedEmpty++;
          continue;
        }
        contractType = 'AUTHORISATION';
      }

      if (!startDate || !endDate) {
        stats.errors.push({
          rowIndex: idx,
          pid,
          uuid,
          reason: 'missing start or end date',
        });
        continue;
      }

      stats.contractTypeCounts[contractType] =
        (stats.contractTypeCounts[contractType] || 0) + 1;

      const paymentCycle =
        PAYMENT_CYCLE_MAP[paymentCycleRaw.toLowerCase()] || 'PREPAID';
      stats.paymentCycleCounts[paymentCycle] =
        (stats.paymentCycleCounts[paymentCycle] || 0) + 1;

      const agreementStatus =
        AGREEMENT_STATUS_MAP[agreementStatusRaw.toLowerCase()] || null;
      if (agreementStatus) {
        stats.agreementStatusCounts[agreementStatus] =
          (stats.agreementStatusCounts[agreementStatus] || 0) + 1;
      }

      const incrementFrequency = mapIncrementFrequency(incrementFreqRaw);
      if (incrementFrequency) {
        stats.incrementFrequencyCounts[incrementFrequency] =
          (stats.incrementFrequencyCounts[incrementFrequency] || 0) + 1;
      }

      // Property lookup
      const propertyId = propMap.get(pid) || null;
      if (propertyId) stats.propertyMatched++;
      else stats.propertyMissing++;

      // lockInEndDate
      const lockInEndDate =
        lockInDur !== null ? addMonthsISO(startDate, lockInDur) : null;

      const contractId = randomUUID();
      const name = uuid ? `${pid}_${uuid}` : `${pid}_merchant_${idx}`;

      if (existingNames.has(name)) {
        stats.skippedEmpty++; // reuse skip counter for duplicates
        continue;
      }

      const agreementPdfUrl = agreementPdf && /^https?:\/\//i.test(agreementPdf)
        ? agreementPdf
        : null;
      const inventoryListUrl = inventoryList && /^https?:\/\//i.test(inventoryList)
        ? inventoryList
        : null;

      // Insert _contract
      contractPos += 1;
      await client.query(
        `INSERT INTO "${SCHEMA}"."_contract" (
          id, name, position,
          "createdAt", "updatedAt",
          "createdBySource", "updatedBySource",
          "createdByName", "updatedByName",
          "contractType", "contractStartDate", "contractEndDate",
          "serviceTerm", "lockInDuration", "lockInEndDate", "noticePeriod",
          "agreementPdfPrimaryLinkUrl", "agreementPdfPrimaryLinkLabel",
          "propertyId"
        ) VALUES (
          $1, $2, $3,
          NOW(), NOW(),
          'IMPORT', 'IMPORT',
          'Flent Merchant Contracts Import', 'Flent Merchant Contracts Import',
          $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12,
          $13
        )`,
        [
          contractId,
          name,
          contractPos,
          contractType,
          startDate,
          endDate,
          serviceTerm !== null ? serviceTerm : 0,
          lockInDur,
          lockInEndDate,
          noticePeriod,
          agreementPdfUrl,
          agreementPdfUrl ? 'Agreement PDF' : null,
          propertyId,
        ],
      );

      // Insert _merchantContractDetail
      mcdPos += 1;
      const mcdId = randomUUID();

      // baseRent JSON
      const baseRentJson = JSON.stringify(
        baseRent !== null ? [{ month: 0, amount: baseRent }] : [],
      );

      // paymentDeadline fallback: use contractStartDate when blank (NOT NULL)
      const paymentDeadlineFinal = paymentDeadline || startDate;

      await client.query(
        `INSERT INTO "${SCHEMA}"."_merchantContractDetail" (
          id, position,
          "createdAt", "updatedAt",
          "createdBySource", "updatedBySource",
          "createdByName", "updatedByName",
          "partyNameMerchant",
          "keyHandoverDate",
          "incrementPercentage", "incrementFrequency",
          "agreementStatus",
          "baseRent",
          "merchantSecurityDepositAmountMicros", "merchantSecurityDepositCurrencyCode",
          "managementFeePerMonthAmountMicros", "managementFeePerMonthCurrencyCode",
          "contractAcquisitionCostAmountMicros", "contractAcquisitionCostCurrencyCode",
          "paymentCycle", "paymentDeadline",
          "inventoryListPrimaryLinkUrl", "inventoryListPrimaryLinkLabel",
          "contractId", "merchantId"
        ) VALUES (
          $1, $2,
          NOW(), NOW(),
          'IMPORT', 'IMPORT',
          'Flent Merchant Contracts Import', 'Flent Merchant Contracts Import',
          $3,
          $4,
          $5, $6,
          $7,
          $8::jsonb,
          $9, $10,
          $11, $12,
          $13, $14,
          $15, $16,
          $17, $18,
          $19, NULL
        )`,
        [
          mcdId,
          mcdPos,
          '', // partyNameMerchant (NOT NULL) - no source value available
          keyHandover,
          incrementPct,
          incrementFrequency,
          agreementStatus,
          baseRentJson,
          securityDep !== null ? toMicros(securityDep) : null,
          securityDep !== null ? 'INR' : null,
          mgmtFee !== null ? toMicros(mgmtFee) : null,
          mgmtFee !== null ? 'INR' : null,
          acqCost !== null ? toMicros(acqCost) : null,
          acqCost !== null ? 'INR' : null,
          paymentCycle,
          paymentDeadlineFinal,
          inventoryListUrl,
          inventoryListUrl ? 'Inventory List' : null,
          contractId,
        ],
      );

      stats.inserted++;

      if ((idx + 1) % BATCH_SIZE === 0) {
        await client.query('COMMIT');
        await client.query('BEGIN');
        console.log(`Progress: ${idx + 1}/${rows.length} processed (inserted=${stats.inserted})`);
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    stats.errors.push({ fatal: true, message: err.message, stack: err.stack });
    console.error('FATAL:', err);
  } finally {
    client.release();
  }

  // Final counts
  const finalContract = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_contract"`,
  );
  const finalMcd = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_merchantContractDetail"`,
  );

  console.log('\n===== IMPORT SUMMARY =====');
  console.log('Source rows:          ', stats.totalRows);
  console.log('Skipped (empty):      ', stats.skippedEmpty);
  console.log('Inserted (contracts): ', stats.inserted);
  console.log('Errors:               ', stats.errors.length);
  console.log('Property matched:     ', stats.propertyMatched);
  console.log('Property missing:     ', stats.propertyMissing);
  console.log(
    'Property linkage %:   ',
    ((stats.propertyMatched / (stats.propertyMatched + stats.propertyMissing)) * 100).toFixed(1),
  );
  console.log('contractType counts:  ', stats.contractTypeCounts);
  console.log('paymentCycle counts:  ', stats.paymentCycleCounts);
  console.log('agreementStatus cnts: ', stats.agreementStatusCounts);
  console.log('incrementFreq counts: ', stats.incrementFrequencyCounts);
  console.log('Unmapped cont types:  ', stats.unmappedContractTypes);
  console.log('--- Final DB counts ---');
  console.log('_contract:                ', finalContract.rows[0].c);
  console.log('_merchantContractDetail:  ', finalMcd.rows[0].c);

  if (stats.errors.length) {
    console.log('\n--- First 10 errors ---');
    for (const e of stats.errors.slice(0, 10)) console.log(JSON.stringify(e));
  }

  await pool.end();
})().catch((e) => {
  console.error('TOP-LEVEL ERROR:', e);
  process.exit(1);
});
