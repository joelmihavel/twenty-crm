import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantRequirementsWorkspaceEntity extends BaseWorkspaceEntity {
  // Preferences
  preferredMicromarkets: string[] | null;
  preferredOccupancyType: string | null;
  preferredFurnishedType: string | null;
  preferredMoveInTimeline: string | null;
  genderPreferences: string | null;
  foodPreferences: string | null;
  hasPet: boolean | null;
  smokingPreferences: string | null;
  customPreference: string | null;

  // Budget
  budgetMax: CurrencyMetadata | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
