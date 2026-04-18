// TODO: Replace mock data with API calls when backend is ready

import { mockVendors } from '../data/mock-vendors';
import { type Vendor, type VendorFilters } from '../types/vendor.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    await delay();
    return mockVendors;
  },

  async getById(id: string): Promise<Vendor | undefined> {
    await delay();
    return mockVendors.find((v) => v.id === id);
  },

  async getByFilters(filters: VendorFilters): Promise<Vendor[]> {
    await delay();
    let result = [...mockVendors];

    if (filters.vendor_type) {
      result = result.filter((v) => v.vendor_type === filters.vendor_type);
    }
    if (filters.quality_tier) {
      result = result.filter(
        (v) => v.quality_tier === filters.quality_tier,
      );
    }
    if (filters.city) {
      result = result.filter((v) => v.city === filters.city);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.vendor_name.toLowerCase().includes(q) ||
          v.contact_name.toLowerCase().includes(q) ||
          v.vendor_code.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q),
      );
    }

    return result;
  },
};
