import { type CurrencyMetadata, FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type FsinWorkspaceEntityRef = BaseWorkspaceEntity;
type PoLineWorkspaceEntity = BaseWorkspaceEntity;
type ItemStateWorkspaceEntity = BaseWorkspaceEntity;
type ItemTransactionLinksWorkspaceEntity = BaseWorkspaceEntity;

const ITEM_CODE_FIELD_NAME = 'itemCode';

export const SEARCH_FIELDS_FOR_ITEM: FieldTypeAndNameMetadata[] = [
  { name: ITEM_CODE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class ItemWorkspaceEntity extends BaseWorkspaceEntity {
  itemCode: string;
  serialNo: number | null;
  unitPrice: CurrencyMetadata | null;
  gstPercent: number | null;
  fsin: EntityRelation<FsinWorkspaceEntityRef> | null;
  fsinId: string | null;
  poLine: EntityRelation<PoLineWorkspaceEntity> | null;
  poLineId: string | null;
  itemStates: EntityRelation<ItemStateWorkspaceEntity[]>;
  itemTransactionLinks: EntityRelation<ItemTransactionLinksWorkspaceEntity[]>;
  searchVector: string;
}
