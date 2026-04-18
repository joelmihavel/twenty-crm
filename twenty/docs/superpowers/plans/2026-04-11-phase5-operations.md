# Phase 5: Operations (Tickets) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 3 workspace entities (Ticket, TenantTicketDetails, VendorTicketDetails) using Twenty's workspace entity system to model the complete operations/ticket lifecycle for property management.

**Architecture:** The Ticket base entity holds pipeline assignment, category, status, priority, and financial tracking. Two extension entities split tenant-facing details (SLAs, CSAT, cost breakdowns) from vendor-facing details (response metrics, notes). All entities use Twenty's ObjectMetadataSeed + FieldMetadataSeed pattern with RELATION fields linking to Phase 1 (Vendor), Phase 2 (Property, Room), and Phase 4 (Transaction) entities. A cross-wire adds a `ticket` relation field on the Transaction entity after Ticket exists.

**Tech Stack:** Twenty workspace entities, TypeScript, PostgreSQL 16

**Dependencies:** Phase 1 (Vendor entity), Phase 2 (Property, Room entities), Phase 4 (Transaction entity)

---

## File Structure

```
packages/twenty-server/src/modules/flent/ticket/
  standard-objects/
    ticket.workspace-entity.ts                        # Task 1
    tenant-ticket-details.workspace-entity.ts         # Task 4
    vendor-ticket-details.workspace-entity.ts         # Task 6
  constants/
    ticket-object-seed.constant.ts                    # Task 2
    ticket-field-seeds.constant.ts                    # Task 3
    ticket-relation-field-seeds.constant.ts           # Task 3
    tenant-ticket-details-object-seed.constant.ts     # Task 5
    tenant-ticket-details-field-seeds.constant.ts     # Task 5
    tenant-ticket-details-relation-field-seeds.constant.ts  # Task 5
    vendor-ticket-details-object-seed.constant.ts     # Task 7
    vendor-ticket-details-field-seeds.constant.ts     # Task 7
    vendor-ticket-details-relation-field-seeds.constant.ts  # Task 7
    transaction-ticket-relation-field-seed.constant.ts      # Task 8
```

---

## Task 1: Ticket Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/standard-objects/ticket.workspace-entity.ts`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p packages/twenty-server/src/modules/flent/ticket/standard-objects
mkdir -p packages/twenty-server/src/modules/flent/ticket/constants
```

- [ ] **Step 2: Create the workspace entity class**

```typescript
// ticket.workspace-entity.ts
import { type CurrencyMetadata, FieldMetadataType, type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Forward-reference types for Phase 1/2/4 entities
// These will resolve once those workspace entities exist
type PropertyWorkspaceEntity = BaseWorkspaceEntity;
type VendorWorkspaceEntity = BaseWorkspaceEntity;
type TransactionWorkspaceEntity = BaseWorkspaceEntity;
type TenantTicketDetailsWorkspaceEntity = BaseWorkspaceEntity;
type VendorTicketDetailsWorkspaceEntity = BaseWorkspaceEntity;

const TICKET_DESCRIPTION_FIELD_NAME = 'ticketDescription';

export const SEARCH_FIELDS_FOR_TICKET: FieldTypeAndNameMetadata[] = [
  { name: TICKET_DESCRIPTION_FIELD_NAME, type: FieldMetadataType.RICH_TEXT },
];

export class TicketWorkspaceEntity extends BaseWorkspaceEntity {
  pipeline: string;
  ticketDescription: RichTextMetadata | null;
  ticketOwner: string | null;
  ticketCategory: string;
  ticketStatus: string;
  priority: string;
  resolutionNotes: RichTextMetadata | null;
  collectedFromTenant: CurrencyMetadata | null;
  collectedFromMerchant: CurrencyMetadata | null;
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
  assignedVendor: EntityRelation<VendorWorkspaceEntity> | null;
  assignedVendorId: string | null;
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;
  tenantTicketDetails: EntityRelation<TenantTicketDetailsWorkspaceEntity[]>;
  vendorTicketDetails: EntityRelation<VendorTicketDetailsWorkspaceEntity[]>;
  searchVector: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/standard-objects/ticket.workspace-entity.ts
git commit -m "feat(flent): add Ticket workspace entity class

Defines TicketWorkspaceEntity extending BaseWorkspaceEntity with pipeline,
category, status, priority, financial, and relation fields. Includes
search vector configuration for ticketDescription.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Ticket Object Seed

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/ticket-object-seed.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// ticket-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TICKET_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tickets',
  labelSingular: 'Ticket',
  namePlural: 'tickets',
  nameSingular: 'ticket',
  icon: 'IconTicket',
  description: 'Operations ticket for property management requests and issues',
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/constants/ticket-object-seed.constant.ts
git commit -m "feat(flent): add Ticket object metadata seed

Defines the Ticket custom object with label, name, icon, and description
for Twenty's workspace metadata system.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Ticket Field Seeds and Relation Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/ticket-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the field seeds**

```typescript
// ticket-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TICKET_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    label: 'Pipeline',
    name: 'pipeline',
    icon: 'IconFilter',
    isNullable: false,
    options: [
      { label: 'Tenant', value: 'TENANT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Ticket Description',
    name: 'ticketDescription',
    icon: 'IconFileDescription',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Ticket Owner',
    name: 'ticketOwner',
    icon: 'IconUser',
    description: 'Team member assigned as ticket owner',
    isNullable: true,
    options: [
      { label: 'Unassigned', value: 'UNASSIGNED', position: 0, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Ticket Category',
    name: 'ticketCategory',
    icon: 'IconCategory',
    isNullable: false,
    options: [
      { label: 'Plumbing', value: 'PLUMBING', position: 0, color: 'blue' },
      { label: 'Carpentry', value: 'CARPENTRY', position: 1, color: 'orange' },
      { label: 'Electrical', value: 'ELECTRICAL', position: 2, color: 'yellow' },
      { label: 'Utility', value: 'UTILITY', position: 3, color: 'green' },
      { label: 'Inventory', value: 'INVENTORY', position: 4, color: 'purple' },
      { label: 'Appliance', value: 'APPLIANCE', position: 5, color: 'sky' },
      { label: 'Agreement', value: 'AGREEMENT', position: 6, color: 'turquoise' },
      { label: 'Reimbursement', value: 'REIMBURSEMENT', position: 7, color: 'pink' },
      { label: 'Other', value: 'OTHER', position: 8, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Ticket Status',
    name: 'ticketStatus',
    icon: 'IconStatusChange',
    isNullable: false,
    defaultValue: "'NEW_REQUEST'",
    options: [
      { label: 'New Request', value: 'NEW_REQUEST', position: 0, color: 'blue' },
      { label: 'Waiting on Customer', value: 'WAITING_ON_CUSTOMER', position: 1, color: 'orange' },
      { label: 'Waiting on Vendor', value: 'WAITING_ON_VENDOR', position: 2, color: 'yellow' },
      { label: 'Waiting on Product', value: 'WAITING_ON_PRODUCT', position: 3, color: 'purple' },
      { label: 'Blocked', value: 'BLOCKED', position: 4, color: 'red' },
      { label: 'Waiting on Landlord', value: 'WAITING_ON_LANDLORD', position: 5, color: 'turquoise' },
      { label: 'Waiting for Payment', value: 'WAITING_FOR_PAYMENT', position: 6, color: 'pink' },
      { label: 'Ready for Closure', value: 'READY_FOR_CLOSURE', position: 7, color: 'green' },
      { label: 'Closed', value: 'CLOSED', position: 8, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Priority',
    name: 'priority',
    icon: 'IconUrgent',
    isNullable: false,
    defaultValue: "'MEDIUM'",
    options: [
      { label: 'Low', value: 'LOW', position: 0, color: 'gray' },
      { label: 'Medium', value: 'MEDIUM', position: 1, color: 'blue' },
      { label: 'High', value: 'HIGH', position: 2, color: 'orange' },
      { label: 'Urgent', value: 'URGENT', position: 3, color: 'red' },
      { label: 'Critical', value: 'CRITICAL', position: 4, color: 'pink' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Resolution Notes',
    name: 'resolutionNotes',
    icon: 'IconNotes',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Collected from Tenant',
    name: 'collectedFromTenant',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Collected from Merchant',
    name: 'collectedFromMerchant',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
];
```

- [ ] **Step 2: Create the relation field seeds**

```typescript
// ticket-relation-field-seeds.constant.ts
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

// Relations are seeded separately because they require target object metadata IDs
// which must be resolved at runtime after all objects exist.

// These seeds are used with the junction/relation seeding flow in DevSeederMetadataService.
// Each creates a MANY_TO_ONE from Ticket to the target, plus a ONE_TO_MANY inverse on the target.

export const TICKET_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'ticket',
    name: 'property',
    label: 'Property',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
  {
    sourceObjectName: 'ticket',
    name: 'assignedVendor',
    label: 'Assigned Vendor',
    icon: 'IconTool',
    targetObjectName: 'vendor',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
  {
    sourceObjectName: 'ticket',
    name: 'transaction',
    label: 'Transaction',
    icon: 'IconReceipt',
    targetObjectName: 'transaction',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/constants/ticket-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant.ts
git commit -m "feat(flent): add Ticket field seeds with 9 fields and 3 relations

Defines field metadata seeds for pipeline (SELECT), ticketDescription
(RICH_TEXT), ticketOwner (SELECT), ticketCategory (SELECT with 9 options),
ticketStatus (SELECT with 9 options), priority (SELECT with 5 options),
resolutionNotes (RICH_TEXT), collectedFromTenant (CURRENCY), and
collectedFromMerchant (CURRENCY). Relation seeds link to Property, Vendor,
and Transaction via MANY_TO_ONE.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: TenantTicketDetails Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/standard-objects/tenant-ticket-details.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// tenant-ticket-details.workspace-entity.ts
import { type CurrencyMetadata, FieldMetadataType, type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Forward-reference types
type TicketWorkspaceEntityRef = BaseWorkspaceEntity;
type RoomWorkspaceEntity = BaseWorkspaceEntity;

export class TenantTicketDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  ticketName: string | null;
  conversationId: string | null;
  categoryPhase: string | null;
  timeSlot: Date | null;
  ticketFlag: string | null;
  flagNotes: RichTextMetadata | null;
  costPaidByFlent: CurrencyMetadata | null;
  totalCost: CurrencyMetadata | null;
  vendorGroupChatId: string | null;
  relatedTickets: string | null;
  timeToFirstRepAssignment: number | null;
  timeToFirstResponseSlaHours: number | null;
  tenantRating: string | null;
  csatFeedback: RichTextMetadata | null;
  csatResponse: RichTextMetadata | null;
  ticket: EntityRelation<TicketWorkspaceEntityRef> | null;
  ticketId: string | null;
  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/standard-objects/tenant-ticket-details.workspace-entity.ts
git commit -m "feat(flent): add TenantTicketDetails workspace entity class

Defines TenantTicketDetailsWorkspaceEntity with 15 data fields and 2
relation fields (ticket, room) for tenant-facing ticket extensions
including SLA tracking, CSAT feedback, and cost breakdowns.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: TenantTicketDetails Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// tenant-ticket-details-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_TICKET_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Ticket Details',
  labelSingular: 'Tenant Ticket Detail',
  namePlural: 'tenantTicketDetails',
  nameSingular: 'tenantTicketDetail',
  icon: 'IconUserCircle',
  description: 'Tenant-facing ticket extension with SLA tracking, CSAT, and cost breakdown',
  skipNameField: true,
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// tenant-ticket-details-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_TICKET_DETAILS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Ticket Name',
    name: 'ticketName',
    icon: 'IconTag',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Conversation ID',
    name: 'conversationId',
    icon: 'IconMessage',
    description: 'External conversation/chat thread identifier',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Category Phase',
    name: 'categoryPhase',
    icon: 'IconTimeline',
    isNullable: true,
    options: [
      { label: 'Pre Move-In', value: 'PRE_MOVE_IN', position: 0, color: 'blue' },
      { label: 'Gestation', value: 'GESTATION', position: 1, color: 'orange' },
      { label: 'Active', value: 'ACTIVE', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Time Slot',
    name: 'timeSlot',
    icon: 'IconClock',
    description: 'Scheduled time slot for vendor visit or service',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Ticket Flag',
    name: 'ticketFlag',
    icon: 'IconFlag',
    description: 'Reasonableness assessment of the ticket request',
    isNullable: true,
    options: [
      { label: 'Reasonable', value: 'REASONABLE', position: 0, color: 'green' },
      { label: 'Not Reasonable', value: 'NOT_REASONABLE', position: 1, color: 'red' },
      { label: 'Subjective', value: 'SUBJECTIVE', position: 2, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Flag Notes',
    name: 'flagNotes',
    icon: 'IconNotes',
    description: 'Explanation for the ticket flag assessment',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Cost Paid by Flent',
    name: 'costPaidByFlent',
    icon: 'IconCurrencyRupee',
    description: 'Amount paid by Flent for this ticket resolution',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Total Cost',
    name: 'totalCost',
    icon: 'IconCurrencyRupee',
    description: 'Derived: costPaidByFlent minus amounts collected from tenant/merchant',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Vendor Group Chat ID',
    name: 'vendorGroupChatId',
    icon: 'IconMessages',
    description: 'WhatsApp or chat group ID for vendor coordination',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Related Tickets',
    name: 'relatedTickets',
    icon: 'IconLink',
    description: 'Comma-separated list of related ticket IDs',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Time to First Rep Assignment',
    name: 'timeToFirstRepAssignment',
    icon: 'IconClockHour4',
    description: 'Minutes from ticket creation to first rep assignment',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Time to First Response SLA (Hours)',
    name: 'timeToFirstResponseSlaHours',
    icon: 'IconClockHour8',
    description: 'Hours from ticket creation to first customer-facing response',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RATING,
    label: 'Tenant Rating',
    name: 'tenantRating',
    icon: 'IconStars',
    description: 'Tenant satisfaction rating (1-5)',
    isNullable: true,
    options: [
      { label: '1', value: 'RATING_1', position: 0 },
      { label: '2', value: 'RATING_2', position: 1 },
      { label: '3', value: 'RATING_3', position: 2 },
      { label: '4', value: 'RATING_4', position: 3 },
      { label: '5', value: 'RATING_5', position: 4 },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'CSAT Feedback',
    name: 'csatFeedback',
    icon: 'IconMessageReport',
    description: 'Customer satisfaction survey feedback text',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'CSAT Response',
    name: 'csatResponse',
    icon: 'IconMessageCheck',
    description: 'Internal response/notes on CSAT feedback',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// tenant-ticket-details-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'tenantTicketDetail',
    name: 'ticket',
    label: 'Ticket',
    icon: 'IconTicket',
    targetObjectName: 'ticket',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconUserCircle',
  },
  {
    sourceObjectName: 'tenantTicketDetail',
    name: 'room',
    label: 'Room',
    icon: 'IconDoor',
    targetObjectName: 'room',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconUserCircle',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant.ts
git commit -m "feat(flent): add TenantTicketDetails object seed and 15 field seeds

Defines TenantTicketDetails custom object with fields for ticket name,
conversation tracking, category phase (SELECT), time slot, ticket flag
assessment (SELECT), cost tracking (2 CURRENCY), vendor chat coordination,
SLA metrics (2 NUMBER), tenant rating (RATING 1-5), and CSAT feedback
(2 RICH_TEXT). Relations to Ticket and Room via MANY_TO_ONE.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: VendorTicketDetails Workspace Entity Class

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/standard-objects/vendor-ticket-details.workspace-entity.ts`

- [ ] **Step 1: Create the workspace entity class**

```typescript
// vendor-ticket-details.workspace-entity.ts
import { type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type TicketWorkspaceEntityRef = BaseWorkspaceEntity;

export class VendorTicketDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  notes: RichTextMetadata | null;
  firstResponseMins: number | null;
  timeToCloseHours: number | null;
  ticket: EntityRelation<TicketWorkspaceEntityRef> | null;
  ticketId: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/standard-objects/vendor-ticket-details.workspace-entity.ts
git commit -m "feat(flent): add VendorTicketDetails workspace entity class

Defines VendorTicketDetailsWorkspaceEntity with vendor notes (RICH_TEXT),
first response time (NUMBER), time to close (NUMBER), and ticket
relation (MANY_TO_ONE).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: VendorTicketDetails Object Seed and Field Seeds

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant.ts`
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant.ts`

- [ ] **Step 1: Create the object seed**

```typescript
// vendor-ticket-details-object-seed.constant.ts
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_TICKET_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Ticket Details',
  labelSingular: 'Vendor Ticket Detail',
  namePlural: 'vendorTicketDetails',
  nameSingular: 'vendorTicketDetail',
  icon: 'IconTool',
  description: 'Vendor-facing ticket extension with response and resolution metrics',
  skipNameField: true,
};
```

- [ ] **Step 2: Create the field seeds**

```typescript
// vendor-ticket-details-field-seeds.constant.ts
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_TICKET_DETAILS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Notes',
    name: 'notes',
    icon: 'IconNotes',
    description: 'Internal vendor notes on ticket work performed',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'First Response (Minutes)',
    name: 'firstResponseMins',
    icon: 'IconClockHour4',
    description: 'Minutes from vendor assignment to first vendor response',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Time to Close (Hours)',
    name: 'timeToCloseHours',
    icon: 'IconClockHour8',
    description: 'Hours from vendor assignment to ticket resolution by vendor',
    isNullable: true,
  },
];
```

- [ ] **Step 3: Create the relation field seeds**

```typescript
// vendor-ticket-details-relation-field-seeds.constant.ts
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'vendorTicketDetail',
    name: 'ticket',
    label: 'Ticket',
    icon: 'IconTicket',
    targetObjectName: 'ticket',
    targetFieldLabel: 'Vendor Ticket Details',
    targetFieldIcon: 'IconTool',
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant.ts
git add packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant.ts
git add packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant.ts
git commit -m "feat(flent): add VendorTicketDetails object seed and 3 field seeds

Defines VendorTicketDetails custom object with notes (RICH_TEXT),
firstResponseMins (NUMBER), timeToCloseHours (NUMBER), and a
MANY_TO_ONE relation to Ticket.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Cross-Wire Transaction-to-Ticket Relation

**Files:**
- Create: `packages/twenty-server/src/modules/flent/ticket/constants/transaction-ticket-relation-field-seed.constant.ts`

**Why:** After the Ticket entity exists, Transaction needs a reverse lookup to find associated tickets. This seed adds a `tickets` ONE_TO_MANY relation field on the Transaction entity (created as the inverse side of Ticket's `transaction` MANY_TO_ONE relation in Task 3). This is already handled by the `targetFieldLabel: 'Tickets'` in the ticket relation seed. This task documents the cross-wire and provides an explicit constant for any additional relation wiring needed.

- [ ] **Step 1: Create the cross-wire relation seed**

```typescript
// transaction-ticket-relation-field-seed.constant.ts

// NOTE: The Transaction -> Tickets reverse relation is automatically created
// when the Ticket.transaction MANY_TO_ONE relation is seeded (Task 3).
// The targetFieldLabel 'Tickets' and targetFieldIcon 'IconTicket' define
// the inverse ONE_TO_MANY field on the Transaction entity.
//
// This file exists for documentation and for any future manual wiring.
// If the Transaction entity needs additional ticket-related fields beyond
// the auto-created inverse relation, add them here.

export const TRANSACTION_TICKET_CROSS_WIRE_NOTE = {
  description:
    'The Transaction.tickets ONE_TO_MANY relation is created as the inverse ' +
    'side of Ticket.transaction MANY_TO_ONE (see ticket-relation-field-seeds.constant.ts). ' +
    'No additional seed needed for this cross-wire.',
  sourceObject: 'transaction',
  inverseFieldLabel: 'Tickets',
  inverseFieldIcon: 'IconTicket',
  createdBy: 'ticket-relation-field-seeds MANY_TO_ONE -> transaction',
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add packages/twenty-server/src/modules/flent/ticket/constants/transaction-ticket-relation-field-seed.constant.ts
git commit -m "feat(flent): document Transaction-to-Ticket cross-wire relation

Documents that the Transaction.tickets inverse relation is auto-created
when seeding the Ticket.transaction MANY_TO_ONE relation. No additional
seed required.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Register Flent Ticket Seeds in DevSeederMetadataService

**Files:**
- Modify: `packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts`

**Why:** The DevSeederMetadataService holds the seed configuration that creates custom objects and fields during workspace initialization. The three ticket entities, their fields, and their relations must be registered here to be created when a workspace is seeded.

- [ ] **Step 1: Add imports to dev-seeder-metadata.service.ts**

Add these imports after the existing imports in the file:

```typescript
import { TICKET_OBJECT_SEED } from 'src/modules/flent/ticket/constants/ticket-object-seed.constant';
import { TICKET_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/ticket-field-seeds.constant';
import { TICKET_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant';
import { TENANT_TICKET_DETAILS_OBJECT_SEED } from 'src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant';
import { TENANT_TICKET_DETAILS_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant';
import { TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant';
import { VENDOR_TICKET_DETAILS_OBJECT_SEED } from 'src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant';
import { VENDOR_TICKET_DETAILS_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant';
import { VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant';
```

- [ ] **Step 2: Add ticket objects to the workspace config**

In the `SEED_APPLE_WORKSPACE_ID` config, add these entries to the `objects` array:

```typescript
// Flent Ticket entities
{ seed: TICKET_OBJECT_SEED, fields: TICKET_FIELD_SEEDS },
{ seed: TENANT_TICKET_DETAILS_OBJECT_SEED, fields: TENANT_TICKET_DETAILS_FIELD_SEEDS },
{ seed: VENDOR_TICKET_DETAILS_OBJECT_SEED, fields: VENDOR_TICKET_DETAILS_FIELD_SEEDS },
```

- [ ] **Step 3: Add ticket junction fields to the workspace config**

In the `SEED_APPLE_WORKSPACE_ID` config, add these entries to the `junctionFields` array (create it if it does not exist):

```typescript
// Ticket -> Property (MANY_TO_ONE, creates inverse Property.tickets)
...TICKET_RELATION_FIELD_SEEDS,
// TenantTicketDetails -> Ticket, Room
...TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS,
// VendorTicketDetails -> Ticket
...VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS,
```

- [ ] **Step 4: Verify seeds load without errors**

```bash
npx ts-node -e "
  require('src/modules/flent/ticket/constants/ticket-object-seed.constant');
  require('src/modules/flent/ticket/constants/ticket-field-seeds.constant');
  require('src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant');
  require('src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant');
  require('src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant');
  require('src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant');
  require('src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant');
  require('src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant');
  require('src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant');
  console.log('All ticket seeds loaded successfully');
"
```

- [ ] **Step 5: Commit**

```bash
git add packages/twenty-server/src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service.ts
git commit -m "feat(flent): register Ticket entity seeds in DevSeederMetadataService

Adds Ticket, TenantTicketDetails, and VendorTicketDetails objects with
their field and relation seeds to the workspace seed config so they are
created during workspace initialization.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Verification and Integration Test

- [ ] **Step 1: Verify all files exist with correct structure**

```bash
# Verify directory structure
find packages/twenty-server/src/modules/flent/ticket -type f | sort

# Expected output:
# packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/ticket-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/ticket-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/transaction-ticket-relation-field-seed.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant.ts
# packages/twenty-server/src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant.ts
# packages/twenty-server/src/modules/flent/ticket/standard-objects/tenant-ticket-details.workspace-entity.ts
# packages/twenty-server/src/modules/flent/ticket/standard-objects/ticket.workspace-entity.ts
# packages/twenty-server/src/modules/flent/ticket/standard-objects/vendor-ticket-details.workspace-entity.ts
```

- [ ] **Step 2: TypeScript compilation check**

```bash
cd packages/twenty-server && npx tsc --noEmit --project tsconfig.json 2>&1 | head -50
```

- [ ] **Step 3: Verify field counts match specification**

| Entity | Data Fields | Relation Fields | Total Seeds |
|--------|-------------|-----------------|-------------|
| Ticket | 9 | 3 (property, assignedVendor, transaction) | 12 |
| TenantTicketDetails | 15 | 2 (ticket, room) | 17 |
| VendorTicketDetails | 3 | 1 (ticket) | 4 |
| **Totals** | **27** | **6** | **33** |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(flent): complete Phase 5 Operations/Tickets implementation

Phase 5 delivers 3 workspace entities (Ticket, TenantTicketDetails,
VendorTicketDetails) with 27 data fields, 6 MANY_TO_ONE relations, and
full search vector support. Cross-wires Transaction.tickets inverse
relation via Ticket.transaction seed.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Entity Reference Summary

### Ticket (base)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| createdAt | DATE_TIME | BaseWorkspaceEntity |
| updatedAt | DATE_TIME | BaseWorkspaceEntity |
| deletedAt | DATE_TIME | BaseWorkspaceEntity |
| pipeline | SELECT | Tenant, Landlord |
| ticketDescription | RICH_TEXT | Searchable |
| ticketOwner | SELECT | Team member assignment |
| ticketCategory | SELECT | 9 options: Plumbing through Other |
| ticketStatus | SELECT | 9 options: New Request through Closed |
| priority | SELECT | 5 options: Low through Critical |
| resolutionNotes | RICH_TEXT | |
| collectedFromTenant | CURRENCY | INR |
| collectedFromMerchant | CURRENCY | INR |
| propertyId | UUID FK | MANY_TO_ONE -> Property |
| assignedVendorId | UUID FK | MANY_TO_ONE -> Vendor |
| transactionId | UUID FK | MANY_TO_ONE -> Transaction |

### TenantTicketDetails (extension)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| ticketName | TEXT | |
| conversationId | TEXT | Chat thread ID |
| categoryPhase | SELECT | Pre Move-In, Gestation, Active |
| timeSlot | DATE_TIME | Vendor visit scheduling |
| ticketFlag | SELECT | Reasonable, Not Reasonable, Subjective |
| flagNotes | RICH_TEXT | |
| costPaidByFlent | CURRENCY | |
| totalCost | CURRENCY | Derived field |
| vendorGroupChatId | TEXT | |
| relatedTickets | TEXT | Comma-separated IDs |
| timeToFirstRepAssignment | NUMBER | Minutes |
| timeToFirstResponseSlaHours | NUMBER | Hours |
| tenantRating | RATING | 1-5 |
| csatFeedback | RICH_TEXT | |
| csatResponse | RICH_TEXT | |
| ticketId | UUID FK | MANY_TO_ONE -> Ticket |
| roomId | UUID FK | MANY_TO_ONE -> Room |

### VendorTicketDetails (extension)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | BaseWorkspaceEntity |
| notes | RICH_TEXT | |
| firstResponseMins | NUMBER | Minutes |
| timeToCloseHours | NUMBER | Hours |
| ticketId | UUID FK | MANY_TO_ONE -> Ticket |
