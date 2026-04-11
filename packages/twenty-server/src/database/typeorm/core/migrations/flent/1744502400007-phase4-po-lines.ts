import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase4PoLines1744502400007
  implements MigrationInterface
{
  name = 'Phase4PoLines1744502400007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flent"."po_lines" (
        "po_line_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "utn" character varying(255) NOT NULL,
        "fsin_code" character varying(255),
        "item_name" character varying(255) NOT NULL,
        "qty" integer NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "line_amount" numeric(12,2),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "notes" text,
        CONSTRAINT "PK_po_lines_po_line_id" PRIMARY KEY ("po_line_id"),
        CONSTRAINT "CHK_po_lines_qty_positive" CHECK ("qty" >= 1)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "flent"."po_lines"
      ADD CONSTRAINT "FK_po_lines_utn"
      FOREIGN KEY ("utn") REFERENCES "flent"."transactions"("utn")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // NOTE: fsin_code FK is deferred to Phase 6 when fsins table is created.
    // Column exists as nullable VARCHAR without FK constraint.

    await queryRunner.query(`
      CREATE INDEX "IDX_po_lines_utn" ON "flent"."po_lines" ("utn")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_po_lines_fsin_code" ON "flent"."po_lines" ("fsin_code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "flent"."IDX_po_lines_fsin_code"`);
    await queryRunner.query(`DROP INDEX "flent"."IDX_po_lines_utn"`);
    await queryRunner.query(
      `ALTER TABLE "flent"."po_lines" DROP CONSTRAINT "FK_po_lines_utn"`
    );
    await queryRunner.query(`DROP TABLE "flent"."po_lines"`);
  }
}
