#!/usr/bin/env node
/**
 * extract-seed-data.js
 *
 * Reads all Flent object and field seed TypeScript files, parses them,
 * and outputs a JSON file (flent-seed-data.json) containing all 53
 * entities with their fields. This JSON is then consumed by register-entities.js.
 *
 * Usage: node extract-seed-data.js
 * Output: flent-seed-data.json in the same directory
 */

const fs = require('fs');
const path = require('path');

const FLENT_DIR = path.resolve(__dirname, '..');

function findFiles(dir, pattern) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(item.name)) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

/**
 * Parse a TypeScript seed file and extract the JS object literal.
 * This is a simplified parser that handles the patterns used in the seed files.
 */
function parseObjectSeedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Remove imports and type annotations
  let cleaned = content
    .replace(/import\s+.*?;/gs, '')
    .replace(/export\s+const\s+\w+:\s*\w+\s*=\s*/, '')
    .replace(/as\s+\w+<[^>]+>/g, '') // remove "as Type<Generic>"
    .trim();

  // Remove trailing semicolon
  if (cleaned.endsWith(';')) {
    cleaned = cleaned.slice(0, -1);
  }

  // Replace single-quoted strings with double-quoted for JSON-like parsing
  // Use eval with a safe context
  try {
    // Convert FieldMetadataType.X references to string "X"
    cleaned = cleaned.replace(/FieldMetadataType\.(\w+)/g, '"$1"');
    // Convert NumberDataType.X references to string "X"
    cleaned = cleaned.replace(/NumberDataType\.(\w+)/g, '"$1"');

    const result = eval(`(${cleaned})`);
    return result;
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${e.message}`);
    // Try a more aggressive cleaning
    try {
      cleaned = cleaned
        .replace(/\/\/.*$/gm, '') // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // remove multi-line comments
      const result = eval(`(${cleaned})`);
      return result;
    } catch (e2) {
      console.error(`Also failed after cleaning: ${e2.message}`);
      return null;
    }
  }
}

function parseFieldSeedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Replace TypeScript enum references globally first
  let processed = content
    .replace(/FieldMetadataType\.(\w+)/g, '"$1"')
    .replace(/NumberDataType\.(\w+)/g, '"$1"');

  // Remove imports
  processed = processed.replace(/import\s+.*?;/gs, '');

  // Remove type annotations like `: FieldMetadataSeed[]`
  // Remove 'as Type<Generic>' casts
  processed = processed.replace(/as\s+\w+<[^>]+>/g, '');

  // Remove comments
  processed = processed
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Handle cases with local const declarations (like PARTY_TYPE_OPTIONS)
  // Extract all const declarations and the final export
  const constDecls = [];
  processed = processed.replace(/(?:export\s+)?const\s+(\w+)(?::\s*[^=]+?)?\s*=\s*/g, (match, name) => {
    constDecls.push(name);
    return `var ${name} = `;
  });

  // Remove 'export' keyword if still present
  processed = processed.replace(/\bexport\s+/g, '');

  // Clean up whitespace
  processed = processed.trim();

  // Wrap in an IIFE that returns the last value
  // Find the main seeds array (the exported one, typically the last assignment)
  try {
    // Evaluate all const declarations and return the last one
    const wrappedCode = `(function() { ${processed}; return ${constDecls[constDecls.length - 1]}; })()`;
    const result = eval(wrappedCode);
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error(`Failed to parse field seeds ${path.basename(filePath)}: ${e.message}`);
    return [];
  }
}

function parseRelationSeedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  let cleaned = content
    .replace(/import\s+.*?;/gs, '')
    .replace(/export\s+const\s+\w+:\s*[\s\S]*?=\s*/, '')
    .trim();

  if (cleaned.endsWith(';')) {
    cleaned = cleaned.slice(0, -1);
  }

  // Handle object references like SEED_CONSTANT.nameSingular
  cleaned = cleaned.replace(/\w+_OBJECT_SEED\.nameSingular/g, (match) => {
    // Just use empty string as placeholder; we don't need these in the output
    return '""';
  });

  cleaned = cleaned
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  try {
    const result = eval(`(${cleaned})`);
    return result;
  } catch (e) {
    console.error(`Failed to parse relation seeds ${filePath}: ${e.message}`);
    return [];
  }
}

// Find all files
const objectSeedFiles = findFiles(FLENT_DIR, /-object-seed\.constant\.ts$/);
const fieldSeedFiles = findFiles(FLENT_DIR, /-field-seeds\.constant\.ts$/);
const relationSeedFiles = findFiles(FLENT_DIR, /-relation.*\.constant\.ts$/);

console.log(`Found ${objectSeedFiles.length} object seed files`);
console.log(`Found ${fieldSeedFiles.length} field seed files`);
console.log(`Found ${relationSeedFiles.length} relation seed files`);

// Parse object seeds
const objects = {};
for (const file of objectSeedFiles) {
  const parsed = parseObjectSeedFile(file);
  if (parsed && parsed.nameSingular) {
    objects[parsed.nameSingular] = {
      ...parsed,
      fields: [],
      _sourceFile: path.relative(FLENT_DIR, file),
    };
  }
}

// Build a lookup from various possible name forms to the actual object key
const objectLookup = {};
for (const key of Object.keys(objects)) {
  objectLookup[key] = key;
  // Also add the plural form as a lookup
  objectLookup[objects[key].namePlural] = key;
}

// Parse field seeds and match to objects
for (const file of fieldSeedFiles) {
  const basename = path.basename(file, '.constant.ts');

  // Skip relation field seeds - they define relations, not regular fields
  if (basename.includes('relation')) continue;

  const parsed = parseFieldSeedFile(file);
  if (!Array.isArray(parsed) || parsed.length === 0) continue;

  // Remove "-field-seeds" suffix
  let objectKey = basename.replace(/-field-seeds$/, '');

  // Convert kebab-case to camelCase
  objectKey = objectKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  // Try direct match first
  if (objects[objectKey]) {
    objects[objectKey].fields = parsed;
  } else {
    // Try variations: the object might use singular while the file uses plural
    // e.g., file "room-commercials" -> object "roomCommercial"
    // e.g., file "tenant-requirements" -> object "tenantRequirement"
    // e.g., file "transaction-line-items" -> object "transactionLineItem"
    let found = false;

    // Try removing trailing 's'
    if (objectKey.endsWith('s') && objects[objectKey.slice(0, -1)]) {
      objects[objectKey.slice(0, -1)].fields = parsed;
      found = true;
    }
    // Try removing trailing 'es'
    else if (objectKey.endsWith('es') && objects[objectKey.slice(0, -2)]) {
      objects[objectKey.slice(0, -2)].fields = parsed;
      found = true;
    }
    // Try removing 'ies' and adding 'y'
    else if (objectKey.endsWith('ies')) {
      const tryKey = objectKey.slice(0, -3) + 'y';
      if (objects[tryKey]) {
        objects[tryKey].fields = parsed;
        found = true;
      }
    }
    // Try removing trailing 'Details' -> try with 'Detail'
    else if (objectKey.endsWith('Details') && objects[objectKey.slice(0, -1)]) {
      objects[objectKey.slice(0, -1)].fields = parsed;
      found = true;
    }

    if (!found) {
      // Brute force: check all object nameSingular values
      for (const [key, obj] of Object.entries(objects)) {
        // Check if the kebab form of the file matches when converted
        const objKebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const fileKebab = basename.replace(/-field-seeds$/, '');
        if (objKebab === fileKebab || fileKebab.startsWith(objKebab)) {
          objects[key].fields = parsed;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.warn(`No matching object for field seeds: ${basename} (tried key: ${objectKey})`);
    }
  }
}

// Build the output
const output = {
  generatedAt: new Date().toISOString(),
  totalObjects: Object.keys(objects).length,
  totalFields: Object.values(objects).reduce((sum, o) => sum + (o.fields ? o.fields.length : 0), 0),
  entities: Object.values(objects).map(obj => {
    const { _sourceFile, ...rest } = obj;
    return rest;
  }),
};

const outputPath = path.join(__dirname, 'flent-seed-data.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\nGenerated ${outputPath}`);
console.log(`Total objects: ${output.totalObjects}`);
console.log(`Total fields: ${output.totalFields}`);

// Also print a summary
console.log('\nEntities:');
for (const entity of output.entities) {
  console.log(`  ${entity.nameSingular} (${entity.labelSingular}) - ${entity.fields.length} fields`);
}
