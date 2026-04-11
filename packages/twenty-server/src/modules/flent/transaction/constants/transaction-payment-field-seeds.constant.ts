import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TRANSACTION_PAYMENT_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'paymentChannel',
    label: 'Payment Channel',
    description: 'Method used for the payment',
    icon: 'IconWallet',
    options: [
      { label: 'UPI', value: 'UPI', position: 0, color: 'green' },
      { label: 'NEFT', value: 'NEFT', position: 1, color: 'blue' },
      { label: 'RTGS', value: 'RTGS', position: 2, color: 'purple' },
      { label: 'IMPS', value: 'IMPS', position: 3, color: 'sky' },
      {
        label: 'Auto-debit NACH',
        value: 'AUTO_DEBIT_NACH',
        position: 4,
        color: 'turquoise',
      },
      {
        label: 'Virtual Account',
        value: 'VIRTUAL_ACCOUNT',
        position: 5,
        color: 'yellow',
      },
      {
        label: 'Payment Link',
        value: 'PAYMENT_LINK',
        position: 6,
        color: 'orange',
      },
      { label: 'Cheque', value: 'CHEQUE', position: 7, color: 'pink' },
      { label: 'Cash', value: 'CASH', position: 8, color: 'red' },
      { label: 'Other', value: 'OTHER', position: 9, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'paymentProvider',
    label: 'Payment Provider',
    description: 'Financial institution or payment processor',
    icon: 'IconBuildingBank',
    options: [
      { label: 'Kotak', value: 'KOTAK', position: 0, color: 'red' },
      { label: 'IDFC', value: 'IDFC', position: 1, color: 'blue' },
      { label: 'Razorpayx', value: 'RAZORPAYX', position: 2, color: 'sky' },
      { label: 'Volopay', value: 'VOLOPAY', position: 3, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'gatewayReferenceId',
    label: 'Gateway Reference ID',
    description: 'External reference ID for payment reconciliation',
    icon: 'IconKey',
    isNullable: true,
    defaultValue: "''",
  },
];
