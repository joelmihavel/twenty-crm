import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TRANSACTION_CLASSIFICATION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'purposeCategory1',
    label: 'Purpose Category 1',
    description:
      'High-level accounting bucket for financial reporting',
    icon: 'IconCategory',
    options: [
      { label: 'OPEX', value: 'OPEX', position: 0, color: 'blue' },
      { label: 'CAPEX', value: 'CAPEX', position: 1, color: 'purple' },
      { label: 'Interest', value: 'INTEREST', position: 2, color: 'green' },
      { label: 'Salary', value: 'SALARY', position: 3, color: 'yellow' },
      {
        label: 'Reimbursement',
        value: 'REIMBURSEMENT',
        position: 4,
        color: 'orange',
      },
      { label: 'Revenue', value: 'REVENUE', position: 5, color: 'green' },
      { label: 'Refunds', value: 'REFUNDS', position: 6, color: 'red' },
      { label: 'COGS', value: 'COGS', position: 7, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'purposeCategory2',
    label: 'Purpose Category 2',
    description:
      'Granular sub-classification for detailed financial reporting',
    icon: 'IconCategory2',
    options: [
      { label: 'Deposit', value: 'DEPOSIT', position: 0, color: 'green' },
      { label: 'Transport', value: 'TRANSPORT', position: 1, color: 'blue' },
      { label: 'Fixtures', value: 'FIXTURES', position: 2, color: 'purple' },
      { label: 'Office', value: 'OFFICE', position: 3, color: 'sky' },
      { label: 'Employee', value: 'EMPLOYEE', position: 4, color: 'yellow' },
      {
        label: 'Consultant',
        value: 'CONSULTANT',
        position: 5,
        color: 'orange',
      },
      {
        label: 'Contractor',
        value: 'CONTRACTOR',
        position: 6,
        color: 'turquoise',
      },
      { label: 'Inventory', value: 'INVENTORY', position: 7, color: 'pink' },
      { label: 'Tech', value: 'TECH', position: 8, color: 'blue' },
      { label: 'Marketing', value: 'MARKETING', position: 9, color: 'red' },
      {
        label: 'Food and Beverages',
        value: 'FOOD_AND_BEVERAGES',
        position: 10,
        color: 'orange',
      },
    ],
  },
];
