import { useState, useCallback } from 'react';
import { type Ticket, type TicketStatus } from '../../types/ticket.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const statusOptions = [
  'New Request', 'Waiting on Customer', 'Waiting on Vendor',
  'Blocked', 'Waiting for Payment', 'Ready for Closure', 'Closed',
].map((v) => ({ value: v, label: v }));

const priorityOptions = [
  'Low', 'Medium', 'High', 'Urgent',
].map((v) => ({ value: v, label: v }));

const pipelineOptions = [
  { value: 'Tenant', label: 'Tenant' },
  { value: 'Landlord', label: 'Landlord' },
];

type TicketFormData = {
  ticket_name: string;
  ticket_description: string;
  pipeline: string;
  ticket_category: string;
  ticket_status: string;
  priority: string;
  ticket_owner: string;
  pid: string;
  rid: string;
  tenant_name: string;
  assigned_vendor: string;
  total_cost_net: string;
  resolution_notes: string;
};

const emptyForm: TicketFormData = {
  ticket_name: '',
  ticket_description: '',
  pipeline: 'Tenant',
  ticket_category: '',
  ticket_status: 'New Request',
  priority: 'Medium',
  ticket_owner: '',
  pid: '',
  rid: '',
  tenant_name: '',
  assigned_vendor: '',
  total_cost_net: '',
  resolution_notes: '',
};

const fromTicket = (t: Ticket): TicketFormData => ({
  ticket_name: t.ticket_name,
  ticket_description: t.ticket_description,
  pipeline: t.pipeline,
  ticket_category: t.ticket_category,
  ticket_status: t.ticket_status,
  priority: t.priority,
  ticket_owner: t.ticket_owner,
  pid: t.pid,
  rid: t.rid,
  tenant_name: t.tenant_name,
  assigned_vendor: t.assigned_vendor,
  total_cost_net: String(t.total_cost_net),
  resolution_notes: t.resolution_notes,
});

type TicketFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ticket>) => void;
  ticket?: Ticket;
};

export const TicketForm = ({
  isOpen,
  onClose,
  onSave,
  ticket,
}: TicketFormProps) => {
  const [form, setForm] = useState<TicketFormData>(
    ticket ? fromTicket(ticket) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof TicketFormData>(key: K) =>
      (value: TicketFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        total_cost_net: Number(form.total_cost_net) || 0,
        ticket_status: form.ticket_status as TicketStatus,
        priority: form.priority as Ticket['priority'],
        pipeline: form.pipeline as Ticket['pipeline'],
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={ticket ? 'Edit Ticket' : 'New Ticket'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Ticket Details',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="Ticket Name"
                value={form.ticket_name}
                onChange={set('ticket_name')}
                required
                placeholder="e.g. Broken AC in Room 09BR1"
              />
              <HawkeyeFormField
                type="textarea"
                label="Description"
                value={form.ticket_description}
                onChange={set('ticket_description')}
                placeholder="Describe the issue..."
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Pipeline"
                  value={form.pipeline}
                  onChange={set('pipeline')}
                  options={pipelineOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="Category"
                  value={form.ticket_category}
                  onChange={set('ticket_category')}
                  placeholder="Maintenance, Repair, etc."
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Status & Assignment',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Status"
                  value={form.ticket_status}
                  onChange={set('ticket_status')}
                  options={statusOptions}
                  required
                />
                <HawkeyeFormField
                  type="select"
                  label="Priority"
                  value={form.priority}
                  onChange={set('priority')}
                  options={priorityOptions}
                  required
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Owner"
                  value={form.ticket_owner}
                  onChange={set('ticket_owner')}
                  placeholder="Assignee name"
                />
                <HawkeyeFormField
                  type="text"
                  label="Assigned Vendor"
                  value={form.assigned_vendor}
                  onChange={set('assigned_vendor')}
                  placeholder="Vendor name"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Location & Tenant',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Property (PID)"
                  value={form.pid}
                  onChange={set('pid')}
                  placeholder="PID-09B"
                />
                <HawkeyeFormField
                  type="text"
                  label="Room (RID)"
                  value={form.rid}
                  onChange={set('rid')}
                  placeholder="09BR1"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Tenant Name"
                value={form.tenant_name}
                onChange={set('tenant_name')}
                placeholder="Tenant name"
              />
            </>
          ),
        },
        {
          title: 'Cost & Resolution',
          children: (
            <>
              <HawkeyeFormField
                type="number"
                label="Total Cost (₹)"
                value={form.total_cost_net}
                onChange={set('total_cost_net')}
                placeholder="0"
              />
              <HawkeyeFormField
                type="textarea"
                label="Resolution Notes"
                value={form.resolution_notes}
                onChange={set('resolution_notes')}
                placeholder="How was this resolved?"
              />
            </>
          ),
        },
      ]}
    />
  );
};
