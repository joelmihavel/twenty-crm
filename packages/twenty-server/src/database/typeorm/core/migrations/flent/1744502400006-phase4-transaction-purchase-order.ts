import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionPurchaseOrder1744502400006
  implements MigrationInterface
{
  name = 'Phase4TransactionPurchaseOrder1744502400006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_purchase_order" (
        "utn" character varying(255) NOT NULL,
        "po_number" character varying(255) NOT NULL,
        "vendor_code" character varying(255) NOT NULL,
        "vendor_name" character varying(255) NOT NULL,
        "total_items" integer,
        "gst_percent" numeric(5,2),
        "advance_amount" numeric(12,2),
        "remaining_amount" numeric(12,2),
        "advance_date" date,
        "fnf_date" date,
        "invoice" character varying(500),
        "po_status" character varying(100) NOT NULL DEFAULT 'Draft',
        "round_off" numeric(12,2),
        "txn_id_advance" character varying(255),
        "txn_id_remaining" character varying(255),
        CONSTRAINT "PK_transaction_purchase_order_utn" PRIMARY KEY ("utn"),
        CONSTRAINT "UQ_transaction_purchase_order_po_number" UNIQUE ("po_number")
      )
    `);

    // FK to transactions base (this PO IS a transaction)
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // FK to vendors
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_vendor_code"
      FOREIGN KEY ("vendor_code") REFERENCES "flent"."vendors"("vendor_code")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // FK to advance payment transaction
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_txn_advance"
      FOREIGN KEY ("txn_id_advance") REFERENCES "flent"."transactions"("utn")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // FK to remaining payment transaction
    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_purchase_order"
      ADD CONSTRAINT "FK_transaction_purchase_order_txn_remaining"
      FOREIGN KEY ("txn_id_remaining") REFERENCES "flent"."transactions"("utn")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_vendor_code" ON "flent"."transaction_purchase_order" ("vendor_code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_po_status" ON "flent"."transaction_purchase_order" ("po_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_txn_advance" ON "flent"."transaction_purchase_order" ("txn_id_advance")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_purchase_order_txn_remaining" ON "flent"."transaction_purchase_order" ("txn_id_remaining")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_txn_remaining"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_txn_advance"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_po_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_purchase_order_vendor_code"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_txn_remaining"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_txn_advance"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_vendor_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_purchase_order" DROP CONSTRAINT "FK_transaction_purchase_order_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_purchase_order"`);
  }
}
