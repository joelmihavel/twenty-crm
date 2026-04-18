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
