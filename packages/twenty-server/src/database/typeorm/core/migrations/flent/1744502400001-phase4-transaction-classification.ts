import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionClassification1744502400001
  implements MigrationInterface
{
  name = 'Phase4TransactionClassification1744502400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_classification" (
        "utn" character varying(255) NOT NULL,
        "purpose_category_1" character varying(100),
        "purpose_category_2" character varying(100),
        CONSTRAINT "PK_transaction_classification_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_classification"
      ADD CONSTRAINT "FK_transaction_classification_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_classification_cat1" ON "flent"."transaction_classification" ("purpose_category_1")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_classification_cat2" ON "flent"."transaction_classification" ("purpose_category_2")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_classification_cat2"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_classification_cat1"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_classification" DROP CONSTRAINT "FK_transaction_classification_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_classification"`);
  }
}
