import { CONTRACT_OBJECT_SEED } from 'src/modules/flent/contract/constants/contract-object-seed.constant';

export const CONTRACT_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // Contract belongs to Property (MANY_TO_ONE: many contracts per property)
  // Defined from Property side: Property has many Contracts
  // The relation seed defines the ONE_TO_MANY from the source (property) side
  {
    sourceObjectName: 'property',
    name: 'contracts',
    label: 'Contracts',
    icon: 'IconFileText',
    targetObjectName: CONTRACT_OBJECT_SEED.nameSingular,
    targetFieldLabel: 'Property',
    targetFieldIcon: 'IconBuilding',
  },
];
