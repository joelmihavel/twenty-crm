import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'rid',
    label: 'RID',
    description: 'Unique room identifier',
    icon: 'IconHash',
    isNullable: false,
    isUnique: true,
    defaultValue: "''",
  },
];
