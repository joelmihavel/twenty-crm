import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionsBase1744502400000
  implements MigrationInterface
{
  name = 'Phase4TransactionsBase1744502400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transactions" (
        "utn" character varying(255) NOT NULL,
        "transaction_type" character varying(100) NOT NULL,
        "credit_debit" character varying(100) NOT NULL,
        "transaction_date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "status" character varying(100) NOT NULL,
        "created_by" character varying(255) NOT NULL,
        "created_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "authorised_by" character varying(255),
        "authorised_date" TIMESTAMP WITH TIME ZONE,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions_utn" PRIMARY KEY ("utn"),
        CONSTRAINT "CHK_transactions_amount_positive" CHECK ("amount" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transaction_type" ON "flent"."transactions" ("transaction_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_credit_debit" ON "flent"."transactions" ("credit_debit")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transaction_date" ON "flent"."transactions" ("transaction_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_status" ON "flent"."transactions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_created_by" ON "flent"."transactions" ("created_by")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_created_by"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_status"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_transaction_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_credit_debit"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transactions_transaction_type"`);
    await queryRunner.query(`DROP TABLE "flent"."transactions"`);
  }
}
