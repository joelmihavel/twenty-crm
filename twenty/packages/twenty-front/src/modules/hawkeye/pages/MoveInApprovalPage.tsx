import { IconDoorEnter } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ApprovalActions } from '../components/ApprovalActions';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';

// ── Types ─────────────────────────────────────────────────────────

type MoveInStatus =
  | 'Checklist Pending'
  | 'Payments Pending'
  | 'Agreement Pending'
  | 'Ready'
  | 'Moved In';

interface MoveInApproval {
  id: string;
  tenant_name: string;
  contract_id: string;
  pid: string;
  rid: string;
  planned_move_in: string;
  token_paid: boolean;
  fmr_paid: boolean;
  sd_paid: boolean;
  agreement_signed: boolean;
  bgv_cleared: boolean;
  room_inspected: boolean;
  keys_handed: boolean;
  status: MoveInStatus;
  assigned_to: string;
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockData: MoveInApproval[] = [
  { id: 'MI-001', tenant_name: 'Rahul Sharma', contract_id: 'CTR-1001', pid: 'PID-101', rid: 'RID-201', planned_move_in: '2025-04-20', token_paid: true, fmr_paid: false, sd_paid: false, agreement_signed: false, bgv_cleared: true, room_inspected: false, keys_handed: false, status: 'Checklist Pending', assigned_to: 'Priya Desai' },
  { id: 'MI-002', tenant_name: 'Ananya Gupta', contract_id: 'CTR-1002', pid: 'PID-102', rid: 'RID-302', planned_move_in: '2025-04-25', token_paid: false, fmr_paid: false, sd_paid: false, agreement_signed: false, bgv_cleared: false, room_inspected: true, keys_handed: false, status: 'Checklist Pending', assigned_to: 'Vikram Singh' },
  { id: 'MI-003', tenant_name: 'Karan Mehta', contract_id: 'CTR-1003', pid: 'PID-103', rid: 'RID-403', planned_move_in: '2025-04-28', token_paid: true, fmr_paid: false, sd_paid: false, agreement_signed: false, bgv_cleared: true, room_inspected: true, keys_handed: false, status: 'Payments Pending', assigned_to: 'Amit Joshi' },
  { id: 'MI-004', tenant_name: 'Sneha Patel', contract_id: 'CTR-1004', pid: 'PID-101', rid: 'RID-204', planned_move_in: '2025-05-01', token_paid: true, fmr_paid: true, sd_paid: true, agreement_signed: false, bgv_cleared: true, room_inspected: true, keys_handed: false, status: 'Agreement Pending', assigned_to: 'Priya Desai' },
  { id: 'MI-005', tenant_name: 'Deepak Nair', contract_id: 'CTR-1005', pid: 'PID-104', rid: 'RID-505', planned_move_in: '2025-05-05', token_paid: true, fmr_paid: true, sd_paid: true, agreement_signed: true, bgv_cleared: true, room_inspected: true, keys_handed: false, status: 'Ready', assigned_to: 'Vikram Singh' },
  { id: 'MI-006', tenant_name: 'Meera Iyer', contract_id: 'CTR-1006', pid: 'PID-102', rid: 'RID-306', planned_move_in: '2025-05-10', token_paid: true, fmr_paid: true, sd_paid: true, agreement_signed: true, bgv_cleared: true, room_inspected: true, keys_handed: false, status: 'Ready', assigned_to: 'Amit Joshi' },
  { id: 'MI-007', tenant_name: 'Arjun Reddy', contract_id: 'CTR-1007', pid: 'PID-105', rid: 'RID-607', planned_move_in: '2025-04-15', token_paid: true, fmr_paid: true, sd_paid: true, agreement_signed: true, bgv_cleared: true, room_inspected: true, keys_handed: true, status: 'Moved In', assigned_to: 'Priya Desai' },
];

// ── Column & Field Definitions ──────────────────────────────────

const columns: HawkeyeColumn<MoveInApproval>[] = [
  { key: 'id', label: 'ID', width: 80 },
  { key: 'tenant_name', label: 'Tenant', width: 140 },
  { key: 'contract_id', label: 'Contract', width: 110 },
  { key: 'pid', label: 'PID', width: 80 },
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'planned_move_in', label: 'Move-in Date', type: 'date', width: 120 },
  { key: 'token_paid', label: 'Token', type: 'boolean', width: 70 },
  { key: 'fmr_paid', label: 'FMR', type: 'boolean', width: 70 },
  { key: 'sd_paid', label: 'SD', type: 'boolean', width: 70 },
  { key: 'agreement_signed', label: 'Agreement', type: 'boolean', width: 90 },
  { key: 'bgv_cleared', label: 'BGV', type: 'boolean', width: 70 },
  { key: 'room_inspected', label: 'Room', type: 'boolean', width: 70 },
  { key: 'keys_handed', label: 'Keys', type: 'boolean', width: 70 },
  { key: 'status', label: 'Status', type: 'enum', width: 150, options: ['Checklist Pending', 'Payments Pending', 'Agreement Pending', 'Ready', 'Moved In'] },
  { key: 'assigned_to', label: 'Assigned To', width: 120 },
];

const fieldGroups: FieldGroup<MoveInApproval>[] = [
  {
    label: 'Tenant & Contract',
    fields: [
      { key: 'id', label: 'Move-in ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'contract_id', label: 'Contract ID' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
      { key: 'planned_move_in', label: 'Planned Move-in', type: 'date' },
    ],
  },
  {
    label: 'Payment Checklist',
    fields: [
      { key: 'token_paid', label: 'Token Paid', type: 'boolean' },
      { key: 'fmr_paid', label: 'FMR Paid', type: 'boolean' },
      { key: 'sd_paid', label: 'Security Deposit Paid', type: 'boolean' },
    ],
  },
  {
    label: 'Documentation & Readiness',
    fields: [
      { key: 'agreement_signed', label: 'Agreement Signed', type: 'boolean' },
      { key: 'bgv_cleared', label: 'BGV Cleared', type: 'boolean' },
      { key: 'room_inspected', label: 'Room Inspected', type: 'boolean' },
      { key: 'keys_handed', label: 'Keys Handed Over', type: 'boolean' },
    ],
  },
  {
    label: 'Status',
    fields: [
      { key: 'status', label: 'Status', type: 'enum', options: ['Checklist Pending', 'Payments Pending', 'Agreement Pending', 'Ready', 'Moved In'] },
      { key: 'assigned_to', label: 'Assigned To' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────

export const MoveInApprovalPage = () => (
  <HawkeyeListPage
    title="Move-in Approvals"
    Icon={IconDoorEnter}
    iconColor="green"
    columns={columns}
    data={mockData}
    idKey="id"
    basePath="/hawkeye/move-in-approvals"
    fieldGroups={fieldGroups}
    titleFn={(m) => `${m.tenant_name} — ${m.id}`}
    boardColumns={[
      { key: 'Checklist Pending', label: 'Checklist Pending', tagColor: 'orange' },
      { key: 'Payments Pending', label: 'Payments Pending', tagColor: 'red' },
      { key: 'Agreement Pending', label: 'Agreement Pending', tagColor: 'blue' },
      { key: 'Ready', label: 'Ready', tagColor: 'green' },
      { key: 'Moved In', label: 'Moved In', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(m) => [
      { label: 'Contract', value: m.contract_id },
      { label: 'Move-in', value: m.planned_move_in },
      { label: 'Assigned', value: m.assigned_to },
    ]}
    renderActions={(record, onFieldChange) => (
      <ApprovalActions
        status={record.status}
        approvableStatuses={['Checklist Pending', 'Payments Pending', 'Agreement Pending', 'Ready']}
        approvedStatus="Moved In"
        rejectedStatus=""
        onApprove={() => {
          onFieldChange('status', 'Moved In');
          onFieldChange('keys_handed', true);
        }}
        onReject={() => {
          onFieldChange('status', 'Checklist Pending');
        }}
      />
    )}
  />
);
