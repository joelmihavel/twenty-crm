import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_COMMERCIALS_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.CURRENCY, name: 'baseRent', label: 'Base Rent', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.CURRENCY, name: 'maintenanceFee', label: 'Maintenance Fee', icon: 'IconCurrencyRupee', isNullable: true },
];
