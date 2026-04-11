import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';

export const PROPERTY_CHURNED_RELATION_SEEDS: {
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
    name: 'propertyChurneds',
    label: 'Churned Details',
    icon: 'IconArrowBack',
    targetObjectName: 'propertyChurned',
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
