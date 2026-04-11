import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TRANSACTION_LINKS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'contractUid',
    label: 'Contract UID',
    description: 'FK to contracts table',
    icon: 'IconFileDescription',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'tenantId',
    label: 'Tenant ID',
    description: 'FK to tenants table (replaces polymorphic contact_id)',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'merchantId',
    label: 'Merchant ID',
    description: 'FK to merchants table (replaces polymorphic contact_id)',
    icon: 'IconBuildingStore',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'vendorCode',
    label: 'Vendor Code',
    description: 'FK to vendors table (replaces polymorphic contact_id)',
    icon: 'IconTruck',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'overheadId',
    label: 'Overhead ID',
    description: 'FK to overheads table',
    icon: 'IconReceipt2',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'ticketId',
    label: 'Ticket ID',
    description:
      'FK to tickets table (deferred to Phase 5 - column exists without FK constraint)',
    icon: 'IconTicket',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'pid',
    label: 'Property ID',
    description: 'FK to properties table (VARCHAR, fix #24)',
    icon: 'IconBuilding',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'rid',
    label: 'Room ID',
    description: 'FK to rooms table',
    icon: 'IconDoor',
    isNullable: true,
    defaultValue: "''",
  },
];
