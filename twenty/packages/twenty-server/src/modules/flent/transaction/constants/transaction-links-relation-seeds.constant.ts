import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const TRANSACTION_LINKS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // Relation: Transaction -> TransactionLinks
  {
    sourceObjectName: TRANSACTION_OBJECT_SEED.nameSingular,
    name: 'transactionLinks',
    label: 'Links',
    icon: 'IconLink',
    targetObjectName: 'transactionLink',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
  // Relation: Tenant -> TransactionLinks
  {
    sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
    name: 'transactionLinks',
    label: 'Transaction Links',
    icon: 'IconLink',
    targetObjectName: 'transactionLink',
    targetFieldLabel: 'Tenant',
    targetFieldIcon: 'IconUser',
  },
  // Relation: Merchant -> TransactionLinks
  {
    sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
    name: 'transactionLinks',
    label: 'Transaction Links',
    icon: 'IconLink',
    targetObjectName: 'transactionLink',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingStore',
  },
  // Relation: Vendor -> TransactionLinks
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'transactionLinks',
    label: 'Transaction Links',
    icon: 'IconLink',
    targetObjectName: 'transactionLink',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
  // NOTE: Relations to contract, overhead, property, room deferred (entities not yet in workspace layer)
  // NOTE: Relation to ticket deferred to Phase 5
];
