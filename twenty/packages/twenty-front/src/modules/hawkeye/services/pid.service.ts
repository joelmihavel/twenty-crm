// TODO: Replace mock data with API calls when backend is ready

import { mockProperties } from '../data/mock-properties';
import { type Pid, type PidFilters } from '../types/pid.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const pidService = {
  async getAll(): Promise<Pid[]> {
    await delay();
    return mockProperties;
  },

  async getById(id: string): Promise<Pid | undefined> {
    await delay();
    return mockProperties.find((p) => p.id === id);
  },

  async getByFilters(filters: PidFilters): Promise<Pid[]> {
    await delay();
    let result = [...mockProperties];

    if (filters.type) {
      result = result.filter((p) => p.type === filters.type);
    }
    if (filters.deal_stage) {
      result = result.filter((p) => p.deal_stage === filters.deal_stage);
    }
    if (filters.cluster) {
      result = result.filter((p) => p.active_cluster === filters.cluster);
    }
    if (filters.deal_owner) {
      result = result.filter((p) => p.deal_owner === filters.deal_owner);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.building_society.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q),
      );
    }

    return result;
  },
};
