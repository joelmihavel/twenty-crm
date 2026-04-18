import { IconCurrencyRupee } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
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
  deduction_items: string;
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockSettlements: SdSettlement[] = [
  { id: 'SD-001', tenant_name: 'Rahul Sharma', contract_id: 'CON-1001', pid: 'PID-101', rid: 'RID-201', total_sd: 150000, total_deductions: 11000, refund_amount: 139000, status: 'Completed', refund_method: 'Bank Transfer', deduction_items: 'Painting: ₹8,000 | Cleaning: ₹3,000' },
  { id: 'SD-002', tenant_name: 'Ananya Gupta', contract_id: 'CON-1002', pid: 'PID-102', rid: 'RID-202', total_sd: 200000, total_deductions: 30400, refund_amount: 169600, status: 'Refund Initiated', refund_method: 'Bank Transfer', deduction_items: 'Furniture: ₹15,000 | Painting: ₹10,000 | Dues: ₹5,400' },
  { id: 'SD-003', tenant_name: 'Karan Mehta', contract_id: 'CON-1003', pid: 'PID-103', rid: 'RID-303', total_sd: 180000, total_deductions: 11500, refund_amount: 168500, status: 'Approved', refund_method: 'UPI', deduction_items: 'Cleaning: ₹4,000 | Appliance repair: ₹7,500' },
  { id: 'SD-004', tenant_name: 'Sneha Patel', contract_id: 'CON-1004', pid: 'PID-101', rid: 'RID-204', total_sd: 120000, total_deductions: 27000, refund_amount: 93000, status: 'Deductions Calculated', refund_method: 'Bank Transfer', deduction_items: 'Painting: ₹6,000 | Dues: ₹12,000 | Furniture: ₹9,000' },
  { id: 'SD-005', tenant_name: 'Deepak Nair', contract_id: 'CON-1005', pid: 'PID-104', rid: 'RID-405', total_sd: 160000, total_deductions: 0, refund_amount: 160000, status: 'Pending Inspection', refund_method: 'TBD', deduction_items: 'None' },
  { id: 'SD-006', tenant_name: 'Meera Iyer', contract_id: 'CON-1006', pid: 'PID-102', rid: 'RID-206', total_sd: 175000, total_deductions: 3500, refund_amount: 171500, status: 'Completed', refund_method: 'Bank Transfer', deduction_items: 'Cleaning: ₹3,500' },
];

// ── Column & Field Definitions ───────────────────────────────────

const columns: HawkeyeColumn<SdSettlement>[] = [
  { key: 'tenant_name', label: 'Tenant', width: 150 },
  { key: 'contract_id', label: 'Contract', width: 120 },
  { key: 'pid', label: 'PID', width: 90 },
  { key: 'rid', label: 'RID', width: 90 },
  { key: 'total_sd', label: 'Total SD', type: 'currency', width: 120 },
  { key: 'total_deductions', label: 'Deductions', type: 'currency', width: 120 },
  { key: 'refund_amount', label: 'Refund', type: 'currency', width: 120 },
  { key: 'status', label: 'Status', type: 'enum', width: 160 },
  { key: 'refund_method', label: 'Method', type: 'enum', width: 120 },
];

const fieldGroups: FieldGroup<SdSettlement>[] = [
  {
    label: 'Settlement Info',
    fields: [
      { key: 'id', label: 'Settlement ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'contract_id', label: 'Contract' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
      { key: 'status', label: 'Status', type: 'enum' },
    ],
  },
  {
    label: 'Financial Breakdown',
    fields: [
      { key: 'total_sd', label: 'Original Deposit', type: 'currency' },
      { key: 'total_deductions', label: 'Total Deductions', type: 'currency' },
      { key: 'refund_amount', label: 'Net Refund', type: 'currency' },
      { key: 'deduction_items', label: 'Deduction Details', type: 'longtext' },
    ],
  },
  {
    label: 'Refund Details',
    fields: [
      { key: 'refund_method', label: 'Refund Method', type: 'enum' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────

export const SdSettlementPage = () => (
  <HawkeyeListPage
    title="SD Settlement"
    Icon={IconCurrencyRupee}
    columns={columns}
    data={mockSettlements}
    idKey="id"
    basePath="/hawkeye/sd-settlements"
    fieldGroups={fieldGroups}
    titleFn={(r) => `${r.tenant_name} — ${r.contract_id}`}
    boardColumns={[
      { key: 'Pending Inspection', label: 'Pending Inspection', tagColor: 'blue' },
      { key: 'Deductions Calculated', label: 'Deductions Calculated', tagColor: 'orange' },
      { key: 'Approved', label: 'Approved', tagColor: 'blue' },
      { key: 'Refund Initiated', label: 'Refund Initiated', tagColor: 'green' },
      { key: 'Completed', label: 'Completed', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(r) => [
      { label: 'Deposit', value: String(r.total_sd) },
      { label: 'Refund', value: String(r.refund_amount) },
      { label: 'Method', value: r.refund_method },
    ]}
  />
);
