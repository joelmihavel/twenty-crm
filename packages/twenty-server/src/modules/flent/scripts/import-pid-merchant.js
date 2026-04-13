/**
 * Flent PID + Merchant Import Script
 *
 * Imports/updates:
 *   - _property                (UPDATE existing by pid; INSERT if pid is new)
 *   - _propertyActive          (INSERT one per property, idempotent per propertyId)
 *   - _propertyChurned         (INSERT if depositRefunded / exitCostOpx present)
 *   - _merchant                (INSERT; idempotent by email OR name+phone)
 *   - _merchantLandlord        (INSERT one per merchant)
 *   - _property.merchantId     (UPDATE; link property -> merchant by PID)
 *
 * Source files (inside pod): /tmp/pid-data.json, /tmp/merchant-data.json
 *
 * Usage (inside twenty-server pod):
 *   node /tmp/import-pid-merchant.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const { randomUUID } = require('crypto');

const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';
const PID_FILE = '/tmp/pid-data.json';
const MERCHANT_FILE = '/tmp/merchant-data.json';
const IMPORT_TAG = 'Flent PID Merchant Import';

// ---------------- Enum mapping ----------------

const PROPERTY_TYPE_MAP = {
  'gated building': 'APARTMENT',
  'gated society no amenities': 'APARTMENT',
  'gated society with amenities': 'APARTMENT',
  'ind residence': 'INDEPENDENT_HOUSE',
  'ind building': 'INDEPENDENT_HOUSE',
  apartment: 'APARTMENT',
  villa: 'VILLA',
  'row house': 'ROW_HOUSE',
  penthouse: 'PENTHOUSE',
  studio: 'STUDIO',
};

// Valid clusters in enum. Values in source not in this set will be logged.
const CLUSTER_SET = new Set(['HSR', 'KRM', 'IDR', 'MHD', 'BLD', 'MGR', 'HBL', 'WHF']);

const PARKING_MAP = {
  covered: 'COVERED',
  open: 'OPEN',
  basement: 'BASEMENT',
  none: 'NONE',
};

const POWER_BACKUP_MAP = {
  full: 'FULL',
  partial: 'PARTIAL',
  none: 'NONE',
};

const WATER_SOURCE_MAP = {
  corporation: 'CORPORATION',
  bbmp: 'CORPORATION',
  borewell: 'BOREWELL',
  tanker: 'TANKER',
};

const RESTRICTIONS_MAP = {
  none: 'NONE',
  'no pets': 'NO_PETS',
  'no smoking': 'NO_SMOKING',
  'veg only': 'VEG_ONLY',
  'male only': 'MALE_ONLY',
  'female only': 'FEMALE_ONLY',
};

const FURNITURE_MOVEMENT_MAP = {
  allowed: 'ALLOWED',
  'not allowed': 'NOT_ALLOWED',
  'with permission': 'WITH_PERMISSION',
};

const FURNISHING_MAP = {
  unfurnished: 'UNFURNISHED',
  'semi furnished': 'SEMI_FURNISHED',
  'semi-furnished': 'SEMI_FURNISHED',
  'partially furnished': 'PARTIALLY_FURNISHED',
  'fully furnished': 'FULLY_FURNISHED',
};

const PAYMENT_COLLECTION_MAP = {
  upfront: 'UPFRONT',
  'straight deduction': 'STRAIGHT_DEDUCTION',
  emi: 'EMI',
};

const PROP_MGMT_MAP = {
  mygate: 'MYGATE',
  nobroker: 'NOBROKER',
  'apartments.com': 'APARTMENTS_COM',
  none: 'NONE',
};

const PREFIX_MAP = {
  mr: 'MR',
  'mr.': 'MR',
  mrs: 'MRS',
  'mrs.': 'MRS',
  ms: 'MS',
  'ms.': 'MS',
  dr: 'DR',
  'dr.': 'DR',
};

const MERCHANT_TYPE_MAP = {
  landlord: 'LANDLORD',
  poc: 'POC',
  lead: 'LEAD',
  broker: 'BROKER',
  management: 'MANAGEMENT',
};

// ---------------- Helpers ----------------

function clean(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s) return null;
  if (s === '#N/A' || s === '#REF!' || s === '#VALUE!' || s === 'NULL') return null;
  return s;
}

function parseNum(val) {
  const s = clean(val);
  if (!s) return null;
  const n = parseFloat(s.replace(/[,₹$]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toMicros(n) {
  if (n === null || n === undefined) return null;
  return BigInt(Math.round(n * 1000000)).toString();
}

function parseBool(val) {
  const s = clean(val);
  if (!s) return null;
  const l = s.toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(l)) return true;
  if (['no', 'n', 'false', '0'].includes(l)) return false;
  return null;
}

function isValidUrl(val) {
  const s = clean(val);
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) return null;
  return s;
}

function mapEnum(map, val) {
  const s = clean(val);
  if (!s) return null;
  return map[s.toLowerCase()] || null;
}

function mapPropertyType(val) {
  return mapEnum(PROPERTY_TYPE_MAP, val);
}

function mapCluster(val) {
  const s = clean(val);
  if (!s) return null;
  const upper = s.toUpperCase();
  return CLUSTER_SET.has(upper) ? upper : null;
}

function mapPrefix(val) {
  return mapEnum(PREFIX_MAP, val);
}

function parseDate(val) {
  // Accept ISO, DD/MM/YYYY, DD-MM-YYYY
  const s = clean(val);
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;
  let [, d, mo, y] = m;
  d = parseInt(d, 10);
  mo = parseInt(mo, 10);
  y = parseInt(y, 10);
  if (y < 100) y += 2000;
  if (!d || !mo || !y || mo < 1 || mo > 12) return null;
  return `${y.toString().padStart(4, '0')}-${mo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
}

// Split richtext-ish multiline field into blocknote + markdown (we just put the
// raw text into both; good enough for an import).
function toRichText(val) {
  const s = clean(val);
  if (!s) return { bn: null, md: null };
  // Blocknote stores a JSON array of blocks. We create a simple paragraph block.
  const bn = JSON.stringify([
    { type: 'paragraph', content: [{ type: 'text', text: s, styles: {} }] },
  ]);
  return { bn, md: s };
}

// ---------------- Main ----------------

(async () => {
  const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });
  const pidRaw = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
  const merchRaw = JSON.parse(fs.readFileSync(MERCHANT_FILE, 'utf8'));
  const pidRows = pidRaw.values.slice(1);
  const merchRows = merchRaw.values.slice(1);

  const stats = {
    pidSource: pidRows.length,
    merchSource: merchRows.length,
    propertyUpdated: 0,
    propertyInserted: 0,
    propertyActiveInserted: 0,
    propertyActiveSkipped: 0,
    propertyChurnedInserted: 0,
    merchantInserted: 0,
    merchantSkipped: 0,
    merchantLandlordInserted: 0,
    propertyMerchantLinked: 0,
    propertyMerchantMissing: 0,
    unmappedPropertyType: {},
    unmappedCluster: {},
    unmappedPrefix: {},
    unmappedMerchantType: {},
    errors: [],
  };

  // Preload existing property pids -> id
  const existingPropsRes = await pool.query(
    `SELECT id, pid, "lifecycleStatus" FROM "${SCHEMA}"."_property"`,
  );
  const propByPid = new Map();
  for (const r of existingPropsRes.rows) {
    propByPid.set(String(r.pid), { id: r.id, lifecycleStatus: r.lifecycleStatus });
  }

  // Position counters
  const propPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_property"`,
  );
  let propPos = Number(propPosRes.rows[0].max_pos) || 0;
  const paPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_propertyActive"`,
  );
  let paPos = Number(paPosRes.rows[0].max_pos) || 0;
  const pcPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_propertyChurned"`,
  );
  let pcPos = Number(pcPosRes.rows[0].max_pos) || 0;
  const mPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_merchant"`,
  );
  let mPos = Number(mPosRes.rows[0].max_pos) || 0;
  const mlPosRes = await pool.query(
    `SELECT COALESCE(MAX(position), 0) AS max_pos FROM "${SCHEMA}"."_merchantLandlord"`,
  );
  let mlPos = Number(mlPosRes.rows[0].max_pos) || 0;

  const client = await pool.connect();

  try {
    // =============================================================
    // PHASE 1: Properties (_property) + _propertyActive + _propertyChurned
    // =============================================================
    await client.query('BEGIN');

    // Track propertyId per pid for merchant linkage later.
    const propertyIdByPid = new Map();
    // Track which propertyIds already have an active/churned extension row in DB
    const existingPropertyActiveRes = await client.query(
      `SELECT "propertyId" FROM "${SCHEMA}"."_propertyActive" WHERE "propertyId" IS NOT NULL`,
    );
    const activeProps = new Set(
      existingPropertyActiveRes.rows.map((r) => r.propertyId),
    );
    const existingPropertyChurnedRes = await client.query(
      `SELECT "propertyId" FROM "${SCHEMA}"."_propertyChurned" WHERE "propertyId" IS NOT NULL`,
    );
    const churnedProps = new Set(
      existingPropertyChurnedRes.rows.map((r) => r.propertyId),
    );

    for (let idx = 0; idx < pidRows.length; idx++) {
      const r = pidRows[idx];
      const padded = [...r];
      while (padded.length < 36) padded.push('');

      const pidRaw = clean(padded[0]);
      if (!pidRaw) continue;
      // Strip "PID" prefix (e.g. "PID1" -> "1")
      const pidNumStr = pidRaw.replace(/^PID/i, '');
      if (!pidNumStr || !/^\d+$/.test(pidNumStr)) continue;

      const nameValue = `PID${pidNumStr}`;
      const propertyTypeRaw = clean(padded[2]);
      const propertyType = mapPropertyType(propertyTypeRaw);
      if (propertyTypeRaw && !propertyType) {
        stats.unmappedPropertyType[propertyTypeRaw] =
          (stats.unmappedPropertyType[propertyTypeRaw] || 0) + 1;
      }
      const unitsCount = parseNum(padded[3]);
      const clusterRaw = clean(padded[9]);
      const cluster = mapCluster(clusterRaw);
      if (clusterRaw && !cluster) {
        stats.unmappedCluster[clusterRaw] =
          (stats.unmappedCluster[clusterRaw] || 0) + 1;
      }

      // --- Upsert _property (update existing OR insert) ---
      let propertyId;
      const existing = propByPid.get(pidNumStr);
      if (existing) {
        propertyId = existing.id;
        // Build dynamic UPDATE so we do not overwrite with NULL unless we have value.
        const sets = ['"updatedAt" = NOW()', '"updatedBySource" = \'IMPORT\'',
                      `"updatedByName" = '${IMPORT_TAG}'`, '"name" = $2'];
        const params = [propertyId, nameValue];
        let pi = 3;
        if (propertyType) { sets.push(`"propertyType" = $${pi++}`); params.push(propertyType); }
        if (cluster) { sets.push(`"cluster" = $${pi++}`); params.push(cluster); }
        await client.query(
          `UPDATE "${SCHEMA}"."_property" SET ${sets.join(', ')} WHERE id = $1`,
          params,
        );
        stats.propertyUpdated++;
      } else {
        propertyId = randomUUID();
        propPos += 1;
        await client.query(
          `INSERT INTO "${SCHEMA}"."_property" (
            id, name, pid, position,
            "createdAt", "updatedAt",
            "createdBySource", "updatedBySource",
            "createdByName", "updatedByName",
            "propertyType", cluster, "lifecycleStatus"
          ) VALUES (
            $1, $2, $3, $4,
            NOW(), NOW(),
            'IMPORT', 'IMPORT',
            $5, $5,
            $6, $7, 'ACTIVE'
          )`,
          [propertyId, nameValue, pidNumStr, propPos, IMPORT_TAG, propertyType, cluster],
        );
        propByPid.set(pidNumStr, { id: propertyId, lifecycleStatus: 'ACTIVE' });
        stats.propertyInserted++;
      }
      propertyIdByPid.set(pidNumStr, propertyId);

      // --- _propertyActive extension (always create one per property) ---
      const houseNo = clean(padded[1]);
      const tier = clean(padded[4]);
      const floor = clean(padded[5]);
      const gMapUrl = isValidUrl(padded[6]);
      const address = clean(padded[7]);
      const buildingSociety = clean(padded[8]);
      const parkingTypeRaw = clean(padded[10]);
      let parkingType = null;
      if (parkingTypeRaw) {
        const mapped = mapEnum(PARKING_MAP, parkingTypeRaw);
        if (mapped) parkingType = [mapped];
      }
      const parkingNumber = clean(padded[11]);
      const powerBackup = mapEnum(POWER_BACKUP_MAP, padded[12]);
      const waterSourceRaw = clean(padded[13]);
      let waterSource = null;
      if (waterSourceRaw) {
        const mapped = mapEnum(WATER_SOURCE_MAP, waterSourceRaw);
        if (mapped) waterSource = [mapped];
      }
      const restrictions = mapEnum(RESTRICTIONS_MAP, padded[14]);
      const otherNotes = toRichText(padded[15]);
      const furnitureMovement = mapEnum(FURNITURE_MOVEMENT_MAP, padded[16]);
      const furnishingStatus = mapEnum(FURNISHING_MAP, padded[17]);
      const finalApproved = parseNum(padded[19]);
      const finalInvoiceUrl = isValidUrl(padded[20]);
      const llExtra = toRichText(padded[21]);
      const paymentCollection = mapEnum(PAYMENT_COLLECTION_MAP, padded[22]);
      const emiPeriod = parseNum(padded[23]);
      const opexCollections = parseNum(padded[24]);
      const propMgmtApp = mapEnum(PROP_MGMT_MAP, padded[25]);
      const rulesRegsUrl = isValidUrl(padded[26]);
      const garbageDisposal = clean(padded[27]);
      const timingRestrictions = clean(padded[28]);
      const moveInOut = toRichText(padded[29]);
      const rentDeadline = clean(padded[30]);
      const overheadsDeadline = clean(padded[31]);
      const dealOwner = clean(padded[32]);
      // PSM owner (padded[33]) has no dedicated column in _propertyActive; skip.

      if (activeProps.has(propertyId)) {
        stats.propertyActiveSkipped++;
      } else {
        paPos += 1;
        const paId = randomUUID();
        await client.query(
          `INSERT INTO "${SCHEMA}"."_propertyActive" (
            id, position,
            "createdAt", "updatedAt",
            "createdBySource", "updatedBySource",
            "createdByName", "updatedByName",
            "houseNo", "activeUnitsCount", tier, floor,
            "googleMapLocationPrimaryLinkUrl", "googleMapLocationPrimaryLinkLabel",
            "buildingSociety", "activeCluster",
            "parkingType", "parkingNumber",
            "powerBackup", "waterSource",
            restrictions,
            "otherNotesBlocknote", "otherNotesMarkdown",
            "furnitureMovement", "furnishingStatus",
            "finalApprovedAmtAmountMicros", "finalApprovedAmtCurrencyCode",
            "finalInvoicePrimaryLinkUrl", "finalInvoicePrimaryLinkLabel",
            "llExtraClausesBlocknote", "llExtraClausesMarkdown",
            "paymentCollection", "emiPeriod",
            "opexCollectionsAmountMicros", "opexCollectionsCurrencyCode",
            "propMgmtApp",
            "rulesRegulationsPrimaryLinkUrl", "rulesRegulationsPrimaryLinkLabel",
            "garbageDisposal", "timingRestrictions",
            "moveInOutFormalitiesBlocknote", "moveInOutFormalitiesMarkdown",
            "rentDeadline", "overheadsDeadline",
            "activeDealOwner",
            "propertyAddressAddressStreet1", "propertyAddressAddressCountry",
            "propertyId"
          ) VALUES (
            $1, $2,
            NOW(), NOW(),
            'IMPORT', 'IMPORT', $3, $3,
            $4, $5, $6, $7,
            $8, $9,
            $10, $11,
            $12, $13,
            $14, $15,
            $16,
            $17, $18,
            $19, $20,
            $21, $22,
            $23, $24,
            $25, $26,
            $27, $28,
            $29, $30,
            $31,
            $32, $33,
            $34, $35,
            $36, $37,
            $38, $39,
            $40,
            $41, $42,
            $43
          )`,
          [
            paId, paPos,
            IMPORT_TAG,
            houseNo, unitsCount, tier, floor,
            gMapUrl, gMapUrl ? 'Google Map' : null,
            buildingSociety, cluster,
            parkingType, parkingNumber,
            powerBackup, waterSource,
            restrictions,
            otherNotes.bn, otherNotes.md,
            furnitureMovement, furnishingStatus,
            finalApproved !== null ? toMicros(finalApproved) : null,
            finalApproved !== null ? 'INR' : null,
            finalInvoiceUrl, finalInvoiceUrl ? 'Final Invoice' : null,
            llExtra.bn, llExtra.md,
            paymentCollection, emiPeriod,
            opexCollections !== null ? toMicros(opexCollections) : null,
            opexCollections !== null ? 'INR' : null,
            propMgmtApp,
            rulesRegsUrl, rulesRegsUrl ? 'Rules & Regulations' : null,
            garbageDisposal, timingRestrictions,
            moveInOut.bn, moveInOut.md,
            rentDeadline, overheadsDeadline,
            dealOwner,
            address, address ? 'India' : null,
            propertyId,
          ],
        );
        activeProps.add(propertyId);
        stats.propertyActiveInserted++;
      }

      // --- _propertyChurned (only if depositRefunded or exitCostOpx present) ---
      const depositRefunded = parseBool(padded[34]);
      const exitCostOpx = parseNum(padded[35]);
      if ((depositRefunded !== null || exitCostOpx !== null) && !churnedProps.has(propertyId)) {
        pcPos += 1;
        const pcId = randomUUID();
        await client.query(
          `INSERT INTO "${SCHEMA}"."_propertyChurned" (
            id, position,
            "createdAt", "updatedAt",
            "createdBySource", "updatedBySource",
            "createdByName", "updatedByName",
            "depositRefunded",
            "exitCostOpxAmountMicros", "exitCostOpxCurrencyCode",
            "propertyId"
          ) VALUES (
            $1, $2,
            NOW(), NOW(),
            'IMPORT', 'IMPORT', $3, $3,
            $4,
            $5, $6,
            $7
          )`,
          [
            pcId, pcPos, IMPORT_TAG,
            depositRefunded,
            exitCostOpx !== null ? toMicros(exitCostOpx) : null,
            exitCostOpx !== null ? 'INR' : null,
            propertyId,
          ],
        );
        churnedProps.add(propertyId);
        stats.propertyChurnedInserted++;
      }

      if ((idx + 1) % 50 === 0) {
        await client.query('COMMIT');
        await client.query('BEGIN');
        console.log(`[PID] Progress: ${idx + 1}/${pidRows.length}`);
      }
    }

    await client.query('COMMIT');

    // =============================================================
    // PHASE 2: Merchants (_merchant + _merchantLandlord) + link to property
    // =============================================================
    await client.query('BEGIN');

    // Preload existing merchants so re-runs are idempotent.
    const existingMerchRes = await client.query(
      `SELECT id, "emailsPrimaryEmail", name, "phonesPrimaryPhoneNumber"
         FROM "${SCHEMA}"."_merchant"`,
    );
    const merchByEmail = new Map();
    const merchByNamePhone = new Map();
    for (const row of existingMerchRes.rows) {
      if (row.emailsPrimaryEmail) {
        merchByEmail.set(row.emailsPrimaryEmail.toLowerCase(), row.id);
      }
      if (row.name && row.phonesPrimaryPhoneNumber) {
        merchByNamePhone.set(
          `${row.name.toLowerCase()}::${row.phonesPrimaryPhoneNumber}`,
          row.id,
        );
      }
    }

    for (let idx = 0; idx < merchRows.length; idx++) {
      const r = merchRows[idx];
      const padded = [...r];
      while (padded.length < 25) padded.push('');

      const pidRaw = clean(padded[0]);
      const pidNumStr = pidRaw ? pidRaw.replace(/^PID/i, '') : null;

      const merchantTypeRaw = clean(padded[1]);
      const merchantType = mapEnum(MERCHANT_TYPE_MAP, merchantTypeRaw) || 'LANDLORD';
      if (merchantTypeRaw && !MERCHANT_TYPE_MAP[merchantTypeRaw.toLowerCase()]) {
        stats.unmappedMerchantType[merchantTypeRaw] =
          (stats.unmappedMerchantType[merchantTypeRaw] || 0) + 1;
      }
      const prefixRaw = clean(padded[2]);
      const prefix = mapPrefix(prefixRaw);
      if (prefixRaw && !prefix) {
        stats.unmappedPrefix[prefixRaw] =
          (stats.unmappedPrefix[prefixRaw] || 0) + 1;
      }
      const firstName = clean(padded[3]) || '';
      const lastName = clean(padded[4]) || '';
      const name = `${firstName} ${lastName}`.trim();
      const email = clean(padded[5]);
      const countryCodeRaw = clean(padded[6]) || '91';
      const phoneNumber = clean(padded[7]);
      const currentCity = clean(padded[8]);

      // Skip completely-empty rows.
      if (!name && !email && !phoneNumber) {
        stats.merchantSkipped++;
        continue;
      }

      // Idempotency: existing by email or name+phone
      let merchantId = null;
      if (email && merchByEmail.has(email.toLowerCase())) {
        merchantId = merchByEmail.get(email.toLowerCase());
        stats.merchantSkipped++;
      } else if (
        name &&
        phoneNumber &&
        merchByNamePhone.has(`${name.toLowerCase()}::${phoneNumber}`)
      ) {
        merchantId = merchByNamePhone.get(`${name.toLowerCase()}::${phoneNumber}`);
        stats.merchantSkipped++;
      }

      if (!merchantId) {
        merchantId = randomUUID();
        mPos += 1;

        const callingCode = '+' + String(countryCodeRaw).replace(/[^0-9]/g, '');

        await client.query(
          `INSERT INTO "${SCHEMA}"."_merchant" (
            id, name, position,
            "createdAt", "updatedAt",
            "createdBySource", "updatedBySource",
            "createdByName", "updatedByName",
            "merchantType", prefix,
            "emailsPrimaryEmail", "emailsAdditionalEmails",
            "phonesPrimaryPhoneNumber", "phonesPrimaryPhoneCountryCode",
            "phonesPrimaryPhoneCallingCode", "phonesAdditionalPhones",
            "currentCity"
          ) VALUES (
            $1, $2, $3,
            NOW(), NOW(),
            'IMPORT', 'IMPORT', $4, $4,
            $5, $6,
            $7, '[]'::jsonb,
            $8, $9,
            $10, '[]'::jsonb,
            $11
          )`,
          [
            merchantId, name || null, mPos, IMPORT_TAG,
            merchantType, prefix,
            email,
            phoneNumber, phoneNumber ? 'IN' : null,
            phoneNumber ? callingCode : null,
            currentCity,
          ],
        );
        if (email) merchByEmail.set(email.toLowerCase(), merchantId);
        if (name && phoneNumber) {
          merchByNamePhone.set(`${name.toLowerCase()}::${phoneNumber}`, merchantId);
        }
        stats.merchantInserted++;

        // _merchantLandlord extension (one per merchant, for every row since nearly all are landlords)
        mlPos += 1;
        const mlId = randomUUID();
        const aadhaarBack = isValidUrl(padded[9]);
        const panNumber = clean(padded[10]);
        const panCardImage = isValidUrl(padded[11]);
        const bankAccountNumber = clean(padded[12]);
        const beneficiaryName = clean(padded[13]);
        const ifscCode = clean(padded[14]);
        const currentRes = toRichText(padded[15]);
        const permanentRes = toRichText(padded[16]);
        const linkedinUrl = isValidUrl(padded[22]);
        const commsPerm = parseBool(padded[20]);
        // Signing Authority column actually holds "Landlord" (junk). Only treat as boolean if Yes/No.
        const signingAuthority = parseBool(padded[21]);

        await client.query(
          `INSERT INTO "${SCHEMA}"."_merchantLandlord" (
            id, position,
            "createdAt", "updatedAt",
            "createdBySource", "updatedBySource",
            "createdByName", "updatedByName",
            "aadhaarBackPrimaryLinkUrl", "aadhaarBackPrimaryLinkLabel",
            "panNumber",
            "panCardImagePrimaryLinkUrl", "panCardImagePrimaryLinkLabel",
            "bankAccountNumber", "beneficiaryName", "ifscCode",
            "currentResidentialBlocknote", "currentResidentialMarkdown",
            "permanentResidentialBlocknote", "permanentResidentialMarkdown",
            "linkedinUrlPrimaryLinkUrl", "linkedinUrlPrimaryLinkLabel",
            "communicationsPermission", "signingAuthority",
            "merchantId"
          ) VALUES (
            $1, $2,
            NOW(), NOW(),
            'IMPORT', 'IMPORT', $3, $3,
            $4, $5,
            $6,
            $7, $8,
            $9, $10, $11,
            $12, $13,
            $14, $15,
            $16, $17,
            $18, $19,
            $20
          )`,
          [
            mlId, mlPos, IMPORT_TAG,
            aadhaarBack, aadhaarBack ? 'Aadhaar Back' : null,
            panNumber,
            panCardImage, panCardImage ? 'PAN Card Image' : null,
            bankAccountNumber, beneficiaryName, ifscCode,
            currentRes.bn, currentRes.md,
            permanentRes.bn, permanentRes.md,
            linkedinUrl, linkedinUrl ? 'LinkedIn' : null,
            commsPerm, signingAuthority,
            merchantId,
          ],
        );
        stats.merchantLandlordInserted++;
      }

      // --- Link property -> merchant ---
      if (pidNumStr && propertyIdByPid.has(pidNumStr)) {
        const propertyId = propertyIdByPid.get(pidNumStr);
        // Only set if currently NULL OR different (we prefer the first landlord mapped per pid)
        const currentRel = await client.query(
          `SELECT "merchantId" FROM "${SCHEMA}"."_property" WHERE id = $1`,
          [propertyId],
        );
        const curr = currentRel.rows[0]?.merchantId;
        if (!curr) {
          await client.query(
            `UPDATE "${SCHEMA}"."_property" SET "merchantId" = $1, "updatedAt" = NOW() WHERE id = $2`,
            [merchantId, propertyId],
          );
          stats.propertyMerchantLinked++;
        }
      } else if (pidNumStr) {
        stats.propertyMerchantMissing++;
      }

      if ((idx + 1) % 50 === 0) {
        await client.query('COMMIT');
        await client.query('BEGIN');
        console.log(`[MERCH] Progress: ${idx + 1}/${merchRows.length}`);
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    stats.errors.push({ fatal: true, message: err.message, stack: err.stack });
    console.error('FATAL:', err);
  } finally {
    client.release();
  }

  // ---------- Final counts ----------
  const finalProp = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_property"`,
  );
  const finalPA = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_propertyActive"`,
  );
  const finalPC = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_propertyChurned"`,
  );
  const finalM = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_merchant"`,
  );
  const finalML = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_merchantLandlord"`,
  );
  const finalLinked = await pool.query(
    `SELECT COUNT(*)::int AS c FROM "${SCHEMA}"."_property" WHERE "merchantId" IS NOT NULL`,
  );

  console.log('\n========== IMPORT SUMMARY ==========');
  console.log('PID source rows:            ', stats.pidSource);
  console.log('Merchant source rows:       ', stats.merchSource);
  console.log('_property updated:          ', stats.propertyUpdated);
  console.log('_property inserted:         ', stats.propertyInserted);
  console.log('_propertyActive inserted:   ', stats.propertyActiveInserted);
  console.log('_propertyActive skipped:    ', stats.propertyActiveSkipped);
  console.log('_propertyChurned inserted:  ', stats.propertyChurnedInserted);
  console.log('_merchant inserted:         ', stats.merchantInserted);
  console.log('_merchant skipped/existing: ', stats.merchantSkipped);
  console.log('_merchantLandlord inserted: ', stats.merchantLandlordInserted);
  console.log('property->merchant linked:  ', stats.propertyMerchantLinked);
  console.log('property->merchant missing: ', stats.propertyMerchantMissing);
  console.log('--- Unmapped enum values ---');
  console.log('propertyType:', stats.unmappedPropertyType);
  console.log('cluster:     ', stats.unmappedCluster);
  console.log('prefix:      ', stats.unmappedPrefix);
  console.log('merchantType:', stats.unmappedMerchantType);
  console.log('--- Final DB counts ---');
  console.log('_property:           ', finalProp.rows[0].c);
  console.log('_propertyActive:     ', finalPA.rows[0].c);
  console.log('_propertyChurned:    ', finalPC.rows[0].c);
  console.log('_merchant:           ', finalM.rows[0].c);
  console.log('_merchantLandlord:   ', finalML.rows[0].c);
  console.log('_property linked:    ', finalLinked.rows[0].c, '/', finalProp.rows[0].c,
    ` (${((finalLinked.rows[0].c / finalProp.rows[0].c) * 100).toFixed(1)}%)`);

  if (stats.errors.length) {
    console.log('\n--- Errors ---');
    for (const e of stats.errors.slice(0, 10)) {
      console.log(e.fatal ? `FATAL: ${e.message}` : JSON.stringify(e));
    }
  }

  await pool.end();
})().catch((e) => {
  console.error('TOP-LEVEL ERROR:', e);
  process.exit(1);
});
