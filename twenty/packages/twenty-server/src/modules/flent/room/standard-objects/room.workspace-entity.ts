import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';
import { type RoomSpecificationsWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room-specifications.workspace-entity';
import { type RoomFurnishingWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room-furnishing.workspace-entity';
import { type RoomCommercialsWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room-commercials.workspace-entity';
import { type RoomAvailabilityWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room-availability.workspace-entity';

const RID_FIELD_NAME = 'rid';

export const SEARCH_FIELDS_FOR_ROOM: FieldTypeAndNameMetadata[] = [
  { name: RID_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class RoomWorkspaceEntity extends BaseWorkspaceEntity {
  rid: string;

  // Parent relation
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;

  // Extension relations
  roomSpecifications: EntityRelation<RoomSpecificationsWorkspaceEntity[]>;
  roomFurnishings: EntityRelation<RoomFurnishingWorkspaceEntity[]>;
  roomCommercials: EntityRelation<RoomCommercialsWorkspaceEntity[]>;
  roomAvailabilities: EntityRelation<RoomAvailabilityWorkspaceEntity[]>;

  searchVector: string;
}
