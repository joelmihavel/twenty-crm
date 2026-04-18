import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadWaterWorkspaceEntity extends BaseWorkspaceEntity {
  waterAccountNo: string | null;
  waterPassword: string | null;
  waterOwnership: string | null;
  waterPaymentsDues: string | null;
  waterPayToLl: boolean | null;
  waterCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
