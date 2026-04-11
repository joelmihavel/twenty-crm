import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadDgWorkspaceEntity extends BaseWorkspaceEntity {
  dgBrandDetails: string | null;
  dgCapacityKva: number | null;
  dgMaintenanceSchedule: string | null;
  dgFuelTankCapacity: number | null;
  dgRefillUnitLitres: number | null;
  dgAmount: CurrencyMetadata | null;
  dgPayToLl: boolean | null;
  dgCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
