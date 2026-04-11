import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomAvailabilityWorkspaceEntity extends BaseWorkspaceEntity {
  roomStatus: string | null;
  currentTenantName: string | null;
  availableFrom: Date | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;

  // Deferred relation (Phase 3)
  // currentContract: EntityRelation<ContractWorkspaceEntity> | null;
  // currentContractId: string | null;
}
