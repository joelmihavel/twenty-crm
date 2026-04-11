import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { type PropertyLeadStageWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property-lead-stage.workspace-entity';
import { type PropertyActiveWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property-active.workspace-entity';
import { type PropertyChurnedWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property-churned.workspace-entity';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

const PID_FIELD_NAME = 'pid';

export const SEARCH_FIELDS_FOR_PROPERTY: FieldTypeAndNameMetadata[] = [
  { name: PID_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class PropertyWorkspaceEntity extends BaseWorkspaceEntity {
  // Identity
  pid: string;
  lifecycleStatus: string | null;
  propertyType: string | null;
  cluster: string | null;

  // Cross-domain relations
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
  dealOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  dealOwnerId: string | null;
  psmOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  psmOwnerId: string | null;

  // Relations to lifecycle extensions
  propertyLeadStages: EntityRelation<PropertyLeadStageWorkspaceEntity[]>;
  propertyActives: EntityRelation<PropertyActiveWorkspaceEntity[]>;
  propertyChurneds: EntityRelation<PropertyChurnedWorkspaceEntity[]>;

  // Relation to rooms
  rooms: EntityRelation<RoomWorkspaceEntity[]>;

  searchVector: string;
}
