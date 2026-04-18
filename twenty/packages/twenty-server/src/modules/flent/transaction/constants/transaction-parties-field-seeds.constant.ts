import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

const PARTY_TYPE_OPTIONS = [
  { label: 'Tenant', value: 'TENANT', position: 0, color: 'blue' },
  { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'purple' },
  { label: 'Vendor', value: 'VENDOR', position: 2, color: 'orange' },
  { label: 'Platform', value: 'PLATFORM', position: 3, color: 'green' },
  {
    label: 'Third Party',
    value: 'THIRD_PARTY',
    position: 4,
    color: 'yellow',
  },
  {
    label: 'Government',
    value: 'GOVERNMENT',
    position: 5,
    color: 'red',
  },
];

export const TRANSACTION_PARTIES_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'fromParty',
    label: 'From Party',
    description: 'Payer name',
    icon: 'IconUserMinus',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'fromPartyType',
    label: 'From Party Type',
    description: 'Type classification of the payer',
    icon: 'IconUserCircle',
    options: PARTY_TYPE_OPTIONS,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'fromPartyInfo',
    label: 'From Party Info',
    description: 'Derived KYC data: GST, PAN, address of the payer',
    icon: 'IconInfoCircle',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'toParty',
    label: 'To Party',
    description: 'Payee name',
    icon: 'IconUserPlus',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'toPartyType',
    label: 'To Party Type',
    description: 'Type classification of the payee',
    icon: 'IconUserCircle',
    options: PARTY_TYPE_OPTIONS,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'toPartyInfo',
    label: 'To Party Info',
    description: 'Derived KYC data: GST, PAN, address of the payee',
    icon: 'IconInfoCircle',
    isNullable: true,
  },
];
