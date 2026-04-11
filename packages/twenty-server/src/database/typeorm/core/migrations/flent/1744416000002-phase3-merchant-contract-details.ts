import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3MerchantContractDetails1744416000002
  implements MigrationInterface
{
  name = 'Phase3MerchantContractDetails1744416000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."merchant_contract_details" (
        "contract_uid" uuid NOT NULL,
        "merchant_id" uuid NOT NULL,
        "party_name_merchant" character varying(255) NOT NULL,
        "key_handover_date" date,
        "increment_percentage" numeric(5,2),
        "increment_frequency" character varying(100),
        "agreement_status" character varying(100),
        "base_rent" jsonb NOT NULL,
        "merchant_security_deposit" numeric(12,2),
        "management_fee_per_month" numeric(12,2),
        "total_cogs" numeric(12,2),
        "contract_acquisition_cost" numeric(12,2),
        "contract_acquisition_cost_paid_to" character varying(255),
        "payment_cycle" character varying(100) NOT NULL,
        "payment_deadline" date NOT NULL,
        "inventory_list" character varying(500),
        CONSTRAINT "PK_merchant_contract_details_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."merchant_contract_details"
      ADD CONSTRAINT "FK_merchant_contract_details_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."merchant_contract_details"
      ADD CONSTRAINT "FK_merchant_contract_details_merchant_id"
      FOREIGN KEY ("merchant_id") REFERENCES "flent"."merchants"("record_id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_merchant_id" ON "flent"."merchant_contract_details" ("merchant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_agreement_status" ON "flent"."merchant_contract_details" ("agreement_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_merchant_contract_details_payment_cycle" ON "flent"."merchant_contract_details" ("payment_cycle")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_payment_cycle"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_agreement_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_merchant_contract_details_merchant_id"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."merchant_contract_details" DROP CONSTRAINT "FK_merchant_contract_details_merchant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."merchant_contract_details" DROP CONSTRAINT "FK_merchant_contract_details_contract_uid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."merchant_contract_details"`);
  }
}
