// TODO: Replace mock data with API calls when backend is ready

import { mockTickets } from '../data/mock-tickets';
import { type Ticket, type TicketFilters } from '../types/ticket.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const ticketService = {
  async getAll(): Promise<Ticket[]> {
    await delay();
    return mockTickets;
  },

  async getById(id: string): Promise<Ticket | undefined> {
    await delay();
    return mockTickets.find((t) => t.id === id);
  },

  async getByFilters(filters: TicketFilters): Promise<Ticket[]> {
    await delay();
    let result = [...mockTickets];

    if (filters.pipeline) {
      result = result.filter((t) => t.pipeline === filters.pipeline);
    }
    if (filters.status) {
      result = result.filter((t) => t.ticket_status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.category) {
      result = result.filter(
        (t) => t.ticket_category === filters.category,
      );
    }
    if (filters.pid) {
      result = result.filter((t) => t.pid === filters.pid);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.ticket_name.toLowerCase().includes(q) ||
          t.tenant_name.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByVendorId(vendorId: string): Promise<Ticket[]> {
    await delay();
    return mockTickets.filter((t) => t.assigned_vendor_id === vendorId);
  },
};
