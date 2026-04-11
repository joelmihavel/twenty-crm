import { CONTRACT_OBJECT_SEED } from 'src/modules/flent/contract/constants/contract-object-seed.constant';
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_CONTRACT_DETAILS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // MerchantContractDetails belongs to Contract (MANY_TO_ONE via contract_uid PK/FK)
  {
    sourceObjectName: CONTRACT_OBJECT_SEED.nameSingular,
    name: 'merchantContractDetails',
    label: 'Merchant Contract Details',
    icon: 'IconFileInvoice',
    targetObjectName: 'merchantContractDetails',
    targetFieldLabel: 'Contract',
    targetFieldIcon: 'IconFileText',
  },
  // MerchantContractDetails belongs to Merchant (MANY_TO_ONE)
  {
    sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
    name: 'merchantContracts',
    label: 'Merchant Contracts',
    icon: 'IconFileInvoice',
    targetObjectName: 'merchantContractDetails',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
