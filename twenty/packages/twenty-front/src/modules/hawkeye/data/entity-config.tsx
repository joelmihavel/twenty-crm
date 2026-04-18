import { type ReactNode } from 'react';

import { type FieldGroup } from '../types/entities';
import { ItemInspectionList } from '../components/ItemInspectionList';

import { mockTenants } from './mock-tenants';
import { mockMerchants } from './mock-merchants';
import { mockVendors } from './mock-vendors';
import { mockProperties } from './mock-properties';
import { mockRooms } from './mock-rooms';
import { mockContracts } from './mock-contracts';
import { mockTransactions } from './mock-transactions';
import { mockTickets } from './mock-tickets';
import { mockCatalogs } from './mock-catalogs';
import { mockItems } from './mock-items';
import { mockOverheads } from './mock-overheads';

import {
  tenantFieldGroups,
  merchantFieldGroups,
  vendorFieldGroups,
  propertyFieldGroups,
  roomFieldGroups,
  contractFieldGroups,
  transactionFieldGroups,
  ticketFieldGroups,
  catalogFieldGroups,
  itemFieldGroups,
  overheadFieldGroups,
} from './column-definitions';

// ── Types ─────────────────────────────────────────────────────────

export type EntityConfig = {
  data: unknown[];
  fieldGroups: FieldGroup<unknown>[];
  titleFn: (record: unknown) => string;
  idKey: string;
  /** Returns relation sections for the drilled-down record */
  getRelations?: (record: unknown) => RelationSection[];
  /** Renders custom inline content below the relation chips */
  renderCustomContent?: (record: unknown) => ReactNode;
};

export type RelationSection = {
  title: string;
  records: unknown[];
  idKey: string;
  basePath: string;
  titleFn: (record: unknown) => string;
};

// ── Registry ──────────────────────────────────────────────────────

const HAWKEYE = '/hawkeye';

const configs: Record<string, EntityConfig> = {
  [`${HAWKEYE}/tenants`]: {
    data: mockTenants,
    fieldGroups: tenantFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.first_name} ${r.last_name}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const contracts = mockContracts.filter((c) => c.party_id === r.id);
      const transactions = mockTransactions.filter((t) =>
        contracts.some((c) => c.id === t.contract_uid),
      );
      const sections: RelationSection[] = [];
      if (contracts.length > 0) {
        sections.push({
          title: 'Contracts',
          records: contracts,
          idKey: 'id',
          basePath: `${HAWKEYE}/contracts`,
          titleFn: (c: any) => `${c.party_name} — ${c.rid}`,
        });
      }
      if (transactions.length > 0) {
        sections.push({
          title: 'Transactions',
          records: transactions,
          idKey: 'id',
          basePath: `${HAWKEYE}/transactions`,
          titleFn: (t: any) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`,
        });
      }
      const tickets = mockTickets.filter((t) => t.tenant_id === r.id);
      if (tickets.length > 0) {
        sections.push({
          title: 'Tickets',
          records: tickets,
          idKey: 'id',
          basePath: `${HAWKEYE}/tickets`,
          titleFn: (t: any) => `#${t.id} — ${t.ticket_name}`,
        });
      }
      return sections;
    },
  },

  [`${HAWKEYE}/merchants`]: {
    data: mockMerchants,
    fieldGroups: merchantFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.prefix} ${r.first_name} ${r.last_name}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const properties = mockProperties.filter((p) => p.merchant_id === r.id);
      const contracts = mockContracts.filter((c) => c.party_id === r.id);
      const transactions = mockTransactions.filter(
        (t) => t.from_party_id === r.id || t.to_party_id === r.id,
      );
      const sections: RelationSection[] = [];
      if (properties.length > 0) {
        sections.push({
          title: 'Properties',
          records: properties,
          idKey: 'id',
          basePath: `${HAWKEYE}/properties`,
          titleFn: (p: any) => `${p.id} — ${p.building_society}`,
        });
      }
      if (contracts.length > 0) {
        sections.push({
          title: 'Contracts',
          records: contracts,
          idKey: 'id',
          basePath: `${HAWKEYE}/contracts`,
          titleFn: (c: any) => `${c.party_name} — ${c.contract_type}`,
        });
      }
      if (transactions.length > 0) {
        sections.push({
          title: 'Disbursements & Transactions',
          records: transactions,
          idKey: 'id',
          basePath: `${HAWKEYE}/transactions`,
          titleFn: (t: any) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`,
        });
      }
      return sections;
    },
  },

  [`${HAWKEYE}/vendors`]: {
    data: mockVendors,
    fieldGroups: vendorFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => r.vendor_name,
    idKey: 'id',
    getRelations: (r: any) => {
      const tickets = mockTickets.filter((t) => t.assigned_vendor_id === r.id);
      if (tickets.length === 0) return [];
      return [
        {
          title: 'Assigned Tickets',
          records: tickets,
          idKey: 'id',
          basePath: `${HAWKEYE}/tickets`,
          titleFn: (t: any) => `#${t.id} — ${t.ticket_name}`,
        },
      ];
    },
  },

  [`${HAWKEYE}/properties`]: {
    data: mockProperties,
    fieldGroups: propertyFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.id} — ${r.building_society}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const rooms = mockRooms.filter((rm) => rm.pid === r.id);
      const contracts = mockContracts.filter((c) => c.pid === r.id);
      const overheads = mockOverheads.filter((o) => o.pid === r.id);
      const tickets = mockTickets.filter((t) => t.pid === r.id);
      const sections: RelationSection[] = [];
      if (rooms.length > 0) sections.push({ title: 'Rooms', records: rooms, idKey: 'id', basePath: `${HAWKEYE}/rooms`, titleFn: (rm: any) => `${rm.id} — ${rm.bed_type}` });
      if (contracts.length > 0) sections.push({ title: 'Contracts', records: contracts, idKey: 'id', basePath: `${HAWKEYE}/contracts`, titleFn: (c: any) => `${c.party_name} — ${c.contract_type}` });
      if (overheads.length > 0) sections.push({ title: 'Overheads', records: overheads, idKey: 'id', basePath: `${HAWKEYE}/overheads`, titleFn: (o: any) => `${o.pid} — ${o.category_type}` });
      if (tickets.length > 0) sections.push({ title: 'Tickets', records: tickets, idKey: 'id', basePath: `${HAWKEYE}/tickets`, titleFn: (t: any) => `#${t.id} — ${t.ticket_name}` });
      return sections;
    },
  },

  [`${HAWKEYE}/rooms`]: {
    data: mockRooms,
    fieldGroups: roomFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.id} (${r.pid})`,
    idKey: 'id',
    getRelations: (r: any) => {
      const sections: RelationSection[] = [];
      const contracts = mockContracts.filter((c) => c.rid === r.id);
      if (contracts.length > 0) {
        sections.push({
          title: 'Contracts',
          records: contracts,
          idKey: 'id',
          basePath: `${HAWKEYE}/contracts`,
          titleFn: (c: any) => `${c.party_name} — ${c.agreement_lifecycle}`,
        });
      }
      return sections;
    },
    renderCustomContent: (r: any) => {
      const roomLocationKey = `${r.pid}-${r.id}`;
      const items = mockItems.filter(
        (i) => i.location === roomLocationKey || i.location === r.id,
      );
      return <ItemInspectionList items={items} title="Room Inventory" />;
    },
  },

  [`${HAWKEYE}/contracts`]: {
    data: mockContracts,
    fieldGroups: contractFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) =>
      r.contract_type === 'Tenant'
        ? `${r.party_name} — ${r.rid}`
        : `${r.party_name} — ${r.contract_type}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const transactions = mockTransactions.filter((t) => t.contract_uid === r.id);
      if (transactions.length === 0) return [];
      return [
        {
          title: 'Transactions',
          records: transactions,
          idKey: 'id',
          basePath: `${HAWKEYE}/transactions`,
          titleFn: (t: any) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`,
        },
      ];
    },
  },

  [`${HAWKEYE}/transactions`]: {
    data: mockTransactions,
    fieldGroups: transactionFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.id} — ${r.credit_debit}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const sections: RelationSection[] = [];
      if (r.contract_uid) {
        const contract = mockContracts.find((c) => c.id === r.contract_uid);
        if (contract) {
          sections.push({
            title: 'Linked Contract',
            records: [contract],
            idKey: 'id',
            basePath: `${HAWKEYE}/contracts`,
            titleFn: (c: any) => `${c.party_name} — ${c.contract_type}`,
          });
        }
      }
      if (r.pid) {
        const property = mockProperties.find((p) => p.id === r.pid);
        if (property) {
          sections.push({
            title: 'Property',
            records: [property],
            idKey: 'id',
            basePath: `${HAWKEYE}/properties`,
            titleFn: (p: any) => `${p.id} — ${p.building_society}`,
          });
        }
      }
      return sections;
    },
  },

  [`${HAWKEYE}/tickets`]: {
    data: mockTickets,
    fieldGroups: ticketFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `#${r.id} — ${r.ticket_name}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const sections: RelationSection[] = [];
      // Tenant who raised the ticket
      if (r.tenant_id) {
        const tenant = mockTenants.find((t) => t.id === r.tenant_id);
        if (tenant) {
          sections.push({
            title: 'Tenant',
            records: [tenant],
            idKey: 'id',
            basePath: `${HAWKEYE}/tenants`,
            titleFn: (t: any) => `${t.first_name} ${t.last_name}`,
          });
        }
      }
      // Assigned vendor
      const vendor = mockVendors.find((v) => v.id === r.assigned_vendor_id);
      if (vendor) {
        sections.push({
          title: 'Assigned Vendor',
          records: [vendor],
          idKey: 'id',
          basePath: `${HAWKEYE}/vendors`,
          titleFn: (v: any) => v.vendor_name,
        });
      }
      // Other tickets by same tenant
      if (r.tenant_id) {
        const otherTickets = mockTickets.filter(
          (t) => t.tenant_id === r.tenant_id && t.id !== r.id,
        );
        if (otherTickets.length > 0) {
          sections.push({
            title: 'Previous Tickets (Same Tenant)',
            records: otherTickets,
            idKey: 'id',
            basePath: `${HAWKEYE}/tickets`,
            titleFn: (t: any) => `#${t.id} — ${t.ticket_name}`,
          });
        }
      }
      // Linked transaction
      if (r.transaction_id) {
        const txn = mockTransactions.find((t) => t.id === r.transaction_id);
        if (txn) {
          sections.push({
            title: 'Linked Transaction',
            records: [txn],
            idKey: 'id',
            basePath: `${HAWKEYE}/transactions`,
            titleFn: (t: any) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`,
          });
        }
      }
      return sections;
    },
  },

  [`${HAWKEYE}/catalogs`]: {
    data: mockCatalogs,
    fieldGroups: catalogFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.fsin_code} — ${r.item_name}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const items = mockItems.filter((i) => i.fsin_code === r.fsin_code);
      if (items.length === 0) return [];
      return [
        {
          title: 'Items',
          records: items,
          idKey: 'id',
          basePath: `${HAWKEYE}/items`,
          titleFn: (i: any) => `${i.item_code} — ${i.product_name}`,
        },
      ];
    },
  },

  [`${HAWKEYE}/items`]: {
    data: mockItems,
    fieldGroups: itemFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.item_code} (${r.fsin_code})`,
    idKey: 'id',
    getRelations: (r: any) => {
      const sections: RelationSection[] = [];
      const catalog = mockCatalogs.find((c) => c.fsin_code === r.fsin_code);
      if (catalog) {
        sections.push({
          title: 'Catalog Entry',
          records: [catalog],
          idKey: 'id',
          basePath: `${HAWKEYE}/catalogs`,
          titleFn: (c: any) => `${c.fsin_code} — ${c.item_name}`,
        });
      }
      return sections;
    },
  },

  [`${HAWKEYE}/overheads`]: {
    data: mockOverheads,
    fieldGroups: overheadFieldGroups as FieldGroup<unknown>[],
    titleFn: (r: any) => `${r.pid} — ${r.category_type}`,
    idKey: 'id',
    getRelations: (r: any) => {
      const sections: RelationSection[] = [];
      const property = mockProperties.find((p) => p.id === r.pid);
      if (property) {
        sections.push({
          title: 'Property',
          records: [property],
          idKey: 'id',
          basePath: `${HAWKEYE}/properties`,
          titleFn: (p: any) => `${p.id} — ${p.building_society}`,
        });
      }
      return sections;
    },
  },
};

/** Look up entity configuration by basePath (e.g. "/hawkeye/tenants") */
export const getEntityConfig = (basePath: string): EntityConfig | undefined =>
  configs[basePath];

/** Find a single record across all entity types by basePath + record ID */
export const findRecord = (
  basePath: string,
  recordId: string,
): { record: unknown; config: EntityConfig } | undefined => {
  const config = configs[basePath];
  if (!config) return undefined;
  const record = config.data.find(
    (r) => String((r as Record<string, unknown>)[config.idKey]) === recordId,
  );
  if (!record) return undefined;
  return { record, config };
};
