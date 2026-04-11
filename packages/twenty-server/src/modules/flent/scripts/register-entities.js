#!/usr/bin/env node
/**
 * register-entities.js
 *
 * Registers all 53 Flent custom workspace entities in a Twenty CRM production
 * database using the GraphQL metadata API.
 *
 * Prerequisites:
 *   - PG_DATABASE_URL environment variable pointing to the Twenty database
 *   - APP_SECRET environment variable (the Twenty server's JWT signing secret)
 *   - The Twenty server must be running and accessible at SERVER_URL (default: http://localhost:3000)
 *   - Node.js 18+ with built-in fetch
 *   - `pg` and `jsonwebtoken` npm packages available in node_modules
 *
 * Usage:
 *   # From inside a Twenty server pod:
 *   APP_SECRET=<secret> PG_DATABASE_URL=<url> node register-entities.js
 *
 *   # With explicit server URL (if not localhost):
 *   SERVER_URL=http://twenty-server:3000 APP_SECRET=<secret> PG_DATABASE_URL=<url> node register-entities.js
 *
 *   # Dry run (just prints what would be created):
 *   DRY_RUN=1 APP_SECRET=<secret> PG_DATABASE_URL=<url> node register-entities.js
 */

const { createHash } = require('crypto');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────────────────────

const WORKSPACE_ID = process.env.WORKSPACE_ID || 'ae07eba0-7d31-499a-912f-816fc42d987e';
const DATA_SOURCE_ID = process.env.DATA_SOURCE_ID || '52197373-3314-4c0c-b1b7-9d89df1c20eb';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const METADATA_URL = `${SERVER_URL}/metadata`;
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '1', 10); // Sequential by default for safety

// Rate limiting between API calls (ms)
const DELAY_BETWEEN_OBJECTS = parseInt(process.env.DELAY_MS || '500', 10);
const DELAY_BETWEEN_FIELDS = parseInt(process.env.FIELD_DELAY_MS || '200', 10);

// ─── Load seed data ──────────────────────────────────────────────────────────

const SEED_DATA_PATH = process.env.SEED_DATA_PATH || path.join(__dirname, 'flent-seed-data.json');

function loadSeedData() {
  if (!fs.existsSync(SEED_DATA_PATH)) {
    console.error(`Seed data file not found: ${SEED_DATA_PATH}`);
    console.error('Run extract-seed-data.js first to generate it.');
    process.exit(1);
  }
  const raw = fs.readFileSync(SEED_DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// ─── JWT Token Generation ────────────────────────────────────────────────────

/**
 * Generate an API key JWT token for authenticating with the metadata API.
 * Mirrors the logic in Twenty's JwtWrapperService.generateAppSecret() and
 * ApiKeyService.generateApiKeyToken().
 */
async function generateToken(pg) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    throw new Error('APP_SECRET environment variable is required');
  }

  // Find an active API key for this workspace
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

  let apiKeyId;
  let expiresAt;

  if (apiKeyResult.rows.length > 0) {
    apiKeyId = apiKeyResult.rows[0].id;
    expiresAt = apiKeyResult.rows[0].expiresAt;
    console.log(`Found existing API key: ${apiKeyId}`);
  } else {
    // Create a temporary API key
    console.log('No active API key found, creating one...');

    // Find the admin role for this workspace
    const roleResult = await pg.query(
      `SELECT id FROM core."role"
       WHERE "workspaceId" = $1
       ORDER BY "createdAt" ASC
       LIMIT 1`,
      [WORKSPACE_ID]
    );

    if (roleResult.rows.length === 0) {
      throw new Error('No role found for workspace');
    }

    const roleId = roleResult.rows[0].id;

    // Create API key that expires in 1 hour
    expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const insertResult = await pg.query(
      `INSERT INTO core."apiKey" (id, name, "expiresAt", "workspaceId", "roleId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Flent Entity Registration Script', $1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [expiresAt, WORKSPACE_ID, roleId]
    );

    apiKeyId = insertResult.rows[0].id;
    console.log(`Created temporary API key: ${apiKeyId}`);
  }

  // Generate the JWT secret (mirrors JwtWrapperService.generateAppSecret)
  const type = 'API_KEY';
  const secret = createHash('sha256')
    .update(`${appSecret}${WORKSPACE_ID}${type}`)
    .digest('hex');

  // Sign the JWT (mirrors ApiKeyService.generateApiKeyToken)
  let jwt;
  try {
    jwt = require('jsonwebtoken');
  } catch {
    // If jsonwebtoken is not available, use a manual JWT implementation
    jwt = null;
  }

  if (jwt) {
    const expiresIn = expiresAt
      ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      : 365 * 24 * 60 * 60;

    const token = jwt.sign(
      {
        sub: WORKSPACE_ID,
        type: 'API_KEY',
        workspaceId: WORKSPACE_ID,
      },
      secret,
      {
        expiresIn,
        jwtid: apiKeyId,
      }
    );

    return token;
  } else {
    // Manual JWT creation (base64url encoding)
    return createManualJwt(
      { sub: WORKSPACE_ID, type: 'API_KEY', workspaceId: WORKSPACE_ID },
      secret,
      apiKeyId,
      expiresAt
    );
  }
}

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

function createManualJwt(payload, secret, jti, expiresAt) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = expiresAt
    ? Math.floor(new Date(expiresAt).getTime() / 1000)
    : now + 365 * 24 * 60 * 60;

  const fullPayload = {
    ...payload,
    jti,
    iat: now,
    exp,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const signature = createHash('sha256') // Note: proper HMAC-SHA256 needed
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  // Actually use proper HMAC
  const { createHmac } = require('crypto');
  const sig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${sig}`;
}

// ─── GraphQL Client ──────────────────────────────────────────────────────────

async function graphqlRequest(query, variables, token) {
  const response = await fetch(METADATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    const errorMessages = result.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  return result.data;
}

// ─── Object Creation ─────────────────────────────────────────────────────────

const CREATE_OBJECT_MUTATION = `
  mutation CreateOneObject($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
    }
  }
`;

const FIND_OBJECTS_QUERY = `
  query FindObjects {
    objects(paging: { first: 200 }) {
      edges {
        node {
          id
          nameSingular
          namePlural
          isCustom
        }
      }
    }
  }
`;

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

const FIND_FIELDS_QUERY = `
  query FindFields($objectId: UUID!) {
    fields(filter: { objectMetadataId: { eq: $objectId } }, paging: { first: 500 }) {
      edges {
        node {
          id
          name
          label
          type
          isCustom
        }
      }
    }
  }
`;

async function findExistingObjects(token) {
  const data = await graphqlRequest(FIND_OBJECTS_QUERY, {}, token);
  const objects = data.objects.edges.map(e => e.node);
  const byName = {};
  for (const obj of objects) {
    byName[obj.nameSingular] = obj;
  }
  return byName;
}

async function findExistingFields(token, objectMetadataId) {
  const data = await graphqlRequest(FIND_FIELDS_QUERY, { objectId: objectMetadataId }, token);
  const fields = data.fields.edges.map(e => e.node);
  const byName = {};
  for (const field of fields) {
    byName[field.name] = field;
  }
  return byName;
}

async function createObject(entity, token) {
  // Fix: Twenty requires nameSingular and namePlural to be different.
  // If they are the same (e.g. "merchantContractDetails"), truncate the
  // singular form by removing trailing 's'.
  let { nameSingular, namePlural } = entity;
  if (nameSingular === namePlural) {
    if (nameSingular.endsWith('s')) {
      nameSingular = nameSingular.slice(0, -1);
    } else {
      namePlural = namePlural + 's';
    }
    console.log(`    Note: Fixed duplicate name "${entity.nameSingular}" -> singular="${nameSingular}", plural="${namePlural}"`);
  }

  const input = {
    object: {
      nameSingular,
      namePlural,
      labelSingular: entity.labelSingular,
      labelPlural: entity.labelPlural,
      description: entity.description || null,
      icon: entity.icon || null,
      skipNameField: entity.skipNameField || false,
    },
  };

  const data = await graphqlRequest(CREATE_OBJECT_MUTATION, { input }, token);
  return data.createOneObject;
}

// Reserved field names that Twenty does not allow as custom field names
const RESERVED_FIELD_NAMES = new Set(['address', 'name', 'position', 'id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy']);

async function createField(field, objectMetadataId, objectNameSingular, token) {
  let fieldName = field.name;

  // Fix: Twenty reserves certain field names. Prefix with the object context name.
  if (RESERVED_FIELD_NAMES.has(fieldName)) {
    // e.g. "address" on "propertyActive" -> "propertyAddress"
    const prefix = objectNameSingular || 'custom';
    fieldName = prefix.charAt(0).toLowerCase() + prefix.slice(1) + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    console.log(`    Note: Renamed reserved field "${field.name}" -> "${fieldName}"`);
  }

  const fieldInput = {
    type: field.type,
    name: fieldName,
    label: field.label,
    objectMetadataId,
  };

  // Optional fields
  if (field.description !== undefined) fieldInput.description = field.description;
  if (field.icon !== undefined) fieldInput.icon = field.icon;
  if (field.isNullable !== undefined) fieldInput.isNullable = field.isNullable;
  if (field.options !== undefined) fieldInput.options = field.options;
  if (field.settings !== undefined) fieldInput.settings = field.settings;
  if (field.isUIReadOnly !== undefined) fieldInput.isUIReadOnly = field.isUIReadOnly;

  // Fix: isUnique=true + defaultValue causes unique index validation errors.
  // When isUnique is true, omit the defaultValue to prevent conflicts.
  if (field.isUnique) {
    fieldInput.isUnique = true;
    // Do NOT set defaultValue when isUnique is true
  } else if (field.defaultValue !== undefined) {
    fieldInput.defaultValue = field.defaultValue;
  }

  const input = { field: fieldInput };
  const data = await graphqlRequest(CREATE_FIELD_MUTATION, { input }, token);
  return data.createOneField;
}

// ─── Delay utility ───────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Flent Entity Registration Script ===');
  console.log(`Workspace ID: ${WORKSPACE_ID}`);
  console.log(`Data Source ID: ${DATA_SOURCE_ID}`);
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log();

  // Load seed data
  const seedData = loadSeedData();
  console.log(`Loaded ${seedData.totalObjects} objects with ${seedData.totalFields} fields`);
  console.log(`Seed data generated at: ${seedData.generatedAt}`);
  console.log();

  if (DRY_RUN) {
    console.log('=== DRY RUN - No changes will be made ===');
    for (const entity of seedData.entities) {
      console.log(`Would create: ${entity.nameSingular} (${entity.labelSingular}) with ${entity.fields.length} fields`);
      for (const field of entity.fields) {
        console.log(`  - ${field.name} (${field.type})`);
      }
    }
    return;
  }

  // Connect to database
  let pg;
  try {
    const { Client } = require('pg');
    pg = new Client({ connectionString: process.env.PG_DATABASE_URL });
    await pg.connect();
    console.log('Connected to database');
  } catch (e) {
    console.error(`Failed to connect to database: ${e.message}`);
    process.exit(1);
  }

  // Generate API token
  let token;
  try {
    token = await generateToken(pg);
    console.log('Generated API token');
    console.log(`Token preview: ${token.substring(0, 50)}...`);
  } catch (e) {
    console.error(`Failed to generate token: ${e.message}`);
    await pg.end();
    process.exit(1);
  }

  // Test the token by fetching existing objects
  let existingObjects;
  try {
    existingObjects = await findExistingObjects(token);
    const existingCount = Object.keys(existingObjects).length;
    console.log(`Found ${existingCount} existing objects in workspace`);
  } catch (e) {
    console.error(`Failed to query existing objects: ${e.message}`);
    console.error('This likely means the token is invalid or the server is not reachable.');
    await pg.end();
    process.exit(1);
  }

  // Track results
  const results = {
    objectsCreated: 0,
    objectsSkipped: 0,
    objectsFailed: 0,
    fieldsCreated: 0,
    fieldsSkipped: 0,
    fieldsFailed: 0,
  };

  // Phase 1: Create all objects
  console.log('\n=== Phase 1: Creating Objects ===\n');
  const objectIdMap = {}; // nameSingular -> id

  for (const entity of seedData.entities) {
    const { nameSingular } = entity;

    if (existingObjects[nameSingular]) {
      console.log(`  SKIP  ${nameSingular} (already exists, id: ${existingObjects[nameSingular].id})`);
      objectIdMap[nameSingular] = existingObjects[nameSingular].id;
      results.objectsSkipped++;
      continue;
    }

    try {
      const created = await createObject(entity, token);
      console.log(`  OK    ${nameSingular} -> ${created.id}`);
      objectIdMap[nameSingular] = created.id;
      results.objectsCreated++;
    } catch (e) {
      console.error(`  FAIL  ${nameSingular}: ${e.message}`);
      results.objectsFailed++;
    }

    await delay(DELAY_BETWEEN_OBJECTS);
  }

  console.log(`\nPhase 1 complete: ${results.objectsCreated} created, ${results.objectsSkipped} skipped, ${results.objectsFailed} failed`);

  // Phase 2: Create fields for each object
  console.log('\n=== Phase 2: Creating Fields ===\n');

  for (const entity of seedData.entities) {
    const { nameSingular, fields } = entity;

    if (!fields || fields.length === 0) {
      console.log(`  ${nameSingular}: no fields to create`);
      continue;
    }

    const objectId = objectIdMap[nameSingular];
    if (!objectId) {
      console.log(`  ${nameSingular}: SKIP (no object ID, object creation likely failed)`);
      results.fieldsFailed += fields.length;
      continue;
    }

    // Check existing fields for this object
    let existingFields = {};
    try {
      existingFields = await findExistingFields(token, objectId);
    } catch (e) {
      console.warn(`  ${nameSingular}: Warning - could not fetch existing fields: ${e.message}`);
    }

    console.log(`  ${nameSingular} (${objectId}): ${fields.length} fields to process`);

    for (const field of fields) {
      if (existingFields[field.name]) {
        // Field already exists
        results.fieldsSkipped++;
        continue;
      }

      try {
        const created = await createField(field, objectId, nameSingular, token);
        results.fieldsCreated++;
      } catch (e) {
        console.error(`    FAIL  ${nameSingular}.${field.name} (${field.type}): ${e.message}`);
        results.fieldsFailed++;
      }

      await delay(DELAY_BETWEEN_FIELDS);
    }

    const newCount = fields.length - Object.keys(existingFields).filter(n => fields.some(f => f.name === n)).length;
    console.log(`    -> ${newCount > 0 ? newCount + ' created' : 'all existed'}`);
  }

  // Phase 3: Refresh object cache
  console.log('\n=== Phase 3: Final Verification ===\n');

  try {
    const finalObjects = await findExistingObjects(token);
    const flentObjects = seedData.entities
      .map(e => e.nameSingular)
      .filter(name => finalObjects[name]);
    console.log(`Verified: ${flentObjects.length} / ${seedData.entities.length} Flent entities exist in workspace`);
  } catch (e) {
    console.warn(`Warning: Could not verify final state: ${e.message}`);
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Objects: ${results.objectsCreated} created, ${results.objectsSkipped} skipped, ${results.objectsFailed} failed`);
  console.log(`Fields:  ${results.fieldsCreated} created, ${results.fieldsSkipped} skipped, ${results.fieldsFailed} failed`);

  if (results.objectsFailed > 0 || results.fieldsFailed > 0) {
    console.log('\nSome operations failed. Re-run the script to retry (it is idempotent).');
  } else {
    console.log('\nAll operations completed successfully.');
  }

  await pg.end();
  console.log('Database connection closed.');
}

main().catch(e => {
  console.error(`Fatal error: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
