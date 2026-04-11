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
