import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_REQUIREMENTS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantRequirements',
    label: 'Requirements',
    icon: 'IconChecklist',
    targetObjectName: 'tenantRequirement',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
