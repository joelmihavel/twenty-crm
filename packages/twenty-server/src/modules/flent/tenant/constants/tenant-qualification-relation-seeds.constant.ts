import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_QUALIFICATION_RELATION_SEEDS: {
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
    name: 'tenantQualifications',
    label: 'Qualifications',
    icon: 'IconShieldCheck',
    targetObjectName: 'tenantQualification',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
