import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_VISIT_SUMMARY_RELATION_SEEDS: {
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
    name: 'tenantVisitSummaries',
    label: 'Visit Summaries',
    icon: 'IconMapPin',
    targetObjectName: 'tenantVisitSummary',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
