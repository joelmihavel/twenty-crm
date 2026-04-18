/**
 * Import tenant tickets from /tmp/tenant-tickets.json into Twenty production DB.
 *
 * For each source row, creates:
 *   - 1 row in _ticket  (base object)
 *   - 1 row in _tenantTicketDetail  (extension, linked via ticketId)
 *
 * Usage (inside twenty-server pod):
 *   node /tmp/import-tenant-tickets.js
 *
 * Env: PG_DATABASE_URL must be set (it is, by default).
 */

const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');

const INPUT_PATH = process.env.INPUT_PATH || '/tmp/tenant-tickets.json';
const SCHEMA = 'workspace_aawr8bdd2668wxa1b0258jzwe';
const DEFAULT_CURRENCY = 'INR';

// -------- Enum mapping tables -----------------------------------------------

const CATEGORY_MAP = {
  'plumbing': 'PLUMBING',
  'carpentry': 'CARPENTRY',
  'electrical': 'ELECTRICAL',
  'electricals': 'ELECTRICAL',
  'electerical': 'ELECTRICAL',
  'electricity': 'ELECTRICAL',
  'utility': 'UTILITY',
  'utilities': 'UTILITY',
  'utilities-wifi/water/lpg': 'UTILITY',
  'wifi/water/gas': 'UTILITY',
  'wifi': 'UTILITY',
  'wifi wiring': 'UTILITY',
  'drinkprime': 'UTILITY',
  'drink prime': 'UTILITY',
  'inventory': 'INVENTORY',
  'inventory request': 'INVENTORY',
  'appliance': 'APPLIANCE',
  'appliacne': 'APPLIANCE',
  'applicane': 'APPLIANCE',
  'agreement': 'AGREEMENT',
  'reimbursement': 'REIMBURSEMENT',
  'refund': 'REIMBURSEMENT',
  'something else': 'OTHER',
  'somethine else': 'OTHER',
  'something Else': 'OTHER',
  'other': 'OTHER',
};

// Status enum in declaration order by position.
const STATUS_BY_POSITION = [
  'NEW_REQUEST',          // 0
  'WAITING_ON_CUSTOMER',  // 1
  'WAITING_ON_VENDOR',    // 2
  'WAITING_ON_PRODUCT',   // 3
  'BLOCKED',              // 4
  'WAITING_ON_LANDLORD',  // 5
  'WAITING_FOR_PAYMENT',  // 6
  'READY_FOR_CLOSURE',    // 7
  'CLOSED',               // 8
];

const PRIORITY_MAP = {
  'LOW': 'LOW',
  'MEDIUM': 'MEDIUM',
  'HIGH': 'HIGH',
  'URGENT': 'URGENT',
  'CRITICAL': 'CRITICAL',
};

const PHASE_MAP = {
  'pre move-in': 'PRE_MOVE_IN',
  'pre move in': 'PRE_MOVE_IN',
  'pre-movein': 'PRE_MOVE_IN',
  'pre movein': 'PRE_MOVE_IN',
  'gestation': 'GESTATION',
  'active': 'ACTIVE',
};

const FLAG_MAP = {
  'reasonable': 'REASONABLE',
  'non-reasonable': 'NOT_REASONABLE',
  'not reasonable': 'NOT_REASONABLE',
  'not-reasonable': 'NOT_REASONABLE',
  'subjective': 'SUBJECTIVE',
  'subjective (notes added)': 'SUBJECTIVE',
};

const RATING_MAP = {
  1: 'RATING_1', 2: 'RATING_2', 3: 'RATING_3', 4: 'RATING_4', 5: 'RATING_5',
};

// -------- Helpers -----------------------------------------------------------

function mapCategory(raw) {
  if (!raw) return 'OTHER';
  const key = String(raw).trim().toLowerCase();
  return CATEGORY_MAP[key] || 'OTHER';
}

function mapStatus(raw) {
  if (raw === null || raw === undefined) return 'NEW_REQUEST';
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'NEW_REQUEST';
  // Source uses 1..9 where 1 = NEW_REQUEST. So position = n - 1.
  // Anything outside 0..8 is garbage (raw user IDs); fall back to NEW_REQUEST.
  const idx = Math.round(n) - 1;
  if (idx < 0 || idx > 8) return 'NEW_REQUEST';
  return STATUS_BY_POSITION[idx];
}

function mapPriority(raw) {
  if (!raw) return 'LOW';
  const key = String(raw).trim().toUpperCase();
  return PRIORITY_MAP[key] || 'LOW';
}

function mapPhase(raw) {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  return PHASE_MAP[key] || null;
}

function mapFlag(raw) {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  return FLAG_MAP[key] || null;
}

function mapRating(raw) {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const r = Math.round(n);
  return RATING_MAP[r] || null;
}

function padRid(rid) {
  if (!rid) return null;
  const s = String(rid).trim();
  // Rooms are stored with zero-padded prefix (e.g. '01BR1', '04BR1', '104BR2').
  // Source sometimes has '4BR1'. Split on 'BR' and pad left to 2 digits.
  const m = /^(\d+)BR(\d+)$/i.exec(s);
  if (!m) return s;
  const prefix = m[1].padStart(2, '0');
  return `${prefix}BR${m[2]}`;
}

function toTimestamp(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toBigintMicros(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  // CURRENCY stores amountMicros = amount * 1_000_000.
  return String(Math.round(n * 1_000_000));
}

function isPlainString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function truncateName(raw, max = 80) {
  if (!raw) return 'Imported Ticket';
  const s = String(raw).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function blocknoteFromMarkdown(markdown) {
  // Minimal Blocknote doc (array of blocks). One paragraph per line break.
  if (!markdown) return null;
  const blocks = String(markdown)
    .split(/\r?\n/)
    .map((line) => ({
      id: crypto.randomUUID(),
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: line
        ? [
            {
              type: 'text',
              text: line,
              styles: {},
            },
          ]
        : [],
      children: [],
    }));
  return JSON.stringify(blocks);
}

// -------- Main --------------------------------------------------------------

async function main() {
  const raw = fs.readFileSync(INPUT_PATH, 'utf8');
  const data = JSON.parse(raw);
  const rows = data.rows;
  console.log(`Loaded ${rows.length} rows from ${INPUT_PATH}`);

  const client = new Client({ connectionString: process.env.PG_DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Build RID -> {id, propertyId} lookup
  const roomRes = await client.query(
    `SELECT id, rid, "propertyId" FROM "${SCHEMA}"."_room"`,
  );
  const roomByRid = new Map();
  for (const r of roomRes.rows) roomByRid.set(r.rid, r);
  console.log(`Loaded ${roomByRid.size} rooms for RID lookup`);

  const stats = {
    total: rows.length,
    imported: 0,
    ridMapped: 0,
    ridUnmapped: 0,
    failed: 0,
    categoryCounts: {},
    statusCounts: {},
    priorityCounts: {},
    phaseCounts: {},
    flagCounts: {},
    ratingCounts: {},
  };
  const errors = [];

  // One transaction per batch to keep insert ordering simple & fast.
  const BATCH_SIZE = 200;
  for (let b = 0; b < rows.length; b += BATCH_SIZE) {
    const batch = rows.slice(b, b + BATCH_SIZE);
    await client.query('BEGIN');
    try {
      for (let i = 0; i < batch.length; i++) {
        const r = batch[i];
        const rowIdx = b + i;
        try {
          const ticketId = crypto.randomUUID();
          const detailId = crypto.randomUUID();

          // --- Base ticket fields
          const pipeline = 'TENANT';
          const createdAt = toTimestamp(r[3]) || new Date().toISOString();
          const createdByEmail = isPlainString(r[5]) ? r[5] : 'import@flent.in';
          const ownerEmail = isPlainString(r[9]) ? r[9] : null;
          const ticketNameRaw = r[6];
          const description = r[7];
          const ridRaw = r[11];
          const paddedRid = padRid(ridRaw);
          const room = paddedRid ? roomByRid.get(paddedRid) : null;
          if (paddedRid && room) stats.ridMapped++;
          else if (paddedRid) stats.ridUnmapped++;

          const ticketCategory = mapCategory(r[12]);
          const ticketStatus = mapStatus(r[13]);
          const priority = mapPriority(r[14]);
          const resolutionNotes = r[19];
          const collectedFromTenant = toBigintMicros(r[20]);
          const collectedFromMerchant = toBigintMicros(r[21]);

          stats.categoryCounts[ticketCategory] =
            (stats.categoryCounts[ticketCategory] || 0) + 1;
          stats.statusCounts[ticketStatus] =
            (stats.statusCounts[ticketStatus] || 0) + 1;
          stats.priorityCounts[priority] =
            (stats.priorityCounts[priority] || 0) + 1;

          // Position = row index so order is preserved.
          const position = rowIdx;

          // createdByContext is NOT NULL (USER-DEFINED enum? Actually jsonb).
          // createdBySource is USER-DEFINED enum: use 'IMPORT'.
          const createdByContext = JSON.stringify({
            source: 'IMPORT',
            sourceEmail: createdByEmail,
            sourceTicketId: r[2] != null ? String(r[2]) : null,
            sourceOwnerEmail: ownerEmail,
          });

          const descMarkdown = isPlainString(description) ? description : null;
          const descBlocknote = descMarkdown
            ? blocknoteFromMarkdown(descMarkdown)
            : null;
          const resNotesMd = isPlainString(resolutionNotes) ? resolutionNotes : null;
          const resNotesBn = resNotesMd ? blocknoteFromMarkdown(resNotesMd) : null;

          const baseInsert = `
            INSERT INTO "${SCHEMA}"."_ticket" (
              "id", "name", "createdAt", "updatedAt",
              "createdBySource", "createdByName", "createdByContext",
              "updatedBySource", "updatedByName",
              "position", "pipeline",
              "ticketDescriptionMarkdown", "ticketDescriptionBlocknote",
              "ticketOwner", "ticketCategory", "ticketStatus", "priority",
              "resolutionNotesMarkdown", "resolutionNotesBlocknote",
              "collectedFromTenantAmountMicros", "collectedFromTenantCurrencyCode",
              "collectedFromMerchantAmountMicros", "collectedFromMerchantCurrencyCode",
              "propertyId"
            ) VALUES (
              $1, $2, $3, $4,
              $5, $6, $7::jsonb,
              $8, $9,
              $10, $11,
              $12, $13,
              $14, $15, $16, $17,
              $18, $19,
              $20, $21,
              $22, $23,
              $24
            )
          `;

          const baseName = truncateName(ticketNameRaw);
          await client.query(baseInsert, [
            ticketId,
            baseName,
            createdAt,
            createdAt, // updatedAt = createdAt
            'IMPORT',
            createdByEmail,
            createdByContext,
            'IMPORT',
            createdByEmail,
            position,
            pipeline,
            descMarkdown,
            descBlocknote,
            'UNASSIGNED', // ticketOwner enum: only UNASSIGNED exists in prod.
            ticketCategory,
            ticketStatus,
            priority,
            resNotesMd,
            resNotesBn,
            collectedFromTenant,
            collectedFromTenant ? DEFAULT_CURRENCY : null,
            collectedFromMerchant,
            collectedFromMerchant ? DEFAULT_CURRENCY : null,
            room ? room.propertyId : null,
          ]);

          // --- Tenant ticket detail fields
          const phase = mapPhase(r[15]);
          if (phase) stats.phaseCounts[phase] = (stats.phaseCounts[phase] || 0) + 1;
          const timeSlot = toTimestamp(r[16]);
          const flag = mapFlag(r[17]);
          if (flag) stats.flagCounts[flag] = (stats.flagCounts[flag] || 0) + 1;
          const flagNotes = isPlainString(r[18]) ? r[18] : null;
          const flagNotesBn = flagNotes ? blocknoteFromMarkdown(flagNotes) : null;
          const totalCost = toBigintMicros(r[22]);
          const vendorGroupChatId = isPlainString(r[25]) ? r[25] : null;
          const relatedTickets = isPlainString(r[26]) ? r[26] : null;
          const timeToFirstAssignment = Number.isFinite(Number(r[27])) && r[27] != null ? Number(r[27]) : null;
          const timeToFirstResponseSla = Number.isFinite(Number(r[28])) && r[28] != null ? Number(r[28]) : null;

          // Rating: col 29 is empty in source; col 31 (CSAT Response) carries
          // the numeric 1-5 rating. Use that for tenantRating.
          const ratingRaw = r[29] != null ? r[29] : r[31];
          const rating = mapRating(ratingRaw);
          if (rating) stats.ratingCounts[rating] = (stats.ratingCounts[rating] || 0) + 1;

          const csatFeedbackMd = isPlainString(r[30]) ? r[30] : null;
          const csatFeedbackBn = csatFeedbackMd ? blocknoteFromMarkdown(csatFeedbackMd) : null;
          const csatResponseRaw = r[31];
          const csatResponseMd = csatResponseRaw == null
            ? null
            : (typeof csatResponseRaw === 'string'
                ? (csatResponseRaw.trim() ? csatResponseRaw : null)
                : String(csatResponseRaw));
          const csatResponseBn = csatResponseMd ? blocknoteFromMarkdown(csatResponseMd) : null;

          const conversationId = isPlainString(r[10]) ? r[10] : null;
          const ticketNameText = isPlainString(ticketNameRaw) ? ticketNameRaw : null;

          const detailInsert = `
            INSERT INTO "${SCHEMA}"."_tenantTicketDetail" (
              "id", "createdAt", "updatedAt",
              "createdBySource", "createdByName", "createdByContext",
              "updatedBySource", "updatedByName",
              "position",
              "ticketName", "conversationId",
              "categoryPhase", "timeSlot",
              "ticketFlag",
              "flagNotesMarkdown", "flagNotesBlocknote",
              "totalCostAmountMicros", "totalCostCurrencyCode",
              "vendorGroupChatId", "relatedTickets",
              "timeToFirstRepAssignment", "timeToFirstResponseSlaHours",
              "tenantRating",
              "csatFeedbackMarkdown", "csatFeedbackBlocknote",
              "csatResponseMarkdown", "csatResponseBlocknote",
              "ticketId", "roomId"
            ) VALUES (
              $1, $2, $3,
              $4, $5, $6::jsonb,
              $7, $8,
              $9,
              $10, $11,
              $12, $13,
              $14,
              $15, $16,
              $17, $18,
              $19, $20,
              $21, $22,
              $23,
              $24, $25,
              $26, $27,
              $28, $29
            )
          `;
          await client.query(detailInsert, [
            detailId,
            createdAt,
            createdAt,
            'IMPORT',
            createdByEmail,
            createdByContext,
            'IMPORT',
            createdByEmail,
            position,
            ticketNameText,
            conversationId,
            phase,
            timeSlot,
            flag,
            flagNotes,
            flagNotesBn,
            totalCost,
            totalCost ? DEFAULT_CURRENCY : null,
            vendorGroupChatId,
            relatedTickets,
            timeToFirstAssignment,
            timeToFirstResponseSla,
            rating,
            csatFeedbackMd,
            csatFeedbackBn,
            csatResponseMd,
            csatResponseBn,
            ticketId,
            room ? room.id : null,
          ]);

          stats.imported++;
        } catch (err) {
          stats.failed++;
          errors.push({ rowIdx, ticketId: r[2], error: err.message });
          if (errors.length <= 10) {
            console.error(`Row ${rowIdx} (ticket ${r[2]}) failed:`, err.message);
          }
          throw err; // bubble up; we'll roll back this batch and retry per-row
        }
      }
      await client.query('COMMIT');
      console.log(`Batch ${b}..${b + batch.length - 1} committed`);
    } catch (batchErr) {
      await client.query('ROLLBACK');
      console.warn(`Batch ${b} rolled back: ${batchErr.message}. Retrying per-row.`);
      // Retry row-by-row so a single failure doesn't kill the batch.
      stats.failed = 0; // reset, errors collected per-row next
      for (let i = 0; i < batch.length; i++) {
        const r = batch[i];
        const rowIdx = b + i;
        try {
          await insertSingle(client, r, rowIdx, roomByRid, stats);
          stats.imported++;
        } catch (err) {
          stats.failed++;
          errors.push({ rowIdx, ticketId: r[2], error: err.message });
          if (errors.length <= 20) {
            console.error(`Row ${rowIdx} failed (retry): ${err.message}`);
          }
        }
      }
    }
  }

  await client.end();

  console.log('\n=== Import Summary ===');
  console.log(JSON.stringify(stats, null, 2));
  if (errors.length) {
    console.log(`\nFirst errors (${Math.min(errors.length, 20)} of ${errors.length}):`);
    errors.slice(0, 20).forEach((e) => console.log(JSON.stringify(e)));
  }
}

// Single-row insert used by per-row retry path.
async function insertSingle(client, r, rowIdx, roomByRid, stats) {
  const ticketId = crypto.randomUUID();
  const detailId = crypto.randomUUID();
  const pipeline = 'TENANT';
  const createdAt = toTimestamp(r[3]) || new Date().toISOString();
  const createdByEmail = isPlainString(r[5]) ? r[5] : 'import@flent.in';
  const ownerEmail = isPlainString(r[9]) ? r[9] : null;
  const ticketNameRaw = r[6];
  const description = r[7];
  const ridRaw = r[11];
  const paddedRid = padRid(ridRaw);
  const room = paddedRid ? roomByRid.get(paddedRid) : null;
  if (paddedRid && room) stats.ridMapped++;
  else if (paddedRid) stats.ridUnmapped++;

  const ticketCategory = mapCategory(r[12]);
  const ticketStatus = mapStatus(r[13]);
  const priority = mapPriority(r[14]);
  stats.categoryCounts[ticketCategory] =
    (stats.categoryCounts[ticketCategory] || 0) + 1;
  stats.statusCounts[ticketStatus] =
    (stats.statusCounts[ticketStatus] || 0) + 1;
  stats.priorityCounts[priority] =
    (stats.priorityCounts[priority] || 0) + 1;

  const createdByContext = JSON.stringify({
    source: 'IMPORT',
    sourceEmail: createdByEmail,
    sourceTicketId: r[2] != null ? String(r[2]) : null,
    sourceOwnerEmail: ownerEmail,
  });
  const descMarkdown = isPlainString(description) ? description : null;
  const descBlocknote = descMarkdown ? blocknoteFromMarkdown(descMarkdown) : null;
  const resNotesMd = isPlainString(r[19]) ? r[19] : null;
  const resNotesBn = resNotesMd ? blocknoteFromMarkdown(resNotesMd) : null;
  const collectedFromTenant = toBigintMicros(r[20]);
  const collectedFromMerchant = toBigintMicros(r[21]);

  await client.query(
    `INSERT INTO "${SCHEMA}"."_ticket" (
       "id","name","createdAt","updatedAt",
       "createdBySource","createdByName","createdByContext",
       "updatedBySource","updatedByName",
       "position","pipeline",
       "ticketDescriptionMarkdown","ticketDescriptionBlocknote",
       "ticketOwner","ticketCategory","ticketStatus","priority",
       "resolutionNotesMarkdown","resolutionNotesBlocknote",
       "collectedFromTenantAmountMicros","collectedFromTenantCurrencyCode",
       "collectedFromMerchantAmountMicros","collectedFromMerchantCurrencyCode",
       "propertyId"
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
     )`,
    [
      ticketId,
      truncateName(ticketNameRaw),
      createdAt,
      createdAt,
      'IMPORT',
      createdByEmail,
      createdByContext,
      'IMPORT',
      createdByEmail,
      rowIdx,
      pipeline,
      descMarkdown,
      descBlocknote,
      'UNASSIGNED',
      ticketCategory,
      ticketStatus,
      priority,
      resNotesMd,
      resNotesBn,
      collectedFromTenant,
      collectedFromTenant ? DEFAULT_CURRENCY : null,
      collectedFromMerchant,
      collectedFromMerchant ? DEFAULT_CURRENCY : null,
      room ? room.propertyId : null,
    ],
  );

  const phase = mapPhase(r[15]);
  if (phase) stats.phaseCounts[phase] = (stats.phaseCounts[phase] || 0) + 1;
  const timeSlot = toTimestamp(r[16]);
  const flag = mapFlag(r[17]);
  if (flag) stats.flagCounts[flag] = (stats.flagCounts[flag] || 0) + 1;
  const flagNotes = isPlainString(r[18]) ? r[18] : null;
  const flagNotesBn = flagNotes ? blocknoteFromMarkdown(flagNotes) : null;
  const totalCost = toBigintMicros(r[22]);
  const vendorGroupChatId = isPlainString(r[25]) ? r[25] : null;
  const relatedTickets = isPlainString(r[26]) ? r[26] : null;
  const timeToFirstAssignment = Number.isFinite(Number(r[27])) && r[27] != null ? Number(r[27]) : null;
  const timeToFirstResponseSla = Number.isFinite(Number(r[28])) && r[28] != null ? Number(r[28]) : null;
  const ratingRaw = r[29] != null ? r[29] : r[31];
  const rating = mapRating(ratingRaw);
  if (rating) stats.ratingCounts[rating] = (stats.ratingCounts[rating] || 0) + 1;
  const csatFeedbackMd = isPlainString(r[30]) ? r[30] : null;
  const csatFeedbackBn = csatFeedbackMd ? blocknoteFromMarkdown(csatFeedbackMd) : null;
  const csatResponseRaw = r[31];
  const csatResponseMd = csatResponseRaw == null
    ? null
    : (typeof csatResponseRaw === 'string'
        ? (csatResponseRaw.trim() ? csatResponseRaw : null)
        : String(csatResponseRaw));
  const csatResponseBn = csatResponseMd ? blocknoteFromMarkdown(csatResponseMd) : null;
  const conversationId = isPlainString(r[10]) ? r[10] : null;
  const ticketNameText = isPlainString(ticketNameRaw) ? ticketNameRaw : null;

  await client.query(
    `INSERT INTO "${SCHEMA}"."_tenantTicketDetail" (
       "id","createdAt","updatedAt",
       "createdBySource","createdByName","createdByContext",
       "updatedBySource","updatedByName",
       "position",
       "ticketName","conversationId",
       "categoryPhase","timeSlot",
       "ticketFlag",
       "flagNotesMarkdown","flagNotesBlocknote",
       "totalCostAmountMicros","totalCostCurrencyCode",
       "vendorGroupChatId","relatedTickets",
       "timeToFirstRepAssignment","timeToFirstResponseSlaHours",
       "tenantRating",
       "csatFeedbackMarkdown","csatFeedbackBlocknote",
       "csatResponseMarkdown","csatResponseBlocknote",
       "ticketId","roomId"
     ) VALUES (
       $1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
     )`,
    [
      detailId,
      createdAt,
      createdAt,
      'IMPORT',
      createdByEmail,
      createdByContext,
      'IMPORT',
      createdByEmail,
      rowIdx,
      ticketNameText,
      conversationId,
      phase,
      timeSlot,
      flag,
      flagNotes,
      flagNotesBn,
      totalCost,
      totalCost ? DEFAULT_CURRENCY : null,
      vendorGroupChatId,
      relatedTickets,
      timeToFirstAssignment,
      timeToFirstResponseSla,
      rating,
      csatFeedbackMd,
      csatFeedbackBn,
      csatResponseMd,
      csatResponseBn,
      ticketId,
      room ? room.id : null,
    ],
  );
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
