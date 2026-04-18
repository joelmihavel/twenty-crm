import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const ROOM_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular,
    name: 'rooms',
    label: 'Rooms',
    icon: 'IconDoor',
    targetObjectName: 'room',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
