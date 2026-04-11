import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyChurnedWorkspaceEntity extends BaseWorkspaceEntity {
  depositRefunded: boolean | null;
  exitCostOpx: CurrencyMetadata | null;
  churnDate: Date | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
