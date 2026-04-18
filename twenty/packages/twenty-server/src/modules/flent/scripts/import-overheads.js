/**
 * Flent Overheads Import Script
 *
 * Reads /tmp/overheads.json (Google Sheets export with 8 sheet keys) and imports
 * into Twenty CRM workspace schema.
 *
 * For each data row, creates:
 *   - 1 row in _overhead (base) with categoryType, objectType, frequency, dates, document, propertyId
 *   - 1 row in a category extension table (_overheadMaintenance, _overheadWifi,
 *     _overheadElectricity, _overheadWaterPurifier, _overheadGas) linked via overheadId.
 *
 * Sheet structure:
 *   - Maintenance: row 0 = human headers, data from row 1 (no api_name row).
 *   - Others     : row 0 = human headers, row 1 = api_names, data from row 2.
 *
 * Usage:
 *   node import-overheads.js
 * Requires PG_DATABASE_URL env var (available in twenty-server pod).
 */

const { Pool } = require('pg');
const fs = require('fs');
const { randomUUID } = require('crypto');

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';
const SOURCE_FILE = '/tmp/overheads.json';

// ---------------------------------------------------------------------------
// Enum mappings (source value -> DB enum label)
// ---------------------------------------------------------------------------

const OBJECT_TYPE_MAP = {
  recurring: 'RECURRING',
  'one time': 'ONE_TIME',
  'one-time': 'ONE_TIME',
  oneoff: 'ONE_TIME',
};

const FREQUENCY_MAP = {
  monthly: 'MONTHLY',
  quarterly: 'QUARTERLY',
  'bi-annually': 'BI_ANNUALLY',
  biannually: 'BI_ANNUALLY',
  'half-yearly': 'BI_ANNUALLY',
  annually: 'ANNUALLY',
  yearly: 'ANNUALLY',
};

// _overheadMaintenance.maintenanceCycle: MONTHLY, QUARTERLY, BI_ANNUALLY, ANNUALLY.
// Source has values like "Prepaid"/"Postpaid" that do NOT match — return NULL.
const MAINTENANCE_CYCLE_MAP = {
  monthly: 'MONTHLY',
  quarterly: 'QUARTERLY',
  'bi-annually': 'BI_ANNUALLY',
  biannually: 'BI_ANNUALLY',
  annually: 'ANNUALLY',
  yearly: 'ANNUALLY',
};

const OWNERSHIP_MAP = {
  flent: 'FLENT',
  landlord: 'LANDLORD',
  tenant: 'TENANT',
  product: 'FLENT',
  cx: 'FLENT',
};

const ELECTRICITY_CONNECTION_MAP = {
  prepaid: 'PREPAID',
  postpaid: 'POSTPAID',
};

const GAS_CONNECTION_MAP = {
  piped: 'PIPED',
  pipeline: 'PIPED',
  cylinder: 'CYLINDER',
  none: 'NONE',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanVal(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'na' || s.toLowerCase() === 'n/a') return null;
  return s;
}

function mapEnum(val, mapping) {
  if (val === undefined || val === null) return null;
  const key = String(val).trim().toLowerCase();
  if (!key) return null;
  return mapping[key] || null;
}

function parseBool(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  if (s === 'true' || s === 'yes' || s === 'y' || s === '1') return true;
  if (s === 'false' || s === 'no' || s === 'n' || s === '0') return false;
  return null;
}

function parseDate(val) {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  // Return YYYY-MM-DD for date column
  return d.toISOString().slice(0, 10);
}

function parseCurrencyMicros(val) {
  if (val === undefined || val === null || val === '') return null;
  const cleaned = String(val).replace(/[^\d.\-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 1000000).toString();
}

function parseNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  const n = parseFloat(String(val).trim());
  return isNaN(n) ? null : n;
}

function pidToText(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    // 1.0 -> "1"
    return Number.isInteger(val) ? String(val) : String(val);
  }
  const s = String(val).trim();
  if (!s) return null;
  // "1.0" -> "1"
  const n = Number(s);
  if (!isNaN(n) && Number.isInteger(n)) return String(n);
  if (!isNaN(n)) return String(n);
  return s;
}

function parsePhone(phoneStr) {
  if (phoneStr === undefined || phoneStr === null || phoneStr === '') {
    return { number: null, countryCode: null, callingCode: null };
  }
  let cleaned = String(phoneStr).replace(/[\s\-()]/g, '');
  let callingCode = '+91';
  let countryCode = 'IN';
  if (cleaned.startsWith('+')) {
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else {
      const match = cleaned.match(/^\+(\d{1,3})/);
      if (match) {
        callingCode = '+' + match[1];
        cleaned = cleaned.substring(match[0].length);
      }
    }
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  return {
    number: cleaned || null,
    countryCode,
    callingCode,
  };
}

function now() {
  return new Date().toISOString();
}

function twentyDefaults() {
  const ts = now();
  return {
    createdAt: ts,
    updatedAt: ts,
    createdBySource: 'IMPORT',
    updatedBySource: 'IMPORT',
    createdByName: 'Flent Overheads Import',
    updatedByName: 'Flent Overheads Import',
    createdByWorkspaceMemberId: null,
    updatedByWorkspaceMemberId: null,
    createdByContext: null,
    updatedByContext: null,
    deletedAt: null,
    position: 0,
  };
}

// ---------------------------------------------------------------------------
// Batch insert
// ---------------------------------------------------------------------------

async function batchInsert(client, table, rows, batchSize = 100) {
  if (rows.length === 0) return { inserted: 0, errors: 0 };

  const fullTable = `"${SCHEMA}"."${table}"`;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const columns = Object.keys(batch[0]);
    const quotedCols = columns.map((c) => `"${c}"`).join(', ');

    const valuePlaceholders = [];
    const values = [];
    let paramIndex = 1;

    for (const row of batch) {
      const rowPlaceholders = [];
      for (const col of columns) {
        rowPlaceholders.push(`$${paramIndex++}`);
        values.push(row[col] !== undefined ? row[col] : null);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    const sql = `INSERT INTO ${fullTable} (${quotedCols}) VALUES ${valuePlaceholders.join(', ')} ON CONFLICT ("id") DO NOTHING`;

    const sp = `sp_${table}_${i}`;
    try {
      await client.query(`SAVEPOINT ${sp}`);
      const result = await client.query(sql, values);
      inserted += result.rowCount;
      await client.query(`RELEASE SAVEPOINT ${sp}`);
    } catch (err) {
      await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      console.error(`  Batch fail ${table} rows ${i}-${i + batch.length - 1}:`, err.message);
      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const cols = Object.keys(row);
        const qCols = cols.map((c) => `"${c}"`).join(', ');
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const vals = cols.map((c) => (row[c] !== undefined ? row[c] : null));
        const sp2 = `sp2_${table}_${i}_${j}`;
        try {
          await client.query(`SAVEPOINT ${sp2}`);
          await client.query(
            `INSERT INTO ${fullTable} (${qCols}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`,
            vals,
          );
          inserted++;
          await client.query(`RELEASE SAVEPOINT ${sp2}`);
        } catch (innerErr) {
          await client.query(`ROLLBACK TO SAVEPOINT ${sp2}`);
          errors++;
          if (errors <= 10) {
            console.error(`    Row fail ${table} (id=${row.id}):`, innerErr.message);
          }
        }
      }
    }
  }

  return { inserted, errors };
}

// ---------------------------------------------------------------------------
// Build base overhead row
// ---------------------------------------------------------------------------

function buildBaseOverhead({
  categoryType,
  objectType,
  frequency,
  startDate,
  endDate,
  document,
  pidText,
  propertyMap,
  stats,
}) {
  const id = randomUUID();

  let propertyId = null;
  if (pidText) {
    const mapped = propertyMap.get(pidText);
    if (mapped) {
      propertyId = mapped;
      stats.linked += 1;
    } else {
      stats.unlinked += 1;
      if (stats.unlinkedSamples.length < 10) stats.unlinkedSamples.push(pidText);
    }
  } else {
    stats.noPid += 1;
  }

  return {
    id,
    ...twentyDefaults(),
    categoryType: categoryType || null,
    objectType: mapEnum(objectType, OBJECT_TYPE_MAP),
    frequency: mapEnum(frequency, FREQUENCY_MAP),
    startDate: parseDate(startDate),
    endDate: parseDate(endDate),
    documentPrimaryLinkLabel: null,
    documentPrimaryLinkUrl: cleanVal(document),
    documentSecondaryLinks: JSON.stringify([]),
    propertyId,
    merchantId: null,
  };
}

// ---------------------------------------------------------------------------
// Sheet processors
// ---------------------------------------------------------------------------

function processMaintenance(rows, propertyMap, stats) {
  // Row 0 = headers, data starts at row 1.
  const headers = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const idx = {
    objectType: headers.indexOf('object type'),
    pid: headers.indexOf('pid'),
    frequency: headers.indexOf('frequency'),
    startDate: headers.indexOf('start date'),
    endDate: headers.indexOf('end date'),
    document: headers.indexOf('document'),
    amount: headers.indexOf('amount'),
    cutoff: headers.indexOf('cut-off date'),
    cycle: headers.indexOf('cycle'),
    payToLL: headers.indexOf('payment to landlord'),
  };

  const baseRows = [];
  const extRows = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((v) => v === null || v === '')) continue;

    const pidText = pidToText(row[idx.pid]);
    const base = buildBaseOverhead({
      categoryType: 'MAINTENANCE',
      objectType: row[idx.objectType],
      frequency: row[idx.frequency],
      startDate: row[idx.startDate],
      endDate: row[idx.endDate],
      document: row[idx.document],
      pidText,
      propertyMap,
      stats,
    });
    baseRows.push(base);

    const cutoffRaw = row[idx.cutoff];
    let cutoffStr = null;
    if (cutoffRaw !== null && cutoffRaw !== undefined && cutoffRaw !== '') {
      const n = Number(cutoffRaw);
      cutoffStr = !isNaN(n) && Number.isInteger(n) ? String(n) : String(cutoffRaw);
    }

    extRows.push({
      id: randomUUID(),
      ...twentyDefaults(),
      maintenanceAmountAmountMicros: parseCurrencyMicros(row[idx.amount]),
      maintenanceAmountCurrencyCode: 'INR',
      maintenanceCutoffDate: cutoffStr,
      maintenanceCycle: mapEnum(row[idx.cycle], MAINTENANCE_CYCLE_MAP),
      maintenancePayToLl: parseBool(row[idx.payToLL]),
      maintenanceCollectTenant: null,
      overheadId: base.id,
    });
  }

  return { baseRows, extRows };
}

function processApiNameSheet(sheetName, rows, categoryType, fieldBuilder, propertyMap, stats) {
  // Row 0 = labels, Row 1 = api_names, data starts at row 2.
  if (rows.length < 3) return { baseRows: [], extRows: [] };
  const apiNames = rows[1].map((n) => String(n || '').trim());
  const idxMap = {};
  apiNames.forEach((name, i) => {
    if (name) idxMap[name] = i;
  });

  const baseRows = [];
  const extRows = [];

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((v) => v === null || v === '')) continue;

    // Defense: skip rows where pid cell is literally "pid" (residual header)
    const pidRaw = row[idxMap['pid']];
    if (pidRaw !== null && pidRaw !== undefined && String(pidRaw).trim().toLowerCase() === 'pid') {
      continue;
    }

    const pidText = pidToText(pidRaw);
    // Skip rows entirely if they have no pid AND no substantive data
    const hasData = row.some((v, i) => {
      if (i === idxMap['pid']) return false;
      if (i === idxMap['_status']) return false;
      if (i === idxMap['_notes']) return false;
      return v !== null && v !== undefined && v !== '';
    });
    if (!pidText && !hasData) continue;

    const base = buildBaseOverhead({
      categoryType,
      objectType: row[idxMap['object_type']],
      frequency: row[idxMap['frequency']],
      startDate: row[idxMap['start_date']],
      endDate: row[idxMap['end_date']],
      document: row[idxMap['document']],
      pidText,
      propertyMap,
      stats,
    });
    baseRows.push(base);

    const extRow = fieldBuilder(row, idxMap, base.id);
    extRows.push(extRow);
  }

  return { baseRows, extRows };
}

function buildWifiExt(row, idxMap, overheadId) {
  const phone = parsePhone(cleanVal(row[idxMap['wifi_registered_number']]));
  return {
    id: randomUUID(),
    ...twentyDefaults(),
    wifiProvider: cleanVal(row[idxMap['wifi_provider']]),
    wifiAccountId: cleanVal(row[idxMap['wifi_account_id']]),
    wifiStartDate: parseDate(row[idxMap['wifi_start_date']]),
    wifiPlanDuration: parseNumber(row[idxMap['wifi_plan_duration']]),
    wifiEndDate: parseDate(row[idxMap['wifi_end_date']]),
    wifiPlanCostAmountMicros: parseCurrencyMicros(row[idxMap['wifi_plan_cost']]),
    wifiPlanCostCurrencyCode: 'INR',
    wifiSsid: cleanVal(row[idxMap['wifi_ssid']]),
    wifiPassword: cleanVal(row[idxMap['wifi_password']]),
    wifiOwnership: mapEnum(row[idxMap['wifi_ownership']], OWNERSHIP_MAP),
    wifiAmountAmountMicros: parseCurrencyMicros(row[idxMap['wifi_amount']]),
    wifiAmountCurrencyCode: 'INR',
    wifiRegisteredNumberPrimaryPhoneNumber: phone.number,
    wifiRegisteredNumberPrimaryPhoneCountryCode: phone.number ? phone.countryCode : null,
    wifiRegisteredNumberPrimaryPhoneCallingCode: phone.number ? phone.callingCode : null,
    wifiRegisteredNumberAdditionalPhones: JSON.stringify([]),
    wifiCollectTenant: parseBool(row[idxMap['wifi_collect_tenant']]),
    wifiPayToLl: parseBool(row[idxMap['wifi_pay_to_ll']]),
    overheadId,
  };
}

function buildElectricityExt(row, idxMap, overheadId) {
  return {
    id: randomUUID(),
    ...twentyDefaults(),
    electricityProvider: cleanVal(row[idxMap['electricity_provider']]),
    electricityConnectionType: mapEnum(row[idxMap['electricity_connection_type']], ELECTRICITY_CONNECTION_MAP),
    electricityAccountNo: cleanVal(row[idxMap['electricity_account_no']]),
    electricityPassword: cleanVal(row[idxMap['electricity_password']]),
    electricityOwnership: mapEnum(row[idxMap['electricity_ownership']], OWNERSHIP_MAP),
    electricityPayToLl: parseBool(row[idxMap['electricity_pay_to_ll']]),
    electricityCollectTenant: parseBool(row[idxMap['electricity_collect_tenant']]),
    overheadId,
  };
}

function buildWaterPurifierExt(row, idxMap, overheadId) {
  return {
    id: randomUUID(),
    ...twentyDefaults(),
    purifierSerialNo: cleanVal(row[idxMap['purifier_serial_no']]),
    purifierSubscription: cleanVal(row[idxMap['purifier_subscription']]),
    purifierOwnership: mapEnum(row[idxMap['purifier_ownership']], OWNERSHIP_MAP),
    purifierPayToLl: parseBool(row[idxMap['purifier_pay_to_ll']]),
    purifierCollectTenant: parseBool(row[idxMap['purifier_collect_tenant']]),
    overheadId,
  };
}

function buildGasExt(row, idxMap, overheadId) {
  return {
    id: randomUUID(),
    ...twentyDefaults(),
    gasConnectionType: mapEnum(row[idxMap['gas_connection_type']], GAS_CONNECTION_MAP),
    gasAccountNo: cleanVal(row[idxMap['gas_account_no']]),
    gasPassword: cleanVal(row[idxMap['gas_password']]),
    gasOwnership: mapEnum(row[idxMap['gas_ownership']], OWNERSHIP_MAP),
    gasPayToLl: parseBool(row[idxMap['gas_pay_to_ll']]),
    gasCollectTenant: parseBool(row[idxMap['gas_collect_tenant']]),
    overheadId,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pool = new Pool({
    connectionString: process.env.PG_DATABASE_URL,
    max: 4,
  });
  const client = await pool.connect();

  try {
    console.log('Loading', SOURCE_FILE);
    const data = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));

    // Property PID -> UUID map
    console.log('Loading property lookup...');
    const propRes = await client.query(
      `SELECT pid, id FROM "${SCHEMA}"."_property" WHERE pid IS NOT NULL`,
    );
    const propertyMap = new Map();
    propRes.rows.forEach((r) => propertyMap.set(String(r.pid).trim(), r.id));
    console.log(`  Loaded ${propertyMap.size} properties.`);

    const stats = {
      linked: 0,
      unlinked: 0,
      noPid: 0,
      unlinkedSamples: [],
    };

    // Process all sheets
    const allBase = [];
    const byTable = {
      _overheadMaintenance: [],
      _overheadWifi: [],
      _overheadElectricity: [],
      _overheadWaterPurifier: [],
      _overheadGas: [],
    };

    if (data.Maintenance && data.Maintenance.length > 1) {
      console.log(`\nProcessing Maintenance (${data.Maintenance.length - 1} data rows)...`);
      const { baseRows, extRows } = processMaintenance(data.Maintenance, propertyMap, stats);
      allBase.push(...baseRows);
      byTable._overheadMaintenance.push(...extRows);
      console.log(`  Built ${baseRows.length} base + ${extRows.length} maintenance rows.`);
    }

    if (data.WiFi && data.WiFi.length > 2) {
      console.log(`\nProcessing WiFi (${data.WiFi.length - 2} data rows)...`);
      const { baseRows, extRows } = processApiNameSheet(
        'WiFi',
        data.WiFi,
        'WIFI',
        buildWifiExt,
        propertyMap,
        stats,
      );
      allBase.push(...baseRows);
      byTable._overheadWifi.push(...extRows);
      console.log(`  Built ${baseRows.length} base + ${extRows.length} wifi rows.`);
    }

    if (data.Electricity && data.Electricity.length > 2) {
      console.log(`\nProcessing Electricity (${data.Electricity.length - 2} data rows)...`);
      const { baseRows, extRows } = processApiNameSheet(
        'Electricity',
        data.Electricity,
        'ELECTRICITY',
        buildElectricityExt,
        propertyMap,
        stats,
      );
      allBase.push(...baseRows);
      byTable._overheadElectricity.push(...extRows);
      console.log(`  Built ${baseRows.length} base + ${extRows.length} electricity rows.`);
    }

    if (data.Water_Purifier && data.Water_Purifier.length > 2) {
      console.log(`\nProcessing Water_Purifier (${data.Water_Purifier.length - 2} data rows)...`);
      const { baseRows, extRows } = processApiNameSheet(
        'Water_Purifier',
        data.Water_Purifier,
        'WATER_PURIFIER',
        buildWaterPurifierExt,
        propertyMap,
        stats,
      );
      allBase.push(...baseRows);
      byTable._overheadWaterPurifier.push(...extRows);
      console.log(`  Built ${baseRows.length} base + ${extRows.length} water purifier rows.`);
    }

    if (data.Gas_Connection && data.Gas_Connection.length > 2) {
      console.log(`\nProcessing Gas_Connection (${data.Gas_Connection.length - 2} data rows)...`);
      const { baseRows, extRows } = processApiNameSheet(
        'Gas_Connection',
        data.Gas_Connection,
        'GAS',
        buildGasExt,
        propertyMap,
        stats,
      );
      allBase.push(...baseRows);
      byTable._overheadGas.push(...extRows);
      console.log(`  Built ${baseRows.length} base + ${extRows.length} gas rows.`);
    }

    console.log(`\nTotal base rows to insert: ${allBase.length}`);
    console.log(`Property linkage: linked=${stats.linked}, unlinked=${stats.unlinked}, noPid=${stats.noPid}`);
    if (stats.unlinkedSamples.length > 0) {
      console.log('  Unlinked pid samples:', stats.unlinkedSamples.join(','));
    }

    // Insert everything inside a single transaction
    console.log('\nStarting transaction...');
    await client.query('BEGIN');

    const results = {};

    const baseResult = await batchInsert(client, '_overhead', allBase);
    results._overhead = baseResult;
    console.log(`_overhead inserted=${baseResult.inserted} errors=${baseResult.errors}`);

    for (const [table, rows] of Object.entries(byTable)) {
      const res = await batchInsert(client, table, rows);
      results[table] = res;
      console.log(`${table} inserted=${res.inserted} errors=${res.errors}`);
    }

    await client.query('COMMIT');
    console.log('\nTransaction committed.');

    // Verify counts
    console.log('\n=== Verification ===');
    for (const t of ['_overhead', '_overheadMaintenance', '_overheadWifi', '_overheadElectricity', '_overheadWaterPurifier', '_overheadGas']) {
      const r = await client.query(`SELECT COUNT(*) FROM "${SCHEMA}"."${t}"`);
      console.log(`${t}: ${r.rows[0].count}`);
    }

    // Property linkage summary
    const linkCheck = await client.query(
      `SELECT COUNT(*) FILTER (WHERE "propertyId" IS NOT NULL) AS linked,
              COUNT(*) FILTER (WHERE "propertyId" IS NULL)     AS unlinked
       FROM "${SCHEMA}"."_overhead"`,
    );
    console.log(`Overhead property linkage: linked=${linkCheck.rows[0].linked} unlinked=${linkCheck.rows[0].unlinked}`);

    console.log('\nImport complete.');
  } catch (err) {
    console.error('FATAL:', err);
    try { await client.query('ROLLBACK'); } catch (_) {}
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Unhandled:', e);
  process.exit(1);
});
