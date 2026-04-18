import { type CurrencyMetadata, FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type VendorWorkspaceEntity = BaseWorkspaceEntity;
type FsinSpecificationWorkspaceEntity = BaseWorkspaceEntity;
type ItemWorkspaceEntity = BaseWorkspaceEntity;

const FSIN_CODE_FIELD_NAME = 'fsinCode';
const ITEM_NAME_FIELD_NAME = 'itemName';

export const SEARCH_FIELDS_FOR_FSIN: FieldTypeAndNameMetadata[] = [
  { name: FSIN_CODE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: ITEM_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class FsinWorkspaceEntity extends BaseWorkspaceEntity {
  fsinCode: string;
  itemName: string;
  category: string;
  uom: string;
  image: object | null;
  reorderPoint: number | null;
  annualDepreciation: CurrencyMetadata | null;
  perceivedValue: CurrencyMetadata | null;
  packaging: string | null;
  lego: number | null;
  status: string;
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
  fsinSpecifications: EntityRelation<FsinSpecificationWorkspaceEntity[]>;
  items: EntityRelation<ItemWorkspaceEntity[]>;
  searchVector: string;
}
