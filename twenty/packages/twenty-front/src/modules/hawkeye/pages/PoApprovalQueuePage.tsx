import { useState } from 'react';

import { styled } from '@linaria/react';
import { IconFileText, IconPlus } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ApprovalActions } from '../components/ApprovalActions';
import { PoApprovalForm } from '../components/forms/PoApprovalForm';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';

// ── Types ─────────────────────────────────────────────────────────

type PoType = 'Purchase Order' | 'Payment Request' | 'Vendor Invoice';
type PoStatus = 'Pending' | 'Approved' | 'Rejected' | 'On Hold';
type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';

interface PoApproval {
  id: string;
  type: PoType;
  title: string;
  amount: number;
  requester: string;
  vendor_name: string;
  pid: string;
  status: PoStatus;
  requested_date: string;
  urgency: Urgency;
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockApprovals: PoApproval[] = [
  { id: 'PO-001', type: 'Purchase Order', title: 'AC unit replacement — Block A', amount: 245000, requester: 'Priya Desai', vendor_name: 'CoolTech Solutions', pid: 'PID-101', status: 'Pending', requested_date: '2026-04-10', urgency: 'High' },
  { id: 'PO-002', type: 'Payment Request', title: 'Monthly pest control — April', amount: 18000, requester: 'Vikram Singh', vendor_name: 'PestFree Services', pid: 'PID-102', status: 'Approved', requested_date: '2026-04-05', urgency: 'Low' },
  { id: 'PO-003', type: 'Vendor Invoice', title: 'Plumbing repair — Unit 303', amount: 12500, requester: 'Amit Joshi', vendor_name: 'QuickFix Plumbing', pid: 'PID-103', status: 'Pending', requested_date: '2026-04-12', urgency: 'Medium' },
  { id: 'PO-004', type: 'Purchase Order', title: 'Furniture procurement — 10 beds', amount: 380000, requester: 'Priya Desai', vendor_name: 'HomeFurnish India', pid: 'PID-104', status: 'On Hold', requested_date: '2026-04-08', urgency: 'Medium' },
  { id: 'PO-005', type: 'Payment Request', title: 'Emergency generator repair', amount: 65000, requester: 'Vikram Singh', vendor_name: 'PowerGen Services', pid: 'PID-101', status: 'Pending', requested_date: '2026-04-15', urgency: 'Critical' },
  { id: 'PO-006', type: 'Vendor Invoice', title: 'Security services — March', amount: 52000, requester: 'Amit Joshi', vendor_name: 'SafeGuard Security', pid: 'PID-102', status: 'Approved', requested_date: '2026-04-01', urgency: 'Low' },
  { id: 'PO-007', type: 'Purchase Order', title: 'CCTV camera installation', amount: 175000, requester: 'Priya Desai', vendor_name: 'SecureVision Tech', pid: 'PID-105', status: 'Rejected', requested_date: '2026-03-28', urgency: 'High' },
  { id: 'PO-008', type: 'Payment Request', title: 'Painting contractor — Block B', amount: 95000, requester: 'Vikram Singh', vendor_name: 'ColourCraft Painters', pid: 'PID-103', status: 'Pending', requested_date: '2026-04-14', urgency: 'Medium' },
  { id: 'PO-009', type: 'Vendor Invoice', title: 'WiFi router replacement', amount: 28000, requester: 'Amit Joshi', vendor_name: 'NetConnect Solutions', pid: 'PID-101', status: 'Approved', requested_date: '2026-04-03', urgency: 'Low' },
  { id: 'PO-010', type: 'Purchase Order', title: 'Water purifier units — 5 nos', amount: 62000, requester: 'Priya Desai', vendor_name: 'AquaPure Systems', pid: 'PID-104', status: 'Pending', requested_date: '2026-04-16', urgency: 'High' },
];

// ── Column & Field Definitions ───────────────────────────────────

const columns: HawkeyeColumn<PoApproval>[] = [
  { key: 'type', label: 'Type', type: 'enum', width: 140, options: ['Purchase Order', 'Payment Request', 'Vendor Invoice'] },
  { key: 'title', label: 'Title', width: 240 },
  { key: 'amount', label: 'Amount', type: 'currency', width: 130 },
  { key: 'requester', label: 'Requester', width: 130 },
  { key: 'vendor_name', label: 'Vendor', width: 160 },
  { key: 'pid', label: 'PID', width: 90 },
  { key: 'status', label: 'Status', type: 'enum', width: 110, options: ['Pending', 'Approved', 'Rejected', 'On Hold'] },
  { key: 'urgency', label: 'Urgency', type: 'enum', width: 100, options: ['Low', 'Medium', 'High', 'Critical'] },
  { key: 'requested_date', label: 'Date', type: 'date', width: 120 },
];

const fieldGroups: FieldGroup<PoApproval>[] = [
  {
    label: 'Request Details',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Type', type: 'enum', options: ['Purchase Order', 'Payment Request', 'Vendor Invoice'] },
      { key: 'title', label: 'Title' },
      { key: 'requester', label: 'Requester' },
      { key: 'requested_date', label: 'Requested Date', type: 'date' },
    ],
  },
  {
    label: 'Vendor & Property',
    fields: [
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'pid', label: 'Property ID' },
    ],
  },
  {
    label: 'Financials & Status',
    fields: [
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'enum', options: ['Pending', 'Approved', 'Rejected', 'On Hold'] },
      { key: 'urgency', label: 'Urgency', type: 'enum', options: ['Low', 'Medium', 'High', 'Critical'] },
    ],
  },
];

// ── Styled ───────────────────────────────────────────────────────

const StyledAddButton = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: nowrap;
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

// ── Component ─────────────────────────────────────────────────────

export const PoApprovalQueuePage = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="PO Approval Queue"
        Icon={IconFileText}
        iconColor="sky"
        columns={columns}
        data={mockApprovals}
        idKey="id"
        basePath="/hawkeye/po-approvals"
        fieldGroups={fieldGroups}
        titleFn={(r) => `${r.id} — ${r.title}`}
        headerExtra={
          <StyledAddButton onClick={() => setFormOpen(true)}>
            <IconPlus size={14} />
            Add Request
          </StyledAddButton>
        }
        boardColumns={[
          { key: 'Pending', label: 'Pending', tagColor: 'orange' },
          { key: 'Approved', label: 'Approved', tagColor: 'green' },
          { key: 'Rejected', label: 'Rejected', tagColor: 'red' },
          { key: 'On Hold', label: 'On Hold', tagColor: 'gray' },
        ]}
        boardStatusKey="status"
        boardCardFields={(r) => [
          { label: 'Amount', value: String(r.amount) },
          { label: 'Vendor', value: r.vendor_name },
          { label: 'Urgency', value: r.urgency },
        ]}
        boardCardTags={(r) => [
          {
            text: r.urgency,
            color: r.urgency === 'Critical' || r.urgency === 'High' ? 'red' : r.urgency === 'Medium' ? 'orange' : 'gray',
          },
        ]}
        renderActions={(record, onFieldChange) => (
          <ApprovalActions
            status={record.status}
            approvableStatuses={['Pending', 'On Hold']}
            approvedStatus="Approved"
            rejectedStatus="Rejected"
            onApprove={() => {
              onFieldChange('status', 'Approved');
            }}
            onReject={() => {
              onFieldChange('status', 'Rejected');
            }}
          />
        )}
      />
      <PoApprovalForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};
