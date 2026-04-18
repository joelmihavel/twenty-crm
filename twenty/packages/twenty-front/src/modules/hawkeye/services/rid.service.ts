// TODO: Replace mock data with API calls when backend is ready

import { mockRooms } from '../data/mock-rooms';
import { type Rid, type RidFilters } from '../types/rid.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const ridService = {
  async getAll(): Promise<Rid[]> {
    await delay();
    return mockRooms;
  },

  async getById(id: string): Promise<Rid | undefined> {
    await delay();
    return mockRooms.find((r) => r.id === id);
  },

  async getByFilters(filters: RidFilters): Promise<Rid[]> {
    await delay();
    let result = [...mockRooms];

    if (filters.status) {
      result = result.filter((r) => r.room_status === filters.status);
    }
    if (filters.pid) {
      result = result.filter((r) => r.pid === filters.pid);
    }
    if (filters.bed_type) {
      result = result.filter((r) => r.bed_type === filters.bed_type);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.pid.toLowerCase().includes(q) ||
          r.current_tenant_name.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByPid(pid: string): Promise<Rid[]> {
    await delay();
    return mockRooms.filter((r) => r.pid === pid);
  },
};
