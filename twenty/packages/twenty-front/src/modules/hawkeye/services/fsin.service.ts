// TODO: Replace mock data with API calls when backend is ready

import { mockCatalogs } from '../data/mock-catalogs';
import { type Fsin, type FsinFilters } from '../types/fsin.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const fsinService = {
  async getAll(): Promise<Fsin[]> {
    await delay();
    return mockCatalogs;
  },

  async getById(id: string): Promise<Fsin | undefined> {
    await delay();
    return mockCatalogs.find((f) => f.id === id);
  },

  async getByFilters(filters: FsinFilters): Promise<Fsin[]> {
    await delay();
    let result = [...mockCatalogs];

    if (filters.category) {
      result = result.filter((f) => f.category === filters.category);
    }
    if (filters.vendor_code) {
      result = result.filter((f) => f.vendor_code === filters.vendor_code);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.fsin_code.toLowerCase().includes(q) ||
          f.item_name.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q),
      );
    }

    return result;
  },
};
