import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionLineItems1744502400004
  implements MigrationInterface
{
  name = 'Phase4TransactionLineItems1744502400004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_line_items" (
        "utn" character varying(255) NOT NULL,
        "line_item_date" date,
        "cost_revenue_center" character varying(255),
        "line_item_description" text,
        CONSTRAINT "PK_transaction_line_items_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_line_items"
      ADD CONSTRAINT "FK_transaction_line_items_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_line_items_date" ON "flent"."transaction_line_items" ("line_item_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_line_items_center" ON "flent"."transaction_line_items" ("cost_revenue_center")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_line_items_center"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_line_items_date"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_line_items" DROP CONSTRAINT "FK_transaction_line_items_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_line_items"`);
  }
}
