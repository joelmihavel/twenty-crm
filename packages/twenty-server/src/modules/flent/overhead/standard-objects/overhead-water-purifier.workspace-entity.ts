import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadWaterPurifierWorkspaceEntity extends BaseWorkspaceEntity {
  purifierSerialNo: string | null;
  purifierSubscription: string | null;
  purifierOwnership: string | null;
  purifierPayToLl: boolean | null;
  purifierCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
