import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadMaintenanceWorkspaceEntity extends BaseWorkspaceEntity {
  maintenanceAmount: CurrencyMetadata | null;
  maintenanceCutoffDate: string | null;
  maintenanceCycle: string | null;
  maintenancePayToLl: boolean | null;
  maintenanceCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
