import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionLinks1744502400005
  implements MigrationInterface
{
  name = 'Phase4TransactionLinks1744502400005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_links" (
        "utn" character varying(255) NOT NULL,
        "contract_uid" uuid,
        "tenant_id" uuid,
        "merchant_id" uuid,
        "vendor_code" character varying(255),
        "overhead_id" uuid,
        "ticket_id" integer,
        "pid" character varying(255),
        "rid" character varying(255),
        CONSTRAINT "PK_transaction_links_utn" PRIMARY KEY ("utn")
      )
    `);

    // FK to transactions base
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // FK to contracts
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_contract_uid"
      FOREIGN KEY ("contract_uid") REFERENCES "flent"."contracts"("contract_uid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to tenants
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_tenant_id"
      FOREIGN KEY ("tenant_id") REFERENCES "flent"."tenants"("record_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to merchants
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_merchant_id"
      FOREIGN KEY ("merchant_id") REFERENCES "flent"."merchants"("record_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to vendors
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_vendor_code"
      FOREIGN KEY ("vendor_code") REFERENCES "flent"."vendors"("vendor_code")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to overheads
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_overhead_id"
      FOREIGN KEY ("overhead_id") REFERENCES "flent"."overheads"("overhead_id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // NOTE: ticket_id FK is deferred to Phase 5 when tickets table is created.
    // Column exists as nullable INTEGER without FK constraint.

    // FK to properties
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_pid"
      FOREIGN KEY ("pid") REFERENCES "flent"."properties"("pid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to rooms
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_links"
      ADD CONSTRAINT "FK_transaction_links_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Indexes for all FK columns
    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_contract_uid" ON "flent"."transaction_links" ("contract_uid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_tenant_id" ON "flent"."transaction_links" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_merchant_id" ON "flent"."transaction_links" ("merchant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_vendor_code" ON "flent"."transaction_links" ("vendor_code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_overhead_id" ON "flent"."transaction_links" ("overhead_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_ticket_id" ON "flent"."transaction_links" ("ticket_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_pid" ON "flent"."transaction_links" ("pid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_links_rid" ON "flent"."transaction_links" ("rid")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_pid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_ticket_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_overhead_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_vendor_code"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_merchant_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_tenant_id"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_links_contract_uid"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_pid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_overhead_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_vendor_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_merchant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_tenant_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_contract_uid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_links" DROP CONSTRAINT "FK_transaction_links_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_links"`);
  }
}
