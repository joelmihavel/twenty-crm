#!/usr/bin/env node
/**
 * create-triggers.js
 *
 * Creates PostgreSQL trigger functions for computed/derived columns
 * in the Flent workspace schema.
 *
 * Triggers created:
 *   1. Lock-in End Date         (_contract)
 *   2. Effective Retail Rent    (_tenantContractDetail)
 *   3. Total Deductions         (_tenantContractDetail)
 *   4. PO Line Amount           (_poLine)
 *   5. PO Item Creation         (_transactionPurchaseOrder) - on status -> 'Completed'
 *
 * Usage:
 *   kubectl exec deployment/twenty-server -n twenty-prod -- node /path/to/create-triggers.js
 *
 * Environment:
 *   PG_DATABASE_URL - PostgreSQL connection string (from Twenty server env)
 */

const SCHEMA = process.env.WORKSPACE_SCHEMA || 'workspace_aawr8bdd2668wxa1b0258jzwe';

async function main() {
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.PG_DATABASE_URL });

  await client.connect();
  console.log(`Connected to database. Schema: ${SCHEMA}`);

  const triggers = [];

  // ─── Trigger 1: Lock-in End Date on _contract ─────────────────────────────
  // When contractStartDate or lockInDuration changes, calculate:
  //   lockInEndDate = contractStartDate + (lockInDuration * interval '1 month')
  // Actual columns: "contractStartDate", "lockInDuration", "lockInEndDate"
  triggers.push({
    name: 'lock_in_end_date',
    description: 'Calculate lockInEndDate from contractStartDate + lockInDuration months',
    sql: `
      CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_contract_lock_in_end_date()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."contractStartDate" IS NOT NULL AND NEW."lockInDuration" IS NOT NULL THEN
          NEW."lockInEndDate" := NEW."contractStartDate" + (NEW."lockInDuration" * INTERVAL '1 month');
        ELSE
          NEW."lockInEndDate" := NULL;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_contract_lock_in_end_date
        ON "${SCHEMA}"."_contract";

      CREATE TRIGGER trg_contract_lock_in_end_date
        BEFORE INSERT OR UPDATE OF "contractStartDate", "lockInDuration"
        ON "${SCHEMA}"."_contract"
        FOR EACH ROW
        EXECUTE FUNCTION "${SCHEMA}".fn_contract_lock_in_end_date();
    `,
  });

  // ─── Trigger 2: Effective Retail Rent on _tenantContractDetail ────────────
  // When totalRetailRent or discountAmount changes, calculate:
  //   effectiveRetailRent = COALESCE(totalRetailRent, 0) - COALESCE(discountAmount, 0)
  // These are CURRENCY fields in Twenty, stored as AmountMicros + CurrencyCode.
  // Actual columns: "totalRetailRentAmountMicros", "discountAmountAmountMicros",
  //                 "effectiveRetailRentAmountMicros"
  triggers.push({
    name: 'effective_retail_rent',
    description: 'Calculate effectiveRetailRent = totalRetailRent - discountAmount (in micros)',
    sql: `
      CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_tcd_effective_retail_rent()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."effectiveRetailRentAmountMicros" :=
          COALESCE(NEW."totalRetailRentAmountMicros", 0)
          - COALESCE(NEW."discountAmountAmountMicros", 0);

        -- Inherit currency code from totalRetailRent if not already set
        IF NEW."effectiveRetailRentCurrencyCode" IS NULL THEN
          NEW."effectiveRetailRentCurrencyCode" :=
            COALESCE(NEW."totalRetailRentCurrencyCode", NEW."discountAmountCurrencyCode", 'INR');
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_tcd_effective_retail_rent
        ON "${SCHEMA}"."_tenantContractDetail";

      CREATE TRIGGER trg_tcd_effective_retail_rent
        BEFORE INSERT OR UPDATE OF "totalRetailRentAmountMicros", "discountAmountAmountMicros"
        ON "${SCHEMA}"."_tenantContractDetail"
        FOR EACH ROW
        EXECUTE FUNCTION "${SCHEMA}".fn_tcd_effective_retail_rent();
    `,
  });

  // ─── Trigger 3: Total Deductions on _tenantContractDetail ─────────────────
  // When damagesDeductions, societyFees, or penalty changes, calculate:
  //   totalDeductions = COALESCE(damages, 0) + COALESCE(society, 0) + COALESCE(penalty, 0)
  // Actual columns: "damagesDeductionsAmountMicros", "societyFeesAmountMicros",
  //                 "penaltyAmountMicros", "totalDeductionsAmountMicros"
  triggers.push({
    name: 'total_deductions',
    description: 'Calculate totalDeductions = damagesDeductions + societyFees + penalty (in micros)',
    sql: `
      CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_tcd_total_deductions()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."totalDeductionsAmountMicros" :=
          COALESCE(NEW."damagesDeductionsAmountMicros", 0)
          + COALESCE(NEW."societyFeesAmountMicros", 0)
          + COALESCE(NEW."penaltyAmountMicros", 0);

        -- Inherit currency code from the first non-null source
        IF NEW."totalDeductionsCurrencyCode" IS NULL THEN
          NEW."totalDeductionsCurrencyCode" :=
            COALESCE(
              NEW."damagesDeductionsCurrencyCode",
              NEW."societyFeesCurrencyCode",
              NEW."penaltyCurrencyCode",
              'INR'
            );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_tcd_total_deductions
        ON "${SCHEMA}"."_tenantContractDetail";

      CREATE TRIGGER trg_tcd_total_deductions
        BEFORE INSERT OR UPDATE OF "damagesDeductionsAmountMicros", "societyFeesAmountMicros", "penaltyAmountMicros"
        ON "${SCHEMA}"."_tenantContractDetail"
        FOR EACH ROW
        EXECUTE FUNCTION "${SCHEMA}".fn_tcd_total_deductions();
    `,
  });

  // ─── Trigger 4: PO Line Amount on _poLine ─────────────────────────────────
  // When qty or unitPrice changes, calculate: lineAmount = qty * unitPrice
  // Actual columns: "qty" (NUMBER), "unitPrice" (NUMBER), "lineAmount" (NUMBER)
  triggers.push({
    name: 'po_line_amount',
    description: 'Calculate lineAmount = qty * unitPrice',
    sql: `
      CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_po_line_amount()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."lineAmount" :=
          COALESCE(NEW."qty", 0) * COALESCE(NEW."unitPrice", 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_po_line_amount
        ON "${SCHEMA}"."_poLine";

      CREATE TRIGGER trg_po_line_amount
        BEFORE INSERT OR UPDATE OF "qty", "unitPrice"
        ON "${SCHEMA}"."_poLine"
        FOR EACH ROW
        EXECUTE FUNCTION "${SCHEMA}".fn_po_line_amount();
    `,
  });

  // ─── Trigger 5: PO Item Creation on _transactionPurchaseOrder ─────────────
  // When poStatus changes to 'Completed', for each _poLine linked to this PO,
  // create an _item record if one does not already exist for that FSIN + serial.
  //
  // The link between PO and PO Lines is via a relation field (to be wired).
  // Until relations are wired, we use a convention:
  //   _poLine has a foreign key column pointing to _transactionPurchaseOrder.
  //   The FK column name follows Twenty's pattern: "transactionPurchaseOrderId"
  //
  // NOTE: This trigger creates skeleton _item rows. The item's fsinId and
  // poLineId relations will be populated once wire-relations.js runs.
  //
  // Actual _transactionPurchaseOrder column: "poStatus"
  // Actual _poLine columns: "fsinCode", "itemName", "qty", "unitPrice"
  // Actual _item columns: "name", "itemCode", "serialNo", "unitPriceAmountMicros",
  //                       "unitPriceCurrencyCode", "gstPercent"
  triggers.push({
    name: 'po_item_creation',
    description: 'When PO status changes to Completed, create _item rows from linked _poLine records',
    sql: `
      CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_po_item_creation()
      RETURNS TRIGGER AS $$
      DECLARE
        po_line RECORD;
        item_count INT;
        new_item_id UUID;
        serial_no INT;
      BEGIN
        -- Only fire when poStatus changes to 'Completed'
        IF NEW."poStatus"::text IS DISTINCT FROM 'COMPLETED' THEN
          RETURN NEW;
        END IF;

        -- Check if old status was already 'COMPLETED' (avoid re-processing)
        IF TG_OP = 'UPDATE' AND OLD."poStatus"::text = 'COMPLETED' THEN
          RETURN NEW;
        END IF;

        -- Find all PO lines linked to this PO.
        -- The FK column follows Twenty's convention for relation fields.
        -- We check both possible FK column names.
        FOR po_line IN
          SELECT pl.*
          FROM "${SCHEMA}"."_poLine" pl
          WHERE (
            -- Try the relation FK column (created by wire-relations.js)
            pl."transactionPurchaseOrderId" = NEW.id
          )
          AND pl."deletedAt" IS NULL
        LOOP
          -- Create 'qty' number of items for each PO line
          FOR serial_no IN 1..GREATEST(COALESCE(po_line."qty", 1)::int, 1)
          LOOP
            new_item_id := gen_random_uuid();

            INSERT INTO "${SCHEMA}"."_item" (
              "id",
              "name",
              "itemCode",
              "serialNo",
              "unitPriceAmountMicros",
              "unitPriceCurrencyCode",
              "createdAt",
              "updatedAt",
              "position"
            ) VALUES (
              new_item_id,
              COALESCE(po_line."itemName", po_line."fsinCode", 'Item'),
              po_line."fsinCode",
              serial_no::text,
              COALESCE(po_line."unitPrice", 0) * 1000000,  -- Convert to micros
              'INR',
              NOW(),
              NOW(),
              0
            )
            ON CONFLICT DO NOTHING;

          END LOOP;
        END LOOP;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_po_item_creation
        ON "${SCHEMA}"."_transactionPurchaseOrder";

      CREATE TRIGGER trg_po_item_creation
        AFTER INSERT OR UPDATE OF "poStatus"
        ON "${SCHEMA}"."_transactionPurchaseOrder"
        FOR EACH ROW
        WHEN (NEW."poStatus"::text = 'COMPLETED')
        EXECUTE FUNCTION "${SCHEMA}".fn_po_item_creation();
    `,
  });

  // ─── Execute all triggers ─────────────────────────────────────────────────
  console.log(`\n=== Creating ${triggers.length} triggers ===\n`);

  let created = 0;
  let failed = 0;

  for (const trigger of triggers) {
    console.log(`Creating: ${trigger.name} - ${trigger.description}`);
    try {
      await client.query(trigger.sql);
      console.log(`  OK    ${trigger.name}`);
      created++;
    } catch (err) {
      console.error(`  FAIL  ${trigger.name}: ${err.message}`);

      // If the PO item creation trigger fails because FK column doesn't exist yet,
      // create a deferred version that will work once relations are wired
      if (trigger.name === 'po_item_creation' && err.message.includes('transactionPurchaseOrderId')) {
        console.log('  INFO  FK column not yet created. Creating deferred trigger that checks column existence...');
        try {
          const deferredSql = `
            CREATE OR REPLACE FUNCTION "${SCHEMA}".fn_po_item_creation()
            RETURNS TRIGGER AS $$
            DECLARE
              po_line RECORD;
              new_item_id UUID;
              serial_no INT;
              fk_col_exists BOOLEAN;
            BEGIN
              -- Only fire when poStatus changes to 'COMPLETED' (enum is uppercase)
              IF NEW."poStatus"::text IS DISTINCT FROM 'COMPLETED' THEN
                RETURN NEW;
              END IF;
              IF TG_OP = 'UPDATE' AND OLD."poStatus"::text = 'COMPLETED' THEN
                RETURN NEW;
              END IF;

              -- Check if the FK column exists (will be created by wire-relations.js)
              SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = '${SCHEMA}'
                  AND table_name = '_poLine'
                  AND column_name = 'transactionPurchaseOrderId'
              ) INTO fk_col_exists;

              IF NOT fk_col_exists THEN
                RAISE NOTICE 'FK column transactionPurchaseOrderId not yet created on _poLine. Skipping item creation.';
                RETURN NEW;
              END IF;

              -- Dynamic query since FK column may not exist at function creation time
              FOR po_line IN
                EXECUTE format(
                  'SELECT * FROM %I."_poLine" WHERE "transactionPurchaseOrderId" = $1 AND "deletedAt" IS NULL',
                  '${SCHEMA}'
                ) USING NEW.id
              LOOP
                FOR serial_no IN 1..GREATEST(COALESCE(po_line."qty", 1)::int, 1)
                LOOP
                  new_item_id := gen_random_uuid();
                  INSERT INTO "${SCHEMA}"."_item" (
                    "id", "name", "itemCode", "serialNo",
                    "unitPriceAmountMicros", "unitPriceCurrencyCode",
                    "createdAt", "updatedAt", "position"
                  ) VALUES (
                    new_item_id,
                    COALESCE(po_line."itemName", po_line."fsinCode", 'Item'),
                    po_line."fsinCode",
                    serial_no::text,
                    COALESCE(po_line."unitPrice", 0) * 1000000,
                    'INR', NOW(), NOW(), 0
                  ) ON CONFLICT DO NOTHING;
                END LOOP;
              END LOOP;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_po_item_creation
              ON "${SCHEMA}"."_transactionPurchaseOrder";

            CREATE TRIGGER trg_po_item_creation
              AFTER INSERT OR UPDATE OF "poStatus"
              ON "${SCHEMA}"."_transactionPurchaseOrder"
              FOR EACH ROW
              WHEN (NEW."poStatus"::text = 'COMPLETED')
              EXECUTE FUNCTION "${SCHEMA}".fn_po_item_creation();
          `;
          await client.query(deferredSql);
          console.log(`  OK    ${trigger.name} (deferred version - checks FK at runtime)`);
          created++;
          failed--; // Undo the failure count
        } catch (err2) {
          console.error(`  FAIL  ${trigger.name} (deferred): ${err2.message}`);
        }
      }
      failed++;
    }
  }

  // ─── Verify triggers ─────────────────────────────────────────────────────
  console.log('\n=== Verification ===\n');

  const verifyResult = await client.query(`
    SELECT trigger_name, event_manipulation, event_object_table, action_timing
    FROM information_schema.triggers
    WHERE trigger_schema = $1
    ORDER BY event_object_table, trigger_name
  `, [SCHEMA]);

  if (verifyResult.rows.length > 0) {
    console.log('Installed triggers:');
    for (const row of verifyResult.rows) {
      console.log(`  ${row.action_timing} ${row.event_manipulation} ON ${row.event_object_table}: ${row.trigger_name}`);
    }
  } else {
    console.log('No triggers found in schema (unexpected).');
  }

  // Also verify functions
  const funcResult = await client.query(`
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = $1
      AND routine_name LIKE 'fn_%'
    ORDER BY routine_name
  `, [SCHEMA]);

  if (funcResult.rows.length > 0) {
    console.log('\nInstalled trigger functions:');
    for (const row of funcResult.rows) {
      console.log(`  ${row.routine_name}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Created: ${created}, Failed: ${failed}`);

  await client.end();
  console.log('Done.');
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
