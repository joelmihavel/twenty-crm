import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_FURNISHING_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'bedType', label: 'Bed Type', icon: 'IconBed',
    options: [
      { label: 'Single', value: 'SINGLE', position: 0, color: 'blue' },
      { label: 'Double', value: 'DOUBLE', position: 1, color: 'green' },
      { label: 'Queen', value: 'QUEEN', position: 2, color: 'purple' },
      { label: 'King', value: 'KING', position: 3, color: 'orange' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'ac', label: 'AC', icon: 'IconAirConditioning', isNullable: true, defaultValue: false },
  {
    type: FieldMetadataType.SELECT, name: 'acType', label: 'AC Type', icon: 'IconAirConditioning',
    options: [
      { label: 'Split', value: 'SPLIT', position: 0, color: 'blue' },
      { label: 'Window', value: 'WINDOW', position: 1, color: 'green' },
      { label: 'Portable', value: 'PORTABLE', position: 2, color: 'yellow' },
      { label: 'Not Possible', value: 'NOT_POSSIBLE', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'acFeasibility', label: 'AC Feasibility', icon: 'IconAirConditioning',
    options: [
      { label: 'Feasible', value: 'FEASIBLE', position: 0, color: 'green' },
      { label: 'Not Feasible', value: 'NOT_FEASIBLE', position: 1, color: 'red' },
      { label: 'Requires Modification', value: 'REQUIRES_MODIFICATION', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'studyTable', label: 'Study Table', icon: 'IconDesk', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.LINKS, name: 'annexure', label: 'Annexure', icon: 'IconFile', isNullable: true },
  { type: FieldMetadataType.DATE, name: 'annexureLastUpdateDate', label: 'Annexure Last Update Date', icon: 'IconCalendar', isNullable: true },
];
