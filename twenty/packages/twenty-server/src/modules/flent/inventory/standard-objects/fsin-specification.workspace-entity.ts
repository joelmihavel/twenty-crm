import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type FsinWorkspaceEntityRef = BaseWorkspaceEntity;

export class FsinSpecificationWorkspaceEntity extends BaseWorkspaceEntity {
  dimensions: string | null;
  material: string | null;
  finish: string | null;
  color: string | null;
  style: string | null;
  attribute: string | null;
  fsin: EntityRelation<FsinWorkspaceEntityRef> | null;
  fsinId: string | null;
}
