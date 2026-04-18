/**
 * Flent Data Import Script
 *
 * Imports data from 3 sources into the Twenty CRM workspace:
 *   1. Vendor CSV (Google Sheets) -> _vendor, _vendorContact, _vendorBilling, _vendorCapability, _vendorCommercial
 *   2. FSIN CSV (Google Sheets) -> _fsin, _fsinSpecification
 *   3. Items (Supabase REST API) -> _item, _itemState, _itemTransactionLink
 *
 * Usage: node import-data.js
 * Requires: PG_DATABASE_URL environment variable (auto-available inside twenty-server pod)
 */

const { Pool } = require('pg');
const https = require('https');
const { randomUUID } = require('crypto');

// ─── Configuration ────────────────────────────────────────────────────────────

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';

const VENDOR_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1d1x2YQupN6s3Opxo3ohyt--EWDXJFqQZab2fV8RrS-A/gviz/tq?tqx=out:csv&sheet=Vendor';

const FSIN_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1d1x2YQupN6s3Opxo3ohyt--EWDXJFqQZab2fV8RrS-A/gviz/tq?tqx=out:csv&sheet=FSIN';

const SUPABASE_URL = 'https://nhhtfcwacypabokrotts.supabase.co/rest/v1';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaHRmY3dhY3lwYWJva3JvdHRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI3MjI4OCwiZXhwIjoyMDcyODQ4Mjg4fQ.Ozk6lVL3H9iPuBjVZ6533JU5rjuYF3FXtGEfAVCMeLM';

const SUPABASE_PAGE_SIZE = 1000;

// ─── Enum Mappings ────────────────────────────────────────────────────────────

const VENDOR_TYPE_MAP = {
  manufacturer: 'MANUFACTURER',
  wholeseller: 'WHOLESALER',
  wholesaler: 'WHOLESALER',
  distributor: 'DISTRIBUTOR',
  freelancer: 'FREELANCER',
  aggregate: 'AGGREGATOR',
  aggregator: 'AGGREGATOR',
  retailer: 'RETAILER',
  landlord: 'LANDLORD',
};

const MSME_MAP = {
  yes: 'YES',
  no: 'NO',
  true: 'YES',
  false: 'NO',
  '1': 'YES',
  '0': 'NO',
};

const CUSTOMIZATION_MAP = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
};

const STANDARDISATION_MAP = {
  c1: 'C1',
  c2: 'C2',
  c3: 'C3',
};

const QUALITY_TIER_MAP = {
  t1: 'T1',
  t2: 'T2',
  t3: 'T3',
};

const FSIN_CATEGORY_MAP = {
  bed: 'BED',
  br_standard_queen_bed: 'BED',
  mattress: 'MATTRESS',
  wardrobe: 'WARDROBE',
  study_table: 'STUDY_TABLE',
  'study table': 'STUDY_TABLE',
  study_chair: 'STUDY_CHAIR',
  dining_table: 'DINING_TABLE',
  lrd_dining: 'DINING_TABLE',
  dining_chair: 'DINING_CHAIR',
  sofa: 'SOFA',
  lrd_couch_primary: 'SOFA',
  center_table: 'CENTER_TABLE',
  lrd_coffee_table: 'CENTER_TABLE',
  'side table': 'CENTER_TABLE',
  lrd_console_table: 'CENTER_TABLE',
  tv_unit: 'TV_UNIT',
  lrd_tv_console: 'TV_UNIT',
  shoe_rack: 'SHOE_RACK',
  bookshelf: 'BOOKSHELF',
  curtain: 'CURTAIN',
  mirror: 'MIRROR',
  appliance: 'APPLIANCE',
  kitchenware: 'KITCHENWARE',
  bedding: 'BEDDING',
  decor: 'DECOR',
  decor_shelves: 'DECOR',
  storage: 'STORAGE',
  other: 'OTHER',
  misc: 'OTHER',
  perish: 'OTHER',
};

const FSIN_UOM_MAP = {
  ea: 'PIECE',
  piece: 'PIECE',
  pcs: 'PIECE',
  set: 'SET',
  pair: 'PAIR',
  meter: 'METER',
  m: 'METER',
  kg: 'KG',
  box: 'BOX',
  roll: 'ROLL',
  bundle: 'BUNDLE',
};

const FSIN_PACKAGING_MAP = {
  flatpack: 'FLATPACK',
  assembled: 'ASSEMBLED',
};

const ITEM_STATE_MAP = {
  BUY: 'BUY',
  WIB: 'WIB',
  WOB: 'WOB',
  PIB: 'PIB',
  POB: 'POB',
  WORK: 'WORK',
  DEAD: 'DEAD',
};

const QA_FLAG_MAP = {
  pass: 'YES',
  yes: 'YES',
  fail: 'NO',
  no: 'NO',
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        ...headers,
      },
    };
    const req = https.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Parse CSV string into array of arrays.
 * Handles quoted fields with commas and newlines inside quotes.
 */
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current);
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current);
        current = '';
        if (row.some((c) => c.trim())) {
          rows.push(row);
        }
        row = [];
        if (char === '\r') i++; // skip \n in \r\n
      } else {
        current += char;
      }
    }
  }
  // last row
  if (current || row.length > 0) {
    row.push(current);
    if (row.some((c) => c.trim())) {
      rows.push(row);
    }
  }
  return rows;
}

function cleanVal(val) {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a') {
    return null;
  }
  return trimmed;
}

function mapEnum(val, mapping) {
  if (!val) return null;
  const key = String(val).trim().toLowerCase();
  return mapping[key] || null;
}

function parseCurrencyMicros(val) {
  if (!val) return null;
  const cleaned = String(val).replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 1000000);
}

function parsePhone(phoneStr) {
  if (!phoneStr) return { number: null, countryCode: null, callingCode: null };
  let cleaned = String(phoneStr).replace(/[\s\-()]/g, '');
  let callingCode = '+91'; // default India
  let countryCode = 'IN';

  if (cleaned.startsWith('+')) {
    if (cleaned.startsWith('+91')) {
      callingCode = '+91';
      countryCode = 'IN';
      cleaned = cleaned.substring(3);
    } else {
      // Keep first digits as calling code
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

// ─── Twenty metadata defaults for createdBy/updatedBy ─────────────────────────

function twentyDefaults() {
  const ts = now();
  return {
    createdAt: ts,
    updatedAt: ts,
    createdBySource: 'IMPORT',
    updatedBySource: 'IMPORT',
    createdByName: 'Flent Import Script',
    updatedByName: 'Flent Import Script',
    createdByWorkspaceMemberId: null,
    updatedByWorkspaceMemberId: null,
    createdByContext: null,
    updatedByContext: null,
    deletedAt: null,
    position: 0,
  };
}

// ─── Batch insert helper ──────────────────────────────────────────────────────

async function batchInsert(client, table, rows, batchSize = 50) {
  if (rows.length === 0) return 0;

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

    try {
      const result = await client.query(sql, values);
      inserted += result.rowCount;
    } catch (err) {
      console.error(`  Error inserting batch into ${table} (rows ${i}-${i + batch.length - 1}):`, err.message);
      // Try individual inserts for this batch
      for (const row of batch) {
        const cols = Object.keys(row);
        const qCols = cols.map((c) => `"${c}"`).join(', ');
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const vals = cols.map((c) => (row[c] !== undefined ? row[c] : null));
        try {
          await client.query(
            `INSERT INTO ${fullTable} (${qCols}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`,
            vals,
          );
          inserted++;
        } catch (innerErr) {
          errors++;
          console.error(`    Failed row in ${table} (id=${row.id}):`, innerErr.message);
        }
      }
    }
  }

  return { inserted, errors };
}

// ─── 1. Import Vendors ────────────────────────────────────────────────────────

async function importVendors(client) {
  console.log('\n=== Importing Vendors ===');
  console.log('Fetching vendor CSV from Google Sheets...');

  const csvText = await httpsGet(VENDOR_CSV_URL);
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    console.log('No vendor data found.');
    return {};
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);
  console.log(`Parsed ${dataRows.length} vendor rows.`);

  const vendorMap = {}; // vendorCode -> vendorId (UUID)
  const vendors = [];
  const contacts = [];
  const billings = [];
  const capabilities = [];
  const commercials = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = dataRows[i][idx] || '';
    });

    const vendorCode = cleanVal(row.vendor_code);
    if (!vendorCode) {
      console.log(`  Skipping row ${i + 2}: no vendor_code`);
      continue;
    }

    const vendorName = cleanVal(row.vendor_name) || vendorCode;
    const vendorId = randomUUID();
    vendorMap[vendorCode] = vendorId;

    const defaults = twentyDefaults();
    // Use the source created_at/updated_at if available
    const srcCreatedAt = cleanVal(row.created_at);
    const srcUpdatedAt = cleanVal(row.updated_at);
    if (srcCreatedAt) defaults.createdAt = srcCreatedAt;
    if (srcUpdatedAt) defaults.updatedAt = srcUpdatedAt;

    // --- _vendor (base) ---
    const vendorType = mapEnum(row.vendor_type, VENDOR_TYPE_MAP);
    vendors.push({
      id: vendorId,
      name: vendorName,
      vendorCode,
      vendorName,
      vendorType,
      status: 'ACTIVE',
      ...defaults,
    });

    // --- _vendorContact ---
    const contactName = cleanVal(row.contact_name);
    const primaryPhone = parsePhone(cleanVal(row.phone));
    const altPhoneRaw = cleanVal(row.alternate_phone);
    const altPhone = altPhoneRaw ? parsePhone(altPhoneRaw) : null;
    const email = cleanVal(row.email);
    const city = cleanVal(row.city);
    const address = cleanVal(row.address);

    const contactId = randomUUID();
    const contactRow = {
      id: contactId,
      contactName,
      phonesPrimaryPhoneNumber: primaryPhone.number,
      phonesPrimaryPhoneCountryCode: primaryPhone.countryCode,
      phonesPrimaryPhoneCallingCode: primaryPhone.callingCode,
      phonesAdditionalPhones: altPhone && altPhone.number
        ? JSON.stringify([
            {
              number: altPhone.number,
              countryCode: altPhone.countryCode,
              callingCode: altPhone.callingCode,
            },
          ])
        : null,
      emailsPrimaryEmail: email,
      emailsAdditionalEmails: null,
      city,
      vendorAddressAddressStreet1: address,
      vendorAddressAddressStreet2: null,
      vendorAddressAddressCity: city,
      vendorAddressAddressPostcode: null,
      vendorAddressAddressState: null,
      vendorAddressAddressCountry: 'India',
      vendorAddressAddressLat: null,
      vendorAddressAddressLng: null,
      vendorId,
      ...twentyDefaults(),
    };
    contacts.push(contactRow);

    // --- _vendorBilling ---
    const billingId = randomUUID();
    const msmeVendor = mapEnum(row.msme_vendor, MSME_MAP);
    billings.push({
      id: billingId,
      gstNumber: cleanVal(row.gst_number),
      pan: cleanVal(row.pan),
      billingName: cleanVal(row.billing_name),
      bankName: cleanVal(row.bank_name),
      bankAccountNumber: cleanVal(row.bank_account_number),
      ifscCode: cleanVal(row.ifsc_code),
      msmeVendor,
      udyamAadhaar: cleanVal(row.udyam_aadhaar),
      vendorId,
      ...twentyDefaults(),
    });

    // --- _vendorCapability ---
    const capId = randomUUID();
    const specText = cleanVal(row.specialization);
    const tatRaw = cleanVal(row.tat_in_days);
    const tat = tatRaw ? parseFloat(tatRaw) : null;
    capabilities.push({
      id: capId,
      specializationMarkdown: specText,
      specializationBlocknote: specText
        ? JSON.stringify([
            {
              id: randomUUID(),
              type: 'paragraph',
              props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
              content: [{ type: 'text', text: specText, styles: {} }],
              children: [],
            },
          ])
        : null,
      tatInDays: isNaN(tat) ? null : tat,
      customizationCapability: mapEnum(row.customization_capability, CUSTOMIZATION_MAP),
      standardisationFit: mapEnum(row.standardisation_fit, STANDARDISATION_MAP),
      vendorId,
      ...twentyDefaults(),
    });

    // --- _vendorCommercial ---
    const comId = randomUUID();
    const minOrderMicros = parseCurrencyMicros(row.min_order_value);
    const negRemarks = cleanVal(row.negotiation_remarks);
    commercials.push({
      id: comId,
      qualityTier: mapEnum(row.quality_tier, QUALITY_TIER_MAP),
      paymentTerms: cleanVal(row.payment_terms),
      minOrderValueAmountMicros: minOrderMicros,
      minOrderValueCurrencyCode: minOrderMicros !== null ? 'INR' : null,
      negotiationRemarksMarkdown: negRemarks,
      negotiationRemarksBlocknote: negRemarks
        ? JSON.stringify([
            {
              id: randomUUID(),
              type: 'paragraph',
              props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
              content: [{ type: 'text', text: negRemarks, styles: {} }],
              children: [],
            },
          ])
        : null,
      vendorId,
      ...twentyDefaults(),
    });
  }

  console.log(`Inserting ${vendors.length} vendors...`);
  const vResult = await batchInsert(client, '_vendor', vendors);
  console.log(`  _vendor: ${vResult.inserted} inserted, ${vResult.errors} errors`);

  const cResult = await batchInsert(client, '_vendorContact', contacts);
  console.log(`  _vendorContact: ${cResult.inserted} inserted, ${cResult.errors} errors`);

  const bResult = await batchInsert(client, '_vendorBilling', billings);
  console.log(`  _vendorBilling: ${bResult.inserted} inserted, ${bResult.errors} errors`);

  const capResult = await batchInsert(client, '_vendorCapability', capabilities);
  console.log(`  _vendorCapability: ${capResult.inserted} inserted, ${capResult.errors} errors`);

  const comResult = await batchInsert(client, '_vendorCommercial', commercials);
  console.log(`  _vendorCommercial: ${comResult.inserted} inserted, ${comResult.errors} errors`);

  return vendorMap;
}

// ─── 2. Import FSINs ──────────────────────────────────────────────────────────

async function importFSINs(client, vendorMap) {
  console.log('\n=== Importing FSINs ===');
  console.log('Fetching FSIN CSV from Google Sheets...');

  const csvText = await httpsGet(FSIN_CSV_URL);
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    console.log('No FSIN data found.');
    return {};
  }

  // The header row in this sheet is corrupted (multiple data rows collapsed).
  // Column order (verified from header analysis):
  // [0] fsin_code, [1] vendor_code, [2] item_name, [3] category, [4] uom,
  // [5] image, [6] reorder_point, [7] annual_depreciation, [8] perceived_value,
  // [9] dimensions, [10] material, [11] finish, [12] color, [13] style,
  // [14] attribute, [15] packaging, [16] lego, [17] specific_care
  const FSIN_HEADERS = [
    'fsin_code',
    'vendor_code',
    'item_name',
    'category',
    'uom',
    'image',
    'reorder_point',
    'annual_depreciation',
    'perceived_value',
    'dimensions',
    'material',
    'finish',
    'color',
    'style',
    'attribute',
    'packaging',
    'lego',
    'specific_care',
  ];

  // Skip the corrupted header row; data starts at row index 1
  const dataRows = rows.slice(1);
  console.log(`Parsed ${dataRows.length} FSIN rows (skipped corrupted header).`);

  const fsinMap = {}; // fsinCode -> fsinId (UUID)
  const fsins = [];
  const specs = [];
  let vendorNotFound = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const raw = dataRows[i];
    const row = {};
    FSIN_HEADERS.forEach((h, idx) => {
      row[h] = raw[idx] || '';
    });

    const fsinCode = cleanVal(row.fsin_code);
    if (!fsinCode) {
      continue;
    }

    const vendorCode = cleanVal(row.vendor_code);
    let vendorId = null;
    if (vendorCode && vendorMap[vendorCode]) {
      vendorId = vendorMap[vendorCode];
    } else if (vendorCode) {
      vendorNotFound++;
    }

    const itemName = cleanVal(row.item_name) || fsinCode;
    const fsinId = randomUUID();
    fsinMap[fsinCode] = fsinId;

    // Map category
    const category = mapEnum(row.category, FSIN_CATEGORY_MAP) || 'OTHER';
    const uom = mapEnum(row.uom, FSIN_UOM_MAP) || 'PIECE';

    // Image field - if it's a path, build the URL
    const imageRaw = cleanVal(row.image);
    let imageUrl = null;
    if (imageRaw && imageRaw !== 'serial' && imageRaw.length > 3) {
      imageUrl = imageRaw;
    }

    // Reorder point
    const reorderRaw = cleanVal(row.reorder_point);
    const reorderPoint = reorderRaw ? parseFloat(reorderRaw) : null;

    // Annual depreciation (currency)
    const depRaw = cleanVal(row.annual_depreciation);
    let depMicros = null;
    // The annual_depreciation column sometimes contains image paths, not currency values
    if (depRaw && !depRaw.includes('fsin_Images') && !depRaw.includes('/')) {
      depMicros = parseCurrencyMicros(depRaw);
    }
    // If depRaw is an image path, use it as the image URL instead
    if (depRaw && depRaw.includes('fsin_Images')) {
      imageUrl = depRaw;
    }

    // Perceived value (currency)
    const pvRaw = cleanVal(row.perceived_value);
    const pvMicros = pvRaw ? parseCurrencyMicros(pvRaw) : null;

    // Packaging
    const packaging = mapEnum(row.packaging, FSIN_PACKAGING_MAP);

    // Lego (number)
    const legoRaw = cleanVal(row.lego);
    const lego = legoRaw ? parseFloat(legoRaw) : null;

    const defaults = twentyDefaults();

    fsins.push({
      id: fsinId,
      name: itemName,
      fsinCode,
      itemName,
      category,
      uom,
      imagePrimaryLinkLabel: imageUrl ? 'Product Image' : null,
      imagePrimaryLinkUrl: imageUrl,
      imageSecondaryLinks: null,
      reorderPoint: isNaN(reorderPoint) ? null : reorderPoint,
      annualDepreciationAmountMicros: depMicros,
      annualDepreciationCurrencyCode: depMicros !== null ? 'INR' : null,
      perceivedValueAmountMicros: pvMicros,
      perceivedValueCurrencyCode: pvMicros !== null ? 'INR' : null,
      packaging,
      lego: isNaN(lego) ? null : lego,
      status: 'ACTIVE',
      vendorId,
      ...defaults,
    });

    // --- _fsinSpecification ---
    const dimensions = cleanVal(row.dimensions);
    const material = cleanVal(row.material);
    const finish = cleanVal(row.finish);
    const color = cleanVal(row.color);
    const style = cleanVal(row.style);
    const attribute = cleanVal(row.attribute);

    const specId = randomUUID();
    specs.push({
      id: specId,
      dimensions,
      material,
      finish,
      color,
      style,
      attribute,
      fsinId,
      ...twentyDefaults(),
    });
  }

  if (vendorNotFound > 0) {
    console.log(`  Warning: ${vendorNotFound} FSINs referenced vendor codes not found in vendor data.`);
  }

  console.log(`Inserting ${fsins.length} FSINs...`);
  const fResult = await batchInsert(client, '_fsin', fsins);
  console.log(`  _fsin: ${fResult.inserted} inserted, ${fResult.errors} errors`);

  const sResult = await batchInsert(client, '_fsinSpecification', specs);
  console.log(`  _fsinSpecification: ${sResult.inserted} inserted, ${sResult.errors} errors`);

  return fsinMap;
}

// ─── 3. Import Items from Supabase ────────────────────────────────────────────

async function fetchAllSupabaseItems() {
  console.log('Fetching items from Supabase (paginated)...');
  let allItems = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${SUPABASE_URL}/items?select=*&order=item_code&offset=${offset}&limit=${SUPABASE_PAGE_SIZE}`;
    const response = await httpsGet(url, {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    });
    const items = JSON.parse(response);
    allItems = allItems.concat(items);
    console.log(`  Fetched ${items.length} items (total so far: ${allItems.length})`);
    if (items.length < SUPABASE_PAGE_SIZE) {
      hasMore = false;
    } else {
      offset += SUPABASE_PAGE_SIZE;
    }
  }

  return allItems;
}

async function importItems(client, fsinMap) {
  console.log('\n=== Importing Items ===');

  const supabaseItems = await fetchAllSupabaseItems();
  console.log(`Total Supabase items: ${supabaseItems.length}`);

  const items = [];
  const itemStates = [];
  const itemTxnLinks = [];
  let fsinNotFound = 0;

  for (const src of supabaseItems) {
    const itemCode = cleanVal(src.item_code);
    if (!itemCode) continue;

    const itemId = randomUUID();
    const fsinCode = cleanVal(src.fsin_code);
    let fsinId = null;
    if (fsinCode && fsinMap[fsinCode]) {
      fsinId = fsinMap[fsinCode];
    } else if (fsinCode) {
      fsinNotFound++;
    }

    // Extract serial number from item_seq or from item_code (e.g., "AL10015-7" -> 7)
    let serialNo = null;
    if (src.item_seq !== null && src.item_seq !== undefined) {
      serialNo = parseFloat(src.item_seq);
    }

    const defaults = twentyDefaults();
    if (src.created_at) defaults.createdAt = src.created_at;

    // --- _item (base) ---
    items.push({
      id: itemId,
      name: itemCode,
      itemCode,
      serialNo: isNaN(serialNo) ? null : serialNo,
      unitPriceAmountMicros: null, // not in Supabase data
      unitPriceCurrencyCode: null,
      gstPercent: null, // not in Supabase data
      fsinId,
      poLineId: null, // po_line_id is a Supabase UUID, not in Twenty
      ...defaults,
    });

    // --- _itemState ---
    const state = ITEM_STATE_MAP[src.state] || null;
    const qaFlag = src.qa_flag ? mapEnum(src.qa_flag, QA_FLAG_MAP) : null;
    const lockVal = src.lock === true || src.lock === 'true';
    const stateId = randomUUID();

    const snapshotUrl = cleanVal(src.snapshot);

    itemStates.push({
      id: stateId,
      lock: lockVal,
      lockByPfs: cleanVal(src.locked_by_pfs_id),
      lockedAt: cleanVal(src.locked_at),
      location: cleanVal(src.location),
      state: state || 'BUY',
      stateTime: cleanVal(src.state_time),
      latestSnapshotDate: cleanVal(src.snap_date),
      snapshotPrimaryLinkLabel: snapshotUrl ? 'Snapshot' : null,
      snapshotPrimaryLinkUrl: snapshotUrl,
      snapshotSecondaryLinks: null,
      utilisedAt: null,
      qaFlag,
      itemId,
      ...twentyDefaults(),
    });

    // --- _itemTransactionLink (only if there's bill document data) ---
    // Supabase items don't have explicit bill_document_id or txn_no, so we skip
    // creating empty transaction links. If history data exists we could parse it.
  }

  if (fsinNotFound > 0) {
    console.log(`  Warning: ${fsinNotFound} items referenced FSIN codes not found in FSIN data.`);
  }

  console.log(`Inserting ${items.length} items...`);
  const iResult = await batchInsert(client, '_item', items, 100);
  console.log(`  _item: ${iResult.inserted} inserted, ${iResult.errors} errors`);

  const isResult = await batchInsert(client, '_itemState', itemStates, 100);
  console.log(`  _itemState: ${isResult.inserted} inserted, ${isResult.errors} errors`);

  if (itemTxnLinks.length > 0) {
    const itResult = await batchInsert(client, '_itemTransactionLink', itemTxnLinks, 100);
    console.log(`  _itemTransactionLink: ${itResult.inserted} inserted, ${itResult.errors} errors`);
  } else {
    console.log(`  _itemTransactionLink: 0 inserted (no transaction data in Supabase source)`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('==================================================');
  console.log('  Flent Data Import - Twenty CRM');
  console.log('  Target schema:', SCHEMA);
  console.log('  Started at:', now());
  console.log('==================================================');

  const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });
  const client = await pool.connect();

  try {
    // Set search path
    await client.query(`SET search_path TO "${SCHEMA}", public`);

    // Begin transaction
    await client.query('BEGIN');

    // 1. Import Vendors
    const vendorMap = await importVendors(client);
    console.log(`\nVendor code -> UUID map: ${Object.keys(vendorMap).length} entries`);

    // 2. Import FSINs (needs vendorMap for FK linking)
    const fsinMap = await importFSINs(client, vendorMap);
    console.log(`\nFSIN code -> UUID map: ${Object.keys(fsinMap).length} entries`);

    // 3. Import Items (needs fsinMap for FK linking)
    await importItems(client, fsinMap);

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n=== Transaction COMMITTED successfully ===');

    // Verify counts
    console.log('\n=== Verification: Record counts ===');
    const tables = [
      '_vendor',
      '_vendorContact',
      '_vendorBilling',
      '_vendorCapability',
      '_vendorCommercial',
      '_fsin',
      '_fsinSpecification',
      '_item',
      '_itemState',
      '_itemTransactionLink',
    ];
    for (const t of tables) {
      const res = await pool.query(`SELECT count(*) as c FROM "${SCHEMA}"."${t}"`);
      console.log(`  ${t}: ${res.rows[0].c} records`);
    }
  } catch (err) {
    console.error('\n!!! ERROR - Rolling back transaction !!!');
    console.error(err.message);
    console.error(err.stack);
    await client.query('ROLLBACK');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
    console.log('\nCompleted at:', now());
  }
}

main();
