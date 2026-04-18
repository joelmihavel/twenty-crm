import {
  type AddressMetadata,
  type CurrencyMetadata,
  type LinksMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyActiveWorkspaceEntity extends BaseWorkspaceEntity {
  // Location & Identity
  houseNo: string | null;
  activeUnitsCount: number | null;
  tier: string | null;
  floor: string | null;
  googleMapLocation: LinksMetadata | null;
  address: AddressMetadata | null;
  buildingSociety: string | null;
  activeCluster: string | null;

  // Amenities
  parkingType: string[] | null;
  parkingNumber: string | null;
  powerBackup: string | null;
  waterSource: string[] | null;
  restrictions: string | null;
  otherNotes: string | null;

  // Furnishing
  furnitureMovement: string | null;
  furnishingStatus: string | null;

  // Financials
  finalApprovedAmt: CurrencyMetadata | null;
  finalInvoice: LinksMetadata | null;
  llExtraClauses: string | null;

  // Payment & Collections
  paymentCollection: string | null;
  emiPeriod: number | null;
  opexCollections: CurrencyMetadata | null;

  // Management
  propMgmtApp: string | null;
  rulesRegulations: LinksMetadata | null;
  garbageDisposal: string | null;
  timingRestrictions: string | null;
  moveInOutFormalities: string | null;

  // Deadlines & Dates
  rentDeadline: string | null;
  overheadsDeadline: string | null;
  activeDealOwner: string | null;
  activationDate: Date | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
