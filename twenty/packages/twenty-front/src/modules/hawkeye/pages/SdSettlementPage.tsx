import { IconCurrencyRupee } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ApprovalActions } from '../components/ApprovalActions';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';

// ── Types ─────────────────────────────────────────────────────────

type SdStatus =
  | 'Pending Inspection'
  | 'Deductions Calculated'
  | 'Approved'
  | 'Refund Initiated'
  | 'Completed';

interface SdSettlement {
  id: string;
  tenant_name: string;
  contract_id: string;
  pid: string;
  rid: string;
  total_sd: number;
  total_deductions: number;
  refund_amount: number;
  status: SdStatus;
  refund_method: string;
  move_out_date: string;
  inspection_date: string;
  approved_by: string;
}

// ── Mock Data ────────────────────────────────────────────────────

const mockSettlements: SdSettlement[] = [
  {
    id: 'SD-001',
    tenant_name: 'Rahul Sharma',
    contract_id: 'CON-1001',
    pid: 'PID-101',
    rid: 'RID-201',
    total_sd: 150000,
    total_deductions: 11000,
    refund_amount: 139000,
    status: 'Completed',
    refund_method: 'Bank Transfer',
    move_out_date: '2025-03-15',
    inspection_date: '2025-03-16',
    approved_by: 'Vidyuth',
  },
  {
    id: 'SD-002',
    tenant_name: 'Ananya Gupta',
    contract_id: 'CON-1002',
    pid: 'PID-102',
    rid: 'RID-202',
    total_sd: 200000,
    total_deductions: 30400,
    refund_amount: 169600,
    status: 'Refund Initiated',
    refund_method: 'Bank Transfer',
    move_out_date: '2025-03-20',
    inspection_date: '2025-03-21',
    approved_by: 'Preethi S',
  },
  {
    id: 'SD-003',
    tenant_name: 'Karan Mehta',
    contract_id: 'CON-1003',
    pid: 'PID-103',
    rid: 'RID-303',
    total_sd: 180000,
    total_deductions: 11500,
    refund_amount: 168500,
    status: 'Approved',
    refund_method: 'UPI',
    move_out_date: '2025-04-01',
    inspection_date: '2025-04-02',
    approved_by: 'Vidyuth',
  },
  {
    id: 'SD-004',
    tenant_name: 'Sneha Patel',
    contract_id: 'CON-1004',
    pid: 'PID-101',
    rid: 'RID-204',
    total_sd: 120000,
    total_deductions: 27000,
    refund_amount: 93000,
    status: 'Deductions Calculated',
    refund_method: 'Bank Transfer',
    move_out_date: '2025-04-05',
    inspection_date: '2025-04-06',
    approved_by: '',
  },
  {
    id: 'SD-005',
    tenant_name: 'Deepak Nair',
    contract_id: 'CON-1005',
    pid: 'PID-104',
    rid: 'RID-405',
    total_sd: 160000,
    total_deductions: 0,
    refund_amount: 160000,
    status: 'Pending Inspection',
    refund_method: 'TBD',
    move_out_date: '2025-04-10',
    inspection_date: '',
    approved_by: '',
  },
  {
    id: 'SD-006',
    tenant_name: 'Meera Iyer',
    contract_id: 'CON-1006',
    pid: 'PID-102',
    rid: 'RID-206',
    total_sd: 175000,
    total_deductions: 3500,
    refund_amount: 171500,
    status: 'Completed',
    refund_method: 'Bank Transfer',
    move_out_date: '2025-02-28',
    inspection_date: '2025-03-01',
    approved_by: 'Vidyuth',
  },
];

// ── Column & Field Definitions ──────────────────────────────────

const columns: HawkeyeColumn<SdSettlement>[] = [
  { key: 'id', label: 'ID', width: 90 },
  { key: 'tenant_name', label: 'Tenant', width: 150 },
  { key: 'contract_id', label: 'Contract', width: 110 },
  { key: 'pid', label: 'PID', width: 90 },
  { key: 'rid', label: 'RID', width: 90 },
  { key: 'total_sd', label: 'Total SD', type: 'currency', width: 120 },
  { key: 'total_deductions', label: 'Deductions', type: 'currency', width: 120 },
  { key: 'refund_amount', label: 'Refund', type: 'currency', width: 120 },
  { key: 'status', label: 'Status', type: 'enum', width: 150, options: ['Pending Inspection', 'Deductions Calculated', 'Approved', 'Refund Initiated', 'Completed'] },
  { key: 'move_out_date', label: 'Move-out', type: 'date', width: 120 },
];

const fieldGroups: FieldGroup<SdSettlement>[] = [
  {
    label: 'Tenant & Contract',
    fields: [
      { key: 'id', label: 'Settlement ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'contract_id', label: 'Contract ID' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
    ],
  },
  {
    label: 'Financial Breakdown',
    fields: [
      { key: 'total_sd', label: 'Total Security Deposit', type: 'currency' },
      { key: 'total_deductions', label: 'Total Deductions', type: 'currency' },
      { key: 'refund_amount', label: 'Refund Amount', type: 'currency' },
      { key: 'refund_method', label: 'Refund Method' },
    ],
  },
  {
    label: 'Status & Timeline',
    fields: [
      { key: 'status', label: 'Status', type: 'enum', options: ['Pending Inspection', 'Deductions Calculated', 'Approved', 'Refund Initiated', 'Completed'] },
      { key: 'move_out_date', label: 'Move-out Date', type: 'date' },
      { key: 'inspection_date', label: 'Inspection Date', type: 'date' },
      { key: 'approved_by', label: 'Approved By' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────

export const SdSettlementPage = () => (
  <HawkeyeListPage
    title="SD Settlements"
    Icon={IconCurrencyRupee}
    iconColor="amber"
    columns={columns}
    data={mockSettlements}
    idKey="id"
    basePath="/hawkeye/sd-settlements"
    fieldGroups={fieldGroups}
    titleFn={(s) => `${s.tenant_name} — ${s.id}`}
    boardColumns={[
      { key: 'Pending Inspection', label: 'Pending Inspection', tagColor: 'blue' },
      { key: 'Deductions Calculated', label: 'Deductions Calculated', tagColor: 'orange' },
      { key: 'Approved', label: 'Approved', tagColor: 'blue' },
      { key: 'Refund Initiated', label: 'Refund Initiated', tagColor: 'green' },
      { key: 'Completed', label: 'Completed', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(s) => [
      { label: 'Total SD', value: String(s.total_sd) },
      { label: 'Refund', value: String(s.refund_amount) },
      { label: 'Method', value: s.refund_method },
    ]}
    renderActions={(record, onFieldChange) => (
      <ApprovalActions
        status={record.status}
        approvableStatuses={['Pending Inspection', 'Deductions Calculated']}
        approvedStatus="Approved"
        rejectedStatus=""
        onApprove={() => {
          onFieldChange('status', 'Approved');
          onFieldChange('approved_by', 'Vidyuth');
        }}
        onReject={() => {
          onFieldChange('status', 'Pending Inspection');
        }}
      />
    )}
  />
);
