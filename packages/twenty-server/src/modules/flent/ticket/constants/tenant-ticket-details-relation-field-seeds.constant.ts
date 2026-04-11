export const TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'tenantTicketDetail',
    name: 'ticket',
    label: 'Ticket',
    icon: 'IconTicket',
    targetObjectName: 'ticket',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconUserCircle',
  },
  {
    sourceObjectName: 'tenantTicketDetail',
    name: 'room',
    label: 'Room',
    icon: 'IconDoor',
    targetObjectName: 'room',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconUserCircle',
  },
];
