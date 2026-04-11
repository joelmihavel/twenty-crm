export const VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'vendorTicketDetail',
    name: 'ticket',
    label: 'Ticket',
    icon: 'IconTicket',
    targetObjectName: 'ticket',
    targetFieldLabel: 'Vendor Ticket Details',
    targetFieldIcon: 'IconTool',
  },
];
