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
