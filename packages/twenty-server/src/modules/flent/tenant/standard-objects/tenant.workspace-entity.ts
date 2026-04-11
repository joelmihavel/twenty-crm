import {
  type EmailsMetadata,
  FieldMetadataType,
  type FullNameMetadata,
  type LinksMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantAttributionWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-attribution.workspace-entity';
import { type TenantRequirementsWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-requirements.workspace-entity';
import { type TenantQualificationWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-qualification.workspace-entity';
import { type TenantVisitSummaryWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-visit-summary.workspace-entity';
import { type TenantSatisfactionWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-satisfaction.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_TENANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

export class TenantWorkspaceEntity extends BaseWorkspaceEntity {
  // Identity
  name: FullNameMetadata | null;
  emails: EmailsMetadata;
  phones: PhonesMetadata;
  gender: string | null;
  dateOfBirth: Date | null;

  // KYC Documents
  aadhaarNumber: string;
  aadhaarFrontImage: LinksMetadata | null;
  aadhaarBackImage: LinksMetadata | null;
  pan: string;
  panCardImage: LinksMetadata | null;

  // Social
  linkedinUrl: LinksMetadata | null;
  twitterUrl: LinksMetadata | null;
  instagramId: string | null;

  // Employment
  occupation: string | null;
  employerName: string | null;

  // Lifecycle
  tenantLifecycle: string | null;

  // Relations to extensions (ONE_TO_MANY from tenant perspective)
  tenantAttributions: EntityRelation<TenantAttributionWorkspaceEntity[]>;
  tenantRequirements: EntityRelation<TenantRequirementsWorkspaceEntity[]>;
  tenantQualifications: EntityRelation<TenantQualificationWorkspaceEntity[]>;
  tenantVisitSummaries: EntityRelation<TenantVisitSummaryWorkspaceEntity[]>;
  tenantSatisfactions: EntityRelation<TenantSatisfactionWorkspaceEntity[]>;

  // Deferred relations (Phase 2 - Property and Room)
  // currentProperty: EntityRelation<PropertyWorkspaceEntity> | null;
  // currentPropertyId: string | null;
  // currentRoom: EntityRelation<RoomWorkspaceEntity> | null;
  // currentRoomId: string | null;

  searchVector: string;
}
