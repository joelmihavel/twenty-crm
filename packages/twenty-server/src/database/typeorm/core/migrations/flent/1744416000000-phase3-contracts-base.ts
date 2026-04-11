import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase3ContractsBase1744416000000
  implements MigrationInterface
{
  name = 'Phase3ContractsBase1744416000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."contracts" (
        "contract_uid" uuid NOT NULL DEFAULT gen_random_uuid(),
        "contract_type" character varying(100) NOT NULL,
        "pid" character varying(255) NOT NULL,
        "rid" character varying(255),
        "contract_start_date" date NOT NULL,
        "contract_end_date" date NOT NULL,
        "service_term" integer NOT NULL,
        "lock_in_duration" integer,
        "lock_in_end_date" date,
        "notice_period" integer,
        "agreement_pdf" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contracts_contract_uid" PRIMARY KEY ("contract_uid")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."contracts"
      ADD CONSTRAINT "FK_contracts_pid"
      FOREIGN KEY ("pid") REFERENCES "flent"."properties"("pid")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."contracts"
      ADD CONSTRAINT "FK_contracts_rid"
      FOREIGN KEY ("rid") REFERENCES "flent"."rooms"("rid")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_contract_type" ON "flent"."contracts" ("contract_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_pid" ON "flent"."contracts" ("pid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_rid" ON "flent"."contracts" ("rid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_start_date" ON "flent"."contracts" ("contract_start_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contracts_end_date" ON "flent"."contracts" ("contract_end_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_end_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_start_date"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_rid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_pid"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_contracts_contract_type"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."contracts" DROP CONSTRAINT "FK_contracts_rid"`
    );
    await queryRunner.query(
      `ALTER TABLE "flent"."contracts" DROP CONSTRAINT "FK_contracts_pid"`
    );
    await queryRunner.query(`DROP TABLE "flent"."contracts"`);
  }
}
