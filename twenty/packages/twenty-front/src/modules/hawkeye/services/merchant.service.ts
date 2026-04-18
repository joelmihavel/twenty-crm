// TODO: Replace mock data with API calls when backend is ready

import { mockMerchants } from '../data/mock-merchants';
import { type Merchant, type MerchantFilters } from '../types/merchant.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const merchantService = {
  async getAll(): Promise<Merchant[]> {
    await delay();
    return mockMerchants;
  },

  async getById(id: string): Promise<Merchant | undefined> {
    await delay();
    return mockMerchants.find((m) => m.id === id);
  },

  async getByFilters(filters: MerchantFilters): Promise<Merchant[]> {
    await delay();
    let result = [...mockMerchants];

    if (filters.deal_stage) {
      result = result.filter((m) => m.deal_stage === filters.deal_stage);
    }
    if (filters.merchant_type) {
      result = result.filter(
        (m) => m.merchant_type === filters.merchant_type,
      );
    }
    if (filters.city) {
      result = result.filter((m) => m.current_city === filters.city);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.first_name.toLowerCase().includes(q) ||
          m.last_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q),
      );
    }

    return result;
  },
};
