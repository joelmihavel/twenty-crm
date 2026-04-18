// TODO: Replace mock data with API calls when backend is ready

import { mockTenants } from '../data/mock-tenants';
import { type Tenant, type TenantFilters } from '../types/tenant.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    await delay();
    return mockTenants;
  },

  async getById(id: string): Promise<Tenant | undefined> {
    await delay();
    return mockTenants.find((t) => t.id === id);
  },

  async getByFilters(filters: TenantFilters): Promise<Tenant[]> {
    await delay();
    let result = [...mockTenants];

    if (filters.lifecycle) {
      result = result.filter((t) => t.tenant_lifecycle === filters.lifecycle);
    }
    if (filters.qualification) {
      result = result.filter(
        (t) => t.qualification_status === filters.qualification,
      );
    }
    if (filters.channel) {
      result = result.filter(
        (t) => t.first_inquiry_channel === filters.channel,
      );
    }
    if (filters.bgv_status) {
      result = result.filter((t) => t.bgv_status === filters.bgv_status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.first_name.toLowerCase().includes(q) ||
          t.last_name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q),
      );
    }

    return result;
  },
};
