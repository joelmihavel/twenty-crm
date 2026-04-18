import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

/**
 * Property has three cross-domain relations:
 * 1. merchant (MANY_TO_ONE) - the landlord/merchant who owns this property
 * 2. dealOwner (MANY_TO_ONE) - the workspace member responsible for the deal
 * 3. psmOwner (MANY_TO_ONE) - the workspace member responsible for post-sale management
 *
 * Plus ONE_TO_MANY relations to its own extensions (leadStage, active, churned)
 * and to Room entities.
 */
export const PROPERTY_CROSS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
    name: 'properties',
    label: 'Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
  {
    sourceObjectName: 'workspaceMember',
    name: 'dealOwnedProperties',
    label: 'Deal Owned Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Deal Owner',
    targetFieldIcon: 'IconUser',
  },
  {
    sourceObjectName: 'workspaceMember',
    name: 'psmOwnedProperties',
    label: 'PSM Owned Properties',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'PSM Owner',
    targetFieldIcon: 'IconUser',
  },
];
