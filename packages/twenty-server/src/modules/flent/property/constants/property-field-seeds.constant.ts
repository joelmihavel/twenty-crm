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
