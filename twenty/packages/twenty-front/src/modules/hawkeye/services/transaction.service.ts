// TODO: Replace mock data with API calls when backend is ready

import { mockTransactions } from '../data/mock-transactions';
import {
  type Transaction,
  type TransactionFilters,
} from '../types/transaction.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    await delay();
    return mockTransactions;
  },

  async getById(id: string): Promise<Transaction | undefined> {
    await delay();
    return mockTransactions.find((t) => t.id === id);
  },

  async getByFilters(filters: TransactionFilters): Promise<Transaction[]> {
    await delay();
    let result = [...mockTransactions];

    if (filters.credit_debit) {
      result = result.filter(
        (t) => t.credit_debit === filters.credit_debit,
      );
    }
    if (filters.purpose_category_1) {
      result = result.filter(
        (t) => t.purpose_category_1 === filters.purpose_category_1,
      );
    }
    if (filters.payment_channel) {
      result = result.filter(
        (t) => t.payment_channel === filters.payment_channel,
      );
    }
    if (filters.pid) {
      result = result.filter((t) => t.pid === filters.pid);
    }
    if (filters.month) {
      result = result.filter((t) =>
        t.transaction_date.startsWith(filters.month!),
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.from_party.toLowerCase().includes(q) ||
          t.to_party.toLowerCase().includes(q) ||
          t.line_item_description.toLowerCase().includes(q),
      );
    }

    return result;
  },

  async getByContractId(contractId: string): Promise<Transaction[]> {
    await delay();
    return mockTransactions.filter((t) => t.contract_uid === contractId);
  },
};
