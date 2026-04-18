import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_SPECIFICATIONS_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.BOOLEAN, name: 'attachedBathroom', label: 'Attached Bathroom', icon: 'IconBath', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'balcony', label: 'Balcony', icon: 'IconSunHigh', isNullable: true, defaultValue: false },
];
