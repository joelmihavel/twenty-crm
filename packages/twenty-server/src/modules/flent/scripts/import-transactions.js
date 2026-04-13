/**
 * Flent Transactions Import Script
 *
 * Reads /tmp/transactions-raw.json (Google Sheets export) and imports ~10,918
 * rows into Twenty CRM workspace schema.
 *
 * For each source row, creates one row each in:
 *   - _transaction               (base)
 *   - _transactionClassification (purpose categories)
 *   - _transactionParty          (from/to)
 *   - _transactionPayment        (channel/provider/ref)
 *   - _transactionLineItem       (line item details)
 *   - _transactionLink           (FK links to property via pid)
 *
 * Usage (inside twenty-server pod):
 *   node import-transactions.js
 *
 * Requires PG_DATABASE_URL env var.
 */

const { Pool } = require('pg');
const fs = require('fs');
const { randomUUID } = require('crypto');

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';
const SOURCE_FILE = '/tmp/transactions-raw.json';
const BATCH_SIZE = 200;

// ---------------------------------------------------------------------------
// Enum maps
// ---------------------------------------------------------------------------

const CREDIT_DEBIT_MAP = {
  debit: 'DEBIT',
  credit: 'CREDIT',
};

const PURPOSE_CATEGORY_1_ENUM = new Set([
  'OPEX',
  'CAPEX',
  'INTEREST',
  'SALARY',
  'REIMBURSEMENT',
  'REVENUE',
  'REFUNDS',
  'COGS',
]);

const PURPOSE_CATEGORY_2_ENUM = new Set([
  'DEPOSIT',
  'TRANSPORT',
  'FIXTURES',
  'OFFICE',
  'EMPLOYEE',
  'CONSULTANT',
  'CONTRACTOR',
  'INVENTORY',
  'TECH',
  'MARKETING',
  'FOOD_AND_BEVERAGES',
]);

const PARTY_TYPE_ENUM = new Set([
  'TENANT',
  'LANDLORD',
  'VENDOR',
  'PLATFORM',
  'THIRD_PARTY',
  'GOVERNMENT',
]);

const PAYMENT_CHANNEL_ENUM = new Set([
  'UPI',
  'NEFT',
  'RTGS',
  'IMPS',
  'AUTO_DEBIT_NACH',
  'VIRTUAL_ACCOUNT',
  'PAYMENT_LINK',
  'CHEQUE',
  'CASH',
  'OTHER',
]);

const PAYMENT_PROVIDER_ENUM = new Set(['KOTAK', 'IDFC', 'RAZORPAYX', 'VOLOPAY']);

const PAYMENT_CHANNEL_MAP = {
  upi: 'UPI',
  neft: 'NEFT',
  rtgs: 'RTGS',
  imps: 'IMPS',
  cash: 'CASH',
  cheque: 'CHEQUE',
  'auto debit': 'AUTO_DEBIT_NACH',
  'auto-debit': 'AUTO_DEBIT_NACH',
  nach: 'AUTO_DEBIT_NACH',
  'auto debit nach': 'AUTO_DEBIT_NACH',
  'virtual account': 'VIRTUAL_ACCOUNT',
  'payment link': 'PAYMENT_LINK',
  // Vendors that don't match known channels -> OTHER
  volopay: 'OTHER',
  'razorpay x': 'OTHER',
  razorpayx: 'OTHER',
  mobiqwik: 'OTHER',
  pos: 'OTHER',
  bank: 'OTHER',
  rbl: 'OTHER',
};

const PAYMENT_PROVIDER_MAP = {
  kotak: 'KOTAK',
  idfc: 'IDFC',
  razorpayx: 'RAZORPAYX',
  'razorpay x': 'RAZORPAYX',
  volopay: 'VOLOPAY',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const safe = (arr, i) => (arr && i < arr.length ? arr[i] : '');
const trim = (v) => (v == null ? '' : String(v).trim());

const MONTH_ABBR = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

function parseDmyDate(s) {
  s = trim(s);
  if (!s) return null;
  // DD/MM/YY or DD/MM/YYYY
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    let yy = m[3];
    if (yy.length === 2) yy = '20' + yy;
    return `${yy}-${mm}-${dd}`;
  }
  // DD-MMM-YYYY  (e.g. 04-Nov-2025)
  m = s.match(/^(\d{1,2})-([A-Za-z]{3,4})-(\d{2,4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = MONTH_ABBR[m[2].toLowerCase()];
    if (!mm) return null;
    let yy = m[3];
    if (yy.length === 2) yy = '20' + yy;
    return `${yy}-${mm}-${dd}`;
  }
  // YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

function parseAmount(v) {
  const t = trim(v).replace(/,/g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function mapPurposeCategory1(v) {
  const u = trim(v).toUpperCase();
  if (!u) return null;
  return PURPOSE_CATEGORY_1_ENUM.has(u) ? u : null;
}

function mapPurposeCategory2(v) {
  const raw = trim(v).toUpperCase();
  if (!raw) return null;
  // Normalize: replace non-alphanumeric with underscore, collapse
  const norm = raw.replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (PURPOSE_CATEGORY_2_ENUM.has(norm)) return norm;
  // A few explicit aliases
  const aliases = {
    INVTR: 'INVENTORY',
    INVENTORY_INVTR: 'INVENTORY',
    FOOD_BEVERAGES: 'FOOD_AND_BEVERAGES',
    FOOD_AND_BEVERAGE: 'FOOD_AND_BEVERAGES',
    FNB: 'FOOD_AND_BEVERAGES',
    F_B: 'FOOD_AND_BEVERAGES',
  };
  if (aliases[norm]) return aliases[norm];
  return null;
}

function inferFromPartyType(sourceType, creditDebit) {
  const u = trim(sourceType).toUpperCase();
  if (PARTY_TYPE_ENUM.has(u)) return u;
  if (creditDebit === 'DEBIT') return 'PLATFORM';
  if (creditDebit === 'CREDIT') return 'TENANT';
  return null;
}

function inferToPartyType(sourceType, creditDebit) {
  const u = trim(sourceType).toUpperCase();
  if (PARTY_TYPE_ENUM.has(u)) return u;
  if (creditDebit === 'DEBIT') return 'VENDOR';
  if (creditDebit === 'CREDIT') return 'PLATFORM';
  return null;
}

function mapPaymentChannel(v) {
  const raw = trim(v).toLowerCase();
  if (!raw) return null;
  if (PAYMENT_CHANNEL_MAP[raw]) return PAYMENT_CHANNEL_MAP[raw];
  const upper = raw.toUpperCase().replace(/\s+/g, '_');
  if (PAYMENT_CHANNEL_ENUM.has(upper)) return upper;
  return 'OTHER';
}

function mapPaymentProvider(v) {
  const raw = trim(v).toLowerCase();
  if (!raw) return null;
  if (PAYMENT_PROVIDER_MAP[raw]) return PAYMENT_PROVIDER_MAP[raw];
  const upper = raw.toUpperCase().replace(/\s+/g, '_');
  if (PAYMENT_PROVIDER_ENUM.has(upper)) return upper;
  return null;
}

function buildRichText(text) {
  const t = trim(text);
  if (!t) return { md: null, bn: null };
  const md = t;
  const bn = JSON.stringify([
    {
      id: randomUUID(),
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [{ type: 'text', text: t, styles: {} }],
      children: [],
    },
  ]);
  return { md, bn };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  if (!process.env.PG_DATABASE_URL) {
    throw new Error('PG_DATABASE_URL env var required');
  }

  console.log('Reading source:', SOURCE_FILE);
  const raw = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const rows = raw.values.slice(1);
  console.log('Source rows:', rows.length);

  const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });

  // -----------------------------------------------------------------------
  // Build property lookup
  // -----------------------------------------------------------------------
  const propsRes = await pool.query(
    `SELECT pid, id FROM "${SCHEMA}"."_property" WHERE pid IS NOT NULL`,
  );
  const propertyMap = new Map();
  for (const r of propsRes.rows) propertyMap.set(String(r.pid), r.id);
  console.log('Property lookup entries:', propertyMap.size);

  // -----------------------------------------------------------------------
  // Prepare rows
  // -----------------------------------------------------------------------
  const nowIso = new Date().toISOString();
  const utnCounters = new Map(); // YYYYMMDD -> int
  const stats = {
    total: 0,
    skipped: 0,
    propertyMatched: 0,
    propertyMissing: 0,
    enumPc1Null: 0,
    enumPc2Null: 0,
    enumPaymentChannelNull: 0,
    enumPaymentProviderNull: 0,
  };

  const txnRows = [];
  const classRows = [];
  const partyRows = [];
  const paymentRows = [];
  const lineRows = [];
  const linkRows = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const amount = parseAmount(safe(r, 3));
    const fromParty = trim(safe(r, 6));
    const toParty = trim(safe(r, 9));
    if ((amount === null || amount === 0) && !fromParty && !toParty) {
      stats.skipped++;
      continue;
    }

    // Credit/Debit
    const cdRaw = trim(safe(r, 1)).toLowerCase();
    const creditDebit = CREDIT_DEBIT_MAP[cdRaw] || null;

    // Dates
    let txnDate = parseDmyDate(safe(r, 2));
    const createdDate = parseDmyDate(safe(r, 15));
    const authorisedDate = parseDmyDate(safe(r, 17));
    const lineItemDate = parseDmyDate(safe(r, 18));
    // Fallback chain for NOT NULL transactionDate
    if (!txnDate) txnDate = createdDate || lineItemDate;
    if (!txnDate) {
      // skip — cannot satisfy NOT NULL
      stats.skipped++;
      continue;
    }

    // UTN generation
    const utnDateStr = txnDate.replace(/-/g, '');
    const cnt = (utnCounters.get(utnDateStr) || 0) + 1;
    utnCounters.set(utnDateStr, cnt);
    const utn = `TXN-${utnDateStr}-${String(cnt).padStart(5, '0')}`;

    // IDs
    const txnId = randomUUID();

    // Transaction row
    const effectiveCreatedDate = createdDate || txnDate;
    txnRows.push({
      id: txnId,
      name: utn,
      utn,
      transactionType: 'PAYMENT',
      creditDebit,
      transactionDate: txnDate,
      amount: amount === null ? 0 : amount,
      status: 'SETTLED',
      createdDate: `${effectiveCreatedDate}T00:00:00Z`,
      authorisedBy: trim(safe(r, 16)) || null,
      authorisedDate: authorisedDate ? `${authorisedDate}T00:00:00Z` : null,
      createdByName: 'Flent Transactions Import',
      createdBySource: 'IMPORT',
    });

    // Classification
    const pc1 = mapPurposeCategory1(safe(r, 4));
    const pc2 = mapPurposeCategory2(safe(r, 5));
    if (!pc1) stats.enumPc1Null++;
    if (!pc2) stats.enumPc2Null++;
    classRows.push({
      id: randomUUID(),
      transactionId: txnId,
      purposeCategory1: pc1,
      purposeCategory2: pc2,
    });

    // Party
    const fpType = inferFromPartyType(safe(r, 7), creditDebit);
    const tpType = inferToPartyType(safe(r, 10), creditDebit);
    const fromInfo = buildRichText(safe(r, 8));
    partyRows.push({
      id: randomUUID(),
      transactionId: txnId,
      fromParty: fromParty || 'Unknown',
      fromPartyType: fpType,
      fromPartyInfoMarkdown: fromInfo.md,
      fromPartyInfoBlocknote: fromInfo.bn,
      toParty: toParty || 'Unknown',
      toPartyType: tpType,
      toPartyInfoMarkdown: null,
      toPartyInfoBlocknote: null,
    });

    // Payment
    const chan = mapPaymentChannel(safe(r, 11));
    const prov = mapPaymentProvider(safe(r, 12));
    if (!chan) stats.enumPaymentChannelNull++;
    if (!prov) stats.enumPaymentProviderNull++;
    paymentRows.push({
      id: randomUUID(),
      transactionId: txnId,
      paymentChannel: chan,
      paymentProvider: prov,
      gatewayReferenceId: trim(safe(r, 13)) || null,
    });

    // Line item
    const liDesc = buildRichText(safe(r, 20));
    lineRows.push({
      id: randomUUID(),
      transactionId: txnId,
      lineItemDate,
      costRevenueCenter: trim(safe(r, 19)) || null,
      lineItemDescriptionMarkdown: liDesc.md,
      lineItemDescriptionBlocknote: liDesc.bn,
    });

    // Link
    const pidRaw = trim(safe(r, 23));
    let pidNum = null;
    let propertyRelId = null;
    if (pidRaw) {
      const m = pidRaw.match(/(\d+)/);
      if (m) {
        pidNum = m[1];
        propertyRelId = propertyMap.get(pidNum) || null;
      }
    }
    if (propertyRelId) stats.propertyMatched++;
    else if (pidNum) stats.propertyMissing++;

    const contractUid = trim(safe(r, 21)) || null;
    const contactId = trim(safe(r, 22)) || null; // stored as tenantId text
    linkRows.push({
      id: randomUUID(),
      transactionId: txnId,
      contractUid,
      tenantId: contactId,
      pid: pidNum,
      rid: null,
      propertyRelId,
    });

    stats.total++;
  }

  console.log('Prepared:', stats.total, 'skipped:', stats.skipped);

  // -----------------------------------------------------------------------
  // Batched inserts
  // -----------------------------------------------------------------------
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await batchInsert(client, `"${SCHEMA}"."_transaction"`, [
      'id', 'name', 'utn', 'transactionType', 'creditDebit', 'transactionDate',
      'amount', 'status', 'createdDate', 'authorisedBy', 'authorisedDate',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], txnRows, (r) => [
      r.id, r.name, r.utn, r.transactionType, r.creditDebit, r.transactionDate,
      r.amount, r.status, r.createdDate, r.authorisedBy, r.authorisedDate,
      r.createdByName, r.createdBySource, r.createdByName, r.createdBySource,
    ]);

    await batchInsert(client, `"${SCHEMA}"."_transactionClassification"`, [
      'id', 'transactionId', 'purposeCategory1', 'purposeCategory2',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], classRows, (r) => [
      r.id, r.transactionId, r.purposeCategory1, r.purposeCategory2,
      'Flent Transactions Import', 'IMPORT', 'Flent Transactions Import', 'IMPORT',
    ]);

    await batchInsert(client, `"${SCHEMA}"."_transactionParty"`, [
      'id', 'transactionId', 'fromParty', 'fromPartyType',
      'fromPartyInfoMarkdown', 'fromPartyInfoBlocknote',
      'toParty', 'toPartyType', 'toPartyInfoMarkdown', 'toPartyInfoBlocknote',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], partyRows, (r) => [
      r.id, r.transactionId, r.fromParty, r.fromPartyType,
      r.fromPartyInfoMarkdown, r.fromPartyInfoBlocknote,
      r.toParty, r.toPartyType, r.toPartyInfoMarkdown, r.toPartyInfoBlocknote,
      'Flent Transactions Import', 'IMPORT', 'Flent Transactions Import', 'IMPORT',
    ]);

    await batchInsert(client, `"${SCHEMA}"."_transactionPayment"`, [
      'id', 'transactionId', 'paymentChannel', 'paymentProvider', 'gatewayReferenceId',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], paymentRows, (r) => [
      r.id, r.transactionId, r.paymentChannel, r.paymentProvider, r.gatewayReferenceId,
      'Flent Transactions Import', 'IMPORT', 'Flent Transactions Import', 'IMPORT',
    ]);

    await batchInsert(client, `"${SCHEMA}"."_transactionLineItem"`, [
      'id', 'transactionId', 'lineItemDate', 'costRevenueCenter',
      'lineItemDescriptionMarkdown', 'lineItemDescriptionBlocknote',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], lineRows, (r) => [
      r.id, r.transactionId, r.lineItemDate, r.costRevenueCenter,
      r.lineItemDescriptionMarkdown, r.lineItemDescriptionBlocknote,
      'Flent Transactions Import', 'IMPORT', 'Flent Transactions Import', 'IMPORT',
    ]);

    await batchInsert(client, `"${SCHEMA}"."_transactionLink"`, [
      'id', 'transactionId', 'contractUid', 'tenantId', 'pid', 'rid', 'propertyRelId',
      'createdByName', 'createdBySource', 'updatedByName', 'updatedBySource',
    ], linkRows, (r) => [
      r.id, r.transactionId, r.contractUid, r.tenantId, r.pid, r.rid, r.propertyRelId,
      'Flent Transactions Import', 'IMPORT', 'Flent Transactions Import', 'IMPORT',
    ]);

    await client.query('COMMIT');
    console.log('COMMIT OK');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // -----------------------------------------------------------------------
  // Verify counts
  // -----------------------------------------------------------------------
  const tables = [
    '_transaction',
    '_transactionClassification',
    '_transactionParty',
    '_transactionPayment',
    '_transactionLineItem',
    '_transactionLink',
  ];
  console.log('\n=== Verification ===');
  for (const t of tables) {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."${t}" WHERE "createdBySource" = 'IMPORT' AND "createdByName" = 'Flent Transactions Import'`,
    );
    console.log(`${t}: ${res.rows[0].c}`);
  }

  console.log('\n=== Stats ===');
  console.log(JSON.stringify(stats, null, 2));

  await pool.end();
}

async function batchInsert(client, table, cols, rows, mapFn) {
  if (rows.length === 0) return;
  console.log(`Inserting ${rows.length} into ${table}...`);
  const colList = cols.map((c) => `"${c}"`).join(', ');
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const params = [];
    const placeholders = [];
    chunk.forEach((row, ri) => {
      const vals = mapFn(row);
      const start = ri * cols.length;
      const ph = vals.map((_, vi) => `$${start + vi + 1}`);
      placeholders.push(`(${ph.join(', ')})`);
      params.push(...vals);
    });
    const sql = `INSERT INTO ${table} (${colList}) VALUES ${placeholders.join(', ')}`;
    await client.query(sql, params);
  }
}

run().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
