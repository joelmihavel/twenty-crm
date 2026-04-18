// TODO: Replace mock data with API calls when backend is ready

import { mockOverheads } from '../data/mock-overheads';
import { type Overhead, type OverheadFilters } from '../types/overhead.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const overheadService = {
  async getAll(): Promise<Overhead[]> {
    await delay();
    return mockOverheads;
  },

  async getById(id: string): Promise<Overhead | undefined> {
    await delay();
    return mockOverheads.find((o) => o.id === id);
  },

  async getByFilters(filters: OverheadFilters): Promise<Overhead[]> {
    await delay();
    let result = [...mockOverheads];

    if (filters.category_type) {
      result = result.filter(
        (o) => o.category_type === filters.category_type,
      );
    }
    if (filters.object_type) {
      result = result.filter((o) => o.object_type === filters.object_type);
    }
    if (filters.pid) {
      result = result.filter((o) => o.pid === filters.pid);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.pid.toLowerCase().includes(q) ||
          o.category_type.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByPid(pid: string): Promise<Overhead[]> {
    await delay();
    return mockOverheads.filter((o) => o.pid === pid);
  },
};
