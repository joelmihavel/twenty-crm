import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionTriggers1744502400008
  implements MigrationInterface
{
  name = 'Phase4TransactionTriggers1744502400008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Trigger 1: Auto-calculate line_amount on po_lines
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_po_line_amount"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.line_amount := NEW.qty * NEW.unit_price;
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_po_lines_line_amount"
      BEFORE INSERT OR UPDATE OF qty, unit_price
      ON "flent"."po_lines"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_po_line_amount"()
    `);

    // Trigger 2: Auto-update updated_at on transactions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_transactions_updated_at"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_transactions_updated_at"
      BEFORE UPDATE
      ON "flent"."transactions"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_transactions_updated_at"()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_transactions_updated_at" ON "flent"."transactions"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_transactions_updated_at"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_po_lines_line_amount" ON "flent"."po_lines"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_po_line_amount"()`
    );
  }
}
