# Phase 6: Inventory (FSIN, Item) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 6 workspace entities (Fsin, FsinSpecification, Item, ItemState, ItemTransactionLinks) plus a supplementary PostgreSQL trigger that auto-creates Item records when a Purchase Order reaches Completed status. This forms the complete inventory backbone for furniture lifecycle management.

**Architecture:** FSIN (Furniture Standard Identification Number) is the product catalog entity -- a canonical definition of a furniture type with its vendor, pricing, depreciation, and specifications. Item represents individual physical units, each linked back to a FSIN and to the PO line that procured it. ItemState tracks the current location/status of each item through its lifecycle (BUY -> WIB -> PIB -> WORK -> DEAD). ItemTransactionLinks provides a join between items and financial transactions. The trigger `trg_create_items_on_po_completed` automates item creation at the database level when a PO is completed, inserting one Item + ItemState per unit quantity on each PO line.

**Tech Stack:** Twenty workspace entities, TypeScript, PostgreSQL 16

**Dependencies:** Phase 1 (Vendor entity), Phase 4 (Transaction, TransactionPurchaseOrder, PoLine entities)

---

## File Structure

```
packages/twenty-server/src/modules/flent/inventory/
  standard-objects/
    fsin.workspace-entity.ts                          # Task 1
    fsin-specification.workspace-entity.ts            # Task 4
    item.workspace-entity.ts                          # Task 6
    item-state.workspace-entity.ts                    # Task 8
    item-transaction-links.workspace-entity.ts        # Task 10
  constants/
    fsin-object-seed.constant.ts                      # Task 2
    fsin-field-seeds.constant.ts                      # Task 3
    fsin-relation-field-seeds.constant.ts             # Task 3
    fsin-specification-object-seed.constant.ts        # Task 5
    fsin-specification-field-seeds.constant.ts        # Task 5
    fsin-specification-relation-field-seeds.constant.ts  # Task 5
    item-object-seed.constant.ts                      # Task 7
    item-field-seeds.constant.ts                      # Task 7
    item-relation-field-seeds.constant.ts             # Task 7
    item-state-object-seed.constant.ts                # Task 9
    item-state-field-seeds.constant.ts                # Task 9
    item-state-relation-field-seeds.constant.ts       # Task 9
    item-transaction-links-object-seed.constant.ts    # Task 11
    item-transaction-links-field-seeds.constant.ts    # Task 11
    item-transaction-links-relation-field-seeds.constant.ts  # Task 11
    po-line-fsin-relation-field-seed.constant.ts      # Task 12

packages/twenty-server/src/database/typeorm/core/migrations/flent/
  1744400000000-phase6-trg-create-items-on-po-completed.ts  # Task 13
```

---

## Task 1: Fsin Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin.workspace-entity.ts`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/inventory/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/inventory/constants
```

- [ ] **Step 2: Create the workspace entity class**

```typescript
// fsin.workspace-entity.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin.workspace-entity.ts
git commit -m "feat(flent): add Fsin workspace entity class

Defines FsinWorkspaceEntity (Furniture Standard Identification Number)
extending BaseWorkspaceEntity with catalog fields, vendor relation,
and search vector on fsinCode + itemName.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Fsin Object Seed

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-object-seed.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// fsin-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const FSIN_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'FSINs',
  labelSingular: 'FSIN',
  namePlural: 'fsins',
  nameSingular: 'fsin',
  icon: 'IconBarcode',
  description: 'Furniture Standard Identification Number - canonical product catalog entry',
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-object-seed.constant.ts
git commit -m "feat(flent): add FSIN object metadata seed

Defines the FSIN custom object for the furniture product catalog
with label, name, icon, and description.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Fsin Field Seeds and Relation Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the field seeds**

```typescript
// fsin-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const FSIN_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'FSIN Code',
    name: 'fsinCode',
    icon: 'IconBarcode',
    description: 'Unique Furniture Standard Identification Number',
    isNullable: false,
    isUnique: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Item Name',
    name: 'itemName',
    icon: 'IconTag',
    description: 'Human-readable product name',
    isNullable: false,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Category',
    name: 'category',
    icon: 'IconCategory',
    description: 'Furniture category classification',
    isNullable: false,
    options: [
      { label: 'Bed', value: 'BED', position: 0, color: 'blue' },
      { label: 'Mattress', value: 'MATTRESS', position: 1, color: 'purple' },
      { label: 'Wardrobe', value: 'WARDROBE', position: 2, color: 'green' },
      { label: 'Study Table', value: 'STUDY_TABLE', position: 3, color: 'orange' },
      { label: 'Study Chair', value: 'STUDY_CHAIR', position: 4, color: 'yellow' },
      { label: 'Dining Table', value: 'DINING_TABLE', position: 5, color: 'turquoise' },
      { label: 'Dining Chair', value: 'DINING_CHAIR', position: 6, color: 'sky' },
      { label: 'Sofa', value: 'SOFA', position: 7, color: 'pink' },
      { label: 'Center Table', value: 'CENTER_TABLE', position: 8, color: 'red' },
      { label: 'TV Unit', value: 'TV_UNIT', position: 9, color: 'gray' },
      { label: 'Shoe Rack', value: 'SHOE_RACK', position: 10, color: 'blue' },
      { label: 'Bookshelf', value: 'BOOKSHELF', position: 11, color: 'purple' },
      { label: 'Curtain', value: 'CURTAIN', position: 12, color: 'green' },
      { label: 'Mirror', value: 'MIRROR', position: 13, color: 'orange' },
      { label: 'Appliance', value: 'APPLIANCE', position: 14, color: 'yellow' },
      { label: 'Kitchenware', value: 'KITCHENWARE', position: 15, color: 'turquoise' },
      { label: 'Bedding', value: 'BEDDING', position: 16, color: 'sky' },
      { label: 'Decor', value: 'DECOR', position: 17, color: 'pink' },
      { label: 'Storage', value: 'STORAGE', position: 18, color: 'red' },
      { label: 'Other', value: 'OTHER', position: 19, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Unit of Measurement',
    name: 'uom',
    icon: 'IconRuler',
    description: 'Unit of measurement for inventory counting',
    isNullable: false,
    options: [
      { label: 'Piece', value: 'PIECE', position: 0, color: 'blue' },
      { label: 'Set', value: 'SET', position: 1, color: 'green' },
      { label: 'Pair', value: 'PAIR', position: 2, color: 'purple' },
      { label: 'Meter', value: 'METER', position: 3, color: 'orange' },
      { label: 'Kg', value: 'KG', position: 4, color: 'yellow' },
      { label: 'Box', value: 'BOX', position: 5, color: 'turquoise' },
      { label: 'Roll', value: 'ROLL', position: 6, color: 'sky' },
      { label: 'Bundle', value: 'BUNDLE', position: 7, color: 'pink' },
    ],
  },
  {
    type: FieldMetadataType.LINKS,
    label: 'Image',
    name: 'image',
    icon: 'IconPhoto',
    description: 'Product reference image URL',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Reorder Point',
    name: 'reorderPoint',
    icon: 'IconAlertTriangle',
    description: 'Minimum stock level that triggers reorder',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Annual Depreciation',
    name: 'annualDepreciation',
    icon: 'IconTrendingDown',
    description: 'Yearly depreciation amount for accounting',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Perceived Value',
    name: 'perceivedValue',
    icon: 'IconCurrencyRupee',
    description: 'Current market/perceived value of the item type',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Packaging',
    name: 'packaging',
    icon: 'IconPackage',
    description: 'How the item is delivered',
    isNullable: true,
    options: [
      { label: 'Flatpack', value: 'FLATPACK', position: 0, color: 'blue' },
      { label: 'Assembled', value: 'ASSEMBLED', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Lego',
    name: 'lego',
    icon: 'IconPuzzle',
    description: 'Number of Lego (assembly complexity) units',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    icon: 'IconStatusChange',
    isNullable: false,
    defaultValue: "'ACTIVE'",
    options: [
      { label: 'Active', value: 'ACTIVE', position: 0, color: 'green' },
      { label: 'Discontinued', value: 'DISCONTINUED', position: 1, color: 'red' },
      { label: 'Draft', value: 'DRAFT', position: 2, color: 'gray' },
    ],
  },
];
```

- [ ] **Step 2: Create the relation field seeds**

```typescript
// fsin-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const FSIN_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'fsin',
    name: 'vendor',
    label: 'Vendor',
    icon: 'IconTool',
    targetObjectName: 'vendor',
    targetFieldLabel: 'FSINs',
    targetFieldIcon: 'IconBarcode',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-relation-field-seeds.constant.ts
git commit -m "feat(flent): add FSIN field seeds with 11 fields and vendor relation

Defines field metadata seeds for fsinCode (TEXT, unique), itemName (TEXT),
category (SELECT with 20 furniture categories), uom (SELECT with 8 units),
image (LINKS), reorderPoint (NUMBER), annualDepreciation (CURRENCY),
perceivedValue (CURRENCY), packaging (SELECT), lego (NUMBER), and status
(SELECT). MANY_TO_ONE relation to Vendor.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: FsinSpecification Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin-specification.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// fsin-specification.workspace-entity.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin-specification.workspace-entity.ts
git commit -m "feat(flent): add FsinSpecification workspace entity class

Defines FsinSpecificationWorkspaceEntity with dimensions, material,
finish, color, style, attribute fields and MANY_TO_ONE relation to FSIN.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: FsinSpecification Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// fsin-specification-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const FSIN_SPECIFICATION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'FSIN Specifications',
  labelSingular: 'FSIN Specification',
  namePlural: 'fsinSpecifications',
  nameSingular: 'fsinSpecification',
  icon: 'IconListDetails',
  description: 'Physical specifications and attributes for a FSIN product',
  skipNameField: true,
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// fsin-specification-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const FSIN_SPECIFICATION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Dimensions',
    name: 'dimensions',
    icon: 'IconRuler',
    description: 'Physical dimensions (e.g., 180x90x75 cm)',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Material',
    name: 'material',
    icon: 'IconWood',
    description: 'Primary material (e.g., Engineered Wood, Metal, Fabric)',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Finish',
    name: 'finish',
    icon: 'IconPaint',
    description: 'Surface finish (e.g., Matte, Glossy, Walnut Laminate)',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Color',
    name: 'color',
    icon: 'IconPalette',
    description: 'Primary color of the item',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Style',
    name: 'style',
    icon: 'IconBrush',
    description: 'Design style (e.g., Modern, Scandinavian, Industrial)',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Attribute',
    name: 'attribute',
    icon: 'IconAdjustments',
    description: 'Additional custom attribute or specification',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// fsin-specification-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const FSIN_SPECIFICATION_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'fsinSpecification',
    name: 'fsin',
    label: 'FSIN',
    icon: 'IconBarcode',
    targetObjectName: 'fsin',
    targetFieldLabel: 'Specifications',
    targetFieldIcon: 'IconListDetails',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-relation-field-seeds.constant.ts
git commit -m "feat(flent): add FsinSpecification object seed and 6 field seeds

Defines FsinSpecification custom object with dimensions, material,
finish, color, style, and attribute (all TEXT). MANY_TO_ONE relation
to FSIN.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Item Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/standard-objects/item.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// item.workspace-entity.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/standard-objects/item.workspace-entity.ts
git commit -m "feat(flent): add Item workspace entity class

Defines ItemWorkspaceEntity representing individual physical inventory
units with itemCode (searchable), serialNo, unitPrice (immutable from PO),
gstPercent, and relations to FSIN and PoLine.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Item Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// item-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ITEM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Items',
  labelSingular: 'Item',
  namePlural: 'items',
  nameSingular: 'item',
  icon: 'IconBox',
  description: 'Individual physical inventory unit tracked through its lifecycle',
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// item-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Item Code',
    name: 'itemCode',
    icon: 'IconQrcode',
    description: 'Unique identifier for this individual inventory unit',
    isNullable: false,
    isUnique: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Serial No',
    name: 'serialNo',
    icon: 'IconHash',
    description: 'Sequential serial number within the FSIN group',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Unit Price',
    name: 'unitPrice',
    icon: 'IconCurrencyRupee',
    description: 'Purchase price per unit (immutable, copied from PO line at creation)',
    isNullable: true,
    isUIReadOnly: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'GST Percent',
    name: 'gstPercent',
    icon: 'IconPercentage',
    description: 'GST percentage (immutable, copied from PO at creation)',
    isNullable: true,
    isUIReadOnly: true,
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// item-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'item',
    name: 'fsin',
    label: 'FSIN',
    icon: 'IconBarcode',
    targetObjectName: 'fsin',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconBox',
  },
  {
    sourceObjectName: 'item',
    name: 'poLine',
    label: 'PO Line',
    icon: 'IconFileInvoice',
    targetObjectName: 'poLine',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconBox',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/item-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-relation-field-seeds.constant.ts
git commit -m "feat(flent): add Item object seed with 4 fields and 2 relations

Defines Item custom object with itemCode (TEXT, unique), serialNo (NUMBER),
unitPrice (CURRENCY, UI read-only), gstPercent (NUMBER, UI read-only).
MANY_TO_ONE relations to FSIN and PoLine.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: ItemState Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/standard-objects/item-state.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// item-state.workspace-entity.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/standard-objects/item-state.workspace-entity.ts
git commit -m "feat(flent): add ItemState workspace entity class

Defines ItemStateWorkspaceEntity tracking lock status, physical
location (PID-RID or WH-rack), lifecycle state (BUY/WIB/WOB/PIB/POB/
WORK/DEAD), snapshots, and QA flag with MANY_TO_ONE to Item.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: ItemState Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-state-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-state-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-state-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// item-state-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ITEM_STATE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Item States',
  labelSingular: 'Item State',
  namePlural: 'itemStates',
  nameSingular: 'itemState',
  icon: 'IconMapPin',
  description: 'Current location, lifecycle state, and condition tracking for an inventory item',
  skipNameField: true,
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// item-state-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_STATE_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'Lock',
    name: 'lock',
    icon: 'IconLock',
    description: 'Whether the item is locked (reserved for a specific property/operation)',
    isNullable: false,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Locked By PFS',
    name: 'lockByPfs',
    icon: 'IconUserCheck',
    description: 'PFS (Property Furnishing Specialist) who locked the item',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Locked At',
    name: 'lockedAt',
    icon: 'IconClockLock',
    description: 'Timestamp when the item was locked',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Location',
    name: 'location',
    icon: 'IconMapPin',
    description: 'Current location: PID-RID for deployed items or WH-rack for warehouse items',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'State',
    name: 'state',
    icon: 'IconStatusChange',
    description: 'Current lifecycle state of the inventory item',
    isNullable: false,
    defaultValue: "'BUY'",
    options: [
      { label: 'BUY', value: 'BUY', position: 0, color: 'blue' },
      { label: 'WIB', value: 'WIB', position: 1, color: 'sky' },
      { label: 'WOB', value: 'WOB', position: 2, color: 'turquoise' },
      { label: 'PIB', value: 'PIB', position: 3, color: 'green' },
      { label: 'POB', value: 'POB', position: 4, color: 'orange' },
      { label: 'WORK', value: 'WORK', position: 5, color: 'purple' },
      { label: 'DEAD', value: 'DEAD', position: 6, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'State Time',
    name: 'stateTime',
    icon: 'IconClock',
    description: 'Timestamp when the item entered the current state',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Latest Snapshot Date',
    name: 'latestSnapshotDate',
    icon: 'IconCalendarEvent',
    description: 'Date of the most recent condition snapshot/photo',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    label: 'Snapshot',
    name: 'snapshot',
    icon: 'IconCamera',
    description: 'URL to the latest condition snapshot image',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Utilised At',
    name: 'utilisedAt',
    icon: 'IconClockCheck',
    description: 'Timestamp when the item was first placed in a property',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'QA Flag',
    name: 'qaFlag',
    icon: 'IconShieldCheck',
    description: 'Quality assurance inspection result',
    isNullable: true,
    options: [
      { label: 'Yes', value: 'YES', position: 0, color: 'green' },
      { label: 'No', value: 'NO', position: 1, color: 'red' },
    ],
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// item-state-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_STATE_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'itemState',
    name: 'item',
    label: 'Item',
    icon: 'IconBox',
    targetObjectName: 'item',
    targetFieldLabel: 'Item States',
    targetFieldIcon: 'IconMapPin',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/item-state-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-state-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-state-relation-field-seeds.constant.ts
git commit -m "feat(flent): add ItemState object seed with 10 fields and item relation

Defines ItemState custom object with lock (BOOLEAN), lockByPfs (TEXT),
lockedAt (DATE_TIME), location (TEXT), state (SELECT with 7 lifecycle
states: BUY/WIB/WOB/PIB/POB/WORK/DEAD), stateTime (DATE_TIME),
latestSnapshotDate (DATE_TIME), snapshot (LINKS), utilisedAt (DATE_TIME),
qaFlag (SELECT). MANY_TO_ONE relation to Item.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: ItemTransactionLinks Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/standard-objects/item-transaction-links.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// item-transaction-links.workspace-entity.ts
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type ItemWorkspaceEntityRef = BaseWorkspaceEntity;
type TransactionWorkspaceEntity = BaseWorkspaceEntity;

export class ItemTransactionLinksWorkspaceEntity extends BaseWorkspaceEntity {
  billDocumentId: string | null;
  item: EntityRelation<ItemWorkspaceEntityRef> | null;
  itemId: string | null;
  txnNo: EntityRelation<TransactionWorkspaceEntity> | null;
  txnNoId: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/standard-objects/item-transaction-links.workspace-entity.ts
git commit -m "feat(flent): add ItemTransactionLinks workspace entity class

Defines ItemTransactionLinksWorkspaceEntity as a join entity between
Item and Transaction with an additional billDocumentId field.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: ItemTransactionLinks Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// item-transaction-links-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ITEM_TRANSACTION_LINKS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Item Transaction Links',
  labelSingular: 'Item Transaction Link',
  namePlural: 'itemTransactionLinks',
  nameSingular: 'itemTransactionLink',
  icon: 'IconLink',
  description: 'Join entity linking individual inventory items to financial transactions',
  skipNameField: true,
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// item-transaction-links-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_TRANSACTION_LINKS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Bill Document ID',
    name: 'billDocumentId',
    icon: 'IconFileInvoice',
    description: 'Reference to the external billing document',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// item-transaction-links-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'itemTransactionLink',
    name: 'item',
    label: 'Item',
    icon: 'IconBox',
    targetObjectName: 'item',
    targetFieldLabel: 'Transaction Links',
    targetFieldIcon: 'IconLink',
  },
  {
    sourceObjectName: 'itemTransactionLink',
    name: 'txnNo',
    label: 'Transaction',
    icon: 'IconReceipt',
    targetObjectName: 'transaction',
    targetFieldLabel: 'Item Transaction Links',
    targetFieldIcon: 'IconLink',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-relation-field-seeds.constant.ts
git commit -m "feat(flent): add ItemTransactionLinks object seed with 1 field and 2 relations

Defines ItemTransactionLinks join entity with billDocumentId (TEXT)
and MANY_TO_ONE relations to both Item and Transaction.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Cross-Wire PoLine-to-FSIN Relation

**Files:**
- Create: `packages/twenty-server/src/modules/flent/inventory/constants/po-line-fsin-relation-field-seed.constant.ts`

**Why:** After the FSIN entity exists, each PO Line needs a reference to the FSIN it orders. This is seeded as a junction field from PoLine to FSIN, creating a MANY_TO_ONE on PoLine and a ONE_TO_MANY inverse (`poLines`) on FSIN.

- [ ] **Step 1: Create the cross-wire relation seed**

```typescript
// po-line-fsin-relation-field-seed.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

// This seed is added to the junctionFields array in DevSeederMetadataService.
// It creates PoLine.fsin (MANY_TO_ONE) and FSIN.poLines (ONE_TO_MANY inverse).

export const PO_LINE_FSIN_RELATION_FIELD_SEED: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
} = {
  sourceObjectName: 'poLine',
  name: 'fsin',
  label: 'FSIN',
  icon: 'IconBarcode',
  targetObjectName: 'fsin',
  targetFieldLabel: 'PO Lines',
  targetFieldIcon: 'IconFileInvoice',
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/inventory/constants/po-line-fsin-relation-field-seed.constant.ts
git commit -m "feat(flent): add PoLine-to-FSIN cross-wire relation seed

Creates PoLine.fsin MANY_TO_ONE and FSIN.poLines ONE_TO_MANY inverse
so each PO line references the FSIN product it orders.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: PO Completion Trigger (TypeORM Migration)

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000000-phase6-trg-create-items-on-po-completed.ts`

**Why:** When a Purchase Order's `poStatus` changes to `'Completed'`, the system must auto-create Item and ItemState records for each unit on every PO line. This trigger runs at the PostgreSQL level so items are created regardless of whether the status change comes from the API, a direct database update, or an import script. The trigger function reads from PO line records, generates auto-incrementing item codes per FSIN, and inserts both the Item row and its initial ItemState (state=`'BUY'`, stateTime=`now()`).

- [ ] **Step 1: Create the flent migrations directory if needed**

```bash
mkdir -p packages/twenty-server/src/database/typeorm/core/migrations/flent
```

- [ ] **Step 2: Create the trigger migration**

```typescript
// 1744400000000-phase6-trg-create-items-on-po-completed.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase6TrgCreateItemsOnPoCompleted1744400000000
  implements MigrationInterface
{
  name = 'Phase6TrgCreateItemsOnPoCompleted1744400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the trigger function
    // This function fires on UPDATE of the transactionPurchaseOrder table.
    // When poStatus transitions to 'Completed', it iterates through all
    // PO lines for that transaction and creates Item + ItemState records.
    //
    // NOTE: Table and column names below use Twenty's workspace schema
    // naming convention. The actual table names in the workspace schema
    // are the camelCase entity names converted to snake_case with underscores.
    // Adjust the schema reference (e.g., workspace_<id>) at deployment time
    // or use a schema search path.
    //
    // For workspace entities, tables live in the workspace-specific schema.
    // This trigger must be created per-workspace or use a dynamic schema approach.
    // The implementation below uses a parameterized schema placeholder that
    // should be replaced during workspace provisioning.

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trg_create_items_on_po_completed()
      RETURNS TRIGGER AS $$
      DECLARE
        v_po_line RECORD;
        v_unit_idx INTEGER;
        v_item_id UUID;
        v_item_code TEXT;
        v_existing_count INTEGER;
        v_fsin_code TEXT;
        v_schema_name TEXT;
      BEGIN
        -- Only fire when poStatus changes TO 'Completed'
        IF (TG_OP = 'UPDATE'
            AND NEW."poStatus" = 'COMPLETED'
            AND (OLD."poStatus" IS DISTINCT FROM 'COMPLETED'))
        THEN
          -- Get the schema name from the TG_TABLE_SCHEMA
          v_schema_name := TG_TABLE_SCHEMA;

          -- Iterate through all PO lines for this transaction
          FOR v_po_line IN
            EXECUTE format(
              'SELECT pl.id AS po_line_id,
                      pl."fsinId" AS fsin_id,
                      pl."unitPrice" AS unit_price,
                      pl."unitPriceCurrencyCode" AS unit_price_currency_code,
                      pl."quantity" AS quantity,
                      f."fsinCode" AS fsin_code
               FROM %I."poLine" pl
               JOIN %I."fsin" f ON f.id = pl."fsinId"
               WHERE pl."transactionId" = $1',
              v_schema_name, v_schema_name
            )
            USING NEW.id
          LOOP
            -- Count existing items for this FSIN to generate sequential codes
            EXECUTE format(
              'SELECT COUNT(*) FROM %I."item" WHERE "fsinId" = $1',
              v_schema_name
            )
            INTO v_existing_count
            USING v_po_line.fsin_id;

            v_fsin_code := v_po_line.fsin_code;

            -- Create one Item + ItemState per unit in the PO line quantity
            FOR v_unit_idx IN 1..COALESCE(v_po_line.quantity, 0)
            LOOP
              v_item_id := gen_random_uuid();
              v_existing_count := v_existing_count + 1;

              -- Generate item code: FSIN_CODE-SERIAL (e.g., BED-001-0042)
              v_item_code := v_fsin_code || '-' || LPAD(v_existing_count::TEXT, 4, '0');

              -- Insert Item record
              EXECUTE format(
                'INSERT INTO %I."item"
                  (id, "itemCode", "serialNo",
                   "unitPriceAmountMicros", "unitPriceCurrencyCode",
                   "gstPercent", "fsinId", "poLineId",
                   "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())',
                v_schema_name
              )
              USING
                v_item_id,
                v_item_code,
                v_existing_count,
                v_po_line.unit_price,
                v_po_line.unit_price_currency_code,
                NEW."gstPercent",
                v_po_line.fsin_id,
                v_po_line.po_line_id;

              -- Insert ItemState record with initial state BUY
              EXECUTE format(
                'INSERT INTO %I."itemState"
                  (id, "lock", "state", "stateTime", "itemId",
                   "createdAt", "updatedAt")
                 VALUES ($1, false, $2, now(), $3, now(), now())',
                v_schema_name
              )
              USING
                gen_random_uuid(),
                'BUY',
                v_item_id;
            END LOOP;
          END LOOP;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    -- Add a comment documenting the trigger function
    await queryRunner.query(`
      COMMENT ON FUNCTION trg_create_items_on_po_completed() IS
        'Phase 6 trigger: When a PO status changes to Completed, auto-creates '
        'Item and ItemState records for each unit on every PO line. '
        'Item receives: auto-generated itemCode, fsinId from PO line, '
        'unitPrice from PO line, gstPercent from PO. '
        'ItemState receives: state=BUY, stateTime=now(). '
        'Created by Phase6TrgCreateItemsOnPoCompleted1744400000000.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS trg_create_items_on_po_completed() CASCADE`
    );
  }
}
```

- [ ] **Step 3: Verify the migration compiles**

```bash
cd packages/twenty-server && npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "phase6" || echo "No TypeScript errors for Phase 6 trigger migration"
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000000-phase6-trg-create-items-on-po-completed.ts
git commit -m "feat(flent): add PO completion trigger for auto-creating inventory items

Creates PostgreSQL trigger function trg_create_items_on_po_completed()
that fires when transactionPurchaseOrder.poStatus changes to 'Completed'.
For each PO line: creates qty Item records with auto-generated itemCode
(FSIN_CODE-SERIAL), unitPrice from PO line, gstPercent from PO, and
creates initial ItemState with state='BUY' and stateTime=now(). Uses
dynamic schema references for workspace compatibility.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Trigger Attachment Migration (Per-Workspace)

**Files:**
- Create: `packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000001-phase6-attach-po-trigger-to-workspace.ts`

**Why:** The trigger function from Task 13 exists in the database but is not attached to any table. In Twenty's workspace architecture, each workspace has its own schema. This migration provides a reusable helper that attaches the trigger to the `transactionPurchaseOrder` table in a given workspace schema. It should be run once per workspace or integrated into the workspace provisioning flow.

- [ ] **Step 1: Create the trigger attachment migration**

```typescript
// 1744400000001-phase6-attach-po-trigger-to-workspace.ts
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Phase6AttachPoTriggerToWorkspace1744400000001
  implements MigrationInterface
{
  name = 'Phase6AttachPoTriggerToWorkspace1744400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration creates a helper function that can be called to attach
    // the PO completion trigger to a specific workspace schema.
    // Usage: SELECT attach_po_completion_trigger('workspace_abc123');
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION attach_po_completion_trigger(p_schema_name TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE format(
          'CREATE TRIGGER trg_po_completed_create_items
           AFTER UPDATE ON %I."transactionPurchaseOrder"
           FOR EACH ROW
           EXECUTE FUNCTION trg_create_items_on_po_completed()',
          p_schema_name
        );
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      COMMENT ON FUNCTION attach_po_completion_trigger(TEXT) IS
        'Helper to attach the PO completion trigger to a workspace schema. '
        'Call with: SELECT attach_po_completion_trigger(''workspace_<id>'');';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS attach_po_completion_trigger(TEXT) CASCADE`
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000001-phase6-attach-po-trigger-to-workspace.ts
git commit -m "feat(flent): add helper to attach PO trigger per workspace schema

Creates attach_po_completion_trigger(schema_name) function that attaches
the trg_create_items_on_po_completed trigger to the transactionPurchaseOrder
table in the specified workspace schema.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Register Inventory Seeds in DevSeederMetadataService

**Files:**
- Modify: `packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts`

- [ ] **Step 1: Add imports**

Add these imports after the existing imports in the file:

```typescript
import { FSIN_OBJECT_SEED } from 'src/modules/flent/inventory/constants/fsin-object-seed.constant';
import { FSIN_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-field-seeds.constant';
import { FSIN_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-relation-field-seeds.constant';
import { FSIN_SPECIFICATION_OBJECT_SEED } from 'src/modules/flent/inventory/constants/fsin-specification-object-seed.constant';
import { FSIN_SPECIFICATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-specification-field-seeds.constant';
import { FSIN_SPECIFICATION_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-specification-relation-field-seeds.constant';
import { ITEM_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-object-seed.constant';
import { ITEM_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-field-seeds.constant';
import { ITEM_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-relation-field-seeds.constant';
import { ITEM_STATE_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-state-object-seed.constant';
import { ITEM_STATE_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-state-field-seeds.constant';
import { ITEM_STATE_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-state-relation-field-seeds.constant';
import { ITEM_TRANSACTION_LINKS_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-transaction-links-object-seed.constant';
import { ITEM_TRANSACTION_LINKS_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-transaction-links-field-seeds.constant';
import { ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-transaction-links-relation-field-seeds.constant';
import { PO_LINE_FSIN_RELATION_FIELD_SEED } from 'src/modules/flent/inventory/constants/po-line-fsin-relation-field-seed.constant';
```

- [ ] **Step 2: Add inventory objects to the workspace config**

In the `SEED_APPLE_WORKSPACE_ID` config, add these entries to the `objects` array:

```typescript
// Flent Inventory entities
{ seed: FSIN_OBJECT_SEED, fields: FSIN_FIELD_SEEDS },
{ seed: FSIN_SPECIFICATION_OBJECT_SEED, fields: FSIN_SPECIFICATION_FIELD_SEEDS },
{ seed: ITEM_OBJECT_SEED, fields: ITEM_FIELD_SEEDS },
{ seed: ITEM_STATE_OBJECT_SEED, fields: ITEM_STATE_FIELD_SEEDS },
{ seed: ITEM_TRANSACTION_LINKS_OBJECT_SEED, fields: ITEM_TRANSACTION_LINKS_FIELD_SEEDS },
```

- [ ] **Step 3: Add inventory junction fields to the workspace config**

In the `SEED_APPLE_WORKSPACE_ID` config, add these entries to the `junctionFields` array:

```typescript
// FSIN -> Vendor
...FSIN_RELATION_FIELD_SEEDS,
// FsinSpecification -> FSIN
...FSIN_SPECIFICATION_RELATION_FIELD_SEEDS,
// Item -> FSIN, PoLine
...ITEM_RELATION_FIELD_SEEDS,
// ItemState -> Item
...ITEM_STATE_RELATION_FIELD_SEEDS,
// ItemTransactionLinks -> Item, Transaction
...ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS,
// PoLine -> FSIN (cross-wire)
PO_LINE_FSIN_RELATION_FIELD_SEED,
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts
git commit -m "feat(flent): register Inventory entity seeds in DevSeederMetadataService

Adds FSIN, FsinSpecification, Item, ItemState, and ItemTransactionLinks
objects with their field and relation seeds. Also adds the PoLine-to-FSIN
cross-wire relation. All entities are created during workspace seeding.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Verification and Integration Test

- [ ] **Step 1: Verify all files exist with correct structure**

```bash
# Verify directory structure
find packages/twenty-server/src/modules/flent/inventory -type f | sort

# Expected output:
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/fsin-specification-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-state-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-state-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-state-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/item-transaction-links-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/inventory/constants/po-line-fsin-relation-field-seed.constant.ts
# packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin-specification.workspace-entity.ts
# packages/twenty-server/src/modules/flent/inventory/standard-objects/fsin.workspace-entity.ts
# packages/twenty-server/src/modules/flent/inventory/standard-objects/item-state.workspace-entity.ts
# packages/twenty-server/src/modules/flent/inventory/standard-objects/item-transaction-links.workspace-entity.ts
# packages/twenty-server/src/modules/flent/inventory/standard-objects/item.workspace-entity.ts

# Verify trigger migrations
find packages/twenty-server/src/database/typeorm/core/migrations/flent -name "*phase6*" | sort

# Expected output:
# packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000000-phase6-trg-create-items-on-po-completed.ts
# packages/twenty-server/src/database/typeorm/core/migrations/flent/1744400000001-phase6-attach-po-trigger-to-workspace.ts
```

- [ ] **Step 2: TypeScript compilation check**

```bash
cd packages/twenty-server && npx tsc --noEmit --project tsconfig.json 2>&1 | head -50
```

- [ ] **Step 3: Verify field counts match specification**

| Entity | Data Fields | Relation Fields | Total Seeds |
|--------|-------------|-----------------|-------------|
| FSIN | 11 | 1 (vendor) | 12 |
| FsinSpecification | 6 | 1 (fsin) | 7 |
| Item | 4 | 2 (fsin, poLine) | 6 |
| ItemState | 10 | 1 (item) | 11 |
| ItemTransactionLinks | 1 | 2 (item, txnNo) | 3 |
| **Totals** | **32** | **7** | **39** |
| Cross-wire: PoLine.fsin | - | 1 | 1 |
| **Grand Total** | **32** | **8** | **40** |

- [ ] **Step 4: Verify trigger function SQL syntax**

```bash
# Connect to a local test database and check the trigger compiles
psql -c "
  -- This will fail if syntax is invalid
  SELECT pg_get_functiondef(oid)
  FROM pg_proc
  WHERE proname = 'trg_create_items_on_po_completed';
" 2>&1 || echo "Trigger not yet deployed (expected if migration has not run)"
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(flent): complete Phase 6 Inventory implementation

Phase 6 delivers 5 workspace entities (FSIN, FsinSpecification, Item,
ItemState, ItemTransactionLinks) with 32 data fields, 8 relations
(including PoLine-to-FSIN cross-wire), and 2 trigger migrations for
auto-creating Item+ItemState records when a PO reaches Completed status.
Search vectors configured for fsinCode, itemName, and itemCode.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Entity Reference Summary

### FSIN (base -- Furniture Standard Identification Number)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| createdAt | DATE_TIME | BaseWorkspaceEntity |
| updatedAt | DATE_TIME | BaseWorkspaceEntity |
| deletedAt | DATE_TIME | BaseWorkspaceEntity |
| fsinCode | TEXT | Unique, searchable |
| itemName | TEXT | Searchable |
| category | SELECT | 20 furniture categories |
| uom | SELECT | 8 units of measurement |
| image | LINKS | Product reference image |
| reorderPoint | NUMBER | Min stock trigger |
| annualDepreciation | CURRENCY | Yearly depreciation |
| perceivedValue | CURRENCY | Market value |
| packaging | SELECT | Flatpack, Assembled |
| lego | NUMBER | Assembly complexity |
| status | SELECT | Active, Discontinued, Draft |
| vendorId | UUID FK | MANY_TO_ONE -> Vendor |

### FsinSpecification (extension)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| dimensions | TEXT | e.g., 180x90x75 cm |
| material | TEXT | e.g., Engineered Wood |
| finish | TEXT | e.g., Matte, Walnut Laminate |
| color | TEXT | Primary color |
| style | TEXT | e.g., Modern, Scandinavian |
| attribute | TEXT | Custom attribute |
| fsinId | UUID FK | MANY_TO_ONE -> FSIN |

### Item (base -- individual physical unit)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| itemCode | TEXT | Unique, searchable, auto-generated |
| serialNo | NUMBER | Sequential per FSIN |
| unitPrice | CURRENCY | Immutable from PO, UI read-only |
| gstPercent | NUMBER | Immutable from PO, UI read-only |
| fsinId | UUID FK | MANY_TO_ONE -> FSIN |
| poLineId | UUID FK | MANY_TO_ONE -> PoLine |

### ItemState (extension)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| lock | BOOLEAN | Default false |
| lockByPfs | TEXT | PFS who locked |
| lockedAt | DATE_TIME | Lock timestamp |
| location | TEXT | PID-RID or WH-rack |
| state | SELECT | BUY/WIB/WOB/PIB/POB/WORK/DEAD |
| stateTime | DATE_TIME | State entry time |
| latestSnapshotDate | DATE_TIME | Last photo date |
| snapshot | LINKS | Condition photo URL |
| utilisedAt | DATE_TIME | First deployment |
| qaFlag | SELECT | Yes, No |
| itemId | UUID FK | MANY_TO_ONE -> Item |

### ItemTransactionLinks (extension)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| billDocumentId | TEXT | External billing reference |
| itemId | UUID FK | MANY_TO_ONE -> Item |
| txnNoId | UUID FK | MANY_TO_ONE -> Transaction |

### Cross-Wire: PoLine.fsin

| Field | Type | Notes |
|-------|------|-------|
| fsinId | UUID FK | MANY_TO_ONE -> FSIN (added to PoLine) |

### Trigger: trg_create_items_on_po_completed

| Aspect | Value |
|--------|-------|
| Fires on | UPDATE of transactionPurchaseOrder |
| Condition | poStatus changes to 'COMPLETED' |
| For each PO line | Creates `quantity` Item records |
| Item fields set | itemCode (auto), serialNo (auto), unitPrice (from PO line), gstPercent (from PO), fsinId (from PO line), poLineId |
| ItemState fields set | state='BUY', stateTime=now(), lock=false |
| Item code format | FSIN_CODE-NNNN (e.g., BED-001-0042) |
