// NOTE: The Transaction -> Tickets reverse relation is automatically created
// when the Ticket.transaction MANY_TO_ONE relation is seeded (ticket-relation-field-seeds).
// The targetFieldLabel 'Tickets' and targetFieldIcon 'IconTicket' define
// the inverse ONE_TO_MANY field on the Transaction entity.
//
// This file exists for documentation and for any future manual wiring.
// If the Transaction entity needs additional ticket-related fields beyond
// the auto-created inverse relation, add them here.

export const TRANSACTION_TICKET_CROSS_WIRE_NOTE = {
  description:
    'The Transaction.tickets ONE_TO_MANY relation is created as the inverse ' +
    'side of Ticket.transaction MANY_TO_ONE (see ticket-relation-field-seeds.constant.ts). ' +
    'No additional seed needed for this cross-wire.',
  sourceObject: 'transaction',
  inverseFieldLabel: 'Tickets',
  inverseFieldIcon: 'IconTicket',
  createdBy: 'ticket-relation-field-seeds MANY_TO_ONE -> transaction',
} as const;
