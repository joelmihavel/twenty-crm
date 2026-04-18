import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const PROPERTY_ACTIVE_RELATION_SEEDS: {
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
    name: 'propertyActives',
    label: 'Active Details',
    icon: 'IconCircleCheck',
    targetObjectName: 'propertyActive',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
