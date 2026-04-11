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
