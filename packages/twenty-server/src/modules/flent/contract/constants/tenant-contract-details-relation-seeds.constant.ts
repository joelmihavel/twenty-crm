import { CONTRACT_OBJECT_SEED } from 'src/modules/flent/contract/constants/contract-object-seed.constant';
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';

export const TENANT_CONTRACT_DETAILS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // TenantContractDetails belongs to Contract (MANY_TO_ONE via contract_uid PK/FK)
  {
    sourceObjectName: CONTRACT_OBJECT_SEED.nameSingular,
    name: 'tenantContractDetails',
    label: 'Tenant Contract Details',
    icon: 'IconFileDescription',
    targetObjectName: 'tenantContractDetails',
    targetFieldLabel: 'Contract',
    targetFieldIcon: 'IconFileText',
  },
  // TenantContractDetails belongs to Tenant (MANY_TO_ONE)
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'tenantContracts',
    label: 'Tenant Contracts',
    icon: 'IconFileDescription',
    targetObjectName: 'tenantContractDetails',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
];
