import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_DG_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'dgBrandDetails', label: 'DG Brand Details', icon: 'IconTag', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.NUMBER, name: 'dgCapacityKva', label: 'DG Capacity (KVA)', icon: 'IconBolt', isNullable: true,
    settings: { dataType: NumberDataType.INT, type: 'number' },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  { type: FieldMetadataType.TEXT, name: 'dgMaintenanceSchedule', label: 'Maintenance Schedule', icon: 'IconCalendar', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.NUMBER, name: 'dgFuelTankCapacity', label: 'Fuel Tank Capacity (L)', icon: 'IconDroplet', isNullable: true,
    settings: { dataType: NumberDataType.INT, type: 'number' },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER, name: 'dgRefillUnitLitres', label: 'Refill Unit (Litres)', icon: 'IconDroplet', isNullable: true,
    settings: { dataType: NumberDataType.INT, type: 'number' },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  { type: FieldMetadataType.CURRENCY, name: 'dgAmount', label: 'DG Amount', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.BOOLEAN, name: 'dgPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'dgCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
