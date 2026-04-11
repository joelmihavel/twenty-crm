import { type CurrencyMetadata, type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyLeadStageWorkspaceEntity extends BaseWorkspaceEntity {
  ppid: string | null;
  dateAdded: string | null;
  unitsCount: number | null;
  dealType: string | null;
  apartmentCount: number | null;
  propertyTypeLead: string | null;
  furnishingLead: string | null;
  expectedRent: CurrencyMetadata | null;
  googleMapLocationLead: LinksMetadata | null;
  dealStage: string | null;
  disqualificationReason: string | null;
  lostReason: string | null;
  exploratoryVisitScore: number | null;
  potentialReport: LinksMetadata | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
