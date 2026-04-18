import { IconLogout } from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { ItemInspectionList } from '../components/ItemInspectionList';
import { type HawkeyeColumn, type FieldGroup } from '../types/entities';
import { mockItems } from '../data/mock-items';
import { mockRooms } from '../data/mock-rooms';

// ── Types ─────────────────────────────────────────────────────────

type MoveOutStatus =
  | 'Notice Received'
  | 'Inspection Scheduled'
  | 'Inspection Done'
  | 'Settlement Pending'
  | 'Completed';

interface MoveOutRecord {
  id: string;
  tenant_name: string;
  pid: string;
  rid: string;
  notice_date: string;
  expected_move_out_date: string;
  status: MoveOutStatus;
  assigned_to: string;
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockMoveOuts: MoveOutRecord[] = [
  { id: 'MO-001', tenant_name: 'Rahul Sharma', pid: 'PID-101', rid: 'RID-201', notice_date: '2026-03-01', expected_move_out_date: '2026-04-01', status: 'Completed', assigned_to: 'Priya Desai' },
  { id: 'MO-002', tenant_name: 'Ananya Gupta', pid: 'PID-102', rid: 'RID-202', notice_date: '2026-03-10', expected_move_out_date: '2026-04-10', status: 'Settlement Pending', assigned_to: 'Vikram Singh' },
  { id: 'MO-003', tenant_name: 'Karan Mehta', pid: 'PID-103', rid: 'RID-303', notice_date: '2026-03-15', expected_move_out_date: '2026-04-15', status: 'Inspection Done', assigned_to: 'Priya Desai' },
  { id: 'MO-004', tenant_name: 'Sneha Patel', pid: 'PID-101', rid: 'RID-204', notice_date: '2026-03-20', expected_move_out_date: '2026-04-20', status: 'Inspection Scheduled', assigned_to: 'Amit Joshi' },
  { id: 'MO-005', tenant_name: 'Deepak Nair', pid: 'PID-104', rid: 'RID-405', notice_date: '2026-03-25', expected_move_out_date: '2026-04-25', status: 'Notice Received', assigned_to: 'Vikram Singh' },
  { id: 'MO-006', tenant_name: 'Meera Iyer', pid: 'PID-102', rid: 'RID-206', notice_date: '2026-02-28', expected_move_out_date: '2026-03-28', status: 'Completed', assigned_to: 'Amit Joshi' },
  { id: 'MO-007', tenant_name: 'Arjun Reddy', pid: 'PID-105', rid: 'RID-507', notice_date: '2026-04-01', expected_move_out_date: '2026-05-01', status: 'Notice Received', assigned_to: 'Priya Desai' },
  { id: 'MO-008', tenant_name: 'Pooja Verma', pid: 'PID-103', rid: 'RID-308', notice_date: '2026-04-05', expected_move_out_date: '2026-05-05', status: 'Inspection Scheduled', assigned_to: 'Vikram Singh' },
];

// ── Column & Field Definitions ───────────────────────────────────

const columns: HawkeyeColumn<MoveOutRecord>[] = [
  { key: 'tenant_name', label: 'Tenant', width: 160 },
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'rid', label: 'RID', width: 100 },
  { key: 'notice_date', label: 'Notice Date', type: 'date', width: 120 },
  { key: 'expected_move_out_date', label: 'Move-out Date', type: 'date', width: 120 },
  { key: 'status', label: 'Status', type: 'enum', width: 160 },
  { key: 'assigned_to', label: 'Assigned To', width: 140 },
];

const fieldGroups: FieldGroup<MoveOutRecord>[] = [
  {
    label: 'Move-out Details',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'pid', label: 'Property ID' },
      { key: 'rid', label: 'Room ID' },
      { key: 'notice_date', label: 'Notice Date', type: 'date' },
      { key: 'expected_move_out_date', label: 'Expected Move-out Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'assigned_to', label: 'Assigned To' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────

const getItemsForRoom = (pid: string, rid: string) => {
  // Try matching with PID-RID location format first, then RID alone
  const room = mockRooms.find((r) => r.id === rid && r.pid === pid);
  if (room) {
    const locationKey = `${room.pid}-${room.id}`;
    return mockItems.filter(
      (i) => i.location === locationKey || i.location === room.id,
    );
  }
  // Fallback: match items whose location contains the rid
  return mockItems.filter((i) => i.location.includes(rid));
};

export const MoveOutOrchestratorPage = () => (
  <HawkeyeListPage
    title="Move-Out Orchestrator"
    Icon={IconLogout}
    columns={columns}
    data={mockMoveOuts}
    idKey="id"
    basePath="/hawkeye/move-out"
    fieldGroups={fieldGroups}
    titleFn={(r) => `${r.tenant_name} — ${r.rid}`}
    boardColumns={[
      { key: 'Notice Received', label: 'Notice Received', tagColor: 'blue' },
      { key: 'Inspection Scheduled', label: 'Inspection Scheduled', tagColor: 'orange' },
      { key: 'Inspection Done', label: 'Inspection Done', tagColor: 'orange' },
      { key: 'Settlement Pending', label: 'Settlement Pending', tagColor: 'red' },
      { key: 'Completed', label: 'Completed', tagColor: 'green' },
    ]}
    boardStatusKey="status"
    boardCardFields={(r) => [
      { label: 'PID', value: r.pid },
      { label: 'Move-out', value: r.expected_move_out_date },
      { label: 'Assigned', value: r.assigned_to },
    ]}
    renderRelations={(record) => {
      const items = getItemsForRoom(record.pid, record.rid);
      return (
        <ItemInspectionList
          items={items}
          title="Room Inventory — Inspection"
          showInspection
        />
      );
    }}
  />
);
