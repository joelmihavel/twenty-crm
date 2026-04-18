import { useState, useCallback } from 'react';
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
  IconCalendarEvent,
  IconCurrencyRupee,
  IconPlus,
} from 'twenty-ui/display';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAddButton = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: background 100ms linear, color 100ms linear;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

import { HawkeyeListPage } from '../components/HawkeyeListPage';
import { HawkeyeRecordPage } from '../components/HawkeyeRecordPage';
import {
  HawkeyeBoardView,
  type BoardColumn,
} from '../components/HawkeyeBoardView';
import { RelatedRecords } from '../components/RelatedRecords';
import { HawkeyeSummaryCard } from '../components/HawkeyeSummaryCard';
import { TransactionDrawer } from '../components/TransactionDrawer';
import { ItemDrawer } from '../components/ItemDrawer';
import { TenantForm } from '../components/forms/TenantForm';
import { TicketForm } from '../components/forms/TicketForm';
import { ContractForm } from '../components/forms/ContractForm';
import { TransactionForm } from '../components/forms/TransactionForm';
import { ReserveForm } from '../components/forms/ReserveForm';
import { LandlordOnboardingForm } from '../components/forms/LandlordOnboardingForm';
import { MoveOutNoticeForm } from '../components/forms/MoveOutNoticeForm';
import { CsatNpsSurveyForm } from '../components/forms/CsatNpsSurveyForm';
import { RenewalDecisionForm } from '../components/forms/RenewalDecisionForm';

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

import { type Pid } from '../types/pid.types';
import { type Tenant } from '../types/tenant.types';
import { type Merchant } from '../types/merchant.types';
import { type Contract } from '../types/contract.types';
import { type Vendor } from '../types/vendor.types';
import { type Fsin } from '../types/fsin.types';
import { type Rid } from '../types/rid.types';
import { type Ticket } from '../types/ticket.types';
import { type Transaction } from '../types/transaction.types';
import { type Item } from '../types/item.types';

import { formatINR } from '../utils/format';

import { NpsTrendChart } from '@/hawkeye/components/charts/tenant/NpsTrendChart';
import { TicketVolumeChart as TenantTicketVolumeChart } from '@/hawkeye/components/charts/tenant/TicketVolumeChart';
import { TicketVolumeChart as VendorTicketVolumeChart } from '@/hawkeye/components/charts/vendor/TicketVolumeChart';
import { ResolutionTimeChart } from '@/hawkeye/components/charts/vendor/ResolutionTimeChart';
import { CategoryBreakdownChart } from '@/hawkeye/components/charts/vendor/CategoryBreakdownChart';
import { RevenueCOGSChart } from '@/hawkeye/components/charts/pid/RevenueCOGSChart';
import { TicketCategoryChart } from '@/hawkeye/components/charts/pid/TicketCategoryChart';
import { RentTrajectoryChart } from '@/hawkeye/components/charts/rid/RentTrajectoryChart';
import { OccupancyRateChart } from '@/hawkeye/components/charts/rid/OccupancyRateChart';
import { RepairCostChart } from '@/hawkeye/components/charts/item/RepairCostChart';
import { UnitStateChart } from '@/hawkeye/components/charts/fsin/UnitStateChart';
import { ProcurementHistoryChart } from '@/hawkeye/components/charts/fsin/ProcurementHistoryChart';
import { SlaBreachChart } from '@/hawkeye/components/charts/board/SlaBreachChart';
import { TicketStatusChart } from '@/hawkeye/components/charts/board/TicketStatusChart';
import { CollectionTrendChart } from '@/hawkeye/components/charts/rent/CollectionTrendChart';
import { CollectionStatusChart } from '@/hawkeye/components/charts/rent/CollectionStatusChart';
import { OverdueAgingChart } from '@/hawkeye/components/charts/rent/OverdueAgingChart';
import { LandlordPayoutChart } from '@/hawkeye/components/charts/rent/LandlordPayoutChart';

const StyledChartsGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const HAWKEYE = '/hawkeye';

// ── Tenants ────────────────────────────────────────────────────────

export const TenantsListPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [moveOutOpen, setMoveOutOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="Tenants"
        Icon={IconUser}
        columns={tenantColumns}
        data={mockTenants.filter((t) => !['New Inquiry', 'Visit Scheduled', 'Visit Done', 'Negotiation', 'Converted', 'Dead Lead'].includes(t.tenant_lifecycle))}
        idKey="id"
        basePath={`${HAWKEYE}/tenants`}
        fieldGroups={tenantFieldGroups}
        titleFn={(t) => `${t.first_name} ${t.last_name}`}
        headerExtra={
          <>
            <StyledAddButton onClick={() => setFormOpen(true)}>
              <IconPlus size={14} />
              Add Tenant
            </StyledAddButton>
            <StyledAddButton onClick={() => setSurveyOpen(true)}>
              CSAT Survey
            </StyledAddButton>
            <StyledAddButton onClick={() => setMoveOutOpen(true)}>
              Move-out Notice
            </StyledAddButton>
          </>
        }
        boardColumns={[
          { key: 'Gestation', label: 'Gestation', tagColor: 'orange' },
          { key: 'Moved In', label: 'Moved In', tagColor: 'green' },
          { key: 'Notice Period', label: 'Notice Period', tagColor: 'orange' },
          { key: 'Moved Out', label: 'Moved Out', tagColor: 'gray' },
        ]}
        boardStatusKey="tenant_lifecycle"
        boardCardFields={(t) => [
          { label: 'Phone', value: t.mobile_phone },
          { label: 'PID', value: t.current_pid || '—' },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <NpsTrendChart tenantId={mockTenants[0]?.id ?? ''} />
            <TenantTicketVolumeChart tenantId={mockTenants[0]?.id ?? ''} />
          </StyledChartsGrid>
        )}
        renderRelations={(tenant, onRecordClick) => {
          const contracts = mockContracts.filter((c) => c.party_id === tenant.id);
          return contracts.length > 0 ? (
            <RelatedRecords
              title="Contracts"
              records={contracts}
              idKey="id"
              basePath={`${HAWKEYE}/contracts`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(c) => `${c.party_name} — ${c.rid}`}
              onRecordClick={onRecordClick}
            />
          ) : null;
        }}
      />
      <TenantForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {
          // TODO: Replace with API call
        }}
      />
      <CsatNpsSurveyForm
        isOpen={surveyOpen}
        onClose={() => setSurveyOpen(false)}
        onSave={() => {}}
      />
      <MoveOutNoticeForm
        isOpen={moveOutOpen}
        onClose={() => setMoveOutOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};

export const TenantDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTenants}
    idKey="id"
    titleFn={(t) => `${t.first_name} ${t.last_name}`}
    fieldGroups={tenantFieldGroups}
    basePath={`${HAWKEYE}/tenants`}
    useTabs
    renderSummary={(tenant: Tenant) => {
      const contracts = mockContracts.filter(
        (c) => c.party_id === tenant.id,
      );
      const activeContract = contracts.find(
        (c) => c.agreement_lifecycle === 'Active',
      );
      return (
        <HawkeyeSummaryCard
          items={[
            {
              label: 'Lifecycle',
              value: tenant.tenant_lifecycle,
              Icon: IconUser,
              tag: {
                text: tenant.tenant_lifecycle,
                color:
                  tenant.tenant_lifecycle === 'Moved In'
                    ? 'green'
                    : tenant.tenant_lifecycle === 'Dead Lead'
                      ? 'red'
                      : 'blue',
              },
            },
            {
              label: 'Current PID',
              value: tenant.current_pid || '—',
              Icon: IconHome,
            },
            {
              label: 'Contracts',
              value: contracts.length,
              Icon: IconFileText,
            },
            ...(activeContract
              ? [
                  {
                    label: 'Monthly Rent',
                    value: formatINR(activeContract.monthly_license_fee),
                    Icon: IconCurrencyRupee,
                  },
                ]
              : []),
          ]}
        />
      );
    }}
    renderRelations={(tenant: Tenant) => {
      const contracts = mockContracts.filter(
        (c) => c.party_id === tenant.id,
      );
      const transactions = mockTransactions.filter((t) =>
        contracts.some((c) => c.id === t.contract_uid),
      );
      const tickets = mockTickets.filter((t) => t.tenant_id === tenant.id);
      return (
        <>
          <RelatedRecords
            title="Contracts"
            records={contracts}
            idKey="id"
            basePath={`${HAWKEYE}/contracts`}
            columns={[{ key: 'id', label: 'ID' }]}
            titleFn={(c) => `${c.party_name} — ${c.rid}`}
          />
          {transactions.length > 0 && (
            <RelatedRecords
              title="Transactions"
              records={transactions}
              idKey="id"
              basePath={`${HAWKEYE}/transactions`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`}
            />
          )}
          {tickets.length > 0 && (
            <RelatedRecords
              title="Tickets"
              records={tickets}
              idKey="id"
              basePath={`${HAWKEYE}/tickets`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
            />
          )}
        </>
      );
    }}
  />
);

// ── Merchants ──────────────────────────────────────────────────────

export const MerchantsListPage = () => {
  const [onboardOpen, setOnboardOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="Merchants"
        Icon={IconBuildingSkyscraper}
        columns={merchantColumns}
        data={mockMerchants.filter((m) => ['Under Contract', 'Churned'].includes(m.deal_stage))}
        idKey="id"
        basePath={`${HAWKEYE}/merchants`}
        fieldGroups={merchantFieldGroups}
        titleFn={(m) => `${m.prefix} ${m.first_name} ${m.last_name}`}
        headerExtra={
          <StyledAddButton onClick={() => setOnboardOpen(true)}>
            <IconPlus size={14} />
            Onboard Landlord
          </StyledAddButton>
        }
        boardColumns={[
          { key: 'Under Contract', label: 'Under Contract', tagColor: 'green' },
          { key: 'Churned', label: 'Churned', tagColor: 'red' },
        ]}
        boardStatusKey="deal_stage"
        boardCardFields={(m) => [
          { label: 'Type', value: m.merchant_type },
          { label: 'City', value: m.current_city },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <LandlordPayoutChart />
          </StyledChartsGrid>
        )}
      />
      <LandlordOnboardingForm
        isOpen={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};

export const MerchantDetailPage = () => (
  <HawkeyeRecordPage
    data={mockMerchants}
    idKey="id"
    titleFn={(m) => `${m.prefix} ${m.first_name} ${m.last_name}`}
    fieldGroups={merchantFieldGroups}
    basePath={`${HAWKEYE}/merchants`}
    useTabs
    renderSummary={(merchant: Merchant) => {
      const properties = mockProperties.filter(
        (p) => p.merchant_id === merchant.id,
      );
      return (
        <HawkeyeSummaryCard
          items={[
            {
              label: 'Deal Stage',
              value: merchant.deal_stage,
              tag: {
                text: merchant.deal_stage,
                color:
                  merchant.deal_stage === 'Under Contract'
                    ? 'green'
                    : merchant.deal_stage === 'Churned'
                      ? 'red'
                      : 'blue',
              },
            },
            {
              label: 'Properties',
              value: properties.length,
              Icon: IconHome,
            },
            {
              label: 'Type',
              value: merchant.merchant_type,
              Icon: IconBuildingSkyscraper,
            },
          ]}
        />
      );
    }}
    renderRelations={(merchant: Merchant) => {
      const properties = mockProperties.filter(
        (p) => p.merchant_id === merchant.id,
      );
      const contracts = mockContracts.filter(
        (c) => c.party_id === merchant.id,
      );
      return (
        <>
          <RelatedRecords
            title="Properties"
            records={properties}
            idKey="id"
            basePath={`${HAWKEYE}/properties`}
            columns={[{ key: 'id', label: 'PID' }]}
            titleFn={(p) => `${p.id} — ${p.building_society}`}
          />
          {contracts.length > 0 && (
            <RelatedRecords
              title="Contracts"
              records={contracts}
              idKey="id"
              basePath={`${HAWKEYE}/contracts`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(c) => `${c.party_name} — ${c.contract_type}`}
            />
          )}
        </>
      );
    }}
  />
);

// ── Vendors ────────────────────────────────────────────────────────

export const VendorsListPage = () => (
  <HawkeyeListPage
    title="Vendors"
    Icon={IconTool}
    columns={vendorColumns}
    data={mockVendors}
    idKey="id"
    basePath={`${HAWKEYE}/vendors`}
    fieldGroups={vendorFieldGroups}
    titleFn={(v) => v.vendor_name}
    boardColumns={[
      { key: 'Premium', label: 'Premium', tagColor: 'green' },
      { key: 'Standard', label: 'Standard', tagColor: 'blue' },
      { key: 'Budget', label: 'Budget', tagColor: 'gray' },
    ]}
    boardStatusKey="quality_tier"
    boardCardFields={(v) => [
      { label: 'Specialization', value: v.specialization },
      { label: 'TAT', value: `${v.tat_in_days}d` },
    ]}
    renderCharts={() => (
      <StyledChartsGrid>
        <VendorTicketVolumeChart vendorId={mockVendors[0]?.id ?? ''} />
        <ResolutionTimeChart vendorId={mockVendors[0]?.id ?? ''} />
        <CategoryBreakdownChart vendorId={mockVendors[0]?.id ?? ''} />
      </StyledChartsGrid>
    )}
    renderRelations={(vendor, onRecordClick) => {
      const tickets = mockTickets.filter((t) => t.assigned_vendor_id === vendor.id);
      return tickets.length > 0 ? (
        <RelatedRecords
          title="Tickets"
          records={tickets}
          idKey="id"
          basePath={`${HAWKEYE}/tickets`}
          columns={[{ key: 'id', label: 'ID' }]}
          titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
          onRecordClick={onRecordClick}
        />
      ) : null;
    }}
  />
);

export const VendorDetailPage = () => (
  <HawkeyeRecordPage
    data={mockVendors}
    idKey="id"
    titleFn={(v) => v.vendor_name}
    fieldGroups={vendorFieldGroups}
    basePath={`${HAWKEYE}/vendors`}
    useTabs
    renderSummary={(vendor: Vendor) => {
      const tickets = mockTickets.filter(
        (t) => t.assigned_vendor_id === vendor.id,
      );
      return (
        <HawkeyeSummaryCard
          items={[
            {
              label: 'Quality',
              value: vendor.quality_tier,
              tag: {
                text: vendor.quality_tier,
                color: vendor.quality_tier === 'Premium' ? 'green' : 'gray',
              },
            },
            {
              label: 'TAT',
              value: `${vendor.tat_in_days}d`,
              Icon: IconCalendarEvent,
            },
            {
              label: 'Tickets',
              value: tickets.length,
              Icon: IconTag,
            },
            {
              label: 'Specialization',
              value: vendor.specialization,
              Icon: IconTool,
            },
          ]}
        />
      );
    }}
    renderRelations={(vendor: Vendor) => {
      const tickets = mockTickets.filter(
        (t) => t.assigned_vendor_id === vendor.id,
      );
      return (
        <>
          <RelatedRecords
            title="Assigned Tickets"
            records={tickets}
            idKey="id"
            basePath={`${HAWKEYE}/tickets`}
            columns={[{ key: 'id', label: 'ID' }]}
            titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
          />
        </>
      );
    }}
  />
);

// ── Properties (PID) ───────────────────────────────────────────────

export const PropertiesListPage = () => (
  <HawkeyeListPage
    title="Properties (PID)"
    Icon={IconHome}
    columns={propertyColumns}
    data={mockProperties}
    idKey="id"
    basePath={`${HAWKEYE}/properties`}
    fieldGroups={propertyFieldGroups}
    titleFn={(p) => `${p.id} — ${p.building_society}`}
    boardColumns={[
      { key: 'lead', label: 'Lead', tagColor: 'blue' },
      { key: 'active', label: 'Active', tagColor: 'green' },
      { key: 'churned', label: 'Churned', tagColor: 'red' },
    ]}
    boardStatusKey="type"
    boardCardFields={(p) => [
      { label: 'Building', value: p.building_society },
      { label: 'Units', value: p.active_units_count },
      { label: 'Tier', value: p.tier },
    ]}
    renderCharts={() => (
      <StyledChartsGrid>
        <RevenueCOGSChart pidId={mockProperties[0]?.id ?? ''} />
        <TicketCategoryChart pidId={mockProperties[0]?.id ?? ''} />
      </StyledChartsGrid>
    )}
    renderRelations={(property, onRecordClick) => {
      const rooms = mockRooms.filter((r) => r.pid === property.id);
      return rooms.length > 0 ? (
        <RelatedRecords
          title="Rooms"
          records={rooms}
          idKey="id"
          basePath={`${HAWKEYE}/rooms`}
          columns={[{ key: 'id', label: 'RID' }]}
          titleFn={(r) => `${r.id} — ${r.bed_type}`}
          onRecordClick={onRecordClick}
        />
      ) : null;
    }}
  />
);

export const PropertyDetailPage = () => (
  <HawkeyeRecordPage
    data={mockProperties}
    idKey="id"
    titleFn={(p) => `${p.id} — ${p.building_society}`}
    fieldGroups={propertyFieldGroups}
    basePath={`${HAWKEYE}/properties`}
    useTabs
    renderSummary={(property: Pid) => {
      const rooms = mockRooms.filter((r) => r.pid === property.id);
      const occupied = rooms.filter((r) => r.room_status === 'Occupied');
      const overheads = mockOverheads.filter((o) => o.pid === property.id);
      return (
        <HawkeyeSummaryCard
          items={[
            {
              label: 'Status',
              value: property.type,
              tag: {
                text: property.type,
                color:
                  property.type === 'active'
                    ? 'green'
                    : property.type === 'churned'
                      ? 'red'
                      : 'blue',
              },
            },
            {
              label: 'Rooms',
              value: `${occupied.length}/${rooms.length} occupied`,
              Icon: IconDoorEnter,
            },
            {
              label: 'Overheads',
              value: overheads.length,
              Icon: IconCoins,
            },
            {
              label: 'Tier',
              value: property.tier,
              Icon: IconHome,
            },
          ]}
        />
      );
    }}
    renderRelations={(property: Pid) => {
      const rooms = mockRooms.filter((r) => r.pid === property.id);
      const contracts = mockContracts.filter((c) => c.pid === property.id);
      const overheads = mockOverheads.filter((o) => o.pid === property.id);
      const tickets = mockTickets.filter((t) => t.pid === property.id);
      return (
        <>
          <RelatedRecords
            title="Rooms"
            records={rooms}
            idKey="id"
            basePath={`${HAWKEYE}/rooms`}
            columns={[{ key: 'id', label: 'RID' }]}
            titleFn={(r) => `${r.id} — ${r.bed_type}`}
          />
          {contracts.length > 0 && (
            <RelatedRecords
              title="Contracts"
              records={contracts}
              idKey="id"
              basePath={`${HAWKEYE}/contracts`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(c) => `${c.party_name} — ${c.contract_type}`}
            />
          )}
          {overheads.length > 0 && (
            <RelatedRecords
              title="Overheads"
              records={overheads}
              idKey="id"
              basePath={`${HAWKEYE}/overheads`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(o) => `${o.pid} — ${o.category_type}`}
            />
          )}
          {tickets.length > 0 && (
            <RelatedRecords
              title="Tickets"
              records={tickets}
              idKey="id"
              basePath={`${HAWKEYE}/tickets`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
            />
          )}
        </>
      );
    }}
  />
);

// ── Rooms (RID) ────────────────────────────────────────────────────

export const RoomsListPage = () => {
  const [reserveOpen, setReserveOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="Rooms (RID)"
        Icon={IconDoorEnter}
        columns={roomColumns}
        data={mockRooms}
        idKey="id"
        basePath={`${HAWKEYE}/rooms`}
        fieldGroups={roomFieldGroups}
        titleFn={(r) => `${r.id} (${r.pid})`}
        headerExtra={
          <StyledAddButton onClick={() => setReserveOpen(true)}>
            <IconPlus size={14} />
            Reserve Room
          </StyledAddButton>
        }
        boardColumns={[
          { key: 'Available', label: 'Available', tagColor: 'blue' },
          { key: 'Occupied', label: 'Occupied', tagColor: 'green' },
          { key: 'Under Maintenance', label: 'Maintenance', tagColor: 'orange' },
          { key: 'Blocked', label: 'Blocked', tagColor: 'red' },
        ]}
        boardStatusKey="room_status"
        boardCardFields={(r) => [
          { label: 'Bed Type', value: r.bed_type },
          { label: 'Tenant', value: r.current_tenant_name || '—' },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <RentTrajectoryChart ridId={mockRooms[0]?.id ?? ''} />
            <OccupancyRateChart ridId={mockRooms[0]?.id ?? ''} />
          </StyledChartsGrid>
        )}
        renderRelations={(room, onRecordClick) => {
          const contracts = mockContracts.filter((c) => c.rid === room.id);
          return contracts.length > 0 ? (
            <RelatedRecords
              title="Contracts"
              records={contracts}
              idKey="id"
              basePath={`${HAWKEYE}/contracts`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(c) => `${c.party_name} — ${c.agreement_lifecycle}`}
              onRecordClick={onRecordClick}
            />
          ) : null;
        }}
      />
      <ReserveForm
        isOpen={reserveOpen}
        onClose={() => setReserveOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};

export const RoomDetailPage = () => (
  <HawkeyeRecordPage
    data={mockRooms}
    idKey="id"
    titleFn={(r) => `${r.id} (${r.pid})`}
    fieldGroups={roomFieldGroups}
    basePath={`${HAWKEYE}/rooms`}
    useTabs
    renderSummary={(room: Rid) => (
      <HawkeyeSummaryCard
        items={[
          {
            label: 'Status',
            value: room.room_status,
            tag: {
              text: room.room_status,
              color:
                room.room_status === 'Occupied'
                  ? 'green'
                  : room.room_status === 'Available'
                    ? 'blue'
                    : room.room_status === 'Blocked'
                      ? 'red'
                      : 'orange',
            },
          },
          { label: 'Base Rent', value: formatINR(room.base_rent), Icon: IconCurrencyRupee },
          { label: 'Bed Type', value: room.bed_type },
          { label: 'Tenant', value: room.current_tenant_name || '—', Icon: IconUser },
        ]}
      />
    )}
    renderRelations={(room: Rid) => {
      const contracts = mockContracts.filter((c) => c.rid === room.id);
      return (
        <>
          <RelatedRecords
            title="Contracts"
            records={contracts}
            idKey="id"
            basePath={`${HAWKEYE}/contracts`}
            columns={[{ key: 'id', label: 'ID' }]}
            titleFn={(c) => `${c.party_name} — ${c.agreement_lifecycle}`}
          />
        </>
      );
    }}
  />
);

// ── Contracts ──────────────────────────────────────────────────────

export const ContractsListPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [renewalOpen, setRenewalOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="Contracts"
        Icon={IconFileText}
        columns={contractColumns}
        data={mockContracts}
        idKey="id"
        basePath={`${HAWKEYE}/contracts`}
        fieldGroups={contractFieldGroups}
        titleFn={(c) =>
          c.contract_type === 'Tenant'
            ? `${c.party_name} — ${c.rid}`
            : `${c.party_name} — ${c.contract_type}`
        }
        headerExtra={
          <>
            <StyledAddButton onClick={() => setFormOpen(true)}>
              <IconPlus size={14} />
              Add Contract
            </StyledAddButton>
            <StyledAddButton onClick={() => setRenewalOpen(true)}>
              Renewal Decision
            </StyledAddButton>
          </>
        }
        boardColumns={[
          { key: 'Draft', label: 'Draft', tagColor: 'gray' },
          { key: 'Sent for Signing', label: 'Sent', tagColor: 'blue' },
          { key: 'Signed', label: 'Signed', tagColor: 'blue' },
          { key: 'Active', label: 'Active', tagColor: 'green' },
          { key: 'Expired', label: 'Expired', tagColor: 'orange' },
          { key: 'Terminated', label: 'Terminated', tagColor: 'red' },
        ]}
        boardStatusKey="agreement_lifecycle"
        boardCardFields={(c) => [
          { label: 'Type', value: c.contract_type },
          { label: 'Party', value: c.party_name },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <CollectionTrendChart />
            <CollectionStatusChart />
          </StyledChartsGrid>
        )}
        renderRelations={(contract, onRecordClick) => {
          const transactions = mockTransactions.filter((t) => t.contract_uid === contract.id);
          return transactions.length > 0 ? (
            <RelatedRecords
              title="Transactions"
              records={transactions}
              idKey="id"
              basePath={`${HAWKEYE}/transactions`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`}
              onRecordClick={onRecordClick}
            />
          ) : null;
        }}
      />
      <ContractForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {
          // TODO: Replace with API call
        }}
      />
      <RenewalDecisionForm
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
        onSave={() => {}}
      />
    </>
  );
};

export const ContractDetailPage = () => (
  <HawkeyeRecordPage
    data={mockContracts}
    idKey="id"
    titleFn={(c) =>
      c.contract_type === 'Tenant'
        ? `${c.party_name} — ${c.rid}`
        : `${c.party_name} — ${c.contract_type}`
    }
    fieldGroups={contractFieldGroups}
    basePath={`${HAWKEYE}/contracts`}
    useTabs
    renderSummary={(contract: Contract) => (
      <HawkeyeSummaryCard
        items={[
          {
            label: 'Payment',
            value: contract.payment_lifecycle,
            tag: {
              text: contract.payment_lifecycle,
              color:
                contract.payment_lifecycle === 'All Payments Done'
                  ? 'green'
                  : contract.payment_lifecycle === 'Pending'
                    ? 'red'
                    : 'orange',
            },
          },
          {
            label: 'Agreement',
            value: contract.agreement_lifecycle,
            tag: {
              text: contract.agreement_lifecycle,
              color:
                contract.agreement_lifecycle === 'Active'
                  ? 'green'
                  : contract.agreement_lifecycle === 'Terminated'
                    ? 'red'
                    : 'blue',
            },
          },
          { label: 'Monthly Rent', value: formatINR(contract.monthly_license_fee), Icon: IconCurrencyRupee },
          { label: 'Security Deposit', value: formatINR(contract.security_deposit), Icon: IconCurrencyRupee },
        ]}
      />
    )}
    renderRelations={(contract: Contract) => {
      const transactions = mockTransactions.filter(
        (t) => t.contract_uid === contract.id,
      );
      return (
        <RelatedRecords
          title="Transactions"
          records={transactions}
          idKey="id"
          basePath={`${HAWKEYE}/transactions`}
          columns={[{ key: 'id', label: 'ID' }]}
          titleFn={(t) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`}
        />
      );
    }}
  />
);

// ── Transactions ───────────────────────────────────────────────────

export const TransactionsListPage = () => {
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleRowClick = useCallback((record: Transaction) => {
    setDrawerId(record.id);
  }, []);

  return (
    <>
      <HawkeyeListPage
        title="Transactions"
        Icon={IconCreditCard}
        columns={transactionColumns}
        data={mockTransactions}
        idKey="id"
        basePath={`${HAWKEYE}/transactions`}
        fieldGroups={transactionFieldGroups}
        titleFn={(t) => `${t.id} — ${t.credit_debit}`}
        onRowClick={handleRowClick}
        headerExtra={
          <StyledAddButton onClick={() => setFormOpen(true)}>
            <IconPlus size={14} />
            Add Transaction
          </StyledAddButton>
        }
        boardColumns={[
          { key: 'Credit', label: 'Credit', tagColor: 'green' },
          { key: 'Debit', label: 'Debit', tagColor: 'red' },
        ]}
        boardStatusKey="credit_debit"
        boardCardFields={(t) => [
          { label: 'Amount', value: String(t.amount) },
          { label: 'Purpose', value: t.purpose_category_1 },
          { label: 'Date', value: t.transaction_date },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <OverdueAgingChart />
          </StyledChartsGrid>
        )}
      />
      <TransactionDrawer
        transactionId={drawerId}
        onClose={() => setDrawerId(null)}
      />
      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {
          // TODO: Replace with API call
        }}
      />
    </>
  );
};

export const TransactionDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTransactions}
    idKey="id"
    titleFn={(t) => `${t.id} — ${t.credit_debit}`}
    fieldGroups={transactionFieldGroups}
    basePath={`${HAWKEYE}/transactions`}
    renderSummary={(t: Transaction) => (
      <HawkeyeSummaryCard
        items={[
          {
            label: 'Type',
            value: t.credit_debit,
            tag: {
              text: t.credit_debit,
              color: t.credit_debit === 'Credit' ? 'green' : 'red',
            },
          },
          { label: 'Amount', value: formatINR(t.amount), Icon: IconCurrencyRupee },
          { label: 'Purpose', value: t.purpose_category_1 },
          { label: 'Channel', value: t.payment_channel },
        ]}
      />
    )}
  />
);

// ── Tickets ────────────────────────────────────────────────────────

export const TicketsListPage = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <HawkeyeListPage
        title="Tickets"
        Icon={IconTag}
        columns={ticketColumns}
        data={mockTickets}
        idKey="id"
        basePath={`${HAWKEYE}/tickets`}
        fieldGroups={ticketFieldGroups}
        titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
        headerExtra={
          <StyledAddButton onClick={() => setFormOpen(true)}>
            <IconPlus size={14} />
            Add Ticket
          </StyledAddButton>
        }
        boardColumns={[
          { key: 'New Request', label: 'New Request', tagColor: 'blue' },
          { key: 'Waiting on Customer', label: 'W. Customer', tagColor: 'orange' },
          { key: 'Waiting on Vendor', label: 'W. Vendor', tagColor: 'orange' },
          { key: 'Blocked', label: 'Blocked', tagColor: 'red' },
          { key: 'Waiting for Payment', label: 'W. Payment', tagColor: 'orange' },
          { key: 'Ready for Closure', label: 'Ready', tagColor: 'blue' },
          { key: 'Closed', label: 'Closed', tagColor: 'green' },
        ]}
        boardStatusKey="ticket_status"
        boardCardFields={(t) => [
          { label: 'Category', value: t.ticket_category },
          { label: 'Cost', value: String(t.total_cost_net) },
        ]}
        boardCardTags={(t) => [
          { text: t.priority, color: t.priority === 'Urgent' || t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'orange' : 'gray' },
        ]}
        renderCharts={() => (
          <StyledChartsGrid>
            <SlaBreachChart />
            <TicketStatusChart />
          </StyledChartsGrid>
        )}
        renderRelations={(ticket, onRecordClick) => {
          const vendor = mockVendors.find((v) => v.id === ticket.assigned_vendor_id);
          const tenant = mockTenants.find((t) => t.id === ticket.tenant_id);
          const previousTickets = ticket.tenant_id
            ? mockTickets.filter((t) => t.tenant_id === ticket.tenant_id && t.id !== ticket.id)
            : [];
          return (
            <>
              {tenant && (
                <RelatedRecords
                  title="Tenant"
                  records={[tenant]}
                  idKey="id"
                  basePath={`${HAWKEYE}/tenants`}
                  columns={[{ key: 'id', label: 'ID' }]}
                  titleFn={(t) => `${t.first_name} ${t.last_name}`}
                  onRecordClick={onRecordClick}
                />
              )}
              {vendor && (
                <RelatedRecords
                  title="Assigned Vendor"
                  records={[vendor]}
                  idKey="id"
                  basePath={`${HAWKEYE}/vendors`}
                  columns={[{ key: 'vendor_name', label: 'Name' }]}
                  titleFn={(v) => v.vendor_name}
                  onRecordClick={onRecordClick}
                />
              )}
              {ticket.tenant_id && (
                <RelatedRecords
                  title="Previous Tickets (Same Tenant)"
                  records={previousTickets}
                  idKey="id"
                  basePath={`${HAWKEYE}/tickets`}
                  columns={[{ key: 'id', label: 'ID' }]}
                  titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
                  onRecordClick={onRecordClick}
                />
              )}
            </>
          );
        }}
      />
      <TicketForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {
          // TODO: Replace with API call
        }}
      />
    </>
  );
};

export const TicketDetailPage = () => (
  <HawkeyeRecordPage
    data={mockTickets}
    idKey="id"
    titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
    fieldGroups={ticketFieldGroups}
    basePath={`${HAWKEYE}/tickets`}
    useTabs
    renderSummary={(ticket: Ticket) => {
      const tenant = mockTenants.find((t) => t.id === ticket.tenant_id);
      const tenantTicketCount = mockTickets.filter((t) => t.tenant_id === ticket.tenant_id).length;
      return (
        <HawkeyeSummaryCard
          items={[
            {
              label: 'Status',
              value: ticket.ticket_status,
              tag: {
                text: ticket.ticket_status,
                color:
                  ticket.ticket_status === 'Closed'
                    ? 'green'
                    : ticket.ticket_status === 'Blocked'
                      ? 'red'
                      : 'orange',
              },
            },
            {
              label: 'Priority',
              value: ticket.priority,
              tag: {
                text: ticket.priority,
                color:
                  ticket.priority === 'Urgent' || ticket.priority === 'High'
                    ? 'red'
                    : ticket.priority === 'Medium'
                      ? 'orange'
                      : 'gray',
              },
            },
            { label: 'Cost', value: formatINR(ticket.total_cost_net), Icon: IconCurrencyRupee },
            { label: 'Category', value: ticket.ticket_category },
            ...(tenant
              ? [
                  {
                    label: 'Tenant Lifecycle',
                    value: tenant.tenant_lifecycle,
                    tag: {
                      text: tenant.tenant_lifecycle,
                      color:
                        tenant.tenant_lifecycle === 'Moved In'
                          ? ('green' as const)
                          : tenant.tenant_lifecycle === 'Notice Period'
                            ? ('orange' as const)
                            : ('blue' as const),
                    },
                  },
                  {
                    label: 'Tenant Tickets',
                    value: tenantTicketCount,
                    Icon: IconTag,
                  },
                  ...(tenant.nps_category
                    ? [
                        {
                          label: 'NPS',
                          value: tenant.nps_category,
                          tag: {
                            text: tenant.nps_category,
                            color:
                              tenant.nps_category === 'Promoter'
                                ? ('green' as const)
                                : tenant.nps_category === 'Detractor'
                                  ? ('red' as const)
                                  : ('orange' as const),
                          },
                        },
                      ]
                    : []),
                ]
              : []),
          ]}
        />
      );
    }}
    renderRelations={(ticket: Ticket) => {
      const transactions = mockTransactions.filter(
        (t) => t.id === ticket.transaction_id,
      );
      const vendor = mockVendors.find(
        (v) => v.id === ticket.assigned_vendor_id,
      );
      const tenant = mockTenants.find(
        (t) => t.id === ticket.tenant_id,
      );
      const previousTickets = ticket.tenant_id
        ? mockTickets.filter(
            (t) => t.tenant_id === ticket.tenant_id && t.id !== ticket.id,
          )
        : [];
      return (
        <>
          {tenant && (
            <RelatedRecords
              title="Tenant"
              records={[tenant]}
              idKey="id"
              basePath={`${HAWKEYE}/tenants`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `${t.first_name} ${t.last_name}`}
            />
          )}
          {vendor && (
            <RelatedRecords
              title="Assigned Vendor"
              records={[vendor]}
              idKey="id"
              basePath={`${HAWKEYE}/vendors`}
              columns={[{ key: 'vendor_name', label: 'Name' }]}
              titleFn={(v) => v.vendor_name}
            />
          )}
          {ticket.tenant_id && (
            <RelatedRecords
              title="Previous Tickets (Same Tenant)"
              records={previousTickets}
              idKey="id"
              basePath={`${HAWKEYE}/tickets`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `#${t.id} — ${t.ticket_name}`}
            />
          )}
          {transactions.length > 0 && (
            <RelatedRecords
              title="Linked Transaction"
              records={transactions}
              idKey="id"
              basePath={`${HAWKEYE}/transactions`}
              columns={[{ key: 'id', label: 'ID' }]}
              titleFn={(t) => `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`}
            />
          )}
        </>
      );
    }}
  />
);

// ── Catalogs (FSIN) ────────────────────────────────────────────────

export const CatalogsListPage = () => (
  <HawkeyeListPage
    title="Catalogs (FSN)"
    Icon={IconLayoutGrid}
    columns={catalogColumns}
    data={mockCatalogs}
    idKey="id"
    basePath={`${HAWKEYE}/catalogs`}
    fieldGroups={catalogFieldGroups}
    titleFn={(c) => `${c.fsin_code} — ${c.item_name}`}
    renderCharts={() => (
      <StyledChartsGrid>
        <UnitStateChart fsinId={mockCatalogs[0]?.id ?? ''} />
        <ProcurementHistoryChart fsinId={mockCatalogs[0]?.id ?? ''} />
      </StyledChartsGrid>
    )}
  />
);

export const CatalogDetailPage = () => (
  <HawkeyeRecordPage
    data={mockCatalogs}
    idKey="id"
    titleFn={(c) => `${c.fsin_code} — ${c.item_name}`}
    fieldGroups={catalogFieldGroups}
    basePath={`${HAWKEYE}/catalogs`}
    useTabs
    renderSummary={(catalog: Fsin) => (
      <HawkeyeSummaryCard
        items={[
          { label: 'Total Stock', value: catalog.total_stock, Icon: IconArchive },
          { label: 'In Properties', value: catalog.in_properties, Icon: IconHome },
          { label: 'In Warehouse', value: catalog.in_warehouse },
          { label: 'Under Repair', value: catalog.under_repair, tag: catalog.under_repair > 0 ? { text: String(catalog.under_repair), color: 'orange' } : undefined },
          { label: 'Dead', value: catalog.dead, tag: catalog.dead > 0 ? { text: String(catalog.dead), color: 'red' } : undefined },
        ]}
      />
    )}
    renderRelations={(catalog: Fsin) => {
      const items = mockItems.filter(
        (i) => i.fsin_code === catalog.fsin_code,
      );
      return (
        <>
          <RelatedRecords
            title="Items"
            records={items}
            idKey="id"
            basePath={`${HAWKEYE}/items`}
            columns={[{ key: 'item_code', label: 'Code' }]}
            titleFn={(i) => `${i.item_code} — ${i.product_name}`}
          />
        </>
      );
    }}
  />
);

// ── Items ──────────────────────────────────────────────────────────

export const ItemsListPage = () => {
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const handleRowClick = useCallback((record: Item) => {
    setDrawerId(record.id);
  }, []);

  return (
    <>
      <HawkeyeListPage
        title="Items"
        Icon={IconArchive}
        columns={itemColumns}
        data={mockItems}
        idKey="id"
        basePath={`${HAWKEYE}/items`}
        fieldGroups={itemFieldGroups}
        titleFn={(i) => `${i.item_code} (${i.fsin_code})`}
        onRowClick={handleRowClick}
        renderCharts={() => (
          <StyledChartsGrid>
            <RepairCostChart itemId={mockItems[0]?.id ?? ''} />
          </StyledChartsGrid>
        )}
      />
      <ItemDrawer itemId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  );
};

export const ItemDetailPage = () => (
  <HawkeyeRecordPage
    data={mockItems}
    idKey="id"
    titleFn={(i) => `${i.item_code} (${i.fsin_code})`}
    fieldGroups={itemFieldGroups}
    basePath={`${HAWKEYE}/items`}
    renderSummary={(item: Item) => (
      <HawkeyeSummaryCard
        items={[
          {
            label: 'State',
            value: item.state,
            tag: {
              text: item.state,
              color:
                item.state === 'WORK' || item.state === 'PIB'
                  ? 'green'
                  : item.state === 'DEAD'
                    ? 'red'
                    : item.state === 'WIB'
                      ? 'orange'
                      : 'blue',
            },
          },
          { label: 'Price', value: formatINR(item.unit_price), Icon: IconCurrencyRupee },
          { label: 'Repair Cost', value: formatINR(item.total_repair_cost) },
          { label: 'Location', value: item.location, Icon: IconHome },
        ]}
      />
    )}
    useTabs
  />
);

// ── Overheads ──────────────────────────────────────────────────────

export const OverheadsListPage = () => (
  <HawkeyeListPage
    title="Overheads"
    Icon={IconCoins}
    columns={overheadColumns}
    data={mockOverheads}
    idKey="id"
    basePath={`${HAWKEYE}/overheads`}
    fieldGroups={overheadFieldGroups}
    titleFn={(o) => `${o.pid} — ${o.category_type}`}
    boardColumns={[
      { key: 'Maintenance', label: 'Maintenance', tagColor: 'orange' },
      { key: 'WiFi', label: 'WiFi', tagColor: 'blue' },
      { key: 'DG (Generator)', label: 'DG (Generator)', tagColor: 'gray' },
      { key: 'Water', label: 'Water', tagColor: 'blue' },
      { key: 'Water Purifier', label: 'Water Purifier', tagColor: 'blue' },
      { key: 'Gas Connection', label: 'Gas Connection', tagColor: 'gray' },
      { key: 'Electricity', label: 'Electricity', tagColor: 'orange' },
      { key: 'Helper', label: 'Helper', tagColor: 'blue' },
    ]}
    boardStatusKey="category_type"
    boardCardFields={(o) => [
      { label: 'PID', value: o.pid },
      { label: 'Type', value: o.object_type },
      { label: 'Frequency', value: o.frequency },
    ]}
  />
);

export const OverheadDetailPage = () => (
  <HawkeyeRecordPage
    data={mockOverheads}
    idKey="id"
    titleFn={(o) => `${o.pid} — ${o.category_type}`}
    fieldGroups={overheadFieldGroups}
    basePath={`${HAWKEYE}/overheads`}
  />
);

