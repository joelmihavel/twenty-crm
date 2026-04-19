import { IconFileCheck } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ApprovalActions } from '../components/ApprovalActions';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';

// ── Types ─────────────────────────────────────────────────────────

type ApprovalStatus =
  | 'Pending Review'
  | 'Under Negotiation'
  | 'Approved'
  | 'Rejected'
  | 'Active';

interface ContractApproval {
  id: string;
  contract_type: string;
  party_name: string;
  pid: string;
  rid: string;
  monthly_rent: number;
  security_deposit: number;
  service_term: number;
  contract_start_date: string;
  status: ApprovalStatus;
  submitted_by: string;
  submitted_date: string;
  reviewed_by: string;
  notes: string;
}

// ── Mock Data ────────────────────────────────────────────────────

const mockContracts: ContractApproval[] = [
  { id: 'CA-001', contract_type: 'Tenant', party_name: 'Rahul Sharma', pid: 'PID1', rid: '09BR1', monthly_rent: 25000, security_deposit: 50000, service_term: 12, contract_start_date: '2026-05-01', status: 'Pending Review', submitted_by: 'Priya Desai', submitted_date: '2026-04-10', reviewed_by: '', notes: 'New tenant for Block A unit' },
  { id: 'CA-002', contract_type: 'Tenant', party_name: 'Ananya Gupta', pid: 'PID2', rid: '12BR2', monthly_rent: 18000, security_deposit: 36000, service_term: 6, contract_start_date: '2026-05-15', status: 'Pending Review', submitted_by: 'Vikram Singh', submitted_date: '2026-04-12', reviewed_by: '', notes: 'Short-term lease request' },
  { id: 'CA-003', contract_type: 'Merchant', party_name: 'QuickBites Cafe', pid: 'PID3', rid: '15BR1', monthly_rent: 45000, security_deposit: 90000, service_term: 24, contract_start_date: '2026-06-01', status: 'Pending Review', submitted_by: 'Amit Joshi', submitted_date: '2026-04-14', reviewed_by: '', notes: 'Food court space — ground floor' },
  { id: 'CA-004', contract_type: 'Tenant', party_name: 'Karan Mehta', pid: 'PID1', rid: '09BR2', monthly_rent: 22000, security_deposit: 44000, service_term: 12, contract_start_date: '2026-05-01', status: 'Under Negotiation', submitted_by: 'Priya Desai', submitted_date: '2026-04-05', reviewed_by: 'Vidyuth', notes: 'Tenant requesting reduced deposit' },
  { id: 'CA-005', contract_type: 'Merchant', party_name: 'FreshMart Groceries', pid: 'PID4', rid: '18BR3', monthly_rent: 38000, security_deposit: 76000, service_term: 18, contract_start_date: '2026-06-01', status: 'Under Negotiation', submitted_by: 'Vikram Singh', submitted_date: '2026-04-03', reviewed_by: 'Preethi S', notes: 'Negotiating service term extension to 24 months' },
  { id: 'CA-006', contract_type: 'Tenant', party_name: 'Sneha Patel', pid: 'PID2', rid: '12BR1', monthly_rent: 20000, security_deposit: 40000, service_term: 12, contract_start_date: '2026-05-01', status: 'Approved', submitted_by: 'Amit Joshi', submitted_date: '2026-03-28', reviewed_by: 'Vidyuth', notes: 'All documents verified' },
  { id: 'CA-007', contract_type: 'Merchant', party_name: 'UrbanLaundry Services', pid: 'PID3', rid: '15BR2', monthly_rent: 12000, security_deposit: 24000, service_term: 12, contract_start_date: '2026-05-15', status: 'Rejected', submitted_by: 'Priya Desai', submitted_date: '2026-03-25', reviewed_by: 'Vidyuth', notes: 'Rent below market rate' },
  { id: 'CA-008', contract_type: 'Tenant', party_name: 'Deepak Nair', pid: 'PID1', rid: '09BR3', monthly_rent: 28000, security_deposit: 56000, service_term: 24, contract_start_date: '2026-03-01', status: 'Active', submitted_by: 'Vikram Singh', submitted_date: '2026-02-15', reviewed_by: 'Preethi S', notes: 'Contract activated and signed' },
];

// ── Column & Field Definitions ──────────────────────────────────

const columns: HawkeyeColumn<ContractApproval>[] = [
  { key: 'id', label: 'ID', width: 90 },
  { key: 'contract_type', label: 'Type', type: 'enum', width: 100, options: ['L&L', 'Authorisation', 'C&S'] },
  { key: 'party_name', label: 'Party', width: 170 },
  { key: 'pid', label: 'PID', width: 80 },
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'monthly_rent', label: 'Monthly Rent', type: 'currency', width: 130 },
  { key: 'security_deposit', label: 'Deposit', type: 'currency', width: 120 },
  { key: 'service_term', label: 'Term', type: 'number', width: 80 },
  { key: 'contract_start_date', label: 'Start Date', type: 'date', width: 120 },
  { key: 'status', label: 'Status', type: 'enum', width: 150, options: ['Pending Review', 'Under Negotiation', 'Approved', 'Rejected', 'Active'] },
  { key: 'submitted_by', label: 'Submitted By', width: 130 },
];

const fieldGroups: FieldGroup<ContractApproval>[] = [
  {
    label: 'Contract Details',
    fields: [
      { key: 'id', label: 'Approval ID' },
      { key: 'contract_type', label: 'Type', type: 'enum', options: ['L&L', 'Authorisation', 'C&S'] },
      { key: 'party_name', label: 'Party Name' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
    ],
  },
  {
    label: 'Financial Terms',
    fields: [
      { key: 'monthly_rent', label: 'Monthly Rent', type: 'currency' },
      { key: 'security_deposit', label: 'Security Deposit', type: 'currency' },
      { key: 'service_term', label: 'Service Term (months)', type: 'number' },
      { key: 'contract_start_date', label: 'Contract Start', type: 'date' },
    ],
  },
  {
    label: 'Approval Workflow',
    fields: [
      { key: 'status', label: 'Status', type: 'enum', options: ['Pending Review', 'Under Negotiation', 'Approved', 'Rejected', 'Active'] },
      { key: 'submitted_by', label: 'Submitted By' },
      { key: 'submitted_date', label: 'Submitted Date', type: 'date' },
      { key: 'reviewed_by', label: 'Reviewed By' },
      { key: 'notes', label: 'Notes', type: 'longtext' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────

export const ContractApprovalPage = () => (
  <HawkeyeListPage
    title="Contract Approvals"
    Icon={IconFileCheck}
    iconColor="sky"
    columns={columns}
    data={mockContracts}
    idKey="id"
    basePath="/hawkeye/contract-approvals"
    fieldGroups={fieldGroups}
    titleFn={(c) => `${c.party_name} — ${c.id}`}
    boardColumns={[
      { key: 'Pending Review', label: 'Pending Review', tagColor: 'orange' },
      { key: 'Under Negotiation', label: 'Under Negotiation', tagColor: 'blue' },
      { key: 'Approved', label: 'Approved', tagColor: 'green' },
      { key: 'Rejected', label: 'Rejected', tagColor: 'red' },
      { key: 'Active', label: 'Active', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(c) => [
      { label: 'Type', value: c.contract_type },
      { label: 'Rent', value: String(c.monthly_rent) },
      { label: 'Term', value: `${c.service_term}m` },
    ]}
    boardCardTags={(c) => [
      {
        text: c.contract_type,
        color: c.contract_type === 'Tenant' ? 'blue' : 'orange',
      },
    ]}
    renderActions={(record, onFieldChange) => (
      <ApprovalActions
        status={record.status}
        approvableStatuses={['Pending Review', 'Under Negotiation']}
        approvedStatus="Approved"
        rejectedStatus="Rejected"
        onApprove={() => {
          onFieldChange('status', 'Approved');
          onFieldChange('reviewed_by', 'Vidyuth');
        }}
        onReject={() => {
          onFieldChange('status', 'Rejected');
          onFieldChange('reviewed_by', 'Vidyuth');
        }}
      />
    )}
  />
);
