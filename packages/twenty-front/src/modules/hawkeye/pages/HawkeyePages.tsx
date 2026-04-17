import {
  IconArchive,
  IconBuildingSkyscraper,
  IconCoins,
  IconCreditCard,
  IconDoorEnter,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconTag,
  IconTool,
  IconUser,
} from 'twenty-ui/display';

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { HawkeyeRecordPage } from '../components/HawkeyeRecordPage';

import { mockTenants } from '../data/mock-tenants';
import { mockMerchants } from '../data/mock-merchants';
import { mockVendors } from '../data/mock-vendors';
import { mockProperties } from '../data/mock-properties';
import { mockRooms } from '../data/mock-rooms';
import { mockContracts } from '../data/mock-contracts';
import { mockTransactions } from '../data/mock-transactions';
import { mockTickets } from '../data/mock-tickets';
import { mockCatalogs } from '../data/mock-catalogs';
import { mockItems } from '../data/mock-items';
import { mockOverheads } from '../data/mock-overheads';

import {
  tenantColumns,
  tenantFieldGroups,
  merchantColumns,
  merchantFieldGroups,
  vendorColumns,
  vendorFieldGroups,
  propertyColumns,
  propertyFieldGroups,
  roomColumns,
  roomFieldGroups,
  contractColumns,
  contractFieldGroups,
  transactionColumns,
  transactionFieldGroups,
  ticketColumns,
  ticketFieldGroups,
  catalogColumns,
  catalogFieldGroups,
  itemColumns,
  itemFieldGroups,
  overheadColumns,
  overheadFieldGroups,
} from '../data/column-definitions';

const HAWKEYE = '/hawkeye';

// ── Tenants ────────────────────────────────────────────────────────

export const TenantsListPage = () => (
  <HawkeyeListPage
    title="Tenants"
    Icon={IconUser}
    columns={tenantColumns}
    data={mockTenants}
    idKey="record_id"
    basePath={`${HAWKEYE}/tenants`}
    fieldGroups={tenantFieldGroups}
    titleFn={(t) => `${t.first_name} ${t.last_name}`}
  />
);

export const TenantDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTenants}
    idKey="record_id"
    titleFn={(t) => `${t.first_name} ${t.last_name}`}
    fieldGroups={tenantFieldGroups}
    basePath={`${HAWKEYE}/tenants`}
  />
);

// ── Merchants ──────────────────────────────────────────────────────

export const MerchantsListPage = () => (
  <HawkeyeListPage
    title="Merchants"
    Icon={IconBuildingSkyscraper}
    columns={merchantColumns}
    data={mockMerchants}
    idKey="unique_id"
    basePath={`${HAWKEYE}/merchants`}
    fieldGroups={merchantFieldGroups}
    titleFn={(m) => `${m.prefix} ${m.first_name} ${m.last_name}`}
  />
);

export const MerchantDetailPage = () => (
  <HawkeyeRecordPage
    data={mockMerchants}
    idKey="unique_id"
    titleFn={(m) => `${m.prefix} ${m.first_name} ${m.last_name}`}
    fieldGroups={merchantFieldGroups}
    basePath={`${HAWKEYE}/merchants`}
  />
);

// ── Vendors ────────────────────────────────────────────────────────

export const VendorsListPage = () => (
  <HawkeyeListPage
    title="Vendors"
    Icon={IconTool}
    columns={vendorColumns}
    data={mockVendors}
    idKey="vendor_code"
    basePath={`${HAWKEYE}/vendors`}
    fieldGroups={vendorFieldGroups}
    titleFn={(v) => v.vendor_name}
  />
);

export const VendorDetailPage = () => (
  <HawkeyeRecordPage
    data={mockVendors}
    idKey="vendor_code"
    titleFn={(v) => v.vendor_name}
    fieldGroups={vendorFieldGroups}
    basePath={`${HAWKEYE}/vendors`}
  />
);

// ── Properties (PID) ───────────────────────────────────────────────

export const PropertiesListPage = () => (
  <HawkeyeListPage
    title="Properties (PID)"
    Icon={IconHome}
    columns={propertyColumns}
    data={mockProperties}
    idKey="pid"
    basePath={`${HAWKEYE}/properties`}
    fieldGroups={propertyFieldGroups}
    titleFn={(p) => `${p.pid} — ${p.building_society}`}
  />
);

export const PropertyDetailPage = () => (
  <HawkeyeRecordPage
    data={mockProperties}
    idKey="pid"
    titleFn={(p) => `${p.pid} — ${p.building_society}`}
    fieldGroups={propertyFieldGroups}
    basePath={`${HAWKEYE}/properties`}
  />
);

// ── Rooms (RID) ────────────────────────────────────────────────────

export const RoomsListPage = () => (
  <HawkeyeListPage
    title="Rooms (RID)"
    Icon={IconDoorEnter}
    columns={roomColumns}
    data={mockRooms}
    idKey="rid"
    basePath={`${HAWKEYE}/rooms`}
    fieldGroups={roomFieldGroups}
    titleFn={(r) => `${r.rid} (${r.pid})`}
  />
);

export const RoomDetailPage = () => (
  <HawkeyeRecordPage
    data={mockRooms}
    idKey="rid"
    titleFn={(r) => `${r.rid} (${r.pid})`}
    fieldGroups={roomFieldGroups}
    basePath={`${HAWKEYE}/rooms`}
  />
);

// ── Contracts ──────────────────────────────────────────────────────

export const ContractsListPage = () => (
  <HawkeyeListPage
    title="Contracts"
    Icon={IconFileText}
    columns={contractColumns}
    data={mockContracts}
    idKey="contract_uid"
    basePath={`${HAWKEYE}/contracts`}
    fieldGroups={contractFieldGroups}
    titleFn={(c) =>
      c.party_name_tenant
        ? `${c.party_name_tenant} — ${c.rid}`
        : `${c.party_name_merchant} — ${c.contract_type}`
    }
  />
);

export const ContractDetailPage = () => (
  <HawkeyeRecordPage
    data={mockContracts}
    idKey="contract_uid"
    titleFn={(c) =>
      c.party_name_tenant
        ? `${c.party_name_tenant} — ${c.rid}`
        : `${c.party_name_merchant} — ${c.contract_type}`
    }
    fieldGroups={contractFieldGroups}
    basePath={`${HAWKEYE}/contracts`}
  />
);

// ── Transactions ───────────────────────────────────────────────────

export const TransactionsListPage = () => (
  <HawkeyeListPage
    title="Transactions"
    Icon={IconCreditCard}
    columns={transactionColumns}
    data={mockTransactions}
    idKey="utn"
    basePath={`${HAWKEYE}/transactions`}
    fieldGroups={transactionFieldGroups}
    titleFn={(t) => `${t.utn} — ${t.credit_debit}`}
  />
);

export const TransactionDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTransactions}
    idKey="utn"
    titleFn={(t) => `${t.utn} — ${t.credit_debit}`}
    fieldGroups={transactionFieldGroups}
    basePath={`${HAWKEYE}/transactions`}
  />
);

// ── Tickets ────────────────────────────────────────────────────────

export const TicketsListPage = () => (
  <HawkeyeListPage
    title="Tickets"
    Icon={IconTag}
    columns={ticketColumns}
    data={mockTickets}
    idKey="ticket_id"
    basePath={`${HAWKEYE}/tickets`}
    fieldGroups={ticketFieldGroups}
    titleFn={(t) => `#${t.ticket_id} — ${t.ticket_name}`}
  />
);

export const TicketDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTickets}
    idKey="ticket_id"
    titleFn={(t) => `#${t.ticket_id} — ${t.ticket_name}`}
    fieldGroups={ticketFieldGroups}
    basePath={`${HAWKEYE}/tickets`}
  />
);

// ── Catalogs (FSIN) ────────────────────────────────────────────────

export const CatalogsListPage = () => (
  <HawkeyeListPage
    title="Catalogs (FSN)"
    Icon={IconLayoutGrid}
    columns={catalogColumns}
    data={mockCatalogs}
    idKey="fsin_code"
    basePath={`${HAWKEYE}/catalogs`}
    fieldGroups={catalogFieldGroups}
    titleFn={(c) => `${c.fsin_code} — ${c.item_name}`}
  />
);

export const CatalogDetailPage = () => (
  <HawkeyeRecordPage
    data={mockCatalogs}
    idKey="fsin_code"
    titleFn={(c) => `${c.fsin_code} — ${c.item_name}`}
    fieldGroups={catalogFieldGroups}
    basePath={`${HAWKEYE}/catalogs`}
  />
);

// ── Items ──────────────────────────────────────────────────────────

export const ItemsListPage = () => (
  <HawkeyeListPage
    title="Items"
    Icon={IconArchive}
    columns={itemColumns}
    data={mockItems}
    idKey="item_code"
    basePath={`${HAWKEYE}/items`}
    fieldGroups={itemFieldGroups}
    titleFn={(i) => `${i.item_code} (${i.fsin_code})`}
  />
);

export const ItemDetailPage = () => (
  <HawkeyeRecordPage
    data={mockItems}
    idKey="item_code"
    titleFn={(i) => `${i.item_code} (${i.fsin_code})`}
    fieldGroups={itemFieldGroups}
    basePath={`${HAWKEYE}/items`}
  />
);

// ── Overheads ──────────────────────────────────────────────────────

export const OverheadsListPage = () => (
  <HawkeyeListPage
    title="Overheads"
    Icon={IconCoins}
    columns={overheadColumns}
    data={mockOverheads}
    idKey="overhead_id"
    basePath={`${HAWKEYE}/overheads`}
    fieldGroups={overheadFieldGroups}
    titleFn={(o) => `${o.pid} — ${o.category_type}`}
  />
);

export const OverheadDetailPage = () => (
  <HawkeyeRecordPage
    data={mockOverheads}
    idKey="overhead_id"
    titleFn={(o) => `${o.pid} — ${o.category_type}`}
    fieldGroups={overheadFieldGroups}
    basePath={`${HAWKEYE}/overheads`}
  />
);
