import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TRANSACTION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'utn',
    label: 'UTN',
    description:
      'Unique Transaction Number (TXN-YYYYMMDD-XXXXX), system-generated primary key',
    icon: 'IconHash',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'transactionType',
    label: 'Transaction Type',
    description:
      'Type discriminator determining which extension tables are populated',
    icon: 'IconCategory',
    options: [
      { label: 'Payment', value: 'PAYMENT', position: 0, color: 'green' },
      { label: 'Payout', value: 'PAYOUT', position: 1, color: 'blue' },
      { label: 'Refund', value: 'REFUND', position: 2, color: 'orange' },
      {
        label: 'Purchase Order',
        value: 'PURCHASE_ORDER',
        position: 3,
        color: 'purple',
      },
      {
        label: 'Adjustment',
        value: 'ADJUSTMENT',
        position: 4,
        color: 'yellow',
      },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'creditDebit',
    label: 'Credit/Debit',
    description: 'Direction of the transaction',
    icon: 'IconArrowsExchange',
    options: [
      { label: 'Credit', value: 'CREDIT', position: 0, color: 'green' },
      { label: 'Debit', value: 'DEBIT', position: 1, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.DATE,
    name: 'transactionDate',
    label: 'Transaction Date',
    description: 'Date of the transaction',
    icon: 'IconCalendar',
    isNullable: false,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'amount',
    label: 'Amount',
    description: 'Transaction amount (always positive, CHECK >= 0)',
    icon: 'IconCurrencyRupee',
    isNullable: false,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'status',
    label: 'Status',
    description: 'Transaction lifecycle status',
    icon: 'IconStatusChange',
    options: [
      { label: 'Pending', value: 'PENDING', position: 0, color: 'yellow' },
      { label: 'Approved', value: 'APPROVED', position: 1, color: 'blue' },
      { label: 'Settled', value: 'SETTLED', position: 2, color: 'green' },
      { label: 'Reversed', value: 'REVERSED', position: 3, color: 'orange' },
      { label: 'Voided', value: 'VOIDED', position: 4, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'createdBy',
    label: 'Created By',
    description: 'System user who created the transaction',
    icon: 'IconUser',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.DATE_TIME,
    name: 'createdDate',
    label: 'Created Date',
    description: 'Timestamp when the transaction was created',
    icon: 'IconClock',
    isNullable: false,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'authorisedBy',
    label: 'Authorised By',
    description: 'User who authorised/approved the transaction',
    icon: 'IconUserCheck',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.DATE_TIME,
    name: 'authorisedDate',
    label: 'Authorised Date',
    description: 'Timestamp when the transaction was authorised',
    icon: 'IconClock',
    isNullable: true,
  },
];
