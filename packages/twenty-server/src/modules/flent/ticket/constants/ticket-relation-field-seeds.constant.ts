// Relations are seeded separately because they require target object metadata IDs
// which must be resolved at runtime after all objects exist.

// These seeds are used with the junction/relation seeding flow in DevSeederMetadataService.
// Each creates a MANY_TO_ONE from Ticket to the target, plus a ONE_TO_MANY inverse on the target.

export const TICKET_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'ticket',
    name: 'property',
    label: 'Property',
    icon: 'IconBuilding',
    targetObjectName: 'property',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
  {
    sourceObjectName: 'ticket',
    name: 'assignedVendor',
    label: 'Assigned Vendor',
    icon: 'IconTool',
    targetObjectName: 'vendor',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
  {
    sourceObjectName: 'ticket',
    name: 'transaction',
    label: 'Transaction',
    icon: 'IconReceipt',
    targetObjectName: 'transaction',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  },
];
