/**
 * Flent Demand Data Import Script
 *
 * Imports data from 3 JSON sources (pre-fetched from Google Sheets) into Twenty CRM:
 *   1. /tmp/tenants-raw.json   -> _tenant, _tenantAttribution, _tenantRequirement,
 *                                 _tenantQualification, _tenantVisitSummary, _tenantSatisfaction
 *   2. /tmp/contracts-raw.json -> _contract, _tenantContractDetail
 *   3. /tmp/rid-raw.json       -> _property (created), _room, _roomSpecification,
 *                                 _roomFurnishing, _roomCommercial, _roomAvailability
 *
 * Usage: node import-demand-data.js
 * Requires: PG_DATABASE_URL environment variable (auto-available inside twenty-server pod)
 * JSON files must be copied to /tmp/ on the pod before execution.
 */

const { Pool } = require('pg');
const fs = require('fs');
const { randomUUID } = require('crypto');

// --- Configuration ---

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';

// --- Enum Mappings ---

const GENDER_MAP = {
  male: 'MALE',
  female: 'FEMALE',
};

const TENANT_LIFECYCLE_MAP = {
  'new inquiry': 'NEW_INQUIRY',
  'visit scheduled': 'VISIT_SCHEDULED',
  'visit done': 'VISIT_DONE',
  negotiation: 'NEGOTIATION',
  converted: 'CONVERTED',
  'gestation initiated': 'GESTATION',
  gestation: 'GESTATION',
  member: 'MOVED_IN',
  'moved in': 'MOVED_IN',
  'move in pending': 'CONVERTED',
  'notice triggered': 'NOTICE_PERIOD',
  'notice period': 'NOTICE_PERIOD',
  'moved out': 'MOVED_OUT',
  'dead lead': 'DEAD_LEAD',
  dead: 'DEAD_LEAD',
  'token pending': 'NEGOTIATION',
  'agreement signed': 'CONVERTED',
  'fmr+deposit pending': 'CONVERTED',
};

const CHANNEL_MAP = {
  whatsapp: 'WHATSAPP',
  website: 'WEBSITE',
  instagram: 'INSTAGRAM',
  facebook: 'FACEBOOK',
  'direct call': 'DIRECT_CALL',
  'walk in': 'WALK_IN',
  'walk-in': 'WALK_IN',
  platform: 'PLATFORM',
  referral: 'REFERRAL',
  linkedin: 'LINKEDIN',
  twitter: 'WHATSAPP',
  reddit: 'WEBSITE',
};

const SOURCE_DRILLDOWN1_MAP = {
  'google ads': 'GOOGLE_ADS',
  'meta ads': 'META_ADS',
  'instagram ads': 'INSTAGRAM_ADS',
  'youtube ads': 'YOUTUBE_ADS',
  'housing.com': 'HOUSING_COM',
  magicbricks: 'MAGICBRICKS',
  nobroker: 'NOBROKER',
  '99acres': 'NINETY_NINE_ACRES',
  'whatsapp organic': 'WHATSAPP_ORGANIC',
  'walk in': 'WALK_IN',
  'walk-in': 'WALK_IN',
  referral: 'REFERRAL',
  'direct call': 'DIRECT_CALL',
  other: 'OTHER',
};

const OCCUPANCY_MAP = {
  'full home': 'FULL_HOME',
  'private room': 'PRIVATE_ROOM',
};

const FURNISHED_MAP = {
  furnished: 'FURNISHED',
  'semi furnished': 'SEMI_FURNISHED',
  'semi-furnished': 'SEMI_FURNISHED',
  unfurnished: 'UNFURNISHED',
};

const MOVE_IN_TIMELINE_MAP = {
  immediate: 'IMMEDIATE',
  'within 2 weeks': 'WITHIN_2_WEEKS',
  flexible: 'FLEXIBLE',
};

const GENDER_PREFERENCE_MAP = {
  'male only': 'MALE_ONLY',
  'female only': 'FEMALE_ONLY',
  'no preference': 'NO_PREFERENCE',
};

const FOOD_PREFERENCE_MAP = {
  vegetarian: 'VEGETARIAN',
  'non-vegetarian': 'NON_VEGETARIAN',
  'non vegetarian': 'NON_VEGETARIAN',
  vegan: 'VEGAN',
  'no preference': 'NO_PREFERENCE',
};

const SMOKING_MAP = {
  smoker: 'SMOKER',
  'non-smoker': 'NON_SMOKER',
  'non smoker': 'NON_SMOKER',
  occasional: 'OCCASIONAL',
};

const QUALIFICATION_MAP = {
  qualified: 'QUALIFIED',
  'not qualified': 'NOT_QUALIFIED',
  dead: 'DEAD',
  paused: 'PAUSED',
};

const DISQUALIFICATION_REASON_MAP = {
  budget: 'BUDGET',
  location: 'LOCATION',
  availability: 'AVAILABILITY',
  'no response': 'NO_RESPONSE',
  'chose competitor': 'CHOSE_COMPETITOR',
  'life event': 'LIFE_EVENT',
  other: 'OTHER',
};

const BGV_STATUS_MAP = {
  'not started': 'NOT_STARTED',
  'in progress': 'IN_PROGRESS',
  passed: 'PASSED',
  failed: 'FAILED',
};

const NPS_CATEGORY_MAP = {
  promoter: 'PROMOTER',
  passive: 'PASSIVE',
  detractor: 'DETRACTOR',
};

const MICROMARKET_MAP = {
  hsr: 'HSR',
  koramangala: 'KORAMANGALA',
  indiranagar: 'INDIRANAGAR',
  marathahalli: 'MARATHAHALLI',
  marathalli: 'MARATHAHALLI',
  bellandur: 'BELLANDUR',
  mahadevapura: 'MAHADEVAPURA',
  whitefield: 'WHITEFIELD',
  hebbal: 'HEBBAL',
  // Common variations from source data
  "richard's town": 'INDIRANAGAR',
  'richards town': 'INDIRANAGAR',
  "richard's town, indiranagar": 'INDIRANAGAR',
};

const PAYMENT_LIFECYCLE_MAP = {
  'token paid': 'TOKEN_PAID',
  'fmr paid': 'FMR_PAID',
  'sd paid': 'SD_PAID',
  'fmr and sd cleared': 'FMR_AND_SD_CLEARED',
  'payments done': 'PAYMENTS_DONE',
};

const AGREEMENT_LIFECYCLE_MAP = {
  'll and cs released': 'LL_AND_CS_RELEASED',
  'll signed': 'LL_SIGNED',
  'cs signed': 'CS_SIGNED',
  'all agreements signed': 'ALL_AGREEMENTS_SIGNED',
};

const BED_TYPE_MAP = {
  single: 'SINGLE',
  'single bed': 'SINGLE',
  double: 'DOUBLE',
  'double bed': 'DOUBLE',
  queen: 'QUEEN',
  'queen size': 'QUEEN',
  king: 'KING',
  'king size': 'KING',
};

const AC_TYPE_MAP = {
  split: 'SPLIT',
  window: 'WINDOW',
  portable: 'PORTABLE',
  'not possible': 'NOT_POSSIBLE',
};

const AC_FEASIBILITY_MAP = {
  feasible: 'FEASIBLE',
  'not feasible': 'NOT_FEASIBLE',
  'requires modification': 'REQUIRES_MODIFICATION',
};

const ROOM_STATUS_MAP = {
  available: 'AVAILABLE',
  occupied: 'OCCUPIED',
  'under maintenance': 'UNDER_MAINTENANCE',
  blocked: 'BLOCKED',
};

// --- Helper Functions ---

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
  // Remove currency symbols, commas, whitespace, "Upto " prefix
  const cleaned = String(val).replace(/[^\d.\-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 1000000);
}

/**
 * Parse budget strings like "Upto Rs.30K", "Rs.70K+", "Upto ₹30K" -> amountMicros
 */
function parseBudgetMicros(val) {
  if (!val) return null;
  const s = String(val).trim();
  // Extract numeric part: "Upto ₹30K" -> 30, "₹70K+" -> 70
  const match = s.match(/([\d,.]+)\s*[kK]/i);
  if (match) {
    const num = parseFloat(match[1].replace(/,/g, '')) * 1000;
    return Math.round(num * 1000000);
  }
  // Fallback: try plain number
  return parseCurrencyMicros(s);
}

/**
 * Parse INR currency strings like "₹18,000" -> numeric amount
 */
function parseINRCurrencyMicros(val) {
  if (!val) return null;
  const s = String(val).trim();
  // Remove ₹, Rs, commas, spaces
  const cleaned = s.replace(/[₹Rs,.\s]/g, '');
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return null;
  return Math.round(num * 1000000);
}

function parsePhone(phoneStr) {
  if (!phoneStr) return { number: null, countryCode: null, callingCode: null };
  let cleaned = String(phoneStr).replace(/[\s\-()]/g, '');
  let callingCode = '+91';
  let countryCode = 'IN';

  if (cleaned.startsWith('+')) {
    if (cleaned.startsWith('+91')) {
      callingCode = '+91';
      countryCode = 'IN';
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

function parseBool(val) {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (s === 'true' || s === 'yes' || s === '1') return true;
  if (s === 'false' || s === 'no' || s === '0') return false;
  return null;
}

function parseDate(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;
  // Try ISO format
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return s.includes('T') ? s : s;
}

function parseNumber(val) {
  if (!val) return null;
  const n = parseFloat(String(val).trim());
  return isNaN(n) ? null : n;
}

function makeBlocknote(text) {
  if (!text) return null;
  return JSON.stringify([
    {
      id: randomUUID(),
      type: 'paragraph',
      props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
      content: [{ type: 'text', text: text, styles: {} }],
      children: [],
    },
  ]);
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
    createdByName: 'Flent Demand Import',
    updatedByName: 'Flent Demand Import',
    createdByWorkspaceMemberId: null,
    updatedByWorkspaceMemberId: null,
    createdByContext: null,
    updatedByContext: null,
    deletedAt: null,
    position: 0,
  };
}

/**
 * Parse multi-select micromarket values.
 * Source data like "Richard's Town, Indiranagar" -> array of enum values
 */
function parseMicromarkets(val) {
  if (!val) return null;
  const parts = String(val).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const result = new Set();
  for (const part of parts) {
    // Try exact match first
    if (MICROMARKET_MAP[part]) {
      result.add(MICROMARKET_MAP[part]);
      continue;
    }
    // Try substring matching for known micromarkets
    for (const [key, enumVal] of Object.entries(MICROMARKET_MAP)) {
      if (part.includes(key) || key.includes(part)) {
        result.add(enumVal);
        break;
      }
    }
  }
  const arr = Array.from(result);
  return arr.length > 0 ? arr : null;
}

// --- Batch insert helper ---

async function batchInsert(client, table, rows, batchSize = 50) {
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

    // Use SAVEPOINT so a batch failure does not abort the entire transaction
    const sp = `sp_${table}_${i}`;
    try {
      await client.query(`SAVEPOINT ${sp}`);
      const result = await client.query(sql, values);
      inserted += result.rowCount;
      await client.query(`RELEASE SAVEPOINT ${sp}`);
    } catch (err) {
      await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      console.error(`  Error batch ${table} rows ${i}-${i + batch.length - 1}:`, err.message);
      // Fall back to individual inserts with SAVEPOINTs
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

// --- Load JSON data from files ---

function loadJSON(path) {
  const raw = fs.readFileSync(path, 'utf-8');
  return JSON.parse(raw);
}

function rowsToObjects(data) {
  const headers = data.values[0];
  const rows = data.values.slice(1);
  return rows.map((row) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] || '';
    });
    return obj;
  });
}

// =========================================================================
// 1. IMPORT ROOMS (and create properties)
// =========================================================================

async function importRooms(client) {
  console.log('\n=== Importing Rooms (RID) ===');

  const raw = loadJSON('/tmp/rid-raw.json');
  const records = rowsToObjects(raw);
  console.log(`Parsed ${records.length} room records.`);

  // 1a. Create properties for unique PIDs
  const uniquePids = [...new Set(records.map((r) => cleanVal(r['PID'])).filter(Boolean))];
  console.log(`Found ${uniquePids.length} unique PIDs -> creating properties.`);

  const propertyMap = {}; // pid -> propertyId
  const properties = [];

  for (const pid of uniquePids) {
    const propId = randomUUID();
    propertyMap[pid] = propId;
    properties.push({
      id: propId,
      name: `Property ${pid}`,
      pid: pid,
      lifecycleStatus: 'ACTIVE',
      propertyType: 'APARTMENT',
      cluster: null,
      ...twentyDefaults(),
    });
  }

  console.log(`Inserting ${properties.length} properties...`);
  const pResult = await batchInsert(client, '_property', properties);
  console.log(`  _property: ${pResult.inserted} inserted, ${pResult.errors} errors`);

  // 1b. Create rooms and extension tables
  const roomMap = {}; // rid -> roomId
  const rooms = [];
  const roomSpecs = [];
  const roomFurnishings = [];
  const roomCommercials = [];
  const roomAvailabilities = [];

  for (const rec of records) {
    const rid = cleanVal(rec['RID']);
    if (!rid) continue;

    // Skip duplicate RIDs (keep first occurrence)
    if (roomMap[rid]) {
      console.log(`  Skipping duplicate RID: ${rid}`);
      continue;
    }

    const pid = cleanVal(rec['PID']);
    const propertyId = pid ? propertyMap[pid] : null;
    const roomId = randomUUID();
    roomMap[rid] = roomId;

    const defaults = twentyDefaults();

    // _room (base)
    rooms.push({
      id: roomId,
      name: rid,
      rid: rid,
      propertyId: propertyId,
      ...defaults,
    });

    // _roomSpecification
    const specId = randomUUID();
    roomSpecs.push({
      id: specId,
      attachedBathroom: parseBool(rec['Attached Bathroom']),
      balcony: parseBool(rec['Balcony']),
      roomId: roomId,
      ...twentyDefaults(),
    });

    // _roomFurnishing
    const furnId = randomUUID();
    const acVal = parseBool(rec['AC']);
    roomFurnishings.push({
      id: furnId,
      bedType: mapEnum(rec['Bed Type'], BED_TYPE_MAP),
      ac: acVal,
      acType: mapEnum(rec['AC Type'], AC_TYPE_MAP),
      acFeasibility: mapEnum(rec['AC Feasibility'], AC_FEASIBILITY_MAP),
      studyTable: parseBool(rec['Study Table']),
      annexurePrimaryLinkLabel: cleanVal(rec['Annexure']) ? 'Annexure' : null,
      annexurePrimaryLinkUrl: cleanVal(rec['Annexure']),
      annexureSecondaryLinks: null,
      annexureLastUpdateDate: parseDate(rec['Annexure Last Update']),
      roomId: roomId,
      ...twentyDefaults(),
    });

    // _roomCommercial
    // Note: source header is "Base Rent " (with trailing space) and "Maintainance" (typo)
    const baseRentRaw = cleanVal(rec['Base Rent ']) || cleanVal(rec['Base Rent']);
    const maintRaw = cleanVal(rec['Maintainance']) || cleanVal(rec['Maintenance']);

    const baseRentMicros = parseINRCurrencyMicros(baseRentRaw);
    const maintMicros = parseINRCurrencyMicros(maintRaw);

    const commId = randomUUID();
    roomCommercials.push({
      id: commId,
      baseRentAmountMicros: baseRentMicros,
      baseRentCurrencyCode: baseRentMicros !== null ? 'INR' : null,
      maintenanceFeeAmountMicros: maintMicros,
      maintenanceFeeCurrencyCode: maintMicros !== null ? 'INR' : null,
      roomId: roomId,
      ...twentyDefaults(),
    });

    // _roomAvailability
    const availId = randomUUID();
    roomAvailabilities.push({
      id: availId,
      roomStatus: mapEnum(rec['Status'], ROOM_STATUS_MAP),
      currentTenantName: cleanVal(rec['Current Tenant Name']),
      availableFrom: parseDate(rec['Available From']),
      roomId: roomId,
      ...twentyDefaults(),
    });
  }

  console.log(`Inserting ${rooms.length} rooms...`);
  const rResult = await batchInsert(client, '_room', rooms);
  console.log(`  _room: ${rResult.inserted} inserted, ${rResult.errors} errors`);

  const rsResult = await batchInsert(client, '_roomSpecification', roomSpecs);
  console.log(`  _roomSpecification: ${rsResult.inserted} inserted, ${rsResult.errors} errors`);

  const rfResult = await batchInsert(client, '_roomFurnishing', roomFurnishings);
  console.log(`  _roomFurnishing: ${rfResult.inserted} inserted, ${rfResult.errors} errors`);

  const rcResult = await batchInsert(client, '_roomCommercial', roomCommercials);
  console.log(`  _roomCommercial: ${rcResult.inserted} inserted, ${rcResult.errors} errors`);

  const raResult = await batchInsert(client, '_roomAvailability', roomAvailabilities);
  console.log(`  _roomAvailability: ${raResult.inserted} inserted, ${raResult.errors} errors`);

  return { propertyMap, roomMap };
}

// =========================================================================
// 2. IMPORT TENANTS
// =========================================================================

async function importTenants(client) {
  console.log('\n=== Importing Tenants ===');

  const raw = loadJSON('/tmp/tenants-raw.json');
  const records = rowsToObjects(raw);
  console.log(`Parsed ${records.length} tenant records.`);

  const tenants = [];
  const attributions = [];
  const requirements = [];
  const qualifications = [];
  const visitSummaries = [];
  const satisfactions = [];

  for (const rec of records) {
    const firstName = cleanVal(rec['First Name']);
    const lastName = cleanVal(rec['Last Name']);
    if (!firstName && !lastName) continue;

    const name = [firstName, lastName].filter(Boolean).join(' ');
    const tenantId = randomUUID();

    // Parse phones
    const mobileRaw = cleanVal(rec['Mobile Phone']);
    const whatsappRaw = cleanVal(rec['WhatsApp Phone']);
    const primaryPhone = parsePhone(mobileRaw);
    const whatsappPhone = whatsappRaw && whatsappRaw !== mobileRaw ? parsePhone(whatsappRaw) : null;

    const defaults = twentyDefaults();
    const createDateRaw = cleanVal(rec['Create Date']);
    if (createDateRaw) {
      defaults.createdAt = new Date(createDateRaw).toISOString();
    }

    // --- _tenant ---
    tenants.push({
      id: tenantId,
      name: name,
      emailsPrimaryEmail: cleanVal(rec['Email']),
      emailsAdditionalEmails: null,
      phonesPrimaryPhoneNumber: primaryPhone.number,
      phonesPrimaryPhoneCountryCode: primaryPhone.countryCode,
      phonesPrimaryPhoneCallingCode: primaryPhone.callingCode,
      phonesAdditionalPhones:
        whatsappPhone && whatsappPhone.number
          ? JSON.stringify([
              {
                number: whatsappPhone.number,
                countryCode: whatsappPhone.countryCode,
                callingCode: whatsappPhone.callingCode,
              },
            ])
          : null,
      gender: mapEnum(rec['Gender'], GENDER_MAP),
      dateOfBirth: parseDate(rec['Date of Birth']),
      aadhaarNumber: cleanVal(rec['Aadhaar Number']) || '',
      aadhaarFrontImagePrimaryLinkLabel: cleanVal(rec['Aadhaar Front URL']) ? 'Aadhaar Front' : null,
      aadhaarFrontImagePrimaryLinkUrl: cleanVal(rec['Aadhaar Front URL']),
      aadhaarFrontImageSecondaryLinks: null,
      aadhaarBackImagePrimaryLinkLabel: cleanVal(rec['Aadhaar Back URL']) ? 'Aadhaar Back' : null,
      aadhaarBackImagePrimaryLinkUrl: cleanVal(rec['Aadhaar Back URL']),
      aadhaarBackImageSecondaryLinks: null,
      pan: cleanVal(rec['PAN']) || '',
      panCardImagePrimaryLinkLabel: cleanVal(rec['PAN Card URL']) ? 'PAN Card' : null,
      panCardImagePrimaryLinkUrl: cleanVal(rec['PAN Card URL']),
      panCardImageSecondaryLinks: null,
      linkedinUrlPrimaryLinkLabel: cleanVal(rec['LinkedIn URL']) ? 'LinkedIn' : null,
      linkedinUrlPrimaryLinkUrl: cleanVal(rec['LinkedIn URL']),
      linkedinUrlSecondaryLinks: null,
      twitterUrlPrimaryLinkLabel: cleanVal(rec['Twitter (X) URL']) ? 'Twitter' : null,
      twitterUrlPrimaryLinkUrl: cleanVal(rec['Twitter (X) URL']),
      twitterUrlSecondaryLinks: null,
      instagramId: cleanVal(rec['Instagram ID']),
      occupation: cleanVal(rec['Occupation']),
      employerName: cleanVal(rec['Employer Name']),
      tenantLifecycle: mapEnum(rec['Tenant Lifecycle'], TENANT_LIFECYCLE_MAP),
      ...defaults,
    });

    // --- _tenantAttribution ---
    const attrId = randomUUID();
    const createDate = parseDate(rec['Create Date']);
    attributions.push({
      id: attrId,
      createDate: createDate ? new Date(createDate).toISOString() : null,
      firstInquiryChannel: mapEnum(rec['Channel'], CHANNEL_MAP),
      sourceDrilldown1: mapEnum(rec['Source Drilldown 1'], SOURCE_DRILLDOWN1_MAP),
      sourceDrilldown2: cleanVal(rec['Source Drilldown 2']),
      waxCode: cleanVal(rec['WAX-Code']),
      googleClickId: cleanVal(rec['Google Click ID']),
      facebookClickId: cleanVal(rec['Facebook Click ID']),
      utmSource: cleanVal(rec['UTM Source']),
      utmMedium: cleanVal(rec['UTM Medium']),
      utmCampaign: cleanVal(rec['UTM Campaign']),
      utmContent: cleanVal(rec['UTM Content']),
      utmTerm: cleanVal(rec['UTM Term']),
      tenantId: tenantId,
      ...twentyDefaults(),
    });

    // --- _tenantRequirement ---
    const reqId = randomUUID();
    const micromarkets = parseMicromarkets(rec['Preferred Micromarkets']);
    const budgetMicros = parseBudgetMicros(rec['Budget Maximum (INR)']);

    const customPref = cleanVal(rec['Custom Preference']);

    requirements.push({
      id: reqId,
      preferredMicromarkets: micromarkets,
      preferredOccupancyType: mapEnum(rec['Preferred Occupancy'], OCCUPANCY_MAP),
      preferredFurnishedType: mapEnum(rec['Preferred Furnished'], FURNISHED_MAP),
      preferredMoveInTimeline: mapEnum(rec['Move-in Timeline'], MOVE_IN_TIMELINE_MAP),
      genderPreferences: mapEnum(rec['Gender Preference'], GENDER_PREFERENCE_MAP),
      foodPreferences: mapEnum(rec['Food Preference'], FOOD_PREFERENCE_MAP),
      hasPet: parseBool(rec['Has Pet']),
      smokingPreferences: mapEnum(rec['Smoking Pref'], SMOKING_MAP),
      customPreferenceMarkdown: customPref,
      customPreferenceBlocknote: makeBlocknote(customPref),
      budgetMaxAmountMicros: budgetMicros,
      budgetMaxCurrencyCode: budgetMicros !== null ? 'INR' : null,
      tenantId: tenantId,
      ...twentyDefaults(),
    });

    // --- _tenantQualification ---
    const qualId = randomUUID();
    const disqDetail = cleanVal(rec['Disqualification Detail']);
    const bgvReportUrl = cleanVal(rec['BGV Report URL']);
    qualifications.push({
      id: qualId,
      qualificationStatus: mapEnum(rec['Qualification Status'], QUALIFICATION_MAP),
      disqualificationReason: mapEnum(rec['Disqualification Reason'], DISQUALIFICATION_REASON_MAP),
      disqualificationDetailMarkdown: disqDetail,
      disqualificationDetailBlocknote: makeBlocknote(disqDetail),
      bgvStatus: mapEnum(rec['BGV Status'], BGV_STATUS_MAP),
      bgvReportPrimaryLinkLabel: bgvReportUrl ? 'BGV Report' : null,
      bgvReportPrimaryLinkUrl: bgvReportUrl,
      bgvReportSecondaryLinks: null,
      bgvCompletedDate: parseDate(rec['BGV Completed Date']),
      tenantId: tenantId,
      ...twentyDefaults(),
    });

    // --- _tenantVisitSummary ---
    const visitId = randomUUID();
    const feedback = cleanVal(rec['Feedback']);
    visitSummaries.push({
      id: visitId,
      totalVisitsCount: parseNumber(rec['Total Visits']),
      visitsCancelled: parseNumber(rec['Visits Cancelled']),
      visitsCompleted: parseNumber(rec['Visits Completed']),
      firstVisitDate: parseDate(rec['First Visit Date']),
      ridsVisited: cleanVal(rec['RIDs Visited']),
      feedbackMarkdown: feedback,
      feedbackBlocknote: makeBlocknote(feedback),
      tenantId: tenantId,
      ...twentyDefaults(),
    });

    // --- _tenantSatisfaction ---
    const satId = randomUUID();
    const npsComment = cleanVal(rec['Last NPS Comment']);
    satisfactions.push({
      id: satId,
      onboardingCsatScore: parseNumber(rec['Onboarding CSAT']),
      offboardingCsatScore: parseNumber(rec['Offboarding CSAT']),
      lastNpsScore: parseNumber(rec['Last NPS Score']),
      lastNpsDate: parseDate(rec['Last NPS Date']),
      npsCategory: mapEnum(rec['NPS Category'], NPS_CATEGORY_MAP),
      lastNpsCommentMarkdown: npsComment,
      lastNpsCommentBlocknote: makeBlocknote(npsComment),
      tenantId: tenantId,
      ...twentyDefaults(),
    });
  }

  console.log(`Inserting ${tenants.length} tenants...`);
  const tResult = await batchInsert(client, '_tenant', tenants, 100);
  console.log(`  _tenant: ${tResult.inserted} inserted, ${tResult.errors} errors`);

  const aResult = await batchInsert(client, '_tenantAttribution', attributions, 100);
  console.log(`  _tenantAttribution: ${aResult.inserted} inserted, ${aResult.errors} errors`);

  const rResult = await batchInsert(client, '_tenantRequirement', requirements, 100);
  console.log(`  _tenantRequirement: ${rResult.inserted} inserted, ${rResult.errors} errors`);

  const qResult = await batchInsert(client, '_tenantQualification', qualifications, 100);
  console.log(`  _tenantQualification: ${qResult.inserted} inserted, ${qResult.errors} errors`);

  const vResult = await batchInsert(client, '_tenantVisitSummary', visitSummaries, 100);
  console.log(`  _tenantVisitSummary: ${vResult.inserted} inserted, ${vResult.errors} errors`);

  const sResult = await batchInsert(client, '_tenantSatisfaction', satisfactions, 100);
  console.log(`  _tenantSatisfaction: ${sResult.inserted} inserted, ${sResult.errors} errors`);

  return tenants.length;
}

// =========================================================================
// 3. IMPORT CONTRACTS
// =========================================================================

async function importContracts(client, roomMap, propertyMap) {
  console.log('\n=== Importing Contracts ===');

  const raw = loadJSON('/tmp/contracts-raw.json');
  const records = rowsToObjects(raw);
  console.log(`Parsed ${records.length} contract records.`);

  // Build reverse map: rid -> pid (from rooms data)
  const ridToPid = {};
  const ridRaw = loadJSON('/tmp/rid-raw.json');
  const ridRecords = rowsToObjects(ridRaw);
  for (const rec of ridRecords) {
    const rid = cleanVal(rec['RID']);
    const pid = cleanVal(rec['PID']);
    if (rid && pid) ridToPid[rid] = pid;
  }

  const contracts = [];
  const contractDetails = [];
  let ridNotFound = 0;

  for (const rec of records) {
    const ridVal = cleanVal(rec['RID']);
    const partyName = cleanVal(rec['Party Name (Tenant)']);
    if (!ridVal && !partyName) continue;

    const contractId = randomUUID();

    // Find room and property via RID
    let roomId = null;
    let propertyId = null;
    if (ridVal) {
      // The contract RID format might be like "1BR2" but the room RID is "01BR2"
      // Try direct match first, then try with zero-padded PID prefix
      roomId = roomMap[ridVal] || null;

      if (!roomId) {
        // Try zero-padding: "1BR1" -> "01BR1"
        const match = ridVal.match(/^(\d+)(BR\d+)$/);
        if (match) {
          const paddedRid = match[1].padStart(2, '0') + match[2];
          roomId = roomMap[paddedRid] || null;
          if (roomId && ridVal !== paddedRid) {
            // Found with padding
          }
        }
      }

      if (!roomId) {
        ridNotFound++;
      }

      // Find propertyId from the RID -> PID mapping
      const pid = ridToPid[ridVal];
      if (pid && propertyMap[pid]) {
        propertyId = propertyMap[pid];
      } else {
        // Try padded lookup
        const match = ridVal.match(/^(\d+)(BR\d+)$/);
        if (match) {
          const paddedRid = match[1].padStart(2, '0') + match[2];
          const pid2 = ridToPid[paddedRid];
          if (pid2 && propertyMap[pid2]) {
            propertyId = propertyMap[pid2];
          }
        }
      }
    }

    const contractStartDate = parseDate(rec['Contract Start Date']);
    const contractEndDate = parseDate(rec['Contract End Date']);
    const agreementPdfUrl = cleanVal(rec['Agreement PDF']);

    // Skip contracts missing required NOT NULL fields
    if (!contractStartDate || !contractEndDate) {
      console.log(`  Skipping contract row: missing start/end date. Party: ${partyName}, RID: ${ridVal}`);
      continue;
    }

    // Contract name: "{partyName} - {RID} ({startDate})"
    const contractName = [partyName, ridVal, contractStartDate].filter(Boolean).join(' - ');

    const defaults = twentyDefaults();

    const serviceTerm = parseNumber(rec['Service Term (Months)']);

    // --- _contract ---
    contracts.push({
      id: contractId,
      name: contractName || `Contract ${contractId.substring(0, 8)}`,
      contractType: 'L_AND_L',
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
      serviceTerm: serviceTerm !== null ? serviceTerm : 0,
      lockInDuration: parseNumber(rec['Lock-in Duration (Months)']),
      lockInEndDate: parseDate(rec['Lock-in End Date']),
      noticePeriod: parseNumber(rec['Notice Period (Days)']),
      agreementPdfPrimaryLinkLabel: agreementPdfUrl ? 'Agreement PDF' : null,
      agreementPdfPrimaryLinkUrl: agreementPdfUrl,
      agreementPdfSecondaryLinks: null,
      propertyId: propertyId,
      ...defaults,
    });

    // --- _tenantContractDetail ---
    const totalRetailRent = parseCurrencyMicros(rec['Total Retail Rent']);
    const monthlyLicenseFee = parseCurrencyMicros(rec['Monthly License Fee']);
    const maintenanceFee = parseCurrencyMicros(rec['Maintenance Fee']);
    const furnishingFee = parseCurrencyMicros(rec['Furnishing Fee']);
    const convenienceFee = parseCurrencyMicros(rec['Convenience Fee']);
    const gst = parseCurrencyMicros(rec['GST']);
    const discountAmount = parseCurrencyMicros(rec['Discount Amount']);
    const effectiveRetailRent = parseCurrencyMicros(rec['Effective Retail Rent']);
    const securityDeposit = parseCurrencyMicros(rec['Security Deposit']);
    const cautionDeposit = parseCurrencyMicros(rec['Caution Deposit']);
    const lockInFee = parseCurrencyMicros(rec['Lock-in Fee']);
    const exitFee = parseCurrencyMicros(rec['Exit Fee']);
    const damagesDeductions = parseCurrencyMicros(rec['Damages Deductions']);
    const societyFees = parseCurrencyMicros(rec['Society Fees']);
    const penalty = parseCurrencyMicros(rec['Penalty']);

    const detailId = randomUUID();
    contractDetails.push({
      id: detailId,
      partyNameTenant: partyName || '',
      preferredMoveOutDate: parseDate(rec['Preferred Move Out Date']),
      paymentLifecycle: mapEnum(rec['Payment Lifecycle'], PAYMENT_LIFECYCLE_MAP),
      agreementLifecycle: mapEnum(rec['Agreement Lifecycle'], AGREEMENT_LIFECYCLE_MAP),
      totalRetailRentAmountMicros: totalRetailRent,
      totalRetailRentCurrencyCode: totalRetailRent !== null ? 'INR' : null,
      monthlyLicenseFeeAmountMicros: monthlyLicenseFee,
      monthlyLicenseFeeCurrencyCode: monthlyLicenseFee !== null ? 'INR' : null,
      maintenanceFeeAmountMicros: maintenanceFee,
      maintenanceFeeCurrencyCode: maintenanceFee !== null ? 'INR' : null,
      furnishingFeeAmountMicros: furnishingFee,
      furnishingFeeCurrencyCode: furnishingFee !== null ? 'INR' : null,
      convenienceFeeAmountMicros: convenienceFee,
      convenienceFeeCurrencyCode: convenienceFee !== null ? 'INR' : null,
      gstAmountMicros: gst,
      gstCurrencyCode: gst !== null ? 'INR' : null,
      discountAmountAmountMicros: discountAmount,
      discountAmountCurrencyCode: discountAmount !== null ? 'INR' : null,
      effectiveRetailRentAmountMicros: effectiveRetailRent,
      effectiveRetailRentCurrencyCode: effectiveRetailRent !== null ? 'INR' : null,
      securityDepositAmountMicros: securityDeposit,
      securityDepositCurrencyCode: securityDeposit !== null ? 'INR' : null,
      cautionDepositAmountMicros: cautionDeposit,
      cautionDepositCurrencyCode: cautionDeposit !== null ? 'INR' : null,
      lockInFeeAmountMicros: lockInFee,
      lockInFeeCurrencyCode: lockInFee !== null ? 'INR' : null,
      exitFeeAmountMicros: exitFee,
      exitFeeCurrencyCode: exitFee !== null ? 'INR' : null,
      damagesDeductionsAmountMicros: damagesDeductions,
      damagesDeductionsCurrencyCode: damagesDeductions !== null ? 'INR' : null,
      societyFeesAmountMicros: societyFees,
      societyFeesCurrencyCode: societyFees !== null ? 'INR' : null,
      penaltyAmountMicros: penalty,
      penaltyCurrencyCode: penalty !== null ? 'INR' : null,
      totalDeductionsAmountMicros: null,
      totalDeductionsCurrencyCode: null,
      fmrStatus: cleanVal(rec['FMR Status']),
      depositPaidStatus: cleanVal(rec['Deposit Paid Status']),
      contractId: contractId,
      tenantId: null, // No direct tenant FK from contract sheet
      roomId: roomId,
      ...twentyDefaults(),
    });
  }

  if (ridNotFound > 0) {
    console.log(`  Warning: ${ridNotFound} contracts referenced RIDs not found in room data.`);
  }

  console.log(`Inserting ${contracts.length} contracts...`);
  const cResult = await batchInsert(client, '_contract', contracts, 100);
  console.log(`  _contract: ${cResult.inserted} inserted, ${cResult.errors} errors`);

  const cdResult = await batchInsert(client, '_tenantContractDetail', contractDetails, 50);
  console.log(`  _tenantContractDetail: ${cdResult.inserted} inserted, ${cdResult.errors} errors`);

  return contracts.length;
}

// =========================================================================
// MAIN
// =========================================================================

async function main() {
  console.log('==================================================');
  console.log('  Flent Demand Data Import - Twenty CRM');
  console.log('  Target schema:', SCHEMA);
  console.log('  Started at:', now());
  console.log('==================================================');

  // Verify source files exist
  const files = ['/tmp/tenants-raw.json', '/tmp/contracts-raw.json', '/tmp/rid-raw.json'];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error(`FATAL: Source file not found: ${f}`);
      process.exit(1);
    }
    const stat = fs.statSync(f);
    console.log(`  ${f}: ${(stat.size / 1024).toFixed(1)} KB`);
  }

  const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO "${SCHEMA}", public`);
    await client.query('BEGIN');

    // 1. Import Rooms first (creates properties + rooms -> needed for contract FK)
    const { propertyMap, roomMap } = await importRooms(client);
    console.log(`\nRoom map: ${Object.keys(roomMap).length} entries`);
    console.log(`Property map: ${Object.keys(propertyMap).length} entries`);

    // 2. Import Tenants
    const tenantCount = await importTenants(client);
    console.log(`\nTenants processed: ${tenantCount}`);

    // 3. Import Contracts (needs roomMap + propertyMap for FK)
    const contractCount = await importContracts(client, roomMap, propertyMap);
    console.log(`\nContracts processed: ${contractCount}`);

    // Commit
    await client.query('COMMIT');
    console.log('\n=== Transaction COMMITTED successfully ===');

    // Verify counts
    console.log('\n=== Verification: Record counts ===');
    const tables = [
      '_property',
      '_room',
      '_roomSpecification',
      '_roomFurnishing',
      '_roomCommercial',
      '_roomAvailability',
      '_tenant',
      '_tenantAttribution',
      '_tenantRequirement',
      '_tenantQualification',
      '_tenantVisitSummary',
      '_tenantSatisfaction',
      '_contract',
      '_tenantContractDetail',
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
