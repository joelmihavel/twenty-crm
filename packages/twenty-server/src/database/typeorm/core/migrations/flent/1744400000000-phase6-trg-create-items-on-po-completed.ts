import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase6TrgCreateItemsOnPoCompleted1744400000000
  implements MigrationInterface
{
  name = 'Phase6TrgCreateItemsOnPoCompleted1744400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the trigger function
    // This function fires on UPDATE of the transactionPurchaseOrder table.
    // When poStatus transitions to 'Completed', it iterates through all
    // PO lines for that transaction and creates Item + ItemState records.
    //
    // NOTE: Table and column names below use Twenty's workspace schema
    // naming convention. The actual table names in the workspace schema
    // are the camelCase entity names converted to snake_case with underscores.
    // Adjust the schema reference (e.g., workspace_<id>) at deployment time
    // or use a schema search path.
    //
    // For workspace entities, tables live in the workspace-specific schema.
    // This trigger must be created per-workspace or use a dynamic schema approach.
    // The implementation below uses a parameterized schema placeholder that
    // should be replaced during workspace provisioning.

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trg_create_items_on_po_completed()
      RETURNS TRIGGER AS $$
      DECLARE
        v_po_line RECORD;
        v_unit_idx INTEGER;
        v_item_id UUID;
        v_item_code TEXT;
        v_existing_count INTEGER;
        v_fsin_code TEXT;
        v_schema_name TEXT;
      BEGIN
        -- Only fire when poStatus changes TO 'Completed'
        IF (TG_OP = 'UPDATE'
            AND NEW."poStatus" = 'COMPLETED'
            AND (OLD."poStatus" IS DISTINCT FROM 'COMPLETED'))
        THEN
          -- Get the schema name from the TG_TABLE_SCHEMA
          v_schema_name := TG_TABLE_SCHEMA;

          -- Iterate through all PO lines for this transaction
          FOR v_po_line IN
            EXECUTE format(
              'SELECT pl.id AS po_line_id,
                      pl."fsinId" AS fsin_id,
                      pl."unitPrice" AS unit_price,
                      pl."unitPriceCurrencyCode" AS unit_price_currency_code,
                      pl."quantity" AS quantity,
                      f."fsinCode" AS fsin_code
               FROM %I."poLine" pl
               JOIN %I."fsin" f ON f.id = pl."fsinId"
               WHERE pl."transactionId" = $1',
              v_schema_name, v_schema_name
            )
            USING NEW.id
          LOOP
            -- Count existing items for this FSIN to generate sequential codes
            EXECUTE format(
              'SELECT COUNT(*) FROM %I."item" WHERE "fsinId" = $1',
              v_schema_name
            )
            INTO v_existing_count
            USING v_po_line.fsin_id;

            v_fsin_code := v_po_line.fsin_code;

            -- Create one Item + ItemState per unit in the PO line quantity
            FOR v_unit_idx IN 1..COALESCE(v_po_line.quantity, 0)
            LOOP
              v_item_id := gen_random_uuid();
              v_existing_count := v_existing_count + 1;

              -- Generate item code: FSIN_CODE-SERIAL (e.g., BED-001-0042)
              v_item_code := v_fsin_code || '-' || LPAD(v_existing_count::TEXT, 4, '0');

              -- Insert Item record
              EXECUTE format(
                'INSERT INTO %I."item"
                  (id, "itemCode", "serialNo",
                   "unitPriceAmountMicros", "unitPriceCurrencyCode",
                   "gstPercent", "fsinId", "poLineId",
                   "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())',
                v_schema_name
              )
              USING
                v_item_id,
                v_item_code,
                v_existing_count,
                v_po_line.unit_price,
                v_po_line.unit_price_currency_code,
                NEW."gstPercent",
                v_po_line.fsin_id,
                v_po_line.po_line_id;

              -- Insert ItemState record with initial state BUY
              EXECUTE format(
                'INSERT INTO %I."itemState"
                  (id, "lock", "state", "stateTime", "itemId",
                   "createdAt", "updatedAt")
                 VALUES ($1, false, $2, now(), $3, now(), now())',
                v_schema_name
              )
              USING
                gen_random_uuid(),
                'BUY',
                v_item_id;
            END LOOP;
          END LOOP;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Add a comment documenting the trigger function
    await queryRunner.query(`
      COMMENT ON FUNCTION trg_create_items_on_po_completed() IS
        'Phase 6 trigger: When a PO status changes to Completed, auto-creates '
        'Item and ItemState records for each unit on every PO line. '
        'Item receives: auto-generated itemCode, fsinId from PO line, '
        'unitPrice from PO line, gstPercent from PO. '
        'ItemState receives: state=BUY, stateTime=now(). '
        'Created by Phase6TrgCreateItemsOnPoCompleted1744400000000.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS trg_create_items_on_po_completed() CASCADE`,
    );
  }
}
