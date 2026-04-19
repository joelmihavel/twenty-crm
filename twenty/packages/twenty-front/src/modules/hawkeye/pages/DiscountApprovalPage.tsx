import { IconPercentage } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ApprovalActions } from '../components/ApprovalActions';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';

// ── Types ─────────────────────────────────────────────────────────

type DiscountStatus =
  | 'Requested'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Applied';

interface DiscountApproval {
  id: string;
  tenant_name: string;
  contract_id: string;
  pid: string;
  rid: string;
  current_rent: number;
  discount_amount: number;
  discounted_rent: number;
  discount_percent: number;
  reason: string;
  status: DiscountStatus;
  requested_by: string;
  requested_date: string;
  approved_by: string;
  valid_from: string;
  valid_until: string;
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockData: DiscountApproval[] = [
  { id: 'DSC-001', tenant_name: 'Rahul Mehta', contract_id: 'CON-1042', pid: 'PID-101', rid: 'RID-204', current_rent: 22000, discount_amount: 2000, discounted_rent: 20000, discount_percent: 9.09, reason: 'Long-term tenant retention', status: 'Requested', requested_by: 'Priya Desai', requested_date: '2026-04-10', approved_by: '', valid_from: '2026-05-01', valid_until: '2026-10-31' },
  { id: 'DSC-002', tenant_name: 'Sneha Iyer', contract_id: 'CON-1087', pid: 'PID-103', rid: 'RID-310', current_rent: 18000, discount_amount: 1500, discounted_rent: 16500, discount_percent: 8.33, reason: 'Market rate adjustment', status: 'Under Review', requested_by: 'Vikram Singh', requested_date: '2026-04-08', approved_by: '', valid_from: '2026-05-01', valid_until: '2026-08-31' },
  { id: 'DSC-003', tenant_name: 'Arjun Kapoor', contract_id: 'CON-1105', pid: 'PID-102', rid: 'RID-115', current_rent: 25000, discount_amount: 3000, discounted_rent: 22000, discount_percent: 12.0, reason: 'Early bird renewal', status: 'Approved', requested_by: 'Priya Desai', requested_date: '2026-03-25', approved_by: 'Amit Joshi', valid_from: '2026-04-01', valid_until: '2026-09-30' },
  { id: 'DSC-004', tenant_name: 'Kavitha Nair', contract_id: 'CON-1063', pid: 'PID-104', rid: 'RID-422', current_rent: 14000, discount_amount: 1000, discounted_rent: 13000, discount_percent: 7.14, reason: 'Competitive pressure', status: 'Rejected', requested_by: 'Vikram Singh', requested_date: '2026-04-02', approved_by: '', valid_from: '2026-05-01', valid_until: '2026-07-31' },
  { id: 'DSC-005', tenant_name: 'Deepak Sharma', contract_id: 'CON-1120', pid: 'PID-101', rid: 'RID-208', current_rent: 20000, discount_amount: 1000, discounted_rent: 19000, discount_percent: 5.0, reason: 'Loyalty discount', status: 'Applied', requested_by: 'Priya Desai', requested_date: '2026-03-15', approved_by: 'Amit Joshi', valid_from: '2026-04-01', valid_until: '2026-09-30' },
  { id: 'DSC-006', tenant_name: 'Meena Gupta', contract_id: 'CON-1098', pid: 'PID-105', rid: 'RID-501', current_rent: 16000, discount_amount: 2500, discounted_rent: 13500, discount_percent: 15.63, reason: 'Long-term tenant retention', status: 'Requested', requested_by: 'Vikram Singh', requested_date: '2026-04-14', approved_by: '', valid_from: '2026-05-01', valid_until: '2026-10-31' },
];

// ── Column & Field Definitions ──────────────────────────────────

const columns: HawkeyeColumn<DiscountApproval>[] = [
  { key: 'id', label: 'ID', width: 90 },
  { key: 'tenant_name', label: 'Tenant', width: 140 },
  { key: 'contract_id', label: 'Contract', width: 110 },
  { key: 'pid', label: 'PID', width: 80 },
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'current_rent', label: 'Current Rent', type: 'currency', width: 120 },
  { key: 'discount_amount', label: 'Discount', type: 'currency', width: 110 },
  { key: 'discounted_rent', label: 'New Rent', type: 'currency', width: 110 },
  { key: 'discount_percent', label: 'Discount %', type: 'number', width: 100 },
  { key: 'reason', label: 'Reason', width: 180 },
  { key: 'status', label: 'Status', type: 'enum', width: 120, options: ['Requested', 'Under Review', 'Approved', 'Rejected', 'Applied'] },
  { key: 'requested_by', label: 'Requested By', width: 130 },
];

const fieldGroups: FieldGroup<DiscountApproval>[] = [
  {
    label: 'Tenant & Contract',
    fields: [
      { key: 'id', label: 'Discount ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'contract_id', label: 'Contract ID' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
    ],
  },
  {
    label: 'Discount Details',
    fields: [
      { key: 'current_rent', label: 'Current Rent', type: 'currency' },
      { key: 'discount_amount', label: 'Discount Amount', type: 'currency' },
      { key: 'discounted_rent', label: 'Discounted Rent', type: 'currency' },
      { key: 'discount_percent', label: 'Discount %', type: 'number' },
      { key: 'reason', label: 'Reason' },
    ],
  },
  {
    label: 'Validity & Approval',
    fields: [
      { key: 'status', label: 'Status', type: 'enum', options: ['Requested', 'Under Review', 'Approved', 'Rejected', 'Applied'] },
      { key: 'requested_by', label: 'Requested By' },
      { key: 'requested_date', label: 'Requested Date', type: 'date' },
      { key: 'approved_by', label: 'Approved By' },
      { key: 'valid_from', label: 'Valid From', type: 'date' },
      { key: 'valid_until', label: 'Valid Until', type: 'date' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────

export const DiscountApprovalPage = () => (
  <HawkeyeListPage
    title="Discount Approvals"
    Icon={IconPercentage}
    iconColor="orange"
    columns={columns}
    data={mockData}
    idKey="id"
    basePath="/hawkeye/discount-approvals"
    fieldGroups={fieldGroups}
    titleFn={(d) => `${d.tenant_name} — ${d.id}`}
    boardColumns={[
      { key: 'Requested', label: 'Requested', tagColor: 'orange' },
      { key: 'Under Review', label: 'Under Review', tagColor: 'blue' },
      { key: 'Approved', label: 'Approved', tagColor: 'green' },
      { key: 'Rejected', label: 'Rejected', tagColor: 'red' },
      { key: 'Applied', label: 'Applied', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(d) => [
      { label: 'Current', value: String(d.current_rent) },
      { label: 'Discount', value: `${d.discount_percent}%` },
      { label: 'Reason', value: d.reason },
    ]}
    renderActions={(record, onFieldChange) => (
      <ApprovalActions
        status={record.status}
        approvableStatuses={['Requested', 'Under Review']}
        approvedStatus="Approved"
        rejectedStatus="Rejected"
        onApprove={() => {
          onFieldChange('status', 'Approved');
          onFieldChange('approved_by', 'Vidyuth');
        }}
        onReject={() => {
          onFieldChange('status', 'Rejected');
          onFieldChange('approved_by', 'Vidyuth');
        }}
      />
    )}
  />
);
