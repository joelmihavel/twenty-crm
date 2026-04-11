import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type ItemWorkspaceEntityRef = BaseWorkspaceEntity;

export class ItemStateWorkspaceEntity extends BaseWorkspaceEntity {
  lock: boolean;
  lockByPfs: string | null;
  lockedAt: Date | null;
  location: string | null;
  state: string;
  stateTime: Date | null;
  latestSnapshotDate: Date | null;
  snapshot: object | null;
  utilisedAt: Date | null;
  qaFlag: string | null;
  item: EntityRelation<ItemWorkspaceEntityRef> | null;
  itemId: string | null;
}
