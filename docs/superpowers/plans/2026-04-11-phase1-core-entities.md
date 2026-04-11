# Phase 1: Core Entities (Tenant, Merchant, Vendor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 16 workspace entities (Tenant 6, Merchant 5, Vendor 5) using Twenty's metadata seed system so they appear as first-class objects in the CRM with full CRUD, search, and relation support.

**Architecture:** Each domain object uses a base entity + extension entities pattern. Base entities hold identity, contact, and lifecycle fields. Extension entities hold domain-specific grouped fields (attribution, requirements, billing, etc.) with MANY_TO_ONE relations back to the base entity. All entities are defined as workspace entities with corresponding ObjectMetadataSeed and FieldMetadataSeed constants, then registered in the DevSeederMetadataService.

**Tech Stack:** Twenty workspace entities, TypeScript, PostgreSQL 16, FieldMetadataType from twenty-shared

**Dependencies:** None (Phase 1 is foundational)

---

## File Structure

```
packages/twenty-server/src/
├── modules/flent/
│   ├── tenant/
│   │   ├── standard-objects/
│   │   │   ├── tenant.workspace-entity.ts
│   │   │   ├── tenant-attribution.workspace-entity.ts
│   │   │   ├── tenant-requirements.workspace-entity.ts
│   │   │   ├── tenant-qualification.workspace-entity.ts
│   │   │   ├── tenant-visit-summary.workspace-entity.ts
│   │   │   └── tenant-satisfaction.workspace-entity.ts
│   │   └── constants/
│   │       ├── tenant-object-seed.constant.ts
│   │       ├── tenant-field-seeds.constant.ts
│   │       ├── tenant-relation-seeds.constant.ts
│   │       ├── tenant-attribution-object-seed.constant.ts
│   │       ├── tenant-attribution-field-seeds.constant.ts
│   │       ├── tenant-attribution-relation-seeds.constant.ts
│   │       ├── tenant-requirements-object-seed.constant.ts
│   │       ├── tenant-requirements-field-seeds.constant.ts
│   │       ├── tenant-requirements-relation-seeds.constant.ts
│   │       ├── tenant-qualification-object-seed.constant.ts
│   │       ├── tenant-qualification-field-seeds.constant.ts
│   │       ├── tenant-qualification-relation-seeds.constant.ts
│   │       ├── tenant-visit-summary-object-seed.constant.ts
│   │       ├── tenant-visit-summary-field-seeds.constant.ts
│   │       ├── tenant-visit-summary-relation-seeds.constant.ts
│   │       ├── tenant-satisfaction-object-seed.constant.ts
│   │       ├── tenant-satisfaction-field-seeds.constant.ts
│   │       └── tenant-satisfaction-relation-seeds.constant.ts
│   ├── merchant/
│   │   ├── standard-objects/
│   │   │   ├── merchant.workspace-entity.ts
│   │   │   ├── merchant-landlord.workspace-entity.ts
│   │   │   ├── merchant-poc.workspace-entity.ts
│   │   │   ├── merchant-broker.workspace-entity.ts
│   │   │   └── merchant-management.workspace-entity.ts
│   │   └── constants/
│   │       ├── merchant-object-seed.constant.ts
│   │       ├── merchant-field-seeds.constant.ts
│   │       ├── merchant-landlord-object-seed.constant.ts
│   │       ├── merchant-landlord-field-seeds.constant.ts
│   │       ├── merchant-landlord-relation-seeds.constant.ts
│   │       ├── merchant-poc-object-seed.constant.ts
│   │       ├── merchant-poc-relation-seeds.constant.ts
│   │       ├── merchant-broker-object-seed.constant.ts
│   │       ├── merchant-broker-relation-seeds.constant.ts
│   │       ├── merchant-management-object-seed.constant.ts
│   │       └── merchant-management-relation-seeds.constant.ts
│   └── vendor/
│       ├── standard-objects/
│       │   ├── vendor.workspace-entity.ts
│       │   ├── vendor-contact.workspace-entity.ts
│       │   ├── vendor-billing.workspace-entity.ts
│       │   ├── vendor-capability.workspace-entity.ts
│       │   └── vendor-commercials.workspace-entity.ts
│       └── constants/
│           ├── vendor-object-seed.constant.ts
│           ├── vendor-field-seeds.constant.ts
│           ├── vendor-contact-object-seed.constant.ts
│           ├── vendor-contact-field-seeds.constant.ts
│           ├── vendor-contact-relation-seeds.constant.ts
│           ├── vendor-billing-object-seed.constant.ts
│           ├── vendor-billing-field-seeds.constant.ts
│           ├── vendor-billing-relation-seeds.constant.ts
│           ├── vendor-capability-object-seed.constant.ts
│           ├── vendor-capability-field-seeds.constant.ts
│           ├── vendor-capability-relation-seeds.constant.ts
│           ├── vendor-commercials-object-seed.constant.ts
│           ├── vendor-commercials-field-seeds.constant.ts
│           └── vendor-commercials-relation-seeds.constant.ts
└── engine/workspace-manager/dev-seeder/metadata/
    └── services/dev-seeder-metadata.service.ts  # Modified to register all 16 entities
```

---

## Task 1: Tenant Base Entity

**Files:**
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant.workspace-entity.ts`

This task creates the Tenant base entity with identity fields (name, email, phone), KYC documents, social links, and lifecycle tracking.

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/tenant/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/tenant/constants
```

- [ ] **Step 2: Create the Tenant object seed constant**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenants',
  labelSingular: 'Tenant',
  namePlural: 'tenants',
  nameSingular: 'tenant',
  icon: 'IconUser',
  description: 'A person who rents or inquires about renting a property',
};
```

- [ ] **Step 3: Create the Tenant field seeds constant**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.FULL_NAME,
    name: 'name',
    label: 'Name',
    description: "Tenant's full name",
    icon: 'IconUser',
    isNullable: false,
  },
  {
    type: FieldMetadataType.EMAILS,
    name: 'emails',
    label: 'Email',
    description: "Tenant's email address",
    icon: 'IconMail',
    isNullable: false,
  },
  {
    type: FieldMetadataType.PHONES,
    name: 'phones',
    label: 'Phone',
    description: "Tenant's mobile and WhatsApp numbers",
    icon: 'IconPhone',
    isNullable: false,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'gender',
    label: 'Gender',
    description: "Tenant's gender",
    icon: 'IconGenderBigender',
    options: [
      { label: 'Male', value: 'MALE', position: 0, color: 'blue' },
      { label: 'Female', value: 'FEMALE', position: 1, color: 'pink' },
    ],
  },
  {
    type: FieldMetadataType.DATE,
    name: 'dateOfBirth',
    label: 'Date of Birth',
    description: "Tenant's date of birth",
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'aadhaarNumber',
    label: 'Aadhaar Number',
    description: "Tenant's Aadhaar ID number",
    icon: 'IconId',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'aadhaarFrontImage',
    label: 'Aadhaar Front Image',
    description: "URL to tenant's Aadhaar card front image",
    icon: 'IconPhoto',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'aadhaarBackImage',
    label: 'Aadhaar Back Image',
    description: "URL to tenant's Aadhaar card back image",
    icon: 'IconPhoto',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'pan',
    label: 'PAN',
    description: "Tenant's PAN number",
    icon: 'IconId',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'panCardImage',
    label: 'PAN Card Image',
    description: "URL to tenant's PAN card image",
    icon: 'IconPhoto',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'linkedinUrl',
    label: 'LinkedIn',
    description: "Tenant's LinkedIn profile URL",
    icon: 'IconBrandLinkedin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'twitterUrl',
    label: 'Twitter',
    description: "Tenant's Twitter profile URL",
    icon: 'IconBrandTwitter',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'instagramId',
    label: 'Instagram ID',
    description: "Tenant's Instagram handle",
    icon: 'IconBrandInstagram',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'occupation',
    label: 'Occupation',
    description: "Tenant's current occupation",
    icon: 'IconBriefcase',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'employerName',
    label: 'Employer Name',
    description: "Tenant's employer name",
    icon: 'IconBuilding',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'tenantLifecycle',
    label: 'Lifecycle Stage',
    description: "Tenant's current lifecycle stage",
    icon: 'IconTimeline',
    options: [
      { label: 'New Inquiry', value: 'NEW_INQUIRY', position: 0, color: 'sky' },
      { label: 'Visit Scheduled', value: 'VISIT_SCHEDULED', position: 1, color: 'blue' },
      { label: 'Visit Done', value: 'VISIT_DONE', position: 2, color: 'turquoise' },
      { label: 'Negotiation', value: 'NEGOTIATION', position: 3, color: 'yellow' },
      { label: 'Converted', value: 'CONVERTED', position: 4, color: 'green' },
      { label: 'Gestation', value: 'GESTATION', position: 5, color: 'purple' },
      { label: 'Moved In', value: 'MOVED_IN', position: 6, color: 'green' },
      { label: 'Notice Period', value: 'NOTICE_PERIOD', position: 7, color: 'orange' },
      { label: 'Moved Out', value: 'MOVED_OUT', position: 8, color: 'red' },
      { label: 'Dead Lead', value: 'DEAD_LEAD', position: 9, color: 'red' },
    ],
  },
];
```

- [ ] **Step 4: Create the Tenant workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant.workspace-entity.ts`

```typescript
import {
  type EmailsMetadata,
  FieldMetadataType,
  type FullNameMetadata,
  type LinksMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantAttributionWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-attribution.workspace-entity';
import { type TenantRequirementsWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-requirements.workspace-entity';
import { type TenantQualificationWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-qualification.workspace-entity';
import { type TenantVisitSummaryWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-visit-summary.workspace-entity';
import { type TenantSatisfactionWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant-satisfaction.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_TENANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

export class TenantWorkspaceEntity extends BaseWorkspaceEntity {
  // Identity
  name: FullNameMetadata | null;
  emails: EmailsMetadata;
  phones: PhonesMetadata;
  gender: string | null;
  dateOfBirth: Date | null;

  // KYC Documents
  aadhaarNumber: string;
  aadhaarFrontImage: LinksMetadata | null;
  aadhaarBackImage: LinksMetadata | null;
  pan: string;
  panCardImage: LinksMetadata | null;

  // Social
  linkedinUrl: LinksMetadata | null;
  twitterUrl: LinksMetadata | null;
  instagramId: string | null;

  // Employment
  occupation: string | null;
  employerName: string | null;

  // Lifecycle
  tenantLifecycle: string | null;

  // Relations to extensions (ONE_TO_MANY from tenant perspective)
  tenantAttributions: EntityRelation<TenantAttributionWorkspaceEntity[]>;
  tenantRequirements: EntityRelation<TenantRequirementsWorkspaceEntity[]>;
  tenantQualifications: EntityRelation<TenantQualificationWorkspaceEntity[]>;
  tenantVisitSummaries: EntityRelation<TenantVisitSummaryWorkspaceEntity[]>;
  tenantSatisfactions: EntityRelation<TenantSatisfactionWorkspaceEntity[]>;

  // Deferred relations (Phase 2)
  // currentProperty: EntityRelation<PropertyWorkspaceEntity> | null;
  // currentPropertyId: string | null;
  // currentRoom: EntityRelation<RoomWorkspaceEntity> | null;
  // currentRoomId: string | null;

  searchVector: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/twenty-server/src/modules/flent/tenant/constants/tenant-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant.workspace-entity.ts
git commit -m "feat(flent): add Tenant base workspace entity with identity, KYC, and lifecycle fields"
```

---

## Task 2: Tenant Attribution + Requirements Extensions

**Files:**
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-attribution.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-requirements.workspace-entity.ts`

- [ ] **Step 1: Create TenantAttribution object seed**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_ATTRIBUTION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Attributions',
  labelSingular: 'Tenant Attribution',
  namePlural: 'tenantAttributions',
  nameSingular: 'tenantAttribution',
  icon: 'IconTarget',
  description: 'Marketing attribution and source tracking for tenant leads',
  skipNameField: true,
};
```

- [ ] **Step 2: Create TenantAttribution field seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_ATTRIBUTION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.DATE_TIME,
    name: 'createDate',
    label: 'Create Date',
    description: 'Date the tenant record was first created',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'firstInquiryChannel',
    label: 'First Inquiry Channel',
    description: 'Channel through which the tenant first made contact',
    icon: 'IconBrandWhatsapp',
    options: [
      { label: 'WhatsApp', value: 'WHATSAPP', position: 0, color: 'green' },
      { label: 'Website', value: 'WEBSITE', position: 1, color: 'blue' },
      { label: 'Instagram', value: 'INSTAGRAM', position: 2, color: 'purple' },
      { label: 'Facebook', value: 'FACEBOOK', position: 3, color: 'blue' },
      { label: 'Direct Call', value: 'DIRECT_CALL', position: 4, color: 'sky' },
      { label: 'Walk-in', value: 'WALK_IN', position: 5, color: 'turquoise' },
      { label: 'Platform', value: 'PLATFORM', position: 6, color: 'yellow' },
      { label: 'Referral', value: 'REFERRAL', position: 7, color: 'orange' },
      { label: 'Offline Activation', value: 'OFFLINE_ACTIVATION', position: 8, color: 'red' },
      { label: 'LinkedIn', value: 'LINKEDIN', position: 9, color: 'blue' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'sourceDrilldown1',
    label: 'Source Drilldown 1',
    description: 'Primary source drilldown for attribution',
    icon: 'IconSearch',
    options: [
      { label: 'Google Ads', value: 'GOOGLE_ADS', position: 0, color: 'blue' },
      { label: 'Meta Ads', value: 'META_ADS', position: 1, color: 'blue' },
      { label: 'Instagram Ads', value: 'INSTAGRAM_ADS', position: 2, color: 'purple' },
      { label: 'YouTube Ads', value: 'YOUTUBE_ADS', position: 3, color: 'red' },
      { label: 'Housing.com', value: 'HOUSING_COM', position: 4, color: 'orange' },
      { label: 'MagicBricks', value: 'MAGICBRICKS', position: 5, color: 'red' },
      { label: 'NoBroker', value: 'NOBROKER', position: 6, color: 'green' },
      { label: '99acres', value: 'NINETY_NINE_ACRES', position: 7, color: 'yellow' },
      { label: 'WhatsApp Organic', value: 'WHATSAPP_ORGANIC', position: 8, color: 'green' },
      { label: 'Walk-in', value: 'WALK_IN', position: 9, color: 'turquoise' },
      { label: 'Referral', value: 'REFERRAL', position: 10, color: 'orange' },
      { label: 'Direct Call', value: 'DIRECT_CALL', position: 11, color: 'sky' },
      { label: 'Other', value: 'OTHER', position: 12, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'sourceDrilldown2',
    label: 'Source Drilldown 2',
    description: 'Secondary source drilldown detail',
    icon: 'IconSearch',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'waxCode',
    label: 'WAX Code',
    description: 'WhatsApp business code for tracking',
    icon: 'IconCode',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'googleClickId',
    label: 'Google Click ID',
    description: 'GCLID from Google Ads tracking',
    icon: 'IconBrandGoogle',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'facebookClickId',
    label: 'Facebook Click ID',
    description: 'FBCLID from Facebook Ads tracking',
    icon: 'IconBrandFacebook',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'utmSource',
    label: 'UTM Source',
    description: 'UTM source parameter',
    icon: 'IconLink',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'utmMedium',
    label: 'UTM Medium',
    description: 'UTM medium parameter',
    icon: 'IconLink',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'utmCampaign',
    label: 'UTM Campaign',
    description: 'UTM campaign parameter',
    icon: 'IconLink',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'utmContent',
    label: 'UTM Content',
    description: 'UTM content parameter',
    icon: 'IconLink',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'utmTerm',
    label: 'UTM Term',
    description: 'UTM term parameter',
    icon: 'IconLink',
    isNullable: true,
    defaultValue: "''",
  },
];
```

- [ ] **Step 3: Create TenantAttribution relation seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-relation-seeds.constant.ts`

```typescript
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_ATTRIBUTION_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantAttributions',
    label: 'Attributions',
    icon: 'IconTarget',
    targetObjectName: 'tenantAttribution',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 4: Create TenantAttribution workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-attribution.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantAttributionWorkspaceEntity extends BaseWorkspaceEntity {
  // Attribution tracking
  createDate: string | null;
  firstInquiryChannel: string | null;
  sourceDrilldown1: string | null;
  sourceDrilldown2: string | null;
  waxCode: string | null;

  // Click IDs
  googleClickId: string | null;
  facebookClickId: string | null;

  // UTM Parameters
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
```

- [ ] **Step 5: Create TenantRequirements object seed**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_REQUIREMENTS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Requirements',
  labelSingular: 'Tenant Requirement',
  namePlural: 'tenantRequirements',
  nameSingular: 'tenantRequirement',
  icon: 'IconChecklist',
  description: 'Housing preferences and requirements for tenants',
  skipNameField: true,
};
```

- [ ] **Step 6: Create TenantRequirements field seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_REQUIREMENTS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.MULTI_SELECT,
    name: 'preferredMicromarkets',
    label: 'Preferred Micromarkets',
    description: 'Micromarket areas the tenant prefers',
    icon: 'IconMapPin',
    options: [
      { label: 'HSR', value: 'HSR', position: 0, color: 'blue' },
      { label: 'Koramangala', value: 'KORAMANGALA', position: 1, color: 'green' },
      { label: 'Indiranagar', value: 'INDIRANAGAR', position: 2, color: 'purple' },
      { label: 'Marathahalli', value: 'MARATHAHALLI', position: 3, color: 'orange' },
      { label: 'Bellandur', value: 'BELLANDUR', position: 4, color: 'sky' },
      { label: 'Mahadevapura', value: 'MAHADEVAPURA', position: 5, color: 'turquoise' },
      { label: 'Whitefield', value: 'WHITEFIELD', position: 6, color: 'yellow' },
      { label: 'Hebbal', value: 'HEBBAL', position: 7, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'preferredOccupancyType',
    label: 'Preferred Occupancy Type',
    description: 'Full home vs private room preference',
    icon: 'IconHome',
    options: [
      { label: 'Full Home', value: 'FULL_HOME', position: 0, color: 'blue' },
      { label: 'Private Room', value: 'PRIVATE_ROOM', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'preferredFurnishedType',
    label: 'Preferred Furnished Type',
    description: 'Furnishing preference',
    icon: 'IconArmchair',
    options: [
      { label: 'Furnished', value: 'FURNISHED', position: 0, color: 'green' },
      { label: 'Semi-Furnished', value: 'SEMI_FURNISHED', position: 1, color: 'yellow' },
      { label: 'Unfurnished', value: 'UNFURNISHED', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'preferredMoveInTimeline',
    label: 'Preferred Move-in Timeline',
    description: 'When the tenant intends to move in',
    icon: 'IconClock',
    options: [
      { label: 'Immediate', value: 'IMMEDIATE', position: 0, color: 'green' },
      { label: 'Within 2 Weeks', value: 'WITHIN_2_WEEKS', position: 1, color: 'yellow' },
      { label: 'Flexible', value: 'FLEXIBLE', position: 2, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'genderPreferences',
    label: 'Gender Preferences',
    description: 'Preferred gender mix in shared housing',
    icon: 'IconGenderBigender',
    options: [
      { label: 'Male Only', value: 'MALE_ONLY', position: 0, color: 'blue' },
      { label: 'Female Only', value: 'FEMALE_ONLY', position: 1, color: 'pink' },
      { label: 'No Preference', value: 'NO_PREFERENCE', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'foodPreferences',
    label: 'Food Preferences',
    description: "Tenant's dietary preferences",
    icon: 'IconSalad',
    options: [
      { label: 'Vegetarian', value: 'VEGETARIAN', position: 0, color: 'green' },
      { label: 'Non-Vegetarian', value: 'NON_VEGETARIAN', position: 1, color: 'red' },
      { label: 'Vegan', value: 'VEGAN', position: 2, color: 'turquoise' },
      { label: 'No Preference', value: 'NO_PREFERENCE', position: 3, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'hasPet',
    label: 'Has Pet',
    description: 'Whether the tenant has a pet',
    icon: 'IconPaw',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'smokingPreferences',
    label: 'Smoking Preferences',
    description: "Tenant's smoking habits",
    icon: 'IconSmoking',
    options: [
      { label: 'Smoker', value: 'SMOKER', position: 0, color: 'red' },
      { label: 'Non-Smoker', value: 'NON_SMOKER', position: 1, color: 'green' },
      { label: 'Occasional', value: 'OCCASIONAL', position: 2, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'customPreference',
    label: 'Custom Preference',
    description: 'Free-text custom preferences and notes',
    icon: 'IconNote',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'budgetMax',
    label: 'Budget Max',
    description: "Tenant's maximum monthly budget",
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
];
```

- [ ] **Step 7: Create TenantRequirements relation seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-relation-seeds.constant.ts`

```typescript
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_REQUIREMENTS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantRequirements',
    label: 'Requirements',
    icon: 'IconChecklist',
    targetObjectName: 'tenantRequirement',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 8: Create TenantRequirements workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-requirements.workspace-entity.ts`

```typescript
import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantRequirementsWorkspaceEntity extends BaseWorkspaceEntity {
  // Preferences
  preferredMicromarkets: string[] | null;
  preferredOccupancyType: string | null;
  preferredFurnishedType: string | null;
  preferredMoveInTimeline: string | null;
  genderPreferences: string | null;
  foodPreferences: string | null;
  hasPet: boolean | null;
  smokingPreferences: string | null;
  customPreference: string | null;

  // Budget
  budgetMax: CurrencyMetadata | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
```

- [ ] **Step 9: Commit**

```bash
git add packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-attribution-relation-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-attribution.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-requirements-relation-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-requirements.workspace-entity.ts
git commit -m "feat(flent): add TenantAttribution and TenantRequirements extension entities"
```

---

## Task 3: Tenant Qualification + Visit Summary + Satisfaction Extensions

**Files:**
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-qualification.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-visit-summary.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-satisfaction.workspace-entity.ts`

- [ ] **Step 1: Create TenantQualification object seed**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_QUALIFICATION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Qualifications',
  labelSingular: 'Tenant Qualification',
  namePlural: 'tenantQualifications',
  nameSingular: 'tenantQualification',
  icon: 'IconShieldCheck',
  description: 'Qualification status and background verification for tenants',
  skipNameField: true,
};
```

- [ ] **Step 2: Create TenantQualification field seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_QUALIFICATION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'qualificationStatus',
    label: 'Qualification Status',
    description: 'Current qualification status of the tenant',
    icon: 'IconShieldCheck',
    options: [
      { label: 'Qualified', value: 'QUALIFIED', position: 0, color: 'green' },
      { label: 'Not Qualified', value: 'NOT_QUALIFIED', position: 1, color: 'red' },
      { label: 'Dead', value: 'DEAD', position: 2, color: 'red' },
      { label: 'Paused', value: 'PAUSED', position: 3, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'disqualificationReason',
    label: 'Disqualification Reason',
    description: 'Reason for disqualification if applicable',
    icon: 'IconAlertCircle',
    options: [
      { label: 'Budget', value: 'BUDGET', position: 0, color: 'yellow' },
      { label: 'Location', value: 'LOCATION', position: 1, color: 'blue' },
      { label: 'Availability', value: 'AVAILABILITY', position: 2, color: 'orange' },
      { label: 'No Response', value: 'NO_RESPONSE', position: 3, color: 'red' },
      { label: 'Chose Competitor', value: 'CHOSE_COMPETITOR', position: 4, color: 'purple' },
      { label: 'Life Event', value: 'LIFE_EVENT', position: 5, color: 'turquoise' },
      { label: 'Other', value: 'OTHER', position: 6, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'disqualificationDetail',
    label: 'Disqualification Detail',
    description: 'Additional details about disqualification',
    icon: 'IconNote',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'bgvStatus',
    label: 'BGV Status',
    description: 'Background verification status',
    icon: 'IconSearch',
    options: [
      { label: 'Not Started', value: 'NOT_STARTED', position: 0, color: 'sky' },
      { label: 'In Progress', value: 'IN_PROGRESS', position: 1, color: 'yellow' },
      { label: 'Passed', value: 'PASSED', position: 2, color: 'green' },
      { label: 'Failed', value: 'FAILED', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'bgvReport',
    label: 'BGV Report',
    description: 'Link to background verification report',
    icon: 'IconFile',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'bgvCompletedDate',
    label: 'BGV Completed Date',
    description: 'Date when background verification was completed',
    icon: 'IconCalendarCheck',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create TenantQualification relation seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-relation-seeds.constant.ts`

```typescript
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_QUALIFICATION_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantQualifications',
    label: 'Qualifications',
    icon: 'IconShieldCheck',
    targetObjectName: 'tenantQualification',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 4: Create TenantQualification workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-qualification.workspace-entity.ts`

```typescript
import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantQualificationWorkspaceEntity extends BaseWorkspaceEntity {
  qualificationStatus: string | null;
  disqualificationReason: string | null;
  disqualificationDetail: string | null;
  bgvStatus: string | null;
  bgvReport: LinksMetadata | null;
  bgvCompletedDate: Date | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
```

- [ ] **Step 5: Create TenantVisitSummary object seed**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_VISIT_SUMMARY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Visit Summaries',
  labelSingular: 'Tenant Visit Summary',
  namePlural: 'tenantVisitSummaries',
  nameSingular: 'tenantVisitSummary',
  icon: 'IconMapPin',
  description: 'Aggregated visit statistics and feedback for tenants',
  skipNameField: true,
};
```

- [ ] **Step 6: Create TenantVisitSummary field seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-field-seeds.constant.ts`

```typescript
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_VISIT_SUMMARY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.NUMBER,
    name: 'totalVisitsCount',
    label: 'Total Visits Count',
    description: 'Total number of property visits',
    icon: 'IconHash',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'visitsCancelled',
    label: 'Visits Cancelled',
    description: 'Number of cancelled visits',
    icon: 'IconX',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'visitsCompleted',
    label: 'Visits Completed',
    description: 'Number of completed visits',
    icon: 'IconCheck',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.DATE,
    name: 'firstVisitDate',
    label: 'First Visit Date',
    description: 'Date of the first property visit',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'ridsVisited',
    label: 'RIDs Visited',
    description: 'Comma-separated list of room IDs visited',
    icon: 'IconDoor',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'feedback',
    label: 'Feedback',
    description: 'Tenant feedback from property visits',
    icon: 'IconMessage',
    isNullable: true,
  },
];
```

- [ ] **Step 7: Create TenantVisitSummary relation seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-relation-seeds.constant.ts`

```typescript
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_VISIT_SUMMARY_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantVisitSummaries',
    label: 'Visit Summaries',
    icon: 'IconMapPin',
    targetObjectName: 'tenantVisitSummary',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 8: Create TenantVisitSummary workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-visit-summary.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantVisitSummaryWorkspaceEntity extends BaseWorkspaceEntity {
  totalVisitsCount: number | null;
  visitsCancelled: number | null;
  visitsCompleted: number | null;
  firstVisitDate: Date | null;
  ridsVisited: string | null;
  feedback: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
```

- [ ] **Step 9: Create TenantSatisfaction object seed**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_SATISFACTION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Satisfactions',
  labelSingular: 'Tenant Satisfaction',
  namePlural: 'tenantSatisfactions',
  nameSingular: 'tenantSatisfaction',
  icon: 'IconStar',
  description: 'CSAT and NPS scores for tenant satisfaction tracking',
  skipNameField: true,
};
```

- [ ] **Step 10: Create TenantSatisfaction field seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-field-seeds.constant.ts`

```typescript
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_SATISFACTION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.NUMBER,
    name: 'onboardingCsatScore',
    label: 'Onboarding CSAT Score',
    description: 'Customer satisfaction score from onboarding',
    icon: 'IconStar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'offboardingCsatScore',
    label: 'Offboarding CSAT Score',
    description: 'Customer satisfaction score from offboarding',
    icon: 'IconStar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'lastNpsScore',
    label: 'Last NPS Score',
    description: 'Most recent Net Promoter Score (0-10)',
    icon: 'IconChartBar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.DATE,
    name: 'lastNpsDate',
    label: 'Last NPS Date',
    description: 'Date of the most recent NPS survey',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'npsCategory',
    label: 'NPS Category',
    description: 'NPS category based on score',
    icon: 'IconCategory',
    options: [
      { label: 'Promoter', value: 'PROMOTER', position: 0, color: 'green' },
      { label: 'Passive', value: 'PASSIVE', position: 1, color: 'yellow' },
      { label: 'Detractor', value: 'DETRACTOR', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'lastNpsComment',
    label: 'Last NPS Comment',
    description: 'Comment from the most recent NPS survey',
    icon: 'IconMessage',
    isNullable: true,
  },
];
```

- [ ] **Step 11: Create TenantSatisfaction relation seeds**

Create file: `packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-relation-seeds.constant.ts`

```typescript
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_SATISFACTION_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantSatisfactions',
    label: 'Satisfaction Scores',
    icon: 'IconStar',
    targetObjectName: 'tenantSatisfaction',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
```

- [ ] **Step 12: Create TenantSatisfaction workspace entity**

Create file: `packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-satisfaction.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantSatisfactionWorkspaceEntity extends BaseWorkspaceEntity {
  onboardingCsatScore: number | null;
  offboardingCsatScore: number | null;
  lastNpsScore: number | null;
  lastNpsDate: Date | null;
  npsCategory: string | null;
  lastNpsComment: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
```

- [ ] **Step 13: Commit**

```bash
git add packages/twenty-server/src/modules/flent/tenant/constants/tenant-qualification-*.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-qualification.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-visit-summary-*.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-visit-summary.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/tenant/constants/tenant-satisfaction-*.ts \
       packages/twenty-server/src/modules/flent/tenant/standard-objects/tenant-satisfaction.workspace-entity.ts
git commit -m "feat(flent): add TenantQualification, TenantVisitSummary, and TenantSatisfaction extensions"
```

---

## Task 4: Merchant Base Entity

**Files:**
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant.workspace-entity.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/merchant/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/merchant/constants
```

- [ ] **Step 2: Create Merchant object seed**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchants',
  labelSingular: 'Merchant',
  namePlural: 'merchants',
  nameSingular: 'merchant',
  icon: 'IconBuildingSkyscraper',
  description: 'Property owners, POCs, brokers, and management contacts',
};
```

- [ ] **Step 3: Create Merchant field seeds**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const MERCHANT_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'merchantType',
    label: 'Merchant Type',
    description: 'Type of merchant relationship',
    icon: 'IconCategory',
    options: [
      { label: 'Landlord', value: 'LANDLORD', position: 0, color: 'blue' },
      { label: 'POC', value: 'POC', position: 1, color: 'green' },
      { label: 'Lead', value: 'LEAD', position: 2, color: 'yellow' },
      { label: 'Broker', value: 'BROKER', position: 3, color: 'purple' },
      { label: 'Management', value: 'MANAGEMENT', position: 4, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'prefix',
    label: 'Prefix',
    description: 'Name prefix / salutation',
    icon: 'IconUser',
    options: [
      { label: 'Mr', value: 'MR', position: 0, color: 'blue' },
      { label: 'Mrs', value: 'MRS', position: 1, color: 'pink' },
      { label: 'Ms', value: 'MS', position: 2, color: 'purple' },
      { label: 'Dr', value: 'DR', position: 3, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.FULL_NAME,
    name: 'name',
    label: 'Name',
    description: "Merchant's full name",
    icon: 'IconUser',
    isNullable: false,
  },
  {
    type: FieldMetadataType.EMAILS,
    name: 'emails',
    label: 'Email',
    description: "Merchant's email address",
    icon: 'IconMail',
    isNullable: true,
  },
  {
    type: FieldMetadataType.PHONES,
    name: 'phones',
    label: 'Phone',
    description: "Merchant's phone numbers with country code",
    icon: 'IconPhone',
    isNullable: false,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'currentCity',
    label: 'Current City',
    description: "Merchant's current city of residence",
    icon: 'IconMapPin',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'leadSource',
    label: 'Lead Source',
    description: 'How this merchant was sourced',
    icon: 'IconTarget',
    options: [
      { label: 'Referral', value: 'REFERRAL', position: 0, color: 'green' },
      { label: 'Direct', value: 'DIRECT', position: 1, color: 'blue' },
      { label: 'Broker', value: 'BROKER', position: 2, color: 'purple' },
      { label: 'Online', value: 'ONLINE', position: 3, color: 'sky' },
      { label: 'Cold Outreach', value: 'COLD_OUTREACH', position: 4, color: 'yellow' },
      { label: 'Platform', value: 'PLATFORM', position: 5, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'uniqueId',
    label: 'Unique ID',
    description: 'External unique identifier for the merchant',
    icon: 'IconId',
    isNullable: true,
    isUnique: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'disqualificationReason',
    label: 'Disqualification Reason',
    description: 'Reason the merchant was disqualified',
    icon: 'IconAlertCircle',
    options: [
      { label: 'Price Mismatch', value: 'PRICE_MISMATCH', position: 0, color: 'yellow' },
      { label: 'Property Condition', value: 'PROPERTY_CONDITION', position: 1, color: 'orange' },
      { label: 'Location', value: 'LOCATION', position: 2, color: 'blue' },
      { label: 'Unresponsive', value: 'UNRESPONSIVE', position: 3, color: 'red' },
      { label: 'Regulatory', value: 'REGULATORY', position: 4, color: 'purple' },
      { label: 'Other', value: 'OTHER', position: 5, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'lostReason',
    label: 'Lost Reason',
    description: 'Reason the merchant deal was lost',
    icon: 'IconThumbDown',
    options: [
      { label: 'Chose Competitor', value: 'CHOSE_COMPETITOR', position: 0, color: 'red' },
      { label: 'Price', value: 'PRICE', position: 1, color: 'yellow' },
      { label: 'Timing', value: 'TIMING', position: 2, color: 'orange' },
      { label: 'Not Interested', value: 'NOT_INTERESTED', position: 3, color: 'red' },
      { label: 'Other', value: 'OTHER', position: 4, color: 'sky' },
    ],
  },
];
```

- [ ] **Step 4: Create Merchant workspace entity**

Create file: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant.workspace-entity.ts`

```typescript
import {
  type EmailsMetadata,
  FieldMetadataType,
  type FullNameMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantLandlordWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-landlord.workspace-entity';
import { type MerchantPocWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-poc.workspace-entity';
import { type MerchantBrokerWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-broker.workspace-entity';
import { type MerchantManagementWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-management.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_MERCHANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

export class MerchantWorkspaceEntity extends BaseWorkspaceEntity {
  // Type & Identity
  merchantType: string | null;
  prefix: string | null;
  name: FullNameMetadata | null;
  emails: EmailsMetadata;
  phones: PhonesMetadata;
  currentCity: string | null;

  // Lead & Status
  leadSource: string | null;
  uniqueId: string | null;
  disqualificationReason: string | null;
  lostReason: string | null;

  // Relations to extensions (ONE_TO_MANY from merchant perspective)
  merchantLandlords: EntityRelation<MerchantLandlordWorkspaceEntity[]>;
  merchantPocs: EntityRelation<MerchantPocWorkspaceEntity[]>;
  merchantBrokers: EntityRelation<MerchantBrokerWorkspaceEntity[]>;
  merchantManagements: EntityRelation<MerchantManagementWorkspaceEntity[]>;

  searchVector: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/twenty-server/src/modules/flent/merchant/constants/merchant-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/merchant/constants/merchant-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant.workspace-entity.ts
git commit -m "feat(flent): add Merchant base workspace entity with type, identity, and lead fields"
```

---

## Task 5: Merchant Extension Entities (Landlord, POC, Broker, Management)

**Files:**
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-landlord.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-poc-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-poc-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-poc.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-broker-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-broker-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-broker.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-management-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-management-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-management.workspace-entity.ts`

- [ ] **Step 1: Create MerchantLandlord object seed**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_LANDLORD_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Landlords',
  labelSingular: 'Merchant Landlord',
  namePlural: 'merchantLandlords',
  nameSingular: 'merchantLandlord',
  icon: 'IconHome',
  description: 'Landlord-specific details for merchants including KYC, banking, and personality notes',
  skipNameField: true,
};
```

- [ ] **Step 2: Create MerchantLandlord field seeds**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const MERCHANT_LANDLORD_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'landlordPersonality',
    label: 'Landlord Personality',
    description: 'Notes about landlord personality and communication style',
    icon: 'IconMoodSmile',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'generalLlComments',
    label: 'General LL Comments',
    description: 'General comments and notes about the landlord',
    icon: 'IconNote',
    isNullable: true,
  },
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'potentiallyMultihome',
    label: 'Potentially Multi-home',
    description: 'Whether the landlord may have multiple properties',
    icon: 'IconBuildingCommunity',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'designation',
    label: 'Designation',
    description: "Landlord's professional designation",
    icon: 'IconBriefcase',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'organization',
    label: 'Organization',
    description: "Landlord's organization or company",
    icon: 'IconBuilding',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'aadhaarBack',
    label: 'Aadhaar Back',
    description: 'URL to Aadhaar card back image',
    icon: 'IconPhoto',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'panNumber',
    label: 'PAN Number',
    description: "Landlord's PAN number",
    icon: 'IconId',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'panCardImage',
    label: 'PAN Card Image',
    description: 'URL to PAN card image',
    icon: 'IconPhoto',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'bankAccountNumber',
    label: 'Bank Account Number',
    description: "Landlord's bank account number",
    icon: 'IconCreditCard',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'beneficiaryName',
    label: 'Beneficiary Name',
    description: 'Bank account beneficiary name',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'ifscCode',
    label: 'IFSC Code',
    description: 'Bank IFSC code',
    icon: 'IconBuildingBank',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'currentResidential',
    label: 'Current Residential Address',
    description: "Landlord's current residential address",
    icon: 'IconMapPin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'permanentResidential',
    label: 'Permanent Residential Address',
    description: "Landlord's permanent residential address",
    icon: 'IconMapPin',
    isNullable: true,
  },
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'communicationsPermission',
    label: 'Communications Permission',
    description: 'Whether the landlord has given communications consent',
    icon: 'IconBell',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'signingAuthority',
    label: 'Signing Authority',
    description: 'Whether the landlord has signing authority',
    icon: 'IconPencil',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'linkedinUrl',
    label: 'LinkedIn',
    description: "Landlord's LinkedIn profile URL",
    icon: 'IconBrandLinkedin',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create MerchantLandlord relation seeds**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-landlord-relation-seeds.constant.ts`

```typescript
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_LANDLORD_RELATION_SEEDS: {
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
    name: 'merchantLandlords',
    label: 'Landlord Details',
    icon: 'IconHome',
    targetObjectName: 'merchantLandlord',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
```

- [ ] **Step 4: Create MerchantLandlord workspace entity**

Create file: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-landlord.workspace-entity.ts`

```typescript
import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantLandlordWorkspaceEntity extends BaseWorkspaceEntity {
  // Personality & notes
  landlordPersonality: string | null;
  generalLlComments: string | null;
  potentiallyMultihome: boolean | null;

  // Professional
  designation: string | null;
  organization: string | null;

  // KYC Documents
  aadhaarBack: LinksMetadata | null;
  panNumber: string | null;
  panCardImage: LinksMetadata | null;

  // Banking
  bankAccountNumber: string | null;
  beneficiaryName: string | null;
  ifscCode: string | null;

  // Addresses
  currentResidential: string | null;
  permanentResidential: string | null;

  // Permissions
  communicationsPermission: boolean | null;
  signingAuthority: boolean | null;

  // Social
  linkedinUrl: LinksMetadata | null;

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
```

- [ ] **Step 5: Create MerchantPoc object seed and relation seeds**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-poc-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_POC_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant POCs',
  labelSingular: 'Merchant POC',
  namePlural: 'merchantPocs',
  nameSingular: 'merchantPoc',
  icon: 'IconUserCircle',
  description: 'Point of contact details for merchant interactions (fields TBD)',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-poc-relation-seeds.constant.ts`

```typescript
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_POC_RELATION_SEEDS: {
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
    name: 'merchantPocs',
    label: 'POC Details',
    icon: 'IconUserCircle',
    targetObjectName: 'merchantPoc',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
```

- [ ] **Step 6: Create MerchantPoc workspace entity**

Create file: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-poc.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantPocWorkspaceEntity extends BaseWorkspaceEntity {
  // Fields TBD - placeholder extension entity
  // BaseWorkspaceEntity provides id, createdAt, updatedAt, deletedAt

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
```

- [ ] **Step 7: Create MerchantBroker object seed, relation seeds, and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-broker-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_BROKER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Brokers',
  labelSingular: 'Merchant Broker',
  namePlural: 'merchantBrokers',
  nameSingular: 'merchantBroker',
  icon: 'IconBriefcase',
  description: 'Broker-specific details for merchant relationships (fields TBD)',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-broker-relation-seeds.constant.ts`

```typescript
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_BROKER_RELATION_SEEDS: {
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
    name: 'merchantBrokers',
    label: 'Broker Details',
    icon: 'IconBriefcase',
    targetObjectName: 'merchantBroker',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-broker.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantBrokerWorkspaceEntity extends BaseWorkspaceEntity {
  // Fields TBD - placeholder extension entity
  // BaseWorkspaceEntity provides id, createdAt, updatedAt, deletedAt

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
```

- [ ] **Step 8: Create MerchantManagement object seed, relation seeds, and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-management-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_MANAGEMENT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Managements',
  labelSingular: 'Merchant Management',
  namePlural: 'merchantManagements',
  nameSingular: 'merchantManagement',
  icon: 'IconSettings',
  description: 'Management company details for merchant relationships (fields TBD)',
  skipNameField: true,
};
```

Create file: `packages/twenty-server/src/modules/flent/merchant/constants/merchant-management-relation-seeds.constant.ts`

```typescript
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_MANAGEMENT_RELATION_SEEDS: {
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
    name: 'merchantManagements',
    label: 'Management Details',
    icon: 'IconSettings',
    targetObjectName: 'merchantManagement',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/merchant/standard-objects/merchant-management.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantManagementWorkspaceEntity extends BaseWorkspaceEntity {
  // Fields TBD - placeholder extension entity
  // BaseWorkspaceEntity provides id, createdAt, updatedAt, deletedAt

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
```

- [ ] **Step 9: Commit**

```bash
git add packages/twenty-server/src/modules/flent/merchant/
git commit -m "feat(flent): add Merchant extension entities (Landlord, POC, Broker, Management)"
```

---

## Task 6: Vendor Base + VendorContact Extension

**Files:**
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-contact.workspace-entity.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/vendor/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/vendor/constants
```

- [ ] **Step 2: Create Vendor object seed**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendors',
  labelSingular: 'Vendor',
  namePlural: 'vendors',
  nameSingular: 'vendor',
  icon: 'IconTruck',
  description: 'Suppliers, manufacturers, and service providers',
};
```

- [ ] **Step 3: Create Vendor field seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'vendorCode',
    label: 'Vendor Code',
    description: 'Unique vendor identifier code',
    icon: 'IconBarcode',
    isNullable: false,
    isUnique: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'vendorName',
    label: 'Vendor Name',
    description: 'Vendor company or business name',
    icon: 'IconBuilding',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'vendorType',
    label: 'Vendor Type',
    description: 'Type of vendor business',
    icon: 'IconCategory',
    options: [
      { label: 'Manufacturer', value: 'MANUFACTURER', position: 0, color: 'blue' },
      { label: 'Wholesaler', value: 'WHOLESALER', position: 1, color: 'green' },
      { label: 'Distributor', value: 'DISTRIBUTOR', position: 2, color: 'purple' },
      { label: 'Freelancer', value: 'FREELANCER', position: 3, color: 'orange' },
      { label: 'Aggregator', value: 'AGGREGATOR', position: 4, color: 'yellow' },
      { label: 'Retailer', value: 'RETAILER', position: 5, color: 'sky' },
      { label: 'Landlord', value: 'LANDLORD', position: 6, color: 'turquoise' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'status',
    label: 'Status',
    description: 'Current vendor status',
    icon: 'IconCircleCheck',
    options: [
      { label: 'Active', value: 'ACTIVE', position: 0, color: 'green' },
      { label: 'Inactive', value: 'INACTIVE', position: 1, color: 'yellow' },
      { label: 'Blacklisted', value: 'BLACKLISTED', position: 2, color: 'red' },
      { label: 'On Hold', value: 'ON_HOLD', position: 3, color: 'orange' },
    ],
  },
];
```

- [ ] **Step 4: Create Vendor workspace entity**

Create file: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor.workspace-entity.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorContactWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-contact.workspace-entity';
import { type VendorBillingWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-billing.workspace-entity';
import { type VendorCapabilityWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-capability.workspace-entity';
import { type VendorCommercialsWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-commercials.workspace-entity';

const VENDOR_NAME_FIELD = 'vendorName';
const VENDOR_CODE_FIELD = 'vendorCode';

export const SEARCH_FIELDS_FOR_VENDOR: FieldTypeAndNameMetadata[] = [
  { name: VENDOR_NAME_FIELD, type: FieldMetadataType.TEXT },
  { name: VENDOR_CODE_FIELD, type: FieldMetadataType.TEXT },
];

export class VendorWorkspaceEntity extends BaseWorkspaceEntity {
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  status: string | null;

  // Relations to extensions
  vendorContacts: EntityRelation<VendorContactWorkspaceEntity[]>;
  vendorBillings: EntityRelation<VendorBillingWorkspaceEntity[]>;
  vendorCapabilities: EntityRelation<VendorCapabilityWorkspaceEntity[]>;
  vendorCommercials: EntityRelation<VendorCommercialsWorkspaceEntity[]>;

  searchVector: string;
}
```

- [ ] **Step 5: Create VendorContact object seed**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_CONTACT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Contacts',
  labelSingular: 'Vendor Contact',
  namePlural: 'vendorContacts',
  nameSingular: 'vendorContact',
  icon: 'IconAddressBook',
  description: 'Contact information and address for vendors',
  skipNameField: true,
};
```

- [ ] **Step 6: Create VendorContact field seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_CONTACT_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'contactName',
    label: 'Contact Name',
    description: 'Name of the vendor contact person',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.PHONES,
    name: 'phones',
    label: 'Phone',
    description: 'Vendor contact phone numbers',
    icon: 'IconPhone',
    isNullable: true,
  },
  {
    type: FieldMetadataType.EMAILS,
    name: 'emails',
    label: 'Email',
    description: 'Vendor contact email addresses',
    icon: 'IconMail',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'city',
    label: 'City',
    description: 'Vendor contact city',
    icon: 'IconMapPin',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.ADDRESS,
    name: 'address',
    label: 'Address',
    description: 'Vendor contact full address',
    icon: 'IconMapPin',
    isNullable: true,
  },
];
```

- [ ] **Step 7: Create VendorContact relation seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-relation-seeds.constant.ts`

```typescript
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_CONTACT_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'vendorContacts',
    label: 'Contacts',
    icon: 'IconAddressBook',
    targetObjectName: 'vendorContact',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
```

- [ ] **Step 8: Create VendorContact workspace entity**

Create file: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-contact.workspace-entity.ts`

```typescript
import {
  type AddressMetadata,
  type EmailsMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorContactWorkspaceEntity extends BaseWorkspaceEntity {
  contactName: string | null;
  phones: PhonesMetadata;
  emails: EmailsMetadata;
  city: string | null;
  address: AddressMetadata | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
```

- [ ] **Step 9: Commit**

```bash
git add packages/twenty-server/src/modules/flent/vendor/constants/vendor-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-object-seed.constant.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-field-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-contact-relation-seeds.constant.ts \
       packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-contact.workspace-entity.ts
git commit -m "feat(flent): add Vendor base and VendorContact extension entities"
```

---

## Task 7: Vendor Billing + Capability + Commercials Extensions

**Files:**
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-billing.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-capability.workspace-entity.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-relation-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-commercials.workspace-entity.ts`

- [ ] **Step 1: Create VendorBilling object seed**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_BILLING_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Billings',
  labelSingular: 'Vendor Billing',
  namePlural: 'vendorBillings',
  nameSingular: 'vendorBilling',
  icon: 'IconFileInvoice',
  description: 'GST, PAN, banking, and MSME details for vendor billing',
  skipNameField: true,
};
```

- [ ] **Step 2: Create VendorBilling field seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_BILLING_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'gstNumber',
    label: 'GST Number',
    description: 'Vendor GST registration number',
    icon: 'IconFileInvoice',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'pan',
    label: 'PAN',
    description: 'Vendor PAN number',
    icon: 'IconId',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'billingName',
    label: 'Billing Name',
    description: 'Name to appear on billing documents',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'bankName',
    label: 'Bank Name',
    description: 'Name of the bank for vendor payments',
    icon: 'IconBuildingBank',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'bankAccountNumber',
    label: 'Bank Account Number',
    description: 'Vendor bank account number',
    icon: 'IconCreditCard',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'ifscCode',
    label: 'IFSC Code',
    description: 'Bank IFSC code for fund transfers',
    icon: 'IconBuildingBank',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'msmeVendor',
    label: 'MSME Vendor',
    description: 'Whether the vendor is MSME registered',
    icon: 'IconCertificate',
    options: [
      { label: 'Yes', value: 'YES', position: 0, color: 'green' },
      { label: 'No', value: 'NO', position: 1, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'udyamAadhaar',
    label: 'Udyam Aadhaar',
    description: 'MSME Udyam Aadhaar registration number',
    icon: 'IconCertificate',
    isNullable: true,
    defaultValue: "''",
  },
];
```

- [ ] **Step 3: Create VendorBilling relation seeds and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-relation-seeds.constant.ts`

```typescript
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_BILLING_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'vendorBillings',
    label: 'Billing Details',
    icon: 'IconFileInvoice',
    targetObjectName: 'vendorBilling',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-billing.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorBillingWorkspaceEntity extends BaseWorkspaceEntity {
  gstNumber: string | null;
  pan: string | null;
  billingName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  msmeVendor: string | null;
  udyamAadhaar: string | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
```

- [ ] **Step 4: Create VendorCapability object seed**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_CAPABILITY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Capabilities',
  labelSingular: 'Vendor Capability',
  namePlural: 'vendorCapabilities',
  nameSingular: 'vendorCapability',
  icon: 'IconTools',
  description: 'Vendor specialization, TAT, and customization capabilities',
  skipNameField: true,
};
```

- [ ] **Step 5: Create VendorCapability field seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-field-seeds.constant.ts`

```typescript
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_CAPABILITY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'specialization',
    label: 'Specialization',
    description: 'Areas of specialization for this vendor',
    icon: 'IconBulb',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'tatInDays',
    label: 'TAT (Days)',
    description: 'Typical turnaround time in days',
    icon: 'IconClock',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.SELECT,
    name: 'customizationCapability',
    label: 'Customization Capability',
    description: 'Level of customization the vendor can provide',
    icon: 'IconPalette',
    options: [
      { label: 'Low', value: 'LOW', position: 0, color: 'red' },
      { label: 'Medium', value: 'MEDIUM', position: 1, color: 'yellow' },
      { label: 'High', value: 'HIGH', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'standardisationFit',
    label: 'Standardisation Fit',
    description: 'How well the vendor fits standardised procurement categories',
    icon: 'IconAdjustments',
    options: [
      { label: 'C1', value: 'C1', position: 0, color: 'green' },
      { label: 'C2', value: 'C2', position: 1, color: 'yellow' },
      { label: 'C3', value: 'C3', position: 2, color: 'red' },
    ],
  },
];
```

- [ ] **Step 6: Create VendorCapability relation seeds and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-relation-seeds.constant.ts`

```typescript
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_CAPABILITY_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'vendorCapabilities',
    label: 'Capabilities',
    icon: 'IconTools',
    targetObjectName: 'vendorCapability',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-capability.workspace-entity.ts`

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorCapabilityWorkspaceEntity extends BaseWorkspaceEntity {
  specialization: string | null;
  tatInDays: number | null;
  customizationCapability: string | null;
  standardisationFit: string | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
```

- [ ] **Step 7: Create VendorCommercials object seed**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-object-seed.constant.ts`

```typescript
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_COMMERCIALS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Commercials',
  labelSingular: 'Vendor Commercial',
  namePlural: 'vendorCommercials',
  nameSingular: 'vendorCommercial',
  icon: 'IconCash',
  description: 'Commercial terms, quality tier, and pricing for vendors',
  skipNameField: true,
};
```

- [ ] **Step 8: Create VendorCommercials field seeds**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-field-seeds.constant.ts`

```typescript
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_COMMERCIALS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'qualityTier',
    label: 'Quality Tier',
    description: 'Vendor quality classification tier',
    icon: 'IconStar',
    options: [
      { label: 'T1', value: 'T1', position: 0, color: 'green' },
      { label: 'T2', value: 'T2', position: 1, color: 'yellow' },
      { label: 'T3', value: 'T3', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'paymentTerms',
    label: 'Payment Terms',
    description: 'Payment terms agreed with the vendor',
    icon: 'IconCreditCard',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'minOrderValue',
    label: 'Min Order Value',
    description: 'Minimum order value for this vendor',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'negotiationRemarks',
    label: 'Negotiation Remarks',
    description: 'Notes from price and terms negotiations',
    icon: 'IconNote',
    isNullable: true,
  },
];
```

- [ ] **Step 9: Create VendorCommercials relation seeds and workspace entity**

Create file: `packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-relation-seeds.constant.ts`

```typescript
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_COMMERCIALS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'vendorCommercials',
    label: 'Commercials',
    icon: 'IconCash',
    targetObjectName: 'vendorCommercial',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
```

Create file: `packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-commercials.workspace-entity.ts`

```typescript
import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorCommercialsWorkspaceEntity extends BaseWorkspaceEntity {
  qualityTier: string | null;
  paymentTerms: string | null;
  minOrderValue: CurrencyMetadata | null;
  negotiationRemarks: string | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
```

- [ ] **Step 10: Commit**

```bash
git add packages/twenty-server/src/modules/flent/vendor/constants/vendor-billing-*.ts \
       packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-billing.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-capability-*.ts \
       packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-capability.workspace-entity.ts \
       packages/twenty-server/src/modules/flent/vendor/constants/vendor-commercials-*.ts \
       packages/twenty-server/src/modules/flent/vendor/standard-objects/vendor-commercials.workspace-entity.ts
git commit -m "feat(flent): add VendorBilling, VendorCapability, and VendorCommercials extensions"
```

---

## Task 8: Register All 16 Entities in DevSeederMetadataService

**Files:**
- Modify: `packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts`

This task registers all 16 Flent entities (3 base + 13 extensions) into the DevSeederMetadataService so they are created when the dev seeder runs. The relations (ONE_TO_MANY from base to extension) are established via junctionFields in the seed config.

- [ ] **Step 1: Add all Flent seed imports to DevSeederMetadataService**

At the top of the file, after the existing imports, add:

```typescript
// --- Flent Phase 1: Tenant ---
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';
import { TENANT_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-field-seeds.constant';
import { TENANT_ATTRIBUTION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-attribution-object-seed.constant';
import { TENANT_ATTRIBUTION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-attribution-field-seeds.constant';
import { TENANT_REQUIREMENTS_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-requirements-object-seed.constant';
import { TENANT_REQUIREMENTS_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-requirements-field-seeds.constant';
import { TENANT_QUALIFICATION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-qualification-object-seed.constant';
import { TENANT_QUALIFICATION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-qualification-field-seeds.constant';
import { TENANT_VISIT_SUMMARY_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-visit-summary-object-seed.constant';
import { TENANT_VISIT_SUMMARY_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-visit-summary-field-seeds.constant';
import { TENANT_SATISFACTION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-satisfaction-object-seed.constant';
import { TENANT_SATISFACTION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-satisfaction-field-seeds.constant';

// --- Flent Phase 1: Merchant ---
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';
import { MERCHANT_FIELD_SEEDS } from 'src/modules/flent/merchant/constants/merchant-field-seeds.constant';
import { MERCHANT_LANDLORD_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-landlord-object-seed.constant';
import { MERCHANT_LANDLORD_FIELD_SEEDS } from 'src/modules/flent/merchant/constants/merchant-landlord-field-seeds.constant';
import { MERCHANT_POC_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-poc-object-seed.constant';
import { MERCHANT_BROKER_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-broker-object-seed.constant';
import { MERCHANT_MANAGEMENT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-management-object-seed.constant';

// --- Flent Phase 1: Vendor ---
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';
import { VENDOR_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-field-seeds.constant';
import { VENDOR_CONTACT_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-contact-object-seed.constant';
import { VENDOR_CONTACT_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-contact-field-seeds.constant';
import { VENDOR_BILLING_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-billing-object-seed.constant';
import { VENDOR_BILLING_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-billing-field-seeds.constant';
import { VENDOR_CAPABILITY_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-capability-object-seed.constant';
import { VENDOR_CAPABILITY_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-capability-field-seeds.constant';
import { VENDOR_COMMERCIALS_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-commercials-object-seed.constant';
import { VENDOR_COMMERCIALS_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-commercials-field-seeds.constant';
```

- [ ] **Step 2: Add Flent objects and relations to the SEED_APPLE_WORKSPACE_ID config**

Inside the `workspaceConfigs` for `SEED_APPLE_WORKSPACE_ID`, add the following after the existing entries in the `objects` array:

```typescript
// --- Flent Phase 1: Tenant (base + 5 extensions) ---
{ seed: TENANT_OBJECT_SEED, fields: TENANT_FIELD_SEEDS },
{ seed: TENANT_ATTRIBUTION_OBJECT_SEED, fields: TENANT_ATTRIBUTION_FIELD_SEEDS },
{ seed: TENANT_REQUIREMENTS_OBJECT_SEED, fields: TENANT_REQUIREMENTS_FIELD_SEEDS },
{ seed: TENANT_QUALIFICATION_OBJECT_SEED, fields: TENANT_QUALIFICATION_FIELD_SEEDS },
{ seed: TENANT_VISIT_SUMMARY_OBJECT_SEED, fields: TENANT_VISIT_SUMMARY_FIELD_SEEDS },
{ seed: TENANT_SATISFACTION_OBJECT_SEED, fields: TENANT_SATISFACTION_FIELD_SEEDS },

// --- Flent Phase 1: Merchant (base + 4 extensions) ---
{ seed: MERCHANT_OBJECT_SEED, fields: MERCHANT_FIELD_SEEDS },
{ seed: MERCHANT_LANDLORD_OBJECT_SEED, fields: MERCHANT_LANDLORD_FIELD_SEEDS },
{ seed: MERCHANT_POC_OBJECT_SEED },
{ seed: MERCHANT_BROKER_OBJECT_SEED },
{ seed: MERCHANT_MANAGEMENT_OBJECT_SEED },

// --- Flent Phase 1: Vendor (base + 4 extensions) ---
{ seed: VENDOR_OBJECT_SEED, fields: VENDOR_FIELD_SEEDS },
{ seed: VENDOR_CONTACT_OBJECT_SEED, fields: VENDOR_CONTACT_FIELD_SEEDS },
{ seed: VENDOR_BILLING_OBJECT_SEED, fields: VENDOR_BILLING_FIELD_SEEDS },
{ seed: VENDOR_CAPABILITY_OBJECT_SEED, fields: VENDOR_CAPABILITY_FIELD_SEEDS },
{ seed: VENDOR_COMMERCIALS_OBJECT_SEED, fields: VENDOR_COMMERCIALS_FIELD_SEEDS },
```

And add the following to the `junctionFields` array to establish the ONE_TO_MANY relations from base to extension entities:

```typescript
// --- Flent Tenant extensions ---
{
  sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
  name: 'tenantAttributions',
  label: 'Attributions',
  icon: 'IconTarget',
  targetObjectName: TENANT_ATTRIBUTION_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Tenant',
  targetFieldIcon: 'IconUser',
},
{
  sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
  name: 'tenantRequirements',
  label: 'Requirements',
  icon: 'IconChecklist',
  targetObjectName: TENANT_REQUIREMENTS_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Tenant',
  targetFieldIcon: 'IconUser',
},
{
  sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
  name: 'tenantQualifications',
  label: 'Qualifications',
  icon: 'IconShieldCheck',
  targetObjectName: TENANT_QUALIFICATION_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Tenant',
  targetFieldIcon: 'IconUser',
},
{
  sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
  name: 'tenantVisitSummaries',
  label: 'Visit Summaries',
  icon: 'IconMapPin',
  targetObjectName: TENANT_VISIT_SUMMARY_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Tenant',
  targetFieldIcon: 'IconUser',
},
{
  sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
  name: 'tenantSatisfactions',
  label: 'Satisfaction Scores',
  icon: 'IconStar',
  targetObjectName: TENANT_SATISFACTION_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Tenant',
  targetFieldIcon: 'IconUser',
},

// --- Flent Merchant extensions ---
{
  sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
  name: 'merchantLandlords',
  label: 'Landlord Details',
  icon: 'IconHome',
  targetObjectName: MERCHANT_LANDLORD_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Merchant',
  targetFieldIcon: 'IconBuildingSkyscraper',
},
{
  sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
  name: 'merchantPocs',
  label: 'POC Details',
  icon: 'IconUserCircle',
  targetObjectName: MERCHANT_POC_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Merchant',
  targetFieldIcon: 'IconBuildingSkyscraper',
},
{
  sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
  name: 'merchantBrokers',
  label: 'Broker Details',
  icon: 'IconBriefcase',
  targetObjectName: MERCHANT_BROKER_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Merchant',
  targetFieldIcon: 'IconBuildingSkyscraper',
},
{
  sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
  name: 'merchantManagements',
  label: 'Management Details',
  icon: 'IconSettings',
  targetObjectName: MERCHANT_MANAGEMENT_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Merchant',
  targetFieldIcon: 'IconBuildingSkyscraper',
},

// --- Flent Vendor extensions ---
{
  sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
  name: 'vendorContacts',
  label: 'Contacts',
  icon: 'IconAddressBook',
  targetObjectName: VENDOR_CONTACT_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Vendor',
  targetFieldIcon: 'IconTruck',
},
{
  sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
  name: 'vendorBillings',
  label: 'Billing Details',
  icon: 'IconFileInvoice',
  targetObjectName: VENDOR_BILLING_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Vendor',
  targetFieldIcon: 'IconTruck',
},
{
  sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
  name: 'vendorCapabilities',
  label: 'Capabilities',
  icon: 'IconTools',
  targetObjectName: VENDOR_CAPABILITY_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Vendor',
  targetFieldIcon: 'IconTruck',
},
{
  sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
  name: 'vendorCommercials',
  label: 'Commercials',
  icon: 'IconCash',
  targetObjectName: VENDOR_COMMERCIALS_OBJECT_SEED.nameSingular,
  targetFieldLabel: 'Vendor',
  targetFieldIcon: 'IconTruck',
},
```

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts
git commit -m "feat(flent): register all 16 Phase 1 entities in DevSeederMetadataService"
```

---

## Entity Summary

| # | Entity | Type | Fields | Relations |
|---|--------|------|--------|-----------|
| 1 | `tenant` | Base | 16 (name, emails, phones, gender, dateOfBirth, aadhaarNumber, aadhaarFrontImage, aadhaarBackImage, pan, panCardImage, linkedinUrl, twitterUrl, instagramId, occupation, employerName, tenantLifecycle) | 5 ONE_TO_MANY to extensions |
| 2 | `tenantAttribution` | Extension | 12 (createDate, firstInquiryChannel, sourceDrilldown1, sourceDrilldown2, waxCode, googleClickId, facebookClickId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm) | MANY_TO_ONE to tenant |
| 3 | `tenantRequirement` | Extension | 10 (preferredMicromarkets, preferredOccupancyType, preferredFurnishedType, preferredMoveInTimeline, genderPreferences, foodPreferences, hasPet, smokingPreferences, customPreference, budgetMax) | MANY_TO_ONE to tenant |
| 4 | `tenantQualification` | Extension | 6 (qualificationStatus, disqualificationReason, disqualificationDetail, bgvStatus, bgvReport, bgvCompletedDate) | MANY_TO_ONE to tenant |
| 5 | `tenantVisitSummary` | Extension | 6 (totalVisitsCount, visitsCancelled, visitsCompleted, firstVisitDate, ridsVisited, feedback) | MANY_TO_ONE to tenant |
| 6 | `tenantSatisfaction` | Extension | 6 (onboardingCsatScore, offboardingCsatScore, lastNpsScore, lastNpsDate, npsCategory, lastNpsComment) | MANY_TO_ONE to tenant |
| 7 | `merchant` | Base | 10 (merchantType, prefix, name, emails, phones, currentCity, leadSource, uniqueId, disqualificationReason, lostReason) | 4 ONE_TO_MANY to extensions |
| 8 | `merchantLandlord` | Extension | 16 (landlordPersonality, generalLlComments, potentiallyMultihome, designation, organization, aadhaarBack, panNumber, panCardImage, bankAccountNumber, beneficiaryName, ifscCode, currentResidential, permanentResidential, communicationsPermission, signingAuthority, linkedinUrl) | MANY_TO_ONE to merchant |
| 9 | `merchantPoc` | Extension | 0 (TBD) | MANY_TO_ONE to merchant |
| 10 | `merchantBroker` | Extension | 0 (TBD) | MANY_TO_ONE to merchant |
| 11 | `merchantManagement` | Extension | 0 (TBD) | MANY_TO_ONE to merchant |
| 12 | `vendor` | Base | 4 (vendorCode, vendorName, vendorType, status) | 4 ONE_TO_MANY to extensions |
| 13 | `vendorContact` | Extension | 5 (contactName, phones, emails, city, address) | MANY_TO_ONE to vendor |
| 14 | `vendorBilling` | Extension | 8 (gstNumber, pan, billingName, bankName, bankAccountNumber, ifscCode, msmeVendor, udyamAadhaar) | MANY_TO_ONE to vendor |
| 15 | `vendorCapability` | Extension | 4 (specialization, tatInDays, customizationCapability, standardisationFit) | MANY_TO_ONE to vendor |
| 16 | `vendorCommercial` | Extension | 4 (qualityTier, paymentTerms, minOrderValue, negotiationRemarks) | MANY_TO_ONE to vendor |

**Total:** 16 entities, 107 fields, 13 relations
