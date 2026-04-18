import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadElectricityWorkspaceEntity extends BaseWorkspaceEntity {
  electricityProvider: string | null;
  electricityConnectionType: string | null;
  electricityAccountNo: string | null;
  electricityPassword: string | null;
  electricityOwnership: string | null;
  electricityPayToLl: boolean | null;
  electricityCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
