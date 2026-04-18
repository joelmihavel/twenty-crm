import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionPayment1744502400003
  implements MigrationInterface
{
  name = 'Phase4TransactionPayment1744502400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_payment" (
        "utn" character varying(255) NOT NULL,
        "payment_channel" character varying(100),
        "payment_provider" character varying(100),
        "gateway_reference_id" character varying(255),
        CONSTRAINT "PK_transaction_payment_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_payment"
      ADD CONSTRAINT "FK_transaction_payment_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_payment_channel" ON "flent"."transaction_payment" ("payment_channel")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_payment_provider" ON "flent"."transaction_payment" ("payment_provider")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_payment_provider"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_payment_channel"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_payment" DROP CONSTRAINT "FK_transaction_payment_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_payment"`);
  }
}
