import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomSpecificationsWorkspaceEntity extends BaseWorkspaceEntity {
  attachedBathroom: boolean | null;
  balcony: boolean | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
