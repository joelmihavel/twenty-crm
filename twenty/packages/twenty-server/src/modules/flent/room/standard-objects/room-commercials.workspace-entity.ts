import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomCommercialsWorkspaceEntity extends BaseWorkspaceEntity {
  baseRent: CurrencyMetadata | null;
  maintenanceFee: CurrencyMetadata | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
