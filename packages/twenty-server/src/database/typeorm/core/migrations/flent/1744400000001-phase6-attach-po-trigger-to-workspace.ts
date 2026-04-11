import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase6AttachPoTriggerToWorkspace1744400000001
  implements MigrationInterface
{
  name = 'Phase6AttachPoTriggerToWorkspace1744400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration creates a helper function that can be called to attach
    // the PO completion trigger to a specific workspace schema.
    // Usage: SELECT attach_po_completion_trigger('workspace_abc123');
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION attach_po_completion_trigger(p_schema_name TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE format(
          'CREATE TRIGGER trg_po_completed_create_items
           AFTER UPDATE ON %I."transactionPurchaseOrder"
           FOR EACH ROW
           EXECUTE FUNCTION trg_create_items_on_po_completed()',
          p_schema_name
        );
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      COMMENT ON FUNCTION attach_po_completion_trigger(TEXT) IS
        'Helper to attach the PO completion trigger to a workspace schema. '
        'Call with: SELECT attach_po_completion_trigger(''workspace_<id>'');';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS attach_po_completion_trigger(TEXT) CASCADE`,
    );
  }
}
