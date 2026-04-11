import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3ContractsTriggers1744416000003
  implements MigrationInterface
{
  name = 'Phase3ContractsTriggers1744416000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Trigger 1: Auto-calculate lock_in_end_date on contracts
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_lock_in_end_date"()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.lock_in_duration IS NOT NULL AND NEW.contract_start_date IS NOT NULL THEN
          NEW.lock_in_end_date := NEW.contract_start_date + (NEW.lock_in_duration || ' months')::interval;
        ELSE
          NEW.lock_in_end_date := NULL;
        END IF;
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_contracts_lock_in_end_date"
      BEFORE INSERT OR UPDATE OF lock_in_duration, contract_start_date
      ON "flent"."contracts"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_lock_in_end_date"()
    `);

    // Trigger 2: Auto-calculate effective_retail_rent on tenant_contract_details
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_effective_retail_rent"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.effective_retail_rent := COALESCE(NEW.total_retail_rent, 0) - COALESCE(NEW.discount_amount, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_tenant_contract_effective_rent"
      BEFORE INSERT OR UPDATE OF total_retail_rent, discount_amount
      ON "flent"."tenant_contract_details"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_effective_retail_rent"()
    `);

    // Trigger 3: Auto-calculate total_deductions on tenant_contract_details
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "flent"."trg_calc_total_deductions"()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.total_deductions := COALESCE(NEW.damages_deductions, 0)
                              + COALESCE(NEW.society_fees, 0)
                              + COALESCE(NEW.penalty, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_tenant_contract_total_deductions"
      BEFORE INSERT OR UPDATE OF damages_deductions, society_fees, penalty
      ON "flent"."tenant_contract_details"
      FOR EACH ROW
      EXECUTE FUNCTION "flent"."trg_calc_total_deductions"()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_tenant_contract_total_deductions" ON "flent"."tenant_contract_details"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_total_deductions"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_tenant_contract_effective_rent" ON "flent"."tenant_contract_details"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_effective_retail_rent"()`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trg_contracts_lock_in_end_date" ON "flent"."contracts"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS "flent"."trg_calc_lock_in_end_date"()`
    );
  }
}
