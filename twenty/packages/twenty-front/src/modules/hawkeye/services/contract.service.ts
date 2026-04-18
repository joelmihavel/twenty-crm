// TODO: Replace mock data with API calls when backend is ready

import { mockContracts } from '../data/mock-contracts';
import { type Contract, type ContractFilters } from '../types/contract.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const contractService = {
  async getAll(): Promise<Contract[]> {
    await delay();
    return mockContracts;
  },

  async getById(id: string): Promise<Contract | undefined> {
    await delay();
    return mockContracts.find((c) => c.id === id);
  },

  async getByFilters(filters: ContractFilters): Promise<Contract[]> {
    await delay();
    let result = [...mockContracts];

    if (filters.contract_type) {
      result = result.filter(
        (c) => c.contract_type === filters.contract_type,
      );
    }
    if (filters.payment_lifecycle) {
      result = result.filter(
        (c) => c.payment_lifecycle === filters.payment_lifecycle,
      );
    }
    if (filters.agreement_lifecycle) {
      result = result.filter(
        (c) => c.agreement_lifecycle === filters.agreement_lifecycle,
      );
    }
    if (filters.pid) {
      result = result.filter((c) => c.pid === filters.pid);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.party_name.toLowerCase().includes(q) ||
          c.rid.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByPartyId(partyId: string): Promise<Contract[]> {
    await delay();
    return mockContracts.filter((c) => c.party_id === partyId);
  },
};
