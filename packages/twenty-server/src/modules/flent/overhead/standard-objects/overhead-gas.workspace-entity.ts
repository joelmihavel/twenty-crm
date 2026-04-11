import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadGasWorkspaceEntity extends BaseWorkspaceEntity {
  gasConnectionType: string | null;
  gasAccountNo: string | null;
  gasPassword: string | null;
  gasOwnership: string | null;
  gasPayToLl: boolean | null;
  gasCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
