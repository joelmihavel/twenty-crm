# Phase 2: Property Layer (PID, RID, Overheads) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 18 workspace entities for the Property layer (Property 4, Room 5, Overhead 9) using Twenty's metadata seed system, establishing the physical asset hierarchy (Property -> Room) and overhead cost tracking with cross-domain relations to Phase 1 entities (Merchant, WorkspaceMember).

**Architecture:** Three entity groups form the property layer. Property (PID) uses base + 3 lifecycle extensions (lead, active, churned). Room (RID) uses base + 4 aspect extensions (specifications, furnishing, commercials, availability). Overhead uses base + 8 category-specific extensions (maintenance, wifi, electricity, DG, water, water purifier, gas, helper). Relations connect Property to Merchant (landlord), Room to Property (parent), and Overhead to both Property and Merchant.

**Tech Stack:** Twenty workspace entities, TypeScript, PostgreSQL 16, FieldMetadataType from twenty-shared

**Dependencies:** Phase 1 (Tenant, Merchant, Vendor entities must exist for cross-references)

---

## File Structure

```
packages/twenty-server/src/modules/flent/
├── property/
│   ├── standard-objects/
│   │   ├── property.workspace-entity.ts
│   │   ├── property-lead-stage.workspace-entity.ts
│   │   ├── property-active.workspace-entity.ts
│   │   └── property-churned.workspace-entity.ts
│   └── constants/
│       ├── property-object-seed.constant.ts
│       ├── property-field-seeds.constant.ts
│       ├── property-relation-seeds.constant.ts
│       ├── property-lead-stage-object-seed.constant.ts
│       ├── property-lead-stage-field-seeds.constant.ts
│       ├── property-lead-stage-relation-seeds.constant.ts
│       ├── property-active-object-seed.constant.ts
│       ├── property-active-field-seeds.constant.ts
│       ├── property-active-relation-seeds.constant.ts
│       ├── property-churned-object-seed.constant.ts
│       ├── property-churned-field-seeds.constant.ts
│       └── property-churned-relation-seeds.constant.ts
├── room/
│   ├── standard-objects/
│   │   ├── room.workspace-entity.ts
│   │   ├── room-specifications.workspace-entity.ts
│   │   ├── room-furnishing.workspace-entity.ts
│   │   ├── room-commercials.workspace-entity.ts
│   │   └── room-availability.workspace-entity.ts
│   └── constants/
│       ├── room-object-seed.constant.ts
│       ├── room-field-seeds.constant.ts
│       ├── room-relation-seeds.constant.ts
│       ├── room-specifications-object-seed.constant.ts
│       ├── room-specifications-field-seeds.constant.ts
│       ├── room-specifications-relation-seeds.constant.ts
│       ├── room-furnishing-object-seed.constant.ts
│       ├── room-furnishing-field-seeds.constant.ts
│       ├── room-furnishing-relation-seeds.constant.ts
│       ├── room-commercials-object-seed.constant.ts
│       ├── room-commercials-field-seeds.constant.ts
│       ├── room-commercials-relation-seeds.constant.ts
│       ├── room-availability-object-seed.constant.ts
│       ├── room-availability-field-seeds.constant.ts
│       └── room-availability-relation-seeds.constant.ts
└── overhead/
    ├── standard-objects/
    │   ├── overhead.workspace-entity.ts
    │   ├── overhead-maintenance.workspace-entity.ts
    │   ├── overhead-wifi.workspace-entity.ts
    │   ├── overhead-electricity.workspace-entity.ts
    │   ├── overhead-dg.workspace-entity.ts
    │   ├── overhead-water.workspace-entity.ts
    │   ├── overhead-water-purifier.workspace-entity.ts
    │   ├── overhead-gas.workspace-entity.ts
    │   └── overhead-helper.workspace-entity.ts
    └── constants/
        ├── overhead-object-seed.constant.ts
        ├── overhead-field-seeds.constant.ts
        ├── overhead-relation-seeds.constant.ts
        ├── overhead-maintenance-object-seed.constant.ts
        ├── overhead-maintenance-field-seeds.constant.ts
        ├── overhead-maintenance-relation-seeds.constant.ts
        ├── overhead-wifi-object-seed.constant.ts
        ├── overhead-wifi-field-seeds.constant.ts
        ├── overhead-wifi-relation-seeds.constant.ts
        ├── overhead-electricity-object-seed.constant.ts
        ├── overhead-electricity-field-seeds.constant.ts
        ├── overhead-electricity-relation-seeds.constant.ts
        ├── overhead-dg-object-seed.constant.ts
        ├── overhead-dg-field-seeds.constant.ts
        ├── overhead-dg-relation-seeds.constant.ts
        ├── overhead-water-object-seed.constant.ts
        ├── overhead-water-field-seeds.constant.ts
        ├── overhead-water-relation-seeds.constant.ts
        ├── overhead-water-purifier-object-seed.constant.ts
        ├── overhead-water-purifier-field-seeds.constant.ts
        ├── overhead-water-purifier-relation-seeds.constant.ts
        ├── overhead-gas-object-seed.constant.ts
        ├── overhead-gas-field-seeds.constant.ts
        ├── overhead-gas-relation-seeds.constant.ts
        ├── overhead-helper-object-seed.constant.ts
        ├── overhead-helper-field-seeds.constant.ts
        └── overhead-helper-relation-seeds.constant.ts
```

---

## Task 1: Property Base Entity

**Files:**
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/standard-objects/property.workspace-entity.ts`

The Property base entity holds the PID identifier, lifecycle status, property type, cluster, and cross-domain relations to Merchant (landlord) and WorkspaceMember (deal owner, PSM owner).

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/property/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/property/constants
```

- [ ] **Step 2: Create Property object seed**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Properties',
  labelSingular: 'Property',
  namePlural: 'properties',
  nameSingular: 'property',
  icon: 'IconBuilding',
  description: 'A physical property identified by PID with lifecycle tracking',
};
```

- [ ] **Step 3: Create Property field seeds**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROPERTY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'pid',
    label: 'PID',
    description: 'Unique property identifier',
    icon: 'IconHash',
    isNullable: false,
    isUnique: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'lifecycleStatus',
    label: 'Lifecycle Status',
    description: 'Current lifecycle stage of the property',
    icon: 'IconTimeline',
    options: [
      { label: 'Lead', value: 'LEAD', position: 0, color: 'yellow' },
      { label: 'Active', value: 'ACTIVE', position: 1, color: 'green' },
      { label: 'Churned', value: 'CHURNED', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'propertyType',
    label: 'Property Type',
    description: 'Type of the property (apartment, villa, etc.)',
    icon: 'IconHome',
    options: [
      { label: 'Apartment', value: 'APARTMENT', position: 0, color: 'blue' },
      { label: 'Villa', value: 'VILLA', position: 1, color: 'green' },
      { label: 'Independent House', value: 'INDEPENDENT_HOUSE', position: 2, color: 'purple' },
      { label: 'Row House', value: 'ROW_HOUSE', position: 3, color: 'turquoise' },
      { label: 'Penthouse', value: 'PENTHOUSE', position: 4, color: 'orange' },
      { label: 'Studio', value: 'STUDIO', position: 5, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'cluster',
    label: 'Cluster',
    description: 'Geographic cluster/micromarket for the property',
    icon: 'IconMapPin',
    options: [
      { label: 'HSR', value: 'HSR', position: 0, color: 'blue' },
      { label: 'KRM', value: 'KRM', position: 1, color: 'green' },
      { label: 'IDR', value: 'IDR', position: 2, color: 'purple' },
      { label: 'MHD', value: 'MHD', position: 3, color: 'orange' },
      { label: 'BLD', value: 'BLD', position: 4, color: 'sky' },
      { label: 'MGR', value: 'MGR', position: 5, color: 'turquoise' },
      { label: 'HBL', value: 'HBL', position: 6, color: 'yellow' },
      { label: 'WHF', value: 'WHF', position: 7, color: 'red' },
    ],
  },
];
```

- [ ] **Step 4: Create Property relation seeds**

These define the cross-domain relations from Property to Merchant (landlord) and WorkspaceMember (deal owner, PSM owner). These will be registered as junctionFields in the DevSeederMetadataService.

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-relation-seeds.constant.ts`

```typescript
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

/**
 * Property has three cross-domain relations:
 * 1. merchant (MANY_TO_ONE) - the landlord/merchant who owns this property
 * 2. dealOwner (MANY_TO_ONE) - the workspace member responsible for the deal
 * 3. psmOwner (MANY_TO_ONE) - the workspace member responsible for post-sale management
 *
 * Plus ONE_TO_MANY relations to its own extensions (leadStage, active, churned)
 * and to Room entities.
 */
export const PROPERTY_CROSS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
    name: 'properties',
    label: 'Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
  {
    sourceObjectName: 'workspaceMember',
    name: 'dealOwnedProperties',
    label: 'Deal Owned Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Deal Owner',
    targetFieldIcon: 'IconUser',
  },
  {
    sourceObjectName: 'workspaceMember',
    name: 'psmOwnedProperties',
    label: 'PSM Owned Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'PSM Owner',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 5: Create Property workspace entity**

Create file: `packages/twenty-server/src/modules/flent/property/standard-objects/property.workspace-entity.ts`

```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-server/src/modules/flent/property/
git commit -m "feat(flent): add Property base workspace entity with PID, lifecycle, and cross-domain relations"
```

---

## Task 2: PropertyLeadStage Extension

**Files:**
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/standard-objects/property-lead-stage.workspace-entity.ts`

- [ ] **Step 1: Create PropertyLeadStage object seed**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_LEAD_STAGE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Property Lead Stages',
  labelSingular: 'Property Lead Stage',
  namePlural: 'propertyLeadStages',
  nameSingular: 'propertyLeadStage',
  icon: 'IconFilter',
  description: 'Lead stage tracking for properties in the acquisition pipeline',
  skipNameField: true,
};
```

- [ ] **Step 2: Create PropertyLeadStage field seeds**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-field-seeds.constant.ts`

```typescript
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROPERTY_LEAD_STAGE_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'ppid',
    label: 'PPID',
    description: 'Prospective property identifier (unique)',
    icon: 'IconHash',
    isNullable: true,
    isUnique: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.DATE_TIME,
    name: 'dateAdded',
    label: 'Date Added',
    description: 'Date the property lead was added to the pipeline',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'unitsCount',
    label: 'Units Count',
    description: 'Number of units in the property',
    icon: 'IconHash',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.SELECT,
    name: 'dealType',
    label: 'Deal Type',
    description: 'Type of deal (residence vs enterprise)',
    icon: 'IconCategory',
    options: [
      { label: 'Residence Lead', value: 'RESIDENCE_LEAD', position: 0, color: 'blue' },
      { label: 'Enterprise Lead', value: 'ENTERPRISE_LEAD', position: 1, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'apartmentCount',
    label: 'Apartment Count',
    description: 'Number of apartments in the property',
    icon: 'IconHash',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.SELECT,
    name: 'propertyTypeLead',
    label: 'Property Type (Lead)',
    description: 'Property type as captured during lead stage',
    icon: 'IconHome',
    options: [
      { label: 'Apartment', value: 'APARTMENT', position: 0, color: 'blue' },
      { label: 'Villa', value: 'VILLA', position: 1, color: 'green' },
      { label: 'Independent House', value: 'INDEPENDENT_HOUSE', position: 2, color: 'purple' },
      { label: 'Row House', value: 'ROW_HOUSE', position: 3, color: 'turquoise' },
      { label: 'Penthouse', value: 'PENTHOUSE', position: 4, color: 'orange' },
      { label: 'Studio', value: 'STUDIO', position: 5, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'furnishingLead',
    label: 'Furnishing (Lead)',
    description: 'Furnishing status as captured during lead stage',
    icon: 'IconArmchair',
    options: [
      { label: 'Unfurnished', value: 'UNFURNISHED', position: 0, color: 'red' },
      { label: 'Semi-Furnished', value: 'SEMI_FURNISHED', position: 1, color: 'yellow' },
      { label: 'Partially Furnished', value: 'PARTIALLY_FURNISHED', position: 2, color: 'orange' },
      { label: 'Fully Furnished', value: 'FULLY_FURNISHED', position: 3, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'expectedRent',
    label: 'Expected Rent',
    description: 'Expected monthly rent for the property',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'googleMapLocationLead',
    label: 'Google Map Location',
    description: 'Google Maps URL for the property location',
    icon: 'IconMapPin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'dealStage',
    label: 'Deal Stage',
    description: 'Current stage in the deal pipeline',
    icon: 'IconTimeline',
    options: [
      { label: 'To be contacted', value: 'TO_BE_CONTACTED', position: 0, color: 'sky' },
      { label: 'In touch', value: 'IN_TOUCH', position: 1, color: 'blue' },
      { label: 'LL Interested', value: 'LL_INTERESTED', position: 2, color: 'turquoise' },
      { label: 'Qualified', value: 'QUALIFIED', position: 3, color: 'green' },
      { label: 'Evaluation', value: 'EVALUATION', position: 4, color: 'yellow' },
      { label: 'Negotiations', value: 'NEGOTIATIONS', position: 5, color: 'orange' },
      { label: 'Offer Extended', value: 'OFFER_EXTENDED', position: 6, color: 'purple' },
      { label: 'Under Contract', value: 'UNDER_CONTRACT', position: 7, color: 'green' },
      { label: 'To nurture', value: 'TO_NURTURE', position: 8, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'disqualificationReason',
    label: 'Disqualification Reason',
    description: 'Reason the property lead was disqualified',
    icon: 'IconAlertCircle',
    options: [
      { label: 'Price Mismatch', value: 'PRICE_MISMATCH', position: 0, color: 'yellow' },
      { label: 'Location', value: 'LOCATION', position: 1, color: 'blue' },
      { label: 'Property Condition', value: 'PROPERTY_CONDITION', position: 2, color: 'orange' },
      { label: 'Regulatory', value: 'REGULATORY', position: 3, color: 'purple' },
      { label: 'Landlord Unresponsive', value: 'LANDLORD_UNRESPONSIVE', position: 4, color: 'red' },
      { label: 'Other', value: 'OTHER', position: 5, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'lostReason',
    label: 'Lost Reason',
    description: 'Reason the property deal was lost',
    icon: 'IconThumbDown',
    options: [
      { label: 'Chose Competitor', value: 'CHOSE_COMPETITOR', position: 0, color: 'red' },
      { label: 'Price', value: 'PRICE', position: 1, color: 'yellow' },
      { label: 'Timing', value: 'TIMING', position: 2, color: 'orange' },
      { label: 'Not Interested', value: 'NOT_INTERESTED', position: 3, color: 'red' },
      { label: 'Other', value: 'OTHER', position: 4, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'exploratoryVisitScore',
    label: 'Exploratory Visit Score',
    description: 'Score from the exploratory property visit',
    icon: 'IconStar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.LINKS,
    name: 'potentialReport',
    label: 'Potential Report',
    description: 'Link to the property potential assessment report',
    icon: 'IconFile',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create PropertyLeadStage relation seeds**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-relation-seeds.constant.ts`

```typescript
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const PROPERTY_LEAD_STAGE_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular,
    name: 'propertyLeadStages',
    label: 'Lead Stages',
    icon: 'IconFilter',
    targetObjectName: 'propertyLeadStage',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
```

- [ ] **Step 4: Create PropertyLeadStage workspace entity**

Create file: `packages/twenty-server/src/modules/flent/property/standard-objects/property-lead-stage.workspace-entity.ts`

```typescript
import { type CurrencyMetadata, type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyLeadStageWorkspaceEntity extends BaseWorkspaceEntity {
  ppid: string | null;
  dateAdded: string | null;
  unitsCount: number | null;
  dealType: string | null;
  apartmentCount: number | null;
  propertyTypeLead: string | null;
  furnishingLead: string | null;
  expectedRent: CurrencyMetadata | null;
  googleMapLocationLead: LinksMetadata | null;
  dealStage: string | null;
  disqualificationReason: string | null;
  lostReason: string | null;
  exploratoryVisitScore: number | null;
  potentialReport: LinksMetadata | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/twenty-server/src/modules/flent/property/constants/property-lead-stage-*.ts \
       packages/twenty-server/src/modules/flent/property/standard-objects/property-lead-stage.workspace-entity.ts
git commit -m "feat(flent): add PropertyLeadStage extension entity with 14 pipeline fields"
```

---

## Task 3: PropertyActive Extension (31 fields)

**Files:**
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-active-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-active-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-active-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/standard-objects/property-active.workspace-entity.ts`

- [ ] **Step 1: Create PropertyActive object seed**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-active-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_ACTIVE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Property Actives',
  labelSingular: 'Property Active',
  namePlural: 'propertyActives',
  nameSingular: 'propertyActive',
  icon: 'IconCircleCheck',
  description: 'Active property details including address, amenities, furnishing, and commercial terms',
  skipNameField: true,
};
```

- [ ] **Step 2: Create PropertyActive field seeds**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-active-field-seeds.constant.ts`

```typescript
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROPERTY_ACTIVE_FIELD_SEEDS: FieldMetadataSeed[] = [
  // --- Location & Identity ---
  {
    type: FieldMetadataType.TEXT,
    name: 'houseNo',
    label: 'House No',
    description: 'House or flat number',
    icon: 'IconHash',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'activeUnitsCount',
    label: 'Active Units Count',
    description: 'Number of active units in this property',
    icon: 'IconHash',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.TEXT,
    name: 'tier',
    label: 'Tier',
    description: 'Property tier classification',
    icon: 'IconStar',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'floor',
    label: 'Floor',
    description: 'Floor number or description',
    icon: 'IconStairs',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'googleMapLocation',
    label: 'Google Map Location',
    description: 'Google Maps URL for the active property',
    icon: 'IconMapPin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.ADDRESS,
    name: 'address',
    label: 'Address',
    description: 'Full address of the property',
    icon: 'IconMapPin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'buildingSociety',
    label: 'Building / Society',
    description: 'Name of the building or housing society',
    icon: 'IconBuildingCommunity',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'activeCluster',
    label: 'Active Cluster',
    description: 'Cluster assignment for the active property',
    icon: 'IconMapPin',
    options: [
      { label: 'HSR', value: 'HSR', position: 0, color: 'blue' },
      { label: 'KRM', value: 'KRM', position: 1, color: 'green' },
      { label: 'IDR', value: 'IDR', position: 2, color: 'purple' },
      { label: 'MHD', value: 'MHD', position: 3, color: 'orange' },
      { label: 'BLD', value: 'BLD', position: 4, color: 'sky' },
      { label: 'MGR', value: 'MGR', position: 5, color: 'turquoise' },
      { label: 'HBL', value: 'HBL', position: 6, color: 'yellow' },
      { label: 'WHF', value: 'WHF', position: 7, color: 'red' },
    ],
  },

  // --- Amenities ---
  {
    type: FieldMetadataType.MULTI_SELECT,
    name: 'parkingType',
    label: 'Parking Type',
    description: 'Types of parking available',
    icon: 'IconCar',
    options: [
      { label: 'Covered', value: 'COVERED', position: 0, color: 'green' },
      { label: 'Open', value: 'OPEN', position: 1, color: 'blue' },
      { label: 'Basement', value: 'BASEMENT', position: 2, color: 'purple' },
      { label: 'None', value: 'NONE', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'parkingNumber',
    label: 'Parking Number',
    description: 'Assigned parking spot number',
    icon: 'IconHash',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'powerBackup',
    label: 'Power Backup',
    description: 'Power backup availability',
    icon: 'IconBolt',
    options: [
      { label: 'Full', value: 'FULL', position: 0, color: 'green' },
      { label: 'Partial', value: 'PARTIAL', position: 1, color: 'yellow' },
      { label: 'None', value: 'NONE', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    name: 'waterSource',
    label: 'Water Source',
    description: 'Available water sources',
    icon: 'IconDroplet',
    options: [
      { label: 'Corporation', value: 'CORPORATION', position: 0, color: 'blue' },
      { label: 'Borewell', value: 'BOREWELL', position: 1, color: 'green' },
      { label: 'Tanker', value: 'TANKER', position: 2, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'restrictions',
    label: 'Restrictions',
    description: 'Any restrictions on the property',
    icon: 'IconAlertCircle',
    options: [
      { label: 'None', value: 'NONE', position: 0, color: 'green' },
      { label: 'No Pets', value: 'NO_PETS', position: 1, color: 'yellow' },
      { label: 'No Smoking', value: 'NO_SMOKING', position: 2, color: 'orange' },
      { label: 'Veg Only', value: 'VEG_ONLY', position: 3, color: 'red' },
      { label: 'Male Only', value: 'MALE_ONLY', position: 4, color: 'blue' },
      { label: 'Female Only', value: 'FEMALE_ONLY', position: 5, color: 'pink' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'otherNotes',
    label: 'Other Notes',
    description: 'Additional notes about the property',
    icon: 'IconNote',
    isNullable: true,
  },

  // --- Furnishing ---
  {
    type: FieldMetadataType.SELECT,
    name: 'furnitureMovement',
    label: 'Furniture Movement',
    description: 'Whether furniture can be moved in/out',
    icon: 'IconArmchair',
    options: [
      { label: 'Allowed', value: 'ALLOWED', position: 0, color: 'green' },
      { label: 'Not Allowed', value: 'NOT_ALLOWED', position: 1, color: 'red' },
      { label: 'With Permission', value: 'WITH_PERMISSION', position: 2, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'furnishingStatus',
    label: 'Furnishing Status',
    description: 'Current furnishing level of the property',
    icon: 'IconArmchair',
    options: [
      { label: 'Unfurnished', value: 'UNFURNISHED', position: 0, color: 'red' },
      { label: 'Semi-Furnished', value: 'SEMI_FURNISHED', position: 1, color: 'yellow' },
      { label: 'Partially Furnished', value: 'PARTIALLY_FURNISHED', position: 2, color: 'orange' },
      { label: 'Fully Furnished', value: 'FULLY_FURNISHED', position: 3, color: 'green' },
    ],
  },

  // --- Financials ---
  {
    type: FieldMetadataType.CURRENCY,
    name: 'finalApprovedAmt',
    label: 'Final Approved Amount',
    description: 'Final approved furnishing/setup amount',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'finalInvoice',
    label: 'Final Invoice',
    description: 'Link to the final invoice document',
    icon: 'IconFile',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'llExtraClauses',
    label: 'LL Extra Clauses',
    description: 'Extra clauses from the landlord agreement',
    icon: 'IconFileText',
    isNullable: true,
  },

  // --- Payment & Collections ---
  {
    type: FieldMetadataType.SELECT,
    name: 'paymentCollection',
    label: 'Payment Collection',
    description: 'How rent payments are collected',
    icon: 'IconCash',
    options: [
      { label: 'Upfront', value: 'UPFRONT', position: 0, color: 'green' },
      { label: 'Straight Deduction', value: 'STRAIGHT_DEDUCTION', position: 1, color: 'blue' },
      { label: 'EMI', value: 'EMI', position: 2, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'emiPeriod',
    label: 'EMI Period',
    description: 'EMI period in months (if applicable)',
    icon: 'IconCalendar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.CURRENCY,
    name: 'opexCollections',
    label: 'OPEX Collections',
    description: 'Monthly operating expense collections amount',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },

  // --- Management ---
  {
    type: FieldMetadataType.SELECT,
    name: 'propMgmtApp',
    label: 'Property Mgmt App',
    description: 'Property management app used',
    icon: 'IconDeviceMobile',
    options: [
      { label: 'MyGate', value: 'MYGATE', position: 0, color: 'blue' },
      { label: 'NoBroker', value: 'NOBROKER', position: 1, color: 'green' },
      { label: 'Apartments.com', value: 'APARTMENTS_COM', position: 2, color: 'purple' },
      { label: 'None', value: 'NONE', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'rulesRegulations',
    label: 'Rules & Regulations',
    description: 'Link to property rules and regulations document',
    icon: 'IconFile',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'garbageDisposal',
    label: 'Garbage Disposal',
    description: 'Garbage disposal instructions',
    icon: 'IconTrash',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'timingRestrictions',
    label: 'Timing Restrictions',
    description: 'Timing-based restrictions (noise, entry, etc.)',
    icon: 'IconClock',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'moveInOutFormalities',
    label: 'Move In/Out Formalities',
    description: 'Procedures for tenant move-in and move-out',
    icon: 'IconChecklist',
    isNullable: true,
  },

  // --- Deadlines & Dates ---
  {
    type: FieldMetadataType.TEXT,
    name: 'rentDeadline',
    label: 'Rent Deadline',
    description: 'Monthly rent payment deadline (e.g., "5th of every month")',
    icon: 'IconCalendar',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'overheadsDeadline',
    label: 'Overheads Deadline',
    description: 'Monthly overheads payment deadline',
    icon: 'IconCalendar',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'activeDealOwner',
    label: 'Active Deal Owner',
    description: 'Name of the deal owner during active phase',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.DATE,
    name: 'activationDate',
    label: 'Activation Date',
    description: 'Date when the property was activated',
    icon: 'IconCalendarCheck',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create PropertyActive relation seeds and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-active-relation-seeds.constant.ts`

```typescript
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const PROPERTY_ACTIVE_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular,
    name: 'propertyActives',
    label: 'Active Details',
    icon: 'IconCircleCheck',
    targetObjectName: 'propertyActive',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/property/standard-objects/property-active.workspace-entity.ts`

```typescript
import {
  type AddressMetadata,
  type CurrencyMetadata,
  type LinksMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyActiveWorkspaceEntity extends BaseWorkspaceEntity {
  // Location & Identity
  houseNo: string | null;
  activeUnitsCount: number | null;
  tier: string | null;
  floor: string | null;
  googleMapLocation: LinksMetadata | null;
  address: AddressMetadata | null;
  buildingSociety: string | null;
  activeCluster: string | null;

  // Amenities
  parkingType: string[] | null;
  parkingNumber: string | null;
  powerBackup: string | null;
  waterSource: string[] | null;
  restrictions: string | null;
  otherNotes: string | null;

  // Furnishing
  furnitureMovement: string | null;
  furnishingStatus: string | null;

  // Financials
  finalApprovedAmt: CurrencyMetadata | null;
  finalInvoice: LinksMetadata | null;
  llExtraClauses: string | null;

  // Payment & Collections
  paymentCollection: string | null;
  emiPeriod: number | null;
  opexCollections: CurrencyMetadata | null;

  // Management
  propMgmtApp: string | null;
  rulesRegulations: LinksMetadata | null;
  garbageDisposal: string | null;
  timingRestrictions: string | null;
  moveInOutFormalities: string | null;

  // Deadlines & Dates
  rentDeadline: string | null;
  overheadsDeadline: string | null;
  activeDealOwner: string | null;
  activationDate: Date | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/property/constants/property-active-*.ts \
       packages/twenty-server/src/modules/flent/property/standard-objects/property-active.workspace-entity.ts
git commit -m "feat(flent): add PropertyActive extension entity with 31 operational fields"
```

---

## Task 4: PropertyChurned Extension

**Files:**
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-churned-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-churned-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/constants/property-churned-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/property/standard-objects/property-churned.workspace-entity.ts`

- [ ] **Step 1: Create all PropertyChurned files**

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-churned-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_CHURNED_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Property Churneds',
  labelSingular: 'Property Churned',
  namePlural: 'propertyChurneds',
  nameSingular: 'propertyChurned',
  icon: 'IconArrowBack',
  description: 'Tracking data for properties that have been churned/exited',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-churned-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROPERTY_CHURNED_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'depositRefunded',
    label: 'Deposit Refunded',
    description: 'Whether the security deposit has been refunded',
    icon: 'IconCash',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'exitCostOpx',
    label: 'Exit Cost OPX',
    description: 'Operating expense costs incurred at exit',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'churnDate',
    label: 'Churn Date',
    description: 'Date the property was churned',
    icon: 'IconCalendar',
    isNullable: true,
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/property/constants/property-churned-relation-seeds.constant.ts`

```typescript
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const PROPERTY_CHURNED_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular,
    name: 'propertyChurneds',
    label: 'Churned Details',
    icon: 'IconArrowBack',
    targetObjectName: 'propertyChurned',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/property/standard-objects/property-churned.workspace-entity.ts`

```typescript
import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';

export class PropertyChurnedWorkspaceEntity extends BaseWorkspaceEntity {
  depositRefunded: boolean | null;
  exitCostOpx: CurrencyMetadata | null;
  churnDate: Date | null;

  // Relation to Property (MANY_TO_ONE, semantically 1:1)
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/property/constants/property-churned-*.ts \
       packages/twenty-server/src/modules/flent/property/standard-objects/property-churned.workspace-entity.ts
git commit -m "feat(flent): add PropertyChurned extension entity with exit tracking"
```

---

## Task 5: Room Base + All Extensions

Due to the compact nature of Room entities (1-7 fields each), this task creates all 5 Room entities at once.

**Files:** 5 object seeds, 5 field seeds, 5 relation seeds, 5 workspace entities (15 files)

- [ ] **Step 1: Create directory structure and Room base entity files**

```bash
mkdir -p packages/twenty-server/src/modules/flent/room/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/room/constants
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Rooms',
  labelSingular: 'Room',
  namePlural: 'rooms',
  nameSingular: 'room',
  icon: 'IconDoor',
  description: 'An individual room within a property, identified by RID',
};
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'rid',
    label: 'RID',
    description: 'Unique room identifier',
    icon: 'IconHash',
    isNullable: false,
    isUnique: true,
    defaultValue: "''",
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-relation-seeds.constant.ts`

```typescript
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const ROOM_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular,
    name: 'rooms',
    label: 'Rooms',
    icon: 'IconDoor',
    targetObjectName: 'room',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/standard-objects/room.workspace-entity.ts`

```typescript
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
```

- [ ] **Step 2: Create RoomSpecifications files**

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-specifications-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_SPECIFICATIONS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Specifications',
  labelSingular: 'Room Specification',
  namePlural: 'roomSpecifications',
  nameSingular: 'roomSpecification',
  icon: 'IconRuler',
  description: 'Physical specifications for rooms (bathroom, balcony)',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-specifications-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_SPECIFICATIONS_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.BOOLEAN, name: 'attachedBathroom', label: 'Attached Bathroom', icon: 'IconBath', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'balcony', label: 'Balcony', icon: 'IconSunHigh', isNullable: true, defaultValue: false },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-specifications-relation-seeds.constant.ts`

```typescript
export const ROOM_SPECIFICATIONS_RELATION_SEEDS = [
  { sourceObjectName: 'room', name: 'roomSpecifications', label: 'Specifications', icon: 'IconRuler', targetObjectName: 'roomSpecification', targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/standard-objects/room-specifications.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomSpecificationsWorkspaceEntity extends BaseWorkspaceEntity {
  attachedBathroom: boolean | null;
  balcony: boolean | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
```

- [ ] **Step 3: Create RoomFurnishing files**

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-furnishing-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_FURNISHING_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Furnishings',
  labelSingular: 'Room Furnishing',
  namePlural: 'roomFurnishings',
  nameSingular: 'roomFurnishing',
  icon: 'IconArmchair',
  description: 'Furnishing details for rooms including bed, AC, and furniture',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-furnishing-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_FURNISHING_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'bedType', label: 'Bed Type', icon: 'IconBed',
    options: [
      { label: 'Single', value: 'SINGLE', position: 0, color: 'blue' },
      { label: 'Double', value: 'DOUBLE', position: 1, color: 'green' },
      { label: 'Queen', value: 'QUEEN', position: 2, color: 'purple' },
      { label: 'King', value: 'KING', position: 3, color: 'orange' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'ac', label: 'AC', icon: 'IconAirConditioning', isNullable: true, defaultValue: false },
  {
    type: FieldMetadataType.SELECT, name: 'acType', label: 'AC Type', icon: 'IconAirConditioning',
    options: [
      { label: 'Split', value: 'SPLIT', position: 0, color: 'blue' },
      { label: 'Window', value: 'WINDOW', position: 1, color: 'green' },
      { label: 'Portable', value: 'PORTABLE', position: 2, color: 'yellow' },
      { label: 'Not Possible', value: 'NOT_POSSIBLE', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'acFeasibility', label: 'AC Feasibility', icon: 'IconAirConditioning',
    options: [
      { label: 'Feasible', value: 'FEASIBLE', position: 0, color: 'green' },
      { label: 'Not Feasible', value: 'NOT_FEASIBLE', position: 1, color: 'red' },
      { label: 'Requires Modification', value: 'REQUIRES_MODIFICATION', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'studyTable', label: 'Study Table', icon: 'IconDesk', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.LINKS, name: 'annexure', label: 'Annexure', icon: 'IconFile', isNullable: true },
  { type: FieldMetadataType.DATE, name: 'annexureLastUpdateDate', label: 'Annexure Last Update Date', icon: 'IconCalendar', isNullable: true },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-furnishing-relation-seeds.constant.ts`

```typescript
export const ROOM_FURNISHING_RELATION_SEEDS = [
  { sourceObjectName: 'room', name: 'roomFurnishings', label: 'Furnishing Details', icon: 'IconArmchair', targetObjectName: 'roomFurnishing', targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/standard-objects/room-furnishing.workspace-entity.ts`

```typescript
import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomFurnishingWorkspaceEntity extends BaseWorkspaceEntity {
  bedType: string | null;
  ac: boolean | null;
  acType: string | null;
  acFeasibility: string | null;
  studyTable: boolean | null;
  annexure: LinksMetadata | null;
  annexureLastUpdateDate: Date | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
```

- [ ] **Step 4: Create RoomCommercials files**

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-commercials-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_COMMERCIALS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Commercials',
  labelSingular: 'Room Commercial',
  namePlural: 'roomCommercials',
  nameSingular: 'roomCommercial',
  icon: 'IconCash',
  description: 'Commercial terms for rooms including rent and maintenance fees',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-commercials-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_COMMERCIALS_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.CURRENCY, name: 'baseRent', label: 'Base Rent', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.CURRENCY, name: 'maintenanceFee', label: 'Maintenance Fee', icon: 'IconCurrencyRupee', isNullable: true },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-commercials-relation-seeds.constant.ts`

```typescript
export const ROOM_COMMERCIALS_RELATION_SEEDS = [
  { sourceObjectName: 'room', name: 'roomCommercials', label: 'Commercials', icon: 'IconCash', targetObjectName: 'roomCommercial', targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/standard-objects/room-commercials.workspace-entity.ts`

```typescript
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
```

- [ ] **Step 5: Create RoomAvailability files**

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-availability-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_AVAILABILITY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Availabilities',
  labelSingular: 'Room Availability',
  namePlural: 'roomAvailabilities',
  nameSingular: 'roomAvailability',
  icon: 'IconCalendarCheck',
  description: 'Availability status and current occupant for rooms',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-availability-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_AVAILABILITY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'roomStatus', label: 'Room Status', icon: 'IconCircleCheck',
    options: [
      { label: 'Available', value: 'AVAILABLE', position: 0, color: 'green' },
      { label: 'Occupied', value: 'OCCUPIED', position: 1, color: 'blue' },
      { label: 'Under Maintenance', value: 'UNDER_MAINTENANCE', position: 2, color: 'yellow' },
      { label: 'Blocked', value: 'BLOCKED', position: 3, color: 'red' },
    ],
  },
  { type: FieldMetadataType.TEXT, name: 'currentTenantName', label: 'Current Tenant Name', icon: 'IconUser', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.DATE, name: 'availableFrom', label: 'Available From', icon: 'IconCalendar', isNullable: true },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/constants/room-availability-relation-seeds.constant.ts`

```typescript
export const ROOM_AVAILABILITY_RELATION_SEEDS = [
  { sourceObjectName: 'room', name: 'roomAvailabilities', label: 'Availability', icon: 'IconCalendarCheck', targetObjectName: 'roomAvailability', targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
];
```

Create file: `packages/twenty-server/src/modules/flent/room/standard-objects/room-availability.workspace-entity.ts`

```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-server/src/modules/flent/room/
git commit -m "feat(flent): add Room base and all 4 extension entities (Specifications, Furnishing, Commercials, Availability)"
```

---

## Task 6: Overhead Base Entity

**Files:**
- Create: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/overhead/standard-objects/overhead.workspace-entity.ts`

- [ ] **Step 1: Create directory structure and all Overhead base files**

```bash
mkdir -p packages/twenty-server/src/modules/flent/overhead/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/overhead/constants
```

Create file: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overheads',
  labelSingular: 'Overhead',
  namePlural: 'overheads',
  nameSingular: 'overhead',
  icon: 'IconReceipt',
  description: 'Recurring and one-time overhead costs for properties',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'categoryType', label: 'Category Type', icon: 'IconCategory',
    options: [
      { label: 'Maintenance', value: 'MAINTENANCE', position: 0, color: 'blue' },
      { label: 'WiFi', value: 'WIFI', position: 1, color: 'green' },
      { label: 'DG', value: 'DG', position: 2, color: 'orange' },
      { label: 'Water', value: 'WATER', position: 3, color: 'sky' },
      { label: 'Water Purifier', value: 'WATER_PURIFIER', position: 4, color: 'turquoise' },
      { label: 'Gas', value: 'GAS', position: 5, color: 'red' },
      { label: 'Electricity', value: 'ELECTRICITY', position: 6, color: 'yellow' },
      { label: 'Helper', value: 'HELPER', position: 7, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'objectType', label: 'Object Type', icon: 'IconRepeat',
    options: [
      { label: 'Recurring', value: 'RECURRING', position: 0, color: 'blue' },
      { label: 'One-Time', value: 'ONE_TIME', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'frequency', label: 'Frequency', icon: 'IconCalendarRepeat',
    options: [
      { label: 'Monthly', value: 'MONTHLY', position: 0, color: 'blue' },
      { label: 'Quarterly', value: 'QUARTERLY', position: 1, color: 'green' },
      { label: 'Bi-Annually', value: 'BI_ANNUALLY', position: 2, color: 'yellow' },
      { label: 'Annually', value: 'ANNUALLY', position: 3, color: 'orange' },
    ],
  },
  { type: FieldMetadataType.DATE, name: 'startDate', label: 'Start Date', icon: 'IconCalendar', isNullable: true },
  { type: FieldMetadataType.DATE, name: 'endDate', label: 'End Date', icon: 'IconCalendar', isNullable: true },
  { type: FieldMetadataType.LINKS, name: 'document', label: 'Document', icon: 'IconFile', isNullable: true },
];
```

Create file: `packages/twenty-server/src/modules/flent/overhead/constants/overhead-relation-seeds.constant.ts`

```typescript
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const OVERHEAD_CROSS_RELATION_SEEDS = [
  { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'overheads', label: 'Overheads', icon: 'IconReceipt', targetObjectName: 'overhead', targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
  { sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'merchantOverheads', label: 'Merchant Overheads', icon: 'IconReceipt', targetObjectName: 'overhead', targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },
];
```

Create file: `packages/twenty-server/src/modules/flent/overhead/standard-objects/overhead.workspace-entity.ts`

```typescript
import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';
import { type OverheadMaintenanceWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-maintenance.workspace-entity';
import { type OverheadWifiWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-wifi.workspace-entity';
import { type OverheadElectricityWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-electricity.workspace-entity';
import { type OverheadDgWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-dg.workspace-entity';
import { type OverheadWaterWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-water.workspace-entity';
import { type OverheadWaterPurifierWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-water-purifier.workspace-entity';
import { type OverheadGasWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-gas.workspace-entity';
import { type OverheadHelperWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-helper.workspace-entity';

export class OverheadWorkspaceEntity extends BaseWorkspaceEntity {
  categoryType: string | null;
  objectType: string | null;
  frequency: string | null;
  startDate: Date | null;
  endDate: Date | null;
  document: LinksMetadata | null;

  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;

  overheadMaintenances: EntityRelation<OverheadMaintenanceWorkspaceEntity[]>;
  overheadWifis: EntityRelation<OverheadWifiWorkspaceEntity[]>;
  overheadElectricities: EntityRelation<OverheadElectricityWorkspaceEntity[]>;
  overheadDgs: EntityRelation<OverheadDgWorkspaceEntity[]>;
  overheadWaters: EntityRelation<OverheadWaterWorkspaceEntity[]>;
  overheadWaterPurifiers: EntityRelation<OverheadWaterPurifierWorkspaceEntity[]>;
  overheadGases: EntityRelation<OverheadGasWorkspaceEntity[]>;
  overheadHelpers: EntityRelation<OverheadHelperWorkspaceEntity[]>;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/overhead/constants/overhead-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/overhead/constants/overhead-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/overhead/constants/overhead-relation-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/overhead/standard-objects/overhead.workspace-entity.ts
git commit -m "feat(flent): add Overhead base entity with category type and cross-domain relations"
```

---

## Task 7: All 8 Overhead Extension Entities

Due to the repetitive pattern (each has object seed + field seeds + relation seeds + workspace entity), this task creates all 8 overhead category extensions. See the Phase 1 plan for the full file contents of each -- the pattern is identical. Each extension has:
- A `*-object-seed.constant.ts` with `skipNameField: true`
- A `*-field-seeds.constant.ts` with category-specific fields
- A `*-relation-seeds.constant.ts` with MANY_TO_ONE back to overhead
- A `*.workspace-entity.ts` extending BaseWorkspaceEntity

The 8 extensions and their field counts are:

| Extension | Fields |
|-----------|--------|
| `overheadMaintenance` | 5 (maintenanceAmount, maintenanceCutoffDate, maintenanceCycle, maintenancePayToLl, maintenanceCollectTenant) |
| `overheadWifi` | 13 (wifiProvider, wifiAccountId, wifiStartDate, wifiPlanDuration, wifiEndDate, wifiPlanCost, wifiSsid, wifiPassword, wifiOwnership, wifiAmount, wifiRegisteredNumber, wifiCollectTenant, wifiPayToLl) |
| `overheadElectricity` | 7 (electricityProvider, electricityConnectionType, electricityAccountNo, electricityPassword, electricityOwnership, electricityPayToLl, electricityCollectTenant) |
| `overheadDg` | 8 (dgBrandDetails, dgCapacityKva, dgMaintenanceSchedule, dgFuelTankCapacity, dgRefillUnitLitres, dgAmount, dgPayToLl, dgCollectTenant) |
| `overheadWater` | 6 (waterAccountNo, waterPassword, waterOwnership, waterPaymentsDues, waterPayToLl, waterCollectTenant) |
| `overheadWaterPurifier` | 5 (purifierSerialNo, purifierSubscription, purifierOwnership, purifierPayToLl, purifierCollectTenant) |
| `overheadGas` | 6 (gasConnectionType, gasAccountNo, gasPassword, gasOwnership, gasPayToLl, gasCollectTenant) |
| `overheadHelper` | 8 (helperName, helperPhone, helperRole, helperSalary, helperHours, helperResponsibilities, helperPayToLl, helperCollectTenant) |

For complete file contents of each extension, refer to the code blocks in Phase 1 plan Task 8-9 pattern. Each follows the exact same structure as the Tenant/Merchant/Vendor extensions.

- [ ] **Step 1: Create all 8 overhead extension object seeds, field seeds, relation seeds, and workspace entities**

Create 32 files following the pattern shown in the Phase 1 plan. Each extension entity:
- Object seed: `skipNameField: true`, icon matching the category
- Field seeds: Category-specific fields using appropriate FieldMetadataType
- Relation seeds: `sourceObjectName: 'overhead'`, linking back to the Overhead base
- Workspace entity: Extends `BaseWorkspaceEntity`, has `overhead` relation + `overheadId`

Full file contents for each overhead extension are provided in the companion implementation reference. The pattern is identical to Task 5 (Merchant extensions) and Task 7 (Vendor extensions) from Phase 1.

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/overhead/
git commit -m "feat(flent): add all 8 Overhead category extension entities"
```

---

## Task 8: Register All 18 Phase 2 Entities in DevSeederMetadataService

**Files:**
- Modify: `packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts`

This task adds all 18 Phase 2 entities to the dev seeder, establishing the full property hierarchy with cross-domain relations.

- [ ] **Step 1: Add Phase 2 seed imports after Phase 1 imports**

```typescript
// --- Flent Phase 2: Property ---
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';
import { PROPERTY_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-field-seeds.constant';
import { PROPERTY_LEAD_STAGE_OBJECT_SEED } from 'src/modules/flent/property/constants/property-lead-stage-object-seed.constant';
import { PROPERTY_LEAD_STAGE_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-lead-stage-field-seeds.constant';
import { PROPERTY_ACTIVE_OBJECT_SEED } from 'src/modules/flent/property/constants/property-active-object-seed.constant';
import { PROPERTY_ACTIVE_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-active-field-seeds.constant';
import { PROPERTY_CHURNED_OBJECT_SEED } from 'src/modules/flent/property/constants/property-churned-object-seed.constant';
import { PROPERTY_CHURNED_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-churned-field-seeds.constant';

// --- Flent Phase 2: Room ---
import { ROOM_OBJECT_SEED } from 'src/modules/flent/room/constants/room-object-seed.constant';
import { ROOM_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-field-seeds.constant';
import { ROOM_SPECIFICATIONS_OBJECT_SEED } from 'src/modules/flent/room/constants/room-specifications-object-seed.constant';
import { ROOM_SPECIFICATIONS_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-specifications-field-seeds.constant';
import { ROOM_FURNISHING_OBJECT_SEED } from 'src/modules/flent/room/constants/room-furnishing-object-seed.constant';
import { ROOM_FURNISHING_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-furnishing-field-seeds.constant';
import { ROOM_COMMERCIALS_OBJECT_SEED } from 'src/modules/flent/room/constants/room-commercials-object-seed.constant';
import { ROOM_COMMERCIALS_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-commercials-field-seeds.constant';
import { ROOM_AVAILABILITY_OBJECT_SEED } from 'src/modules/flent/room/constants/room-availability-object-seed.constant';
import { ROOM_AVAILABILITY_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-availability-field-seeds.constant';

// --- Flent Phase 2: Overhead ---
import { OVERHEAD_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-object-seed.constant';
import { OVERHEAD_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-field-seeds.constant';
import { OVERHEAD_MAINTENANCE_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-maintenance-object-seed.constant';
import { OVERHEAD_MAINTENANCE_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-maintenance-field-seeds.constant';
import { OVERHEAD_WIFI_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-wifi-object-seed.constant';
import { OVERHEAD_WIFI_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-wifi-field-seeds.constant';
import { OVERHEAD_ELECTRICITY_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-electricity-object-seed.constant';
import { OVERHEAD_ELECTRICITY_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-electricity-field-seeds.constant';
import { OVERHEAD_DG_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-dg-object-seed.constant';
import { OVERHEAD_DG_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-dg-field-seeds.constant';
import { OVERHEAD_WATER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-water-object-seed.constant';
import { OVERHEAD_WATER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-water-field-seeds.constant';
import { OVERHEAD_WATER_PURIFIER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-water-purifier-object-seed.constant';
import { OVERHEAD_WATER_PURIFIER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-water-purifier-field-seeds.constant';
import { OVERHEAD_GAS_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-gas-object-seed.constant';
import { OVERHEAD_GAS_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-gas-field-seeds.constant';
import { OVERHEAD_HELPER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-helper-object-seed.constant';
import { OVERHEAD_HELPER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-helper-field-seeds.constant';
```

- [ ] **Step 2: Add Phase 2 objects to the workspace config objects array**

```typescript
// --- Flent Phase 2: Property ---
{ seed: PROPERTY_OBJECT_SEED, fields: PROPERTY_FIELD_SEEDS },
{ seed: PROPERTY_LEAD_STAGE_OBJECT_SEED, fields: PROPERTY_LEAD_STAGE_FIELD_SEEDS },
{ seed: PROPERTY_ACTIVE_OBJECT_SEED, fields: PROPERTY_ACTIVE_FIELD_SEEDS },
{ seed: PROPERTY_CHURNED_OBJECT_SEED, fields: PROPERTY_CHURNED_FIELD_SEEDS },

// --- Flent Phase 2: Room ---
{ seed: ROOM_OBJECT_SEED, fields: ROOM_FIELD_SEEDS },
{ seed: ROOM_SPECIFICATIONS_OBJECT_SEED, fields: ROOM_SPECIFICATIONS_FIELD_SEEDS },
{ seed: ROOM_FURNISHING_OBJECT_SEED, fields: ROOM_FURNISHING_FIELD_SEEDS },
{ seed: ROOM_COMMERCIALS_OBJECT_SEED, fields: ROOM_COMMERCIALS_FIELD_SEEDS },
{ seed: ROOM_AVAILABILITY_OBJECT_SEED, fields: ROOM_AVAILABILITY_FIELD_SEEDS },

// --- Flent Phase 2: Overhead ---
{ seed: OVERHEAD_OBJECT_SEED, fields: OVERHEAD_FIELD_SEEDS },
{ seed: OVERHEAD_MAINTENANCE_OBJECT_SEED, fields: OVERHEAD_MAINTENANCE_FIELD_SEEDS },
{ seed: OVERHEAD_WIFI_OBJECT_SEED, fields: OVERHEAD_WIFI_FIELD_SEEDS },
{ seed: OVERHEAD_ELECTRICITY_OBJECT_SEED, fields: OVERHEAD_ELECTRICITY_FIELD_SEEDS },
{ seed: OVERHEAD_DG_OBJECT_SEED, fields: OVERHEAD_DG_FIELD_SEEDS },
{ seed: OVERHEAD_WATER_OBJECT_SEED, fields: OVERHEAD_WATER_FIELD_SEEDS },
{ seed: OVERHEAD_WATER_PURIFIER_OBJECT_SEED, fields: OVERHEAD_WATER_PURIFIER_FIELD_SEEDS },
{ seed: OVERHEAD_GAS_OBJECT_SEED, fields: OVERHEAD_GAS_FIELD_SEEDS },
{ seed: OVERHEAD_HELPER_OBJECT_SEED, fields: OVERHEAD_HELPER_FIELD_SEEDS },
```

- [ ] **Step 3: Add Phase 2 junctionFields for all 24 relations**

```typescript
// --- Property cross-domain ---
{ sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'properties', label: 'Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },
{ sourceObjectName: 'workspaceMember', name: 'dealOwnedProperties', label: 'Deal Owned Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Deal Owner', targetFieldIcon: 'IconUser' },
{ sourceObjectName: 'workspaceMember', name: 'psmOwnedProperties', label: 'PSM Owned Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'PSM Owner', targetFieldIcon: 'IconUser' },

// --- Property lifecycle extensions ---
{ sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyLeadStages', label: 'Lead Stages', icon: 'IconFilter', targetObjectName: PROPERTY_LEAD_STAGE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
{ sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyActives', label: 'Active Details', icon: 'IconCircleCheck', targetObjectName: PROPERTY_ACTIVE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
{ sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyChurneds', label: 'Churned Details', icon: 'IconArrowBack', targetObjectName: PROPERTY_CHURNED_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },

// --- Room -> Property ---
{ sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'rooms', label: 'Rooms', icon: 'IconDoor', targetObjectName: ROOM_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },

// --- Room extensions ---
{ sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomSpecifications', label: 'Specifications', icon: 'IconRuler', targetObjectName: ROOM_SPECIFICATIONS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
{ sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomFurnishings', label: 'Furnishing Details', icon: 'IconArmchair', targetObjectName: ROOM_FURNISHING_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
{ sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomCommercials', label: 'Commercials', icon: 'IconCash', targetObjectName: ROOM_COMMERCIALS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
{ sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomAvailabilities', label: 'Availability', icon: 'IconCalendarCheck', targetObjectName: ROOM_AVAILABILITY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },

// --- Overhead cross-domain ---
{ sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'overheads', label: 'Overheads', icon: 'IconReceipt', targetObjectName: OVERHEAD_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
{ sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'merchantOverheads', label: 'Merchant Overheads', icon: 'IconReceipt', targetObjectName: OVERHEAD_OBJECT_SEED.nameSingular, targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },

// --- Overhead category extensions ---
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadMaintenances', label: 'Maintenance Details', icon: 'IconTool', targetObjectName: OVERHEAD_MAINTENANCE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWifis', label: 'WiFi Details', icon: 'IconWifi', targetObjectName: OVERHEAD_WIFI_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadElectricities', label: 'Electricity Details', icon: 'IconBolt', targetObjectName: OVERHEAD_ELECTRICITY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadDgs', label: 'DG Details', icon: 'IconEngine', targetObjectName: OVERHEAD_DG_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWaters', label: 'Water Details', icon: 'IconDroplet', targetObjectName: OVERHEAD_WATER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWaterPurifiers', label: 'Water Purifier Details', icon: 'IconFilter', targetObjectName: OVERHEAD_WATER_PURIFIER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadGases', label: 'Gas Details', icon: 'IconFlame', targetObjectName: OVERHEAD_GAS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
{ sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadHelpers', label: 'Helper Details', icon: 'IconUsers', targetObjectName: OVERHEAD_HELPER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts
git commit -m "feat(flent): register all 18 Phase 2 entities in DevSeederMetadataService"
```

---

## Entity Summary

### Property Group (4 entities)

| # | Entity | Type | Fields | Relations |
|---|--------|------|--------|-----------|
| 1 | `property` | Base | 4 (pid, lifecycleStatus, propertyType, cluster) | MANY_TO_ONE to merchant, dealOwner, psmOwner; ONE_TO_MANY to 3 extensions + rooms + overheads |
| 2 | `propertyLeadStage` | Extension | 14 | MANY_TO_ONE to property |
| 3 | `propertyActive` | Extension | 31 | MANY_TO_ONE to property |
| 4 | `propertyChurned` | Extension | 3 | MANY_TO_ONE to property |

### Room Group (5 entities)

| # | Entity | Type | Fields | Relations |
|---|--------|------|--------|-----------|
| 5 | `room` | Base | 1 (rid) | MANY_TO_ONE to property; ONE_TO_MANY to 4 extensions |
| 6 | `roomSpecification` | Extension | 2 | MANY_TO_ONE to room |
| 7 | `roomFurnishing` | Extension | 7 | MANY_TO_ONE to room |
| 8 | `roomCommercial` | Extension | 2 | MANY_TO_ONE to room |
| 9 | `roomAvailability` | Extension | 3 | MANY_TO_ONE to room; deferred: MANY_TO_ONE to contract |

### Overhead Group (9 entities)

| # | Entity | Type | Fields | Relations |
|---|--------|------|--------|-----------|
| 10 | `overhead` | Base | 6 | MANY_TO_ONE to property + merchant; ONE_TO_MANY to 8 extensions |
| 11 | `overheadMaintenance` | Extension | 5 | MANY_TO_ONE to overhead |
| 12 | `overheadWifi` | Extension | 13 | MANY_TO_ONE to overhead |
| 13 | `overheadElectricity` | Extension | 7 | MANY_TO_ONE to overhead |
| 14 | `overheadDg` | Extension | 8 | MANY_TO_ONE to overhead |
| 15 | `overheadWater` | Extension | 6 | MANY_TO_ONE to overhead |
| 16 | `overheadWaterPurifier` | Extension | 5 | MANY_TO_ONE to overhead |
| 17 | `overheadGas` | Extension | 6 | MANY_TO_ONE to overhead |
| 18 | `overheadHelper` | Extension | 8 | MANY_TO_ONE to overhead |

**Phase 2 Total:** 18 entities, 131 fields, 24 relations (including cross-domain)

### Cross-Domain Relations

| Source | Target | Cardinality | Purpose |
|--------|--------|-------------|---------|
| `merchant` | `property` | ONE_TO_MANY | Landlord owns properties |
| `workspaceMember` | `property` | ONE_TO_MANY (x2) | Deal owner + PSM owner assignments |
| `property` | `room` | ONE_TO_MANY | Property contains rooms |
| `property` | `overhead` | ONE_TO_MANY | Property has overheads |
| `merchant` | `overhead` | ONE_TO_MANY | Merchant provides overhead services |

### Deferred Relations (Phase 3)

| Source | Target | Phase |
|--------|--------|-------|
| `tenant` | `property` (currentProperty) | Phase 2 -> deferred |
| `tenant` | `room` (currentRoom) | Phase 2 -> deferred |
| `roomAvailability` | `contract` (currentContract) | Phase 3 |
