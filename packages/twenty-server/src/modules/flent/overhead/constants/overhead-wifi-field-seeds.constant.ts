import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_WIFI_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'wifiProvider', label: 'WiFi Provider', icon: 'IconWifi', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'wifiAccountId', label: 'WiFi Account ID', icon: 'IconHash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.DATE, name: 'wifiStartDate', label: 'WiFi Start Date', icon: 'IconCalendar', isNullable: true },
  {
    type: FieldMetadataType.NUMBER, name: 'wifiPlanDuration', label: 'WiFi Plan Duration (months)', icon: 'IconCalendar', isNullable: true,
    settings: { dataType: NumberDataType.INT, type: 'number' },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  { type: FieldMetadataType.DATE, name: 'wifiEndDate', label: 'WiFi End Date', icon: 'IconCalendar', isNullable: true },
  { type: FieldMetadataType.CURRENCY, name: 'wifiPlanCost', label: 'WiFi Plan Cost', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.TEXT, name: 'wifiSsid', label: 'WiFi SSID', icon: 'IconWifi', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'wifiPassword', label: 'WiFi Password', icon: 'IconLock', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'wifiOwnership', label: 'WiFi Ownership', icon: 'IconUser',
    options: [
      { label: 'Flent', value: 'FLENT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'green' },
      { label: 'Tenant', value: 'TENANT', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.CURRENCY, name: 'wifiAmount', label: 'WiFi Amount', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.PHONES, name: 'wifiRegisteredNumber', label: 'WiFi Registered Number', icon: 'IconPhone', isNullable: true },
  { type: FieldMetadataType.BOOLEAN, name: 'wifiCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'wifiPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
];
