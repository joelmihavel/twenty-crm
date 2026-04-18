import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4TransactionParties1744502400002
  implements MigrationInterface
{
  name = 'Phase4TransactionParties1744502400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."transaction_parties" (
        "utn" character varying(255) NOT NULL,
        "from_party" character varying(255) NOT NULL,
        "from_party_type" character varying(100) NOT NULL,
        "from_party_info" text,
        "to_party" character varying(255) NOT NULL,
        "to_party_type" character varying(100) NOT NULL,
        "to_party_info" text,
        CONSTRAINT "PK_transaction_parties_utn" PRIMARY KEY ("utn")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."transaction_parties"
      ADD CONSTRAINT "FK_transaction_parties_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_parties_from_type" ON "flent"."transaction_parties" ("from_party_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_parties_to_type" ON "flent"."transaction_parties" ("to_party_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_parties_to_type"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_transaction_parties_from_type"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."transaction_parties" DROP CONSTRAINT "FK_transaction_parties_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."transaction_parties"`);
  }
}
