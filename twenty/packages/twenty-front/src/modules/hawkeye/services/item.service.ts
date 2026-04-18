// TODO: Replace mock data with API calls when backend is ready

import { mockItems } from '../data/mock-items';
import { type Item, type ItemFilters } from '../types/item.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const itemService = {
  async getAll(): Promise<Item[]> {
    await delay();
    return mockItems;
  },

  async getById(id: string): Promise<Item | undefined> {
    await delay();
    return mockItems.find((i) => i.id === id);
  },

  async getByFilters(filters: ItemFilters): Promise<Item[]> {
    await delay();
    let result = [...mockItems];

    if (filters.state) {
      result = result.filter((i) => i.state === filters.state);
    }
    if (filters.fsin_code) {
      result = result.filter((i) => i.fsin_code === filters.fsin_code);
    }
    if (filters.location) {
      result = result.filter((i) => i.location === filters.location);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.item_code.toLowerCase().includes(q) ||
          i.product_name.toLowerCase().includes(q) ||
          i.fsin_code.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByFsinCode(fsinCode: string): Promise<Item[]> {
    await delay();
    return mockItems.filter((i) => i.fsin_code === fsinCode);
  },
};
