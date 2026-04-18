import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3TenantContractDetails1744416000001
  implements MigrationInterface
{
  name = 'Phase3TenantContractDetails1744416000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."tenant_contract_details" (
        "contract_uid" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "rid" character varying(255) NOT NULL,
        "party_name_tenant" character varying(255) NOT NULL,
        "preferred_move_out_date" date,
        "payment_lifecycle" character varying(100),
        "agreement_lifecycle" character varying(100),
        "total_retail_rent" numeric(12,2),
        "monthly_license_fee" numeric(12,2),
        "maintenance_fee" numeric(12,2),
        "furnishing_fee" numeric(12,2),
        "convenience_fee" numeric(12,2),
        "gst" numeric(12,2),
        "discount_amount" numeric(12,2),
        "effective_retail_rent" numeric(12,2),
        "security_deposit" numeric(12,2),
        "caution_deposit" numeric(12,2),
        "lock_in_fee" numeric(12,2),
        "exit_fee" numeric(12,2),
        "damages_deductions" numeric(12,2),
        "society_fees" numeric(12,2),
        "penalty" numeric(12,2),
        "total_deductions" numeric(12,2),
        "fmr_status" character varying(100),
        "deposit_paid_status" character varying(100),
        CONSTRAINT "PK_tenant_contract_details_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_tenant_id"
      FOREIGN KEY ("tenant_id") REFERENCES "flent"."tenants"("record_id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."tenant_contract_details"
      ADD CONSTRAINT "FK_tenant_contract_details_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_tenant_id" ON "flent"."tenant_contract_details" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_rid" ON "flent"."tenant_contract_details" ("rid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_payment_lifecycle" ON "flent"."tenant_contract_details" ("payment_lifecycle")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_contract_details_agreement_lifecycle" ON "flent"."tenant_contract_details" ("agreement_lifecycle")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_agreement_lifecycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_payment_lifecycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_tenant_contract_details_tenant_id"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_tenant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."tenant_contract_details" DROP CONSTRAINT "FK_tenant_contract_details_contract_uid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."tenant_contract_details"`);
  }
}
