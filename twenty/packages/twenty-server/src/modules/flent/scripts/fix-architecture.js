#!/usr/bin/env node
/**
 * fix-architecture.js
 *
 * Implements 7 architecture fixes to the Flent CRM data model:
 *   #1 - _property.merchant  MANY_TO_ONE  _merchant
 *   #2 - _poLine.fsin        MANY_TO_ONE  _fsin
 *   #3 - _tenant.currentContract / currentProperty / currentRoom + sync trigger
 *   #4 - _room.currentContract / currentTenant + availableFrom + sync trigger
 *   #5 - _contract.partyNameTenant / partyNameMerchant (TEXT) +
 *        primaryTenant / primaryMerchant (MTO) + sync trigger
 *   #6 - _ticket.room / tenant (MTO)
 *   #7 - tenantRoomVisit junction object (migrate ridsVisited)
 *
 * Idempotent: safe to re-run.
 *
 * Usage (from a Twenty pod):
 *   APP_SECRET=<s> PG_DATABASE_URL=<url> node fix-architecture.js
 *
 * Skip phases with env vars: SKIP_RELATIONS=1, SKIP_TRIGGERS=1, SKIP_BACKFILL=1
 */

const { createHash, createHmac } = require('crypto');

// ─── Configuration ──────────────────────────────────────────────────────────

const WORKSPACE_ID = process.env.WORKSPACE_ID || 'ae07eba0-7d31-499a-912f-816fc42d987e';
const SCHEMA = process.env.WORKSPACE_SCHEMA || 'workspace_aawr8bdd2668wxa1b0258jzwe';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const METADATA_URL = `${SERVER_URL}/metadata`;
const DELAY_MS = parseInt(process.env.DELAY_MS || '400', 10);
const APPLY_WAIT_MS = parseInt(process.env.APPLY_WAIT_MS || '8000', 10);

const SKIP_RELATIONS = process.env.SKIP_RELATIONS === '1';
const SKIP_TRIGGERS = process.env.SKIP_TRIGGERS === '1';
const SKIP_BACKFILL = process.env.SKIP_BACKFILL === '1';

// Object metadata IDs (from existing installation)
const OBJECT_IDS = {
  contract: 'de3ca10b-29e7-4e1b-a97b-9f66d853ca08',
  fsin: '7155e40f-c9a1-402f-8e83-351c7dca201f',
  merchant: 'ef268d02-450d-4c5a-b17c-c689c4f7737b',
  poLine: 'd075de41-3e26-48af-a95e-b29e30da1833',
  property: '30a91d13-7c47-419a-a2d7-eaec829d4e67',
  room: '3795f95c-6a99-45d6-8145-3954df0763dd',
  tenant: 'a2017fa5-ad99-4c21-b545-548497ef6c77',
  ticket: 'a3f13417-0f8a-4cc8-bb98-deafc816407e',
};

// ─── JWT generation (same as wire-relations.js) ─────────────────────────────

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

async function generateToken(pg) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) throw new Error('APP_SECRET environment variable is required');

  const apiKeyResult = await pg.query(
    `SELECT ak.id, ak."expiresAt"
     FROM core."apiKey" ak
     WHERE ak."workspaceId" = $1
       AND ak."revokedAt" IS NULL
       AND (ak."expiresAt" IS NULL OR ak."expiresAt" > NOW())
     ORDER BY ak."createdAt" DESC
     LIMIT 1`,
    [WORKSPACE_ID]
  );

  let apiKeyId, expiresAt;
  if (apiKeyResult.rows.length > 0) {
    apiKeyId = apiKeyResult.rows[0].id;
    expiresAt = apiKeyResult.rows[0].expiresAt;
    console.log(`Found existing API key: ${apiKeyId}`);
  } else {
    const roleResult = await pg.query(
      `SELECT id FROM core."role" WHERE "workspaceId" = $1 ORDER BY "createdAt" ASC LIMIT 1`,
      [WORKSPACE_ID]
    );
    if (roleResult.rows.length === 0) throw new Error('No role found for workspace');
    expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const insertResult = await pg.query(
      `INSERT INTO core."apiKey" (id, name, "expiresAt", "workspaceId", "roleId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Flent Architecture Fix Script', $1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [expiresAt, WORKSPACE_ID, roleResult.rows[0].id]
    );
    apiKeyId = insertResult.rows[0].id;
    console.log(`Created temporary API key: ${apiKeyId}`);
  }

  const type = 'API_KEY';
  const secret = createHash('sha256').update(`${appSecret}${WORKSPACE_ID}${type}`).digest('hex');

  let jwt;
  try { jwt = require('jsonwebtoken'); } catch { jwt = null; }

  if (jwt) {
    const expiresIn = expiresAt
      ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      : 365 * 24 * 60 * 60;
    return jwt.sign(
      { sub: WORKSPACE_ID, type: 'API_KEY', workspaceId: WORKSPACE_ID },
      secret,
      { expiresIn, jwtid: apiKeyId }
    );
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : now + 365 * 24 * 60 * 60;
  const payload = { sub: WORKSPACE_ID, type: 'API_KEY', workspaceId: WORKSPACE_ID, jti: apiKeyId, iat: now, exp };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest('base64url');
  return `${headerB64}.${payloadB64}.${sig}`;
}

// ─── GraphQL helpers ────────────────────────────────────────────────────────

async function gql(query, variables, token) {
  const r = await fetch(METADATA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const result = await r.json();
  if (result.errors) throw new Error(`GraphQL error: ${result.errors.map(e => e.message).join('; ')}`);
  return result.data;
}

const CREATE_FIELD_MUTATION = `
  mutation CreateOneField($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) {
      id
      name
      label
      type
    }
  }
`;

const CREATE_OBJECT_MUTATION = `
  mutation CreateOneObject($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
      nameSingular
      namePlural
    }
  }
`;

const FIND_FIELDS_QUERY = `
  query FindFields($objectId: UUID!) {
    fields(filter: { objectMetadataId: { eq: $objectId } }, paging: { first: 500 }) {
      edges { node { id name type } }
    }
  }
`;

const FIND_OBJECTS_QUERY = `
  query FindObjects {
    objects(paging: { first: 300 }) {
      edges { node { id nameSingular namePlural isCustom } }
    }
  }
`;

async function findFields(token, objectId) {
  const data = await gql(FIND_FIELDS_QUERY, { objectId }, token);
  const byName = {};
  for (const edge of data.fields.edges) byName[edge.node.name] = edge.node;
  return byName;
}

async function findObjects(token) {
  const data = await gql(FIND_OBJECTS_QUERY, {}, token);
  const byName = {};
  for (const edge of data.objects.edges) byName[edge.node.nameSingular] = edge.node;
  return byName;
}

async function createRelationField(rel, token) {
  const input = {
    field: {
      type: 'RELATION',
      name: rel.fieldName,
      label: rel.fieldLabel,
      icon: rel.fieldIcon,
      objectMetadataId: rel.sourceObjectId,
      relationCreationPayload: {
        type: 'MANY_TO_ONE',
        targetObjectMetadataId: rel.targetObjectId,
        targetFieldLabel: rel.targetFieldLabel,
        targetFieldIcon: rel.targetFieldIcon,
      },
    },
  };
  const data = await gql(CREATE_FIELD_MUTATION, { input }, token);
  return data.createOneField;
}

async function createTextField(field, token) {
  const input = {
    field: {
      type: 'TEXT',
      name: field.name,
      label: field.label,
      icon: field.icon,
      objectMetadataId: field.objectMetadataId,
      isNullable: true,
    },
  };
  const data = await gql(CREATE_FIELD_MUTATION, { input }, token);
  return data.createOneField;
}

async function createDateField(field, token) {
  const input = {
    field: {
      type: 'DATE',
      name: field.name,
      label: field.label,
      icon: field.icon,
      objectMetadataId: field.objectMetadataId,
      isNullable: true,
    },
  };
  const data = await gql(CREATE_FIELD_MUTATION, { input }, token);
  return data.createOneField;
}

async function createObject(obj, token) {
  const input = {
    object: {
      nameSingular: obj.nameSingular,
      namePlural: obj.namePlural,
      labelSingular: obj.labelSingular,
      labelPlural: obj.labelPlural,
      description: obj.description,
      icon: obj.icon,
    },
  };
  const data = await gql(CREATE_OBJECT_MUTATION, { input }, token);
  return data.createOneObject;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Relation/Field Definitions ─────────────────────────────────────────────

function defineRelations() {
  return [
    // Fix #1
    { id: 'fix1.property.merchant', fix: 1,
      sourceObjectId: OBJECT_IDS.property, sourceName: 'property',
      targetObjectId: OBJECT_IDS.merchant, targetName: 'merchant',
      fieldName: 'merchant', fieldLabel: 'Merchant', fieldIcon: 'IconStore',
      targetFieldLabel: 'Properties', targetFieldIcon: 'IconBuildingSkyscraper',
      targetFieldName: 'properties' },

    // Fix #2
    { id: 'fix2.poLine.fsin', fix: 2,
      sourceObjectId: OBJECT_IDS.poLine, sourceName: 'poLine',
      targetObjectId: OBJECT_IDS.fsin, targetName: 'fsin',
      fieldName: 'fsin', fieldLabel: 'FSIN', fieldIcon: 'IconCarrot',
      targetFieldLabel: 'PO Lines', targetFieldIcon: 'IconListDetails',
      targetFieldName: 'poLines' },

    // Fix #3 - tenant current state
    { id: 'fix3.tenant.currentContract', fix: 3,
      sourceObjectId: OBJECT_IDS.tenant, sourceName: 'tenant',
      targetObjectId: OBJECT_IDS.contract, targetName: 'contract',
      fieldName: 'currentContract', fieldLabel: 'Current Contract', fieldIcon: 'IconFileDescription',
      targetFieldLabel: 'Current Tenants', targetFieldIcon: 'IconUser',
      targetFieldName: 'currentTenants' },
    { id: 'fix3.tenant.currentProperty', fix: 3,
      sourceObjectId: OBJECT_IDS.tenant, sourceName: 'tenant',
      targetObjectId: OBJECT_IDS.property, targetName: 'property',
      fieldName: 'currentProperty', fieldLabel: 'Current Property', fieldIcon: 'IconBuilding',
      targetFieldLabel: 'Current Tenants (Property)', targetFieldIcon: 'IconUser',
      targetFieldName: 'currentTenantsProperty' },
    { id: 'fix3.tenant.currentRoom', fix: 3,
      sourceObjectId: OBJECT_IDS.tenant, sourceName: 'tenant',
      targetObjectId: OBJECT_IDS.room, targetName: 'room',
      fieldName: 'currentRoom', fieldLabel: 'Current Room', fieldIcon: 'IconDoor',
      targetFieldLabel: 'Current Tenants (Room)', targetFieldIcon: 'IconUser',
      targetFieldName: 'currentTenantsRoom' },

    // Fix #4 - room current state
    { id: 'fix4.room.currentContract', fix: 4,
      sourceObjectId: OBJECT_IDS.room, sourceName: 'room',
      targetObjectId: OBJECT_IDS.contract, targetName: 'contract',
      fieldName: 'currentContract', fieldLabel: 'Current Contract', fieldIcon: 'IconFileDescription',
      targetFieldLabel: 'Occupied Rooms', targetFieldIcon: 'IconDoor',
      targetFieldName: 'occupiedRooms' },
    { id: 'fix4.room.currentTenant', fix: 4,
      sourceObjectId: OBJECT_IDS.room, sourceName: 'room',
      targetObjectId: OBJECT_IDS.tenant, targetName: 'tenant',
      fieldName: 'currentTenant', fieldLabel: 'Current Tenant', fieldIcon: 'IconUser',
      targetFieldLabel: 'Currently Occupied Rooms', targetFieldIcon: 'IconDoor',
      targetFieldName: 'currentlyOccupiedRooms' },

    // Fix #5 - contract primary parties
    { id: 'fix5.contract.primaryTenant', fix: 5,
      sourceObjectId: OBJECT_IDS.contract, sourceName: 'contract',
      targetObjectId: OBJECT_IDS.tenant, targetName: 'tenant',
      fieldName: 'primaryTenant', fieldLabel: 'Primary Tenant', fieldIcon: 'IconUser',
      targetFieldLabel: 'Primary Contracts', targetFieldIcon: 'IconFileDescription',
      targetFieldName: 'primaryContracts' },
    { id: 'fix5.contract.primaryMerchant', fix: 5,
      sourceObjectId: OBJECT_IDS.contract, sourceName: 'contract',
      targetObjectId: OBJECT_IDS.merchant, targetName: 'merchant',
      fieldName: 'primaryMerchant', fieldLabel: 'Primary Merchant', fieldIcon: 'IconStore',
      targetFieldLabel: 'Primary Contracts', targetFieldIcon: 'IconFileDescription',
      targetFieldName: 'primaryContractsMerchant' },

    // Fix #6 - ticket direct FKs
    { id: 'fix6.ticket.room', fix: 6,
      sourceObjectId: OBJECT_IDS.ticket, sourceName: 'ticket',
      targetObjectId: OBJECT_IDS.room, targetName: 'room',
      fieldName: 'room', fieldLabel: 'Room', fieldIcon: 'IconDoor',
      targetFieldLabel: 'Tickets', targetFieldIcon: 'IconTicket',
      targetFieldName: 'tickets' },
    { id: 'fix6.ticket.tenant', fix: 6,
      sourceObjectId: OBJECT_IDS.ticket, sourceName: 'ticket',
      targetObjectId: OBJECT_IDS.tenant, targetName: 'tenant',
      fieldName: 'tenant', fieldLabel: 'Tenant', fieldIcon: 'IconUser',
      targetFieldLabel: 'Tenant Tickets', targetFieldIcon: 'IconTicket',
      targetFieldName: 'tenantTickets' },
  ];
}

function defineScalarFields() {
  return [
    // Fix #4 - availableFrom date on room
    { id: 'fix4.room.availableFrom', fix: 4,
      objectMetadataId: OBJECT_IDS.room, sourceName: 'room',
      kind: 'DATE', name: 'availableFrom', label: 'Available From', icon: 'IconCalendarTime' },

    // Fix #5 - denormalized party name strings on contract
    { id: 'fix5.contract.partyNameTenant', fix: 5,
      objectMetadataId: OBJECT_IDS.contract, sourceName: 'contract',
      kind: 'TEXT', name: 'partyNameTenant', label: 'Party Name (Tenant)', icon: 'IconUser' },
    { id: 'fix5.contract.partyNameMerchant', fix: 5,
      objectMetadataId: OBJECT_IDS.contract, sourceName: 'contract',
      kind: 'TEXT', name: 'partyNameMerchant', label: 'Party Name (Merchant)', icon: 'IconStore' },
  ];
}

// ─── Phase A: create RELATION + scalar fields via metadata API ──────────────

async function phaseCreateRelations(token, report) {
  console.log('\n=== Phase A: Create RELATION fields ===\n');

  const relations = defineRelations();
  const scalarFields = defineScalarFields();

  // Pre-fetch existing fields per source object
  const sources = [...new Set([
    ...relations.map(r => r.sourceObjectId),
    ...scalarFields.map(f => f.objectMetadataId),
  ])];

  const existing = {};
  for (const oid of sources) {
    try {
      existing[oid] = await findFields(token, oid);
    } catch (err) {
      console.warn(`  Warning fetching fields for ${oid}: ${err.message}`);
      existing[oid] = {};
    }
  }

  for (const rel of relations) {
    const ex = existing[rel.sourceObjectId] || {};
    if (ex[rel.fieldName]) {
      console.log(`  SKIP  [${rel.id}] ${rel.sourceName}.${rel.fieldName} already exists`);
      report.relations.skipped.push({ ...rel, fieldId: ex[rel.fieldName].id });
      continue;
    }
    try {
      const created = await createRelationField(rel, token);
      console.log(`  OK    [${rel.id}] ${rel.sourceName}.${rel.fieldName} -> ${rel.targetName} (id=${created.id})`);
      report.relations.created.push({ ...rel, fieldId: created.id });
    } catch (err) {
      console.error(`  FAIL  [${rel.id}] ${rel.sourceName}.${rel.fieldName}: ${err.message}`);
      report.relations.failed.push({ ...rel, error: err.message });
    }
    await delay(DELAY_MS);
  }

  for (const f of scalarFields) {
    const ex = existing[f.objectMetadataId] || {};
    if (ex[f.name]) {
      console.log(`  SKIP  [${f.id}] ${f.sourceName}.${f.name} already exists`);
      report.scalarFields.skipped.push({ ...f, fieldId: ex[f.name].id });
      continue;
    }
    try {
      const created = f.kind === 'DATE'
        ? await createDateField(f, token)
        : await createTextField(f, token);
      console.log(`  OK    [${f.id}] ${f.sourceName}.${f.name} (${f.kind}, id=${created.id})`);
      report.scalarFields.created.push({ ...f, fieldId: created.id });
    } catch (err) {
      console.error(`  FAIL  [${f.id}] ${f.sourceName}.${f.name}: ${err.message}`);
      report.scalarFields.failed.push({ ...f, error: err.message });
    }
    await delay(DELAY_MS);
  }
}

// ─── Phase B: Create tenantRoomVisit junction object (Fix #7) ───────────────

async function phaseCreateJunctionObject(token, report) {
  console.log('\n=== Phase B: Create tenantRoomVisit junction object (Fix #7) ===\n');

  const objs = await findObjects(token);
  let obj = objs.tenantRoomVisit;
  let objId;

  if (obj) {
    objId = obj.id;
    console.log(`  SKIP  tenantRoomVisit already exists (id=${objId})`);
    report.junctionObject.skipped = true;
    report.junctionObject.id = objId;
  } else {
    try {
      const created = await createObject({
        nameSingular: 'tenantRoomVisit',
        namePlural: 'tenantRoomVisits',
        labelSingular: 'Tenant Room Visit',
        labelPlural: 'Tenant Room Visits',
        description: 'Junction records for tenant visits to rooms (replaces ridsVisited text)',
        icon: 'IconMapPin',
      }, token);
      objId = created.id;
      console.log(`  OK    Created tenantRoomVisit (id=${objId})`);
      report.junctionObject.created = true;
      report.junctionObject.id = objId;
      // Wait for Twenty to provision the table
      await delay(APPLY_WAIT_MS);
    } catch (err) {
      console.error(`  FAIL  Create tenantRoomVisit: ${err.message}`);
      report.junctionObject.error = err.message;
      return;
    }
  }

  // Create fields on junction: tenant RELATION, room RELATION, visitedAt DATE
  const existing = await findFields(token, objId);

  const junctionFields = [
    { kind: 'RELATION', name: 'tenant', label: 'Tenant', icon: 'IconUser',
      targetObjectId: OBJECT_IDS.tenant, targetName: 'tenant',
      targetFieldLabel: 'Room Visits', targetFieldIcon: 'IconMapPin' },
    { kind: 'RELATION', name: 'room', label: 'Room', icon: 'IconDoor',
      targetObjectId: OBJECT_IDS.room, targetName: 'room',
      targetFieldLabel: 'Tenant Visits', targetFieldIcon: 'IconMapPin' },
    { kind: 'DATE', name: 'visitedAt', label: 'Visited At', icon: 'IconCalendar' },
  ];

  for (const f of junctionFields) {
    if (existing[f.name]) {
      console.log(`  SKIP  tenantRoomVisit.${f.name} already exists`);
      report.junctionFields.skipped.push({ name: f.name, fieldId: existing[f.name].id });
      continue;
    }
    try {
      let created;
      if (f.kind === 'RELATION') {
        created = await createRelationField({
          sourceObjectId: objId, sourceName: 'tenantRoomVisit',
          targetObjectId: f.targetObjectId, targetName: f.targetName,
          fieldName: f.name, fieldLabel: f.label, fieldIcon: f.icon,
          targetFieldLabel: f.targetFieldLabel, targetFieldIcon: f.targetFieldIcon,
        }, token);
      } else if (f.kind === 'DATE') {
        created = await createDateField({
          objectMetadataId: objId, name: f.name, label: f.label, icon: f.icon,
        }, token);
      }
      console.log(`  OK    tenantRoomVisit.${f.name} (${f.kind}, id=${created.id})`);
      report.junctionFields.created.push({ name: f.name, fieldId: created.id });
    } catch (err) {
      console.error(`  FAIL  tenantRoomVisit.${f.name}: ${err.message}`);
      report.junctionFields.failed.push({ name: f.name, error: err.message });
    }
    await delay(DELAY_MS);
  }

  report.junctionObject.metadataId = objId;
}

// ─── Phase C: Create PostgreSQL triggers ────────────────────────────────────

async function phaseCreateTriggers(pg, report) {
  console.log('\n=== Phase C: Create PostgreSQL triggers ===\n');

  const triggers = [
    {
      name: 'trg_tenant_current_state_sync',
      table: '_tenantContractDetail',
      fix: 3,
      description: 'Sync _tenant.currentContract/currentProperty/currentRoom from _tenantContractDetail',
      sql: `
        CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_tenant_current_state_sync()
        RETURNS TRIGGER AS $$
        DECLARE
          v_property_id UUID;
          v_active BOOLEAN;
          v_payment_ok BOOLEAN;
          v_agreement_ok BOOLEAN;
        BEGIN
          -- Only sync when tenant is linked
          IF NEW."tenantId" IS NULL OR NEW."contractId" IS NULL THEN
            RETURN NEW;
          END IF;

          -- Check lifecycle criteria (tolerant of NULLs: if both are null, fall back to active-contract check)
          v_payment_ok := COALESCE(NEW."paymentLifecycle"::text, '') IN ('PAYMENTS_DONE');
          v_agreement_ok := COALESCE(NEW."agreementLifecycle"::text, '') LIKE '%Signed%'
                         OR COALESCE(NEW."agreementLifecycle"::text, '') LIKE '%SIGNED%';

          -- Fetch contract's propertyId and active status
          SELECT k."propertyId",
                 (k."contractEndDate" IS NULL OR k."contractEndDate" > NOW())
          INTO v_property_id, v_active
          FROM "${SCHEMA}"."_contract" k
          WHERE k.id = NEW."contractId";

          -- Only sync when lifecycle is marked signed/paid OR the contract is still active
          IF NOT (v_payment_ok OR v_agreement_ok OR v_active) THEN
            RETURN NEW;
          END IF;

          UPDATE "${SCHEMA}"."_tenant"
          SET "currentContractId" = NEW."contractId",
              "currentPropertyId" = COALESCE(v_property_id, "currentPropertyId"),
              "currentRoomId" = COALESCE(NEW."roomId", "currentRoomId"),
              "updatedAt" = NOW()
          WHERE id = NEW."tenantId";

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_tenant_current_state_sync
          ON "${SCHEMA}"."_tenantContractDetail";

        CREATE TRIGGER trg_tenant_current_state_sync
          AFTER INSERT OR UPDATE OF "contractId", "roomId", "tenantId", "paymentLifecycle", "agreementLifecycle"
          ON "${SCHEMA}"."_tenantContractDetail"
          FOR EACH ROW
          EXECUTE FUNCTION "${SCHEMA}".fn_tenant_current_state_sync();
      `,
    },
    {
      name: 'trg_room_occupancy_sync',
      table: '_tenantContractDetail',
      fix: 4,
      description: 'Sync _room.currentContract/currentTenant/availableFrom from _tenantContractDetail',
      sql: `
        CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_room_occupancy_sync()
        RETURNS TRIGGER AS $$
        DECLARE
          v_end_date DATE;
        BEGIN
          IF NEW."roomId" IS NULL OR NEW."contractId" IS NULL THEN
            RETURN NEW;
          END IF;

          SELECT k."contractEndDate" INTO v_end_date
          FROM "${SCHEMA}"."_contract" k
          WHERE k.id = NEW."contractId";

          UPDATE "${SCHEMA}"."_room"
          SET "currentContractId" = NEW."contractId",
              "currentTenantId" = COALESCE(NEW."tenantId", "currentTenantId"),
              "availableFrom" = CASE
                                  WHEN v_end_date IS NULL THEN NULL
                                  ELSE (v_end_date + INTERVAL '1 day')::date
                                END,
              "updatedAt" = NOW()
          WHERE id = NEW."roomId";

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_room_occupancy_sync
          ON "${SCHEMA}"."_tenantContractDetail";

        CREATE TRIGGER trg_room_occupancy_sync
          AFTER INSERT OR UPDATE OF "contractId", "tenantId", "roomId"
          ON "${SCHEMA}"."_tenantContractDetail"
          FOR EACH ROW
          EXECUTE FUNCTION "${SCHEMA}".fn_room_occupancy_sync();
      `,
    },
    {
      name: 'trg_contract_party_names_sync_from_tcd',
      table: '_tenantContractDetail',
      fix: 5,
      description: 'Sync _contract.partyNameTenant + primaryTenantId from _tenantContractDetail changes',
      sql: `
        CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_contract_party_names_sync_tcd()
        RETURNS TRIGGER AS $$
        DECLARE
          v_tenant_name TEXT;
        BEGIN
          IF NEW."contractId" IS NULL OR NEW."tenantId" IS NULL THEN
            RETURN NEW;
          END IF;

          SELECT t."name" INTO v_tenant_name
          FROM "${SCHEMA}"."_tenant" t
          WHERE t.id = NEW."tenantId";

          UPDATE "${SCHEMA}"."_contract"
          SET "partyNameTenant" = COALESCE(v_tenant_name, "partyNameTenant"),
              "primaryTenantId" = COALESCE("primaryTenantId", NEW."tenantId"),
              "updatedAt" = NOW()
          WHERE id = NEW."contractId";

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_contract_party_names_sync_from_tcd
          ON "${SCHEMA}"."_tenantContractDetail";

        CREATE TRIGGER trg_contract_party_names_sync_from_tcd
          AFTER INSERT OR UPDATE OF "contractId", "tenantId"
          ON "${SCHEMA}"."_tenantContractDetail"
          FOR EACH ROW
          EXECUTE FUNCTION "${SCHEMA}".fn_contract_party_names_sync_tcd();
      `,
    },
    {
      name: 'trg_contract_party_names_sync_from_mcd',
      table: '_merchantContractDetail',
      fix: 5,
      description: 'Sync _contract.partyNameMerchant + primaryMerchantId from _merchantContractDetail changes',
      sql: `
        CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_contract_party_names_sync_mcd()
        RETURNS TRIGGER AS $$
        DECLARE
          v_merchant_name TEXT;
        BEGIN
          IF NEW."contractId" IS NULL OR NEW."merchantId" IS NULL THEN
            RETURN NEW;
          END IF;

          SELECT m."name" INTO v_merchant_name
          FROM "${SCHEMA}"."_merchant" m
          WHERE m.id = NEW."merchantId";

          UPDATE "${SCHEMA}"."_contract"
          SET "partyNameMerchant" = COALESCE(v_merchant_name, "partyNameMerchant"),
              "primaryMerchantId" = COALESCE("primaryMerchantId", NEW."merchantId"),
              "updatedAt" = NOW()
          WHERE id = NEW."contractId";

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_contract_party_names_sync_from_mcd
          ON "${SCHEMA}"."_merchantContractDetail";

        CREATE TRIGGER trg_contract_party_names_sync_from_mcd
          AFTER INSERT OR UPDATE OF "contractId", "merchantId"
          ON "${SCHEMA}"."_merchantContractDetail"
          FOR EACH ROW
          EXECUTE FUNCTION "${SCHEMA}".fn_contract_party_names_sync_mcd();
      `,
    },
  ];

  for (const t of triggers) {
    // Pre-check if required columns exist (triggers depend on relation FK columns created in Phase A)
    const requiredCols = {
      'trg_tenant_current_state_sync': { table: '_tenant', cols: ['currentContractId', 'currentPropertyId', 'currentRoomId'] },
      'trg_room_occupancy_sync':        { table: '_room', cols: ['currentContractId', 'currentTenantId', 'availableFrom'] },
      'trg_contract_party_names_sync_from_tcd': { table: '_contract', cols: ['partyNameTenant', 'primaryTenantId'] },
      'trg_contract_party_names_sync_from_mcd': { table: '_contract', cols: ['partyNameMerchant', 'primaryMerchantId'] },
    }[t.name];

    if (requiredCols) {
      const colCheck = await pg.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
           AND column_name = ANY($3::text[])`,
        [SCHEMA, requiredCols.table, requiredCols.cols]
      );
      const present = new Set(colCheck.rows.map(r => r.column_name));
      const missing = requiredCols.cols.filter(c => !present.has(c));
      if (missing.length > 0) {
        console.warn(`  SKIP  ${t.name}: missing columns on ${requiredCols.table}: ${missing.join(', ')} (Phase A did not apply cleanly)`);
        report.triggers.skipped.push({ name: t.name, reason: `missing columns: ${missing.join(', ')}` });
        continue;
      }
    }

    try {
      await pg.query(t.sql);
      console.log(`  OK    ${t.name} (on ${t.table})`);
      report.triggers.created.push({ name: t.name, table: t.table, fix: t.fix });
    } catch (err) {
      console.error(`  FAIL  ${t.name}: ${err.message}`);
      report.triggers.failed.push({ name: t.name, error: err.message });
    }
  }
}

// ─── Phase D: Backfill data ─────────────────────────────────────────────────

async function phaseBackfill(pg, report) {
  console.log('\n=== Phase D: Backfill data ===\n');

  const has = async (table, col) => {
    const r = await pg.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      [SCHEMA, table, col]
    );
    return r.rows.length > 0;
  };

  // ── Fix #3 backfill: tenant current contract/property/room ──────────────
  if (await has('_tenant', 'currentContractId')
   && await has('_tenant', 'currentPropertyId')
   && await has('_tenant', 'currentRoomId')) {
    try {
      await pg.query('BEGIN');
      const res = await pg.query(`
        WITH latest AS (
          SELECT DISTINCT ON (tcd."tenantId")
                 tcd."tenantId"    AS tenant_id,
                 tcd."contractId"  AS contract_id,
                 tcd."roomId"      AS room_id,
                 k."propertyId"    AS property_id
          FROM "${SCHEMA}"."_tenantContractDetail" tcd
          JOIN "${SCHEMA}"."_contract" k ON k.id = tcd."contractId"
          WHERE tcd."tenantId" IS NOT NULL
            AND tcd."deletedAt" IS NULL
            AND (k."contractEndDate" IS NULL OR k."contractEndDate" > NOW())
          ORDER BY tcd."tenantId", k."contractStartDate" DESC NULLS LAST, tcd."createdAt" DESC
        )
        UPDATE "${SCHEMA}"."_tenant" t
        SET "currentContractId" = l.contract_id,
            "currentPropertyId" = l.property_id,
            "currentRoomId"     = l.room_id
        FROM latest l
        WHERE t.id = l.tenant_id
        RETURNING t.id
      `);
      await pg.query('COMMIT');
      console.log(`  Fix #3 backfill: updated ${res.rowCount} tenants with current state`);
      report.backfill.tenants_current_state = res.rowCount;
    } catch (err) {
      await pg.query('ROLLBACK');
      console.error(`  Fix #3 backfill FAIL: ${err.message}`);
      report.backfill.errors.push({ step: 'fix3_tenant_current', error: err.message });
    }
  } else {
    console.log('  Fix #3 backfill SKIP: current* columns missing on _tenant');
    report.backfill.tenants_current_state = 'skipped (columns missing)';
  }

  // ── Fix #4 backfill: room current contract/tenant + availableFrom ───────
  if (await has('_room', 'currentContractId')
   && await has('_room', 'currentTenantId')
   && await has('_room', 'availableFrom')) {
    try {
      await pg.query('BEGIN');
      const res = await pg.query(`
        WITH latest AS (
          SELECT DISTINCT ON (tcd."roomId")
                 tcd."roomId"      AS room_id,
                 tcd."contractId"  AS contract_id,
                 tcd."tenantId"    AS tenant_id,
                 k."contractEndDate" AS end_date
          FROM "${SCHEMA}"."_tenantContractDetail" tcd
          JOIN "${SCHEMA}"."_contract" k ON k.id = tcd."contractId"
          WHERE tcd."roomId" IS NOT NULL
            AND tcd."deletedAt" IS NULL
            AND (k."contractEndDate" IS NULL OR k."contractEndDate" > NOW())
          ORDER BY tcd."roomId", k."contractStartDate" DESC NULLS LAST, tcd."createdAt" DESC
        )
        UPDATE "${SCHEMA}"."_room" r
        SET "currentContractId" = l.contract_id,
            "currentTenantId"   = l.tenant_id,
            "availableFrom"     = CASE WHEN l.end_date IS NULL THEN NULL
                                       ELSE (l.end_date + INTERVAL '1 day')::date END
        FROM latest l
        WHERE r.id = l.room_id
        RETURNING r.id
      `);
      await pg.query('COMMIT');
      console.log(`  Fix #4 backfill: updated ${res.rowCount} rooms with current state`);
      report.backfill.rooms_current_state = res.rowCount;
    } catch (err) {
      await pg.query('ROLLBACK');
      console.error(`  Fix #4 backfill FAIL: ${err.message}`);
      report.backfill.errors.push({ step: 'fix4_room_current', error: err.message });
    }
  } else {
    console.log('  Fix #4 backfill SKIP: current* or availableFrom columns missing on _room');
    report.backfill.rooms_current_state = 'skipped (columns missing)';
  }

  // ── Fix #5 backfill: contract.partyNameTenant / primaryTenant ───────────
  if (await has('_contract', 'partyNameTenant') && await has('_contract', 'primaryTenantId')) {
    try {
      await pg.query('BEGIN');
      const res = await pg.query(`
        WITH primary_tcd AS (
          SELECT DISTINCT ON (tcd."contractId")
                 tcd."contractId" AS contract_id,
                 tcd."tenantId"   AS tenant_id,
                 t."name"         AS tenant_name
          FROM "${SCHEMA}"."_tenantContractDetail" tcd
          JOIN "${SCHEMA}"."_tenant" t ON t.id = tcd."tenantId"
          WHERE tcd."tenantId" IS NOT NULL
            AND tcd."deletedAt" IS NULL
          ORDER BY tcd."contractId", tcd."createdAt" ASC
        )
        UPDATE "${SCHEMA}"."_contract" c
        SET "partyNameTenant" = p.tenant_name,
            "primaryTenantId" = p.tenant_id
        FROM primary_tcd p
        WHERE c.id = p.contract_id
        RETURNING c.id
      `);
      await pg.query('COMMIT');
      console.log(`  Fix #5 backfill (tenant): updated ${res.rowCount} contracts`);
      report.backfill.contracts_party_tenant = res.rowCount;
    } catch (err) {
      await pg.query('ROLLBACK');
      console.error(`  Fix #5 backfill tenant FAIL: ${err.message}`);
      report.backfill.errors.push({ step: 'fix5_contract_tenant', error: err.message });
    }
  } else {
    console.log('  Fix #5 tenant backfill SKIP: partyNameTenant/primaryTenantId missing on _contract');
    report.backfill.contracts_party_tenant = 'skipped (columns missing)';
  }

  if (await has('_contract', 'partyNameMerchant') && await has('_contract', 'primaryMerchantId')) {
    try {
      await pg.query('BEGIN');
      const res = await pg.query(`
        WITH primary_mcd AS (
          SELECT DISTINCT ON (mcd."contractId")
                 mcd."contractId" AS contract_id,
                 mcd."merchantId" AS merchant_id,
                 m."name"         AS merchant_name
          FROM "${SCHEMA}"."_merchantContractDetail" mcd
          JOIN "${SCHEMA}"."_merchant" m ON m.id = mcd."merchantId"
          WHERE mcd."merchantId" IS NOT NULL
            AND mcd."deletedAt" IS NULL
          ORDER BY mcd."contractId", mcd."createdAt" ASC
        )
        UPDATE "${SCHEMA}"."_contract" c
        SET "partyNameMerchant" = p.merchant_name,
            "primaryMerchantId" = p.merchant_id
        FROM primary_mcd p
        WHERE c.id = p.contract_id
        RETURNING c.id
      `);
      await pg.query('COMMIT');
      console.log(`  Fix #5 backfill (merchant): updated ${res.rowCount} contracts`);
      report.backfill.contracts_party_merchant = res.rowCount;
    } catch (err) {
      await pg.query('ROLLBACK');
      console.error(`  Fix #5 backfill merchant FAIL: ${err.message}`);
      report.backfill.errors.push({ step: 'fix5_contract_merchant', error: err.message });
    }
  } else {
    console.log('  Fix #5 merchant backfill SKIP: partyNameMerchant/primaryMerchantId missing on _contract');
    report.backfill.contracts_party_merchant = 'skipped (columns missing)';
  }

  // ── Fix #6 backfill: ticket.roomId / tenantId from tenantTicketDetail ───
  // (_ticket.roomId and _ticket.tenantId are the FK columns created by Phase A)
  if (await has('_ticket', 'roomId') && await has('_ticket', 'tenantId')) {
    try {
      await pg.query('BEGIN');
      // Backfill roomId from _tenantTicketDetail.roomId
      const res1 = await pg.query(`
        UPDATE "${SCHEMA}"."_ticket" t
        SET "roomId" = ttd."roomId"
        FROM "${SCHEMA}"."_tenantTicketDetail" ttd
        WHERE ttd."ticketId" = t.id
          AND ttd."roomId" IS NOT NULL
          AND ttd."deletedAt" IS NULL
          AND t."roomId" IS NULL
        RETURNING t.id
      `);
      // Backfill tenantId via room->currentTenant lookup (best-effort)
      let tenantRows = 0;
      if (await has('_room', 'currentTenantId')) {
        const res2 = await pg.query(`
          UPDATE "${SCHEMA}"."_ticket" t
          SET "tenantId" = r."currentTenantId"
          FROM "${SCHEMA}"."_room" r
          WHERE t."roomId" = r.id
            AND r."currentTenantId" IS NOT NULL
            AND t."tenantId" IS NULL
          RETURNING t.id
        `);
        tenantRows = res2.rowCount;
      }
      await pg.query('COMMIT');
      console.log(`  Fix #6 backfill: updated roomId on ${res1.rowCount} tickets, tenantId on ${tenantRows} tickets`);
      report.backfill.tickets_roomId = res1.rowCount;
      report.backfill.tickets_tenantId = tenantRows;
    } catch (err) {
      await pg.query('ROLLBACK');
      console.error(`  Fix #6 backfill FAIL: ${err.message}`);
      report.backfill.errors.push({ step: 'fix6_tickets', error: err.message });
    }
  } else {
    console.log('  Fix #6 backfill SKIP: roomId/tenantId missing on _ticket');
    report.backfill.tickets_roomId = 'skipped (columns missing)';
  }

  // ── Fix #7 backfill: migrate ridsVisited -> tenantRoomVisit junction ────
  const junctionTableExists = await pg.query(`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = $1 AND table_name = '_tenantRoomVisit'
  `, [SCHEMA]);

  if (junctionTableExists.rows.length === 0) {
    console.log('  Fix #7 backfill SKIP: _tenantRoomVisit table does not exist');
    report.backfill.tenant_room_visits = 'skipped (table missing)';
    return;
  }

  // Check required columns exist
  const junctionCols = await pg.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = $1 AND table_name = '_tenantRoomVisit'
  `, [SCHEMA]);
  const jc = new Set(junctionCols.rows.map(r => r.column_name));

  if (!jc.has('tenantId') || !jc.has('roomId')) {
    console.log('  Fix #7 backfill SKIP: tenantId/roomId missing on _tenantRoomVisit');
    report.backfill.tenant_room_visits = 'skipped (fk columns missing)';
    return;
  }

  try {
    await pg.query('BEGIN');

    // Build a quick lookup: rid -> room_id
    const ridMap = await pg.query(`
      SELECT rid, id FROM "${SCHEMA}"."_room" WHERE rid IS NOT NULL
    `);
    const ridToRoomId = {};
    for (const row of ridMap.rows) ridToRoomId[row.rid.trim()] = row.id;

    const summaries = await pg.query(`
      SELECT "tenantId", "ridsVisited", "firstVisitDate"
      FROM "${SCHEMA}"."_tenantVisitSummary"
      WHERE "ridsVisited" IS NOT NULL
        AND "ridsVisited" <> ''
        AND "tenantId" IS NOT NULL
        AND "deletedAt" IS NULL
    `);

    let rowsInserted = 0;
    let rowsSkipped = 0;

    for (const sum of summaries.rows) {
      const rids = sum.ridsVisited.split(',').map(s => s.trim()).filter(Boolean);
      for (const rid of rids) {
        const roomId = ridToRoomId[rid];
        if (!roomId) {
          rowsSkipped++;
          continue;
        }
        // Idempotent: check if a row already exists for this tenant+room
        const dup = await pg.query(
          `SELECT 1 FROM "${SCHEMA}"."_tenantRoomVisit"
           WHERE "tenantId" = $1 AND "roomId" = $2 LIMIT 1`,
          [sum.tenantId, roomId]
        );
        if (dup.rows.length > 0) {
          rowsSkipped++;
          continue;
        }
        const visitedAt = sum.firstVisitDate || null;
        // Derive a sensible default for required columns (name, position)
        const nameCol = jc.has('name') ? `"name",` : '';
        const nameVal = jc.has('name') ? `$4,` : '';
        const posCol = jc.has('position') ? `,"position"` : '';
        const posVal = jc.has('position') ? `,0` : '';
        const params = [sum.tenantId, roomId, visitedAt];
        if (jc.has('name')) params.push(`Visit ${rid}`);

        const insertSQL = `
          INSERT INTO "${SCHEMA}"."_tenantRoomVisit"
            (${nameCol} "tenantId", "roomId", "visitedAt" ${posCol}, "createdAt", "updatedAt")
          VALUES (${nameVal} $1, $2, $3 ${posVal}, NOW(), NOW())
        `;
        try {
          await pg.query(insertSQL, params);
          rowsInserted++;
        } catch (e) {
          rowsSkipped++;
        }
      }
    }

    await pg.query('COMMIT');
    console.log(`  Fix #7 backfill: inserted ${rowsInserted} tenant room visits, skipped ${rowsSkipped} (unresolved RIDs or dupes)`);
    report.backfill.tenant_room_visits = rowsInserted;
    report.backfill.tenant_room_visits_skipped = rowsSkipped;
  } catch (err) {
    await pg.query('ROLLBACK');
    console.error(`  Fix #7 backfill FAIL: ${err.message}`);
    report.backfill.errors.push({ step: 'fix7_tenant_room_visits', error: err.message });
  }
}

// ─── Phase E: Verify ────────────────────────────────────────────────────────

async function phaseVerify(pg, report) {
  console.log('\n=== Phase E: Verification ===\n');

  // Triggers
  const trg = await pg.query(`
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = $1
      AND trigger_name IN (
        'trg_tenant_current_state_sync',
        'trg_room_occupancy_sync',
        'trg_contract_party_names_sync_from_tcd',
        'trg_contract_party_names_sync_from_mcd'
      )
  `, [SCHEMA]);
  const trgNames = new Set(trg.rows.map(r => r.trigger_name));
  report.verify.triggers = [...trgNames];
  console.log(`  Triggers present (${trgNames.size}): ${[...trgNames].join(', ')}`);

  // Columns on critical tables
  const cols = async (table, wanted) => {
    const r = await pg.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 AND column_name = ANY($3::text[])`,
      [SCHEMA, table, wanted]
    );
    return r.rows.map(x => x.column_name);
  };

  const checks = {
    _tenant: await cols('_tenant', ['currentContractId', 'currentPropertyId', 'currentRoomId']),
    _room: await cols('_room', ['currentContractId', 'currentTenantId', 'availableFrom']),
    _ticket: await cols('_ticket', ['roomId', 'tenantId']),
    _property: await cols('_property', ['merchantId']),
    _poLine: await cols('_poLine', ['fsinId']),
    _contract: await cols('_contract', ['partyNameTenant', 'partyNameMerchant', 'primaryTenantId', 'primaryMerchantId']),
  };
  report.verify.columns = checks;
  for (const [tbl, found] of Object.entries(checks)) {
    console.log(`  ${tbl}: columns present -> ${found.join(', ') || '(none)'}`);
  }

  // Sample data checks
  const q = async (sql) => (await pg.query(sql)).rows[0];

  try {
    const a = await q(`
      SELECT COUNT(*)::int AS n FROM "${SCHEMA}"."_tenant" WHERE "currentContractId" IS NOT NULL
    `);
    console.log(`  Tenants with currentContractId: ${a.n}`);
    report.verify.tenants_with_current_contract = a.n;
  } catch (e) { console.log('  (skipped: currentContractId col missing)'); }

  try {
    const a = await q(`
      SELECT COUNT(*)::int AS n FROM "${SCHEMA}"."_room" WHERE "currentContractId" IS NOT NULL
    `);
    console.log(`  Rooms with currentContractId: ${a.n}`);
    report.verify.rooms_with_current_contract = a.n;
  } catch (e) { console.log('  (skipped: room.currentContractId missing)'); }

  try {
    const a = await q(`
      SELECT COUNT(*)::int AS n FROM "${SCHEMA}"."_contract"
      WHERE "partyNameTenant" IS NOT NULL OR "partyNameMerchant" IS NOT NULL
    `);
    console.log(`  Contracts with a party name populated: ${a.n}`);
    report.verify.contracts_with_party_name = a.n;
  } catch (e) { console.log('  (skipped: partyName cols missing)'); }

  try {
    const a = await q(`
      SELECT COUNT(*)::int AS n FROM "${SCHEMA}"."_ticket" WHERE "roomId" IS NOT NULL
    `);
    console.log(`  Tickets with roomId: ${a.n}`);
    report.verify.tickets_with_room = a.n;
  } catch (e) { console.log('  (skipped: ticket.roomId missing)'); }

  try {
    const a = await q(`SELECT COUNT(*)::int AS n FROM "${SCHEMA}"."_tenantRoomVisit"`);
    console.log(`  _tenantRoomVisit rows: ${a.n}`);
    report.verify.tenant_room_visits_rows = a.n;
  } catch (e) { console.log('  (skipped: _tenantRoomVisit missing)'); }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Flent Architecture Fix Script ===');
  console.log(`Workspace ID: ${WORKSPACE_ID}`);
  console.log(`Schema:       ${SCHEMA}`);
  console.log(`Server URL:   ${SERVER_URL}`);
  console.log(`Skip: relations=${SKIP_RELATIONS} triggers=${SKIP_TRIGGERS} backfill=${SKIP_BACKFILL}`);
  console.log();

  const report = {
    relations: { created: [], skipped: [], failed: [] },
    scalarFields: { created: [], skipped: [], failed: [] },
    junctionObject: { created: false, skipped: false, id: null, error: null, metadataId: null },
    junctionFields: { created: [], skipped: [], failed: [] },
    triggers: { created: [], skipped: [], failed: [] },
    backfill: { errors: [] },
    verify: {},
  };

  const { Client } = require('pg');
  const pg = new Client({ connectionString: process.env.PG_DATABASE_URL });
  await pg.connect();
  console.log('Connected to database.');

  const token = await generateToken(pg);
  console.log('Generated API token.\n');

  if (!SKIP_RELATIONS) {
    await phaseCreateRelations(token, report);
    await phaseCreateJunctionObject(token, report);
    console.log(`\nWaiting ${APPLY_WAIT_MS}ms for Twenty to apply schema changes...`);
    await delay(APPLY_WAIT_MS);
  } else {
    console.log('Skipping Phase A + B (relations/junction).');
  }

  if (!SKIP_TRIGGERS) {
    await phaseCreateTriggers(pg, report);
  } else {
    console.log('Skipping Phase C (triggers).');
  }

  if (!SKIP_BACKFILL) {
    await phaseBackfill(pg, report);
  } else {
    console.log('Skipping Phase D (backfill).');
  }

  await phaseVerify(pg, report);

  // Final summary
  console.log('\n====================== SUMMARY ======================\n');
  console.log('Relations:');
  console.log(`  created: ${report.relations.created.length}`);
  console.log(`  skipped: ${report.relations.skipped.length}`);
  console.log(`  failed:  ${report.relations.failed.length}`);
  if (report.relations.failed.length > 0) {
    for (const r of report.relations.failed) console.log(`    - ${r.id}: ${r.error}`);
  }

  console.log('Scalar fields:');
  console.log(`  created: ${report.scalarFields.created.length}`);
  console.log(`  skipped: ${report.scalarFields.skipped.length}`);
  console.log(`  failed:  ${report.scalarFields.failed.length}`);
  if (report.scalarFields.failed.length > 0) {
    for (const r of report.scalarFields.failed) console.log(`    - ${r.id}: ${r.error}`);
  }

  console.log('Junction object (tenantRoomVisit):');
  console.log(`  created: ${report.junctionObject.created} skipped: ${report.junctionObject.skipped}`);
  if (report.junctionObject.error) console.log(`  error: ${report.junctionObject.error}`);
  console.log(`  fields created: ${report.junctionFields.created.length}, skipped: ${report.junctionFields.skipped.length}, failed: ${report.junctionFields.failed.length}`);

  console.log('Triggers:');
  console.log(`  created: ${report.triggers.created.length}`);
  console.log(`  skipped: ${report.triggers.skipped.length}`);
  console.log(`  failed:  ${report.triggers.failed.length}`);
  for (const t of report.triggers.created) console.log(`    + ${t.name} on ${t.table}`);
  for (const t of report.triggers.failed) console.log(`    ! ${t.name}: ${t.error}`);

  console.log('Backfill:');
  for (const [k, v] of Object.entries(report.backfill)) {
    if (k === 'errors') continue;
    console.log(`  ${k}: ${v}`);
  }
  if (report.backfill.errors.length > 0) {
    console.log('  errors:');
    for (const e of report.backfill.errors) console.log(`    - ${e.step}: ${e.error}`);
  }

  console.log('\nCreated field IDs (per fix):');
  for (const r of [...report.relations.created, ...report.scalarFields.created, ...report.junctionFields.created]) {
    const tbl = r.sourceName || 'tenantRoomVisit';
    console.log(`  ${r.fix ? '[Fix #' + r.fix + ']' : '[Fix #7]'} ${tbl}.${r.fieldName || r.name}  id=${r.fieldId}`);
  }

  console.log('\nReport JSON:');
  console.log(JSON.stringify(report, null, 2));

  await pg.end();
  console.log('\nDone.');
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
