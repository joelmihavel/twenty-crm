import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import {
  IconSearch,
  IconUser,
  IconBuildingSkyscraper,
  IconTool,
  IconHome,
  IconDoorEnter,
  IconFileText,
  IconCreditCard,
  IconTag,
  IconLayoutGrid,
  IconArchive,
  IconCoins,
  type IconComponent,
} from 'twenty-ui/display';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';

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

const HAWKEYE = '/hawkeye';

// ── Search index ─────────────────────────────────────────────────

type SearchResult = {
  id: string;
  entity: string;
  Icon: IconComponent;
  title: string;
  subtitle: string;
  path: string;
  tagColor: 'green' | 'red' | 'orange' | 'blue' | 'gray';
  tagText: string;
};

const buildIndex = (): SearchResult[] => {
  const results: SearchResult[] = [];

  for (const t of mockTenants) {
    results.push({
      id: t.id,
      entity: 'Tenant',
      Icon: IconUser,
      title: `${t.first_name} ${t.last_name}`,
      subtitle: `${t.email} · ${t.mobile_phone}`,
      path: `${HAWKEYE}/tenants/${t.id}`,
      tagColor: t.tenant_lifecycle === 'Moved In' ? 'green' : t.tenant_lifecycle === 'Dead Lead' ? 'red' : 'blue',
      tagText: t.tenant_lifecycle,
    });
  }

  for (const m of mockMerchants) {
    results.push({
      id: m.id,
      entity: 'Merchant',
      Icon: IconBuildingSkyscraper,
      title: `${m.prefix} ${m.first_name} ${m.last_name}`,
      subtitle: m.merchant_type,
      path: `${HAWKEYE}/merchants/${m.id}`,
      tagColor: m.deal_stage === 'Under Contract' ? 'green' : m.deal_stage === 'Churned' ? 'red' : 'blue',
      tagText: m.deal_stage,
    });
  }

  for (const v of mockVendors) {
    results.push({
      id: v.id,
      entity: 'Vendor',
      Icon: IconTool,
      title: v.vendor_name,
      subtitle: v.specialization,
      path: `${HAWKEYE}/vendors/${v.id}`,
      tagColor: v.quality_tier === 'Premium' ? 'green' : 'gray',
      tagText: v.quality_tier,
    });
  }

  for (const p of mockProperties) {
    results.push({
      id: p.id,
      entity: 'Property',
      Icon: IconHome,
      title: `${p.id} — ${p.building_society}`,
      subtitle: p.address,
      path: `${HAWKEYE}/properties/${p.id}`,
      tagColor: p.type === 'active' ? 'green' : p.type === 'churned' ? 'red' : 'blue',
      tagText: p.type,
    });
  }

  for (const r of mockRooms) {
    results.push({
      id: r.id,
      entity: 'Room',
      Icon: IconDoorEnter,
      title: `${r.id} (${r.pid})`,
      subtitle: `${r.bed_type} · ${r.current_tenant_name || 'Vacant'}`,
      path: `${HAWKEYE}/rooms/${r.id}`,
      tagColor: r.room_status === 'Occupied' ? 'green' : r.room_status === 'Available' ? 'blue' : r.room_status === 'Blocked' ? 'red' : 'orange',
      tagText: r.room_status,
    });
  }

  for (const c of mockContracts) {
    results.push({
      id: c.id,
      entity: 'Contract',
      Icon: IconFileText,
      title: `${c.party_name} — ${c.contract_type}`,
      subtitle: `${c.pid} / ${c.rid}`,
      path: `${HAWKEYE}/contracts/${c.id}`,
      tagColor: c.agreement_lifecycle === 'Active' ? 'green' : c.agreement_lifecycle === 'Terminated' ? 'red' : 'blue',
      tagText: c.agreement_lifecycle,
    });
  }

  for (const t of mockTransactions) {
    results.push({
      id: t.id,
      entity: 'Transaction',
      Icon: IconCreditCard,
      title: `${t.id} — ₹${t.amount.toLocaleString('en-IN')}`,
      subtitle: `${t.purpose_category_1} · ${t.purpose_category_2}`,
      path: `${HAWKEYE}/transactions/${t.id}`,
      tagColor: t.credit_debit === 'Credit' ? 'green' : 'red',
      tagText: t.credit_debit,
    });
  }

  for (const t of mockTickets) {
    results.push({
      id: t.id,
      entity: 'Ticket',
      Icon: IconTag,
      title: `#${t.id} — ${t.ticket_name}`,
      subtitle: `${t.ticket_category} · ${t.priority}`,
      path: `${HAWKEYE}/tickets/${t.id}`,
      tagColor: t.ticket_status === 'Closed' ? 'green' : t.ticket_status === 'Blocked' ? 'red' : 'orange',
      tagText: t.ticket_status,
    });
  }

  for (const c of mockCatalogs) {
    results.push({
      id: c.id,
      entity: 'Catalog',
      Icon: IconLayoutGrid,
      title: `${c.fsin_code} — ${c.item_name}`,
      subtitle: `Stock: ${c.total_stock}`,
      path: `${HAWKEYE}/catalogs/${c.id}`,
      tagColor: 'gray',
      tagText: c.category,
    });
  }

  for (const i of mockItems) {
    results.push({
      id: i.id,
      entity: 'Item',
      Icon: IconArchive,
      title: `${i.item_code} — ${i.product_name}`,
      subtitle: `${i.location} · ${i.state}`,
      path: `${HAWKEYE}/items/${i.id}`,
      tagColor: i.state === 'WORK' || i.state === 'PIB' ? 'green' : i.state === 'DEAD' ? 'red' : i.state === 'WIB' ? 'orange' : 'blue',
      tagText: i.state,
    });
  }

  for (const o of mockOverheads) {
    results.push({
      id: o.id,
      entity: 'Overhead',
      Icon: IconCoins,
      title: `${o.pid} — ${o.category_type}`,
      subtitle: `${o.object_type} · ${o.frequency}`,
      path: `${HAWKEYE}/overheads/${o.id}`,
      tagColor: 'gray',
      tagText: o.category_type,
    });
  }

  return results;
};

// ── Styled ────────────────────────────────────────────────────────

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
`;

const StyledSearchBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  outline: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledFilterChip = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.accent.primary : themeCssVariables.background.primary};
  border: 1px solid ${({ isActive }) =>
    isActive ? themeCssVariables.accent.primary : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive ? themeCssVariables.background.primary : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  transition: all 0.1s ease;

  &:hover {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledResultCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledResultItem = styled(Link)`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-decoration: none;
  transition: background 0.1s ease, border-color 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledResultIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledResultInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledResultTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledResultSubtitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledResultEntity = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[8]} 0;
  text-align: center;
`;

// ── Component ─────────────────────────────────────────────────────

const ENTITY_TYPES = [
  'All', 'Tenant', 'Merchant', 'Vendor', 'Property', 'Room',
  'Contract', 'Transaction', 'Ticket', 'Catalog', 'Item', 'Overhead',
];

const searchIndex = buildIndex();

export const HawkeyeGlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return searchIndex.filter((r) => {
      if (entityFilter !== 'All' && r.entity !== entityFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.tagText.toLowerCase().includes(q)
      );
    });
  }, [query, entityFilter]);

  return (
    <StyledPage>
      <PageHeader title="Search" Icon={IconSearch} />
      <StyledContent>
        <StyledSearchBar>
          <IconSearch size={20} />
          <StyledSearchInput
            placeholder="Search across all entities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </StyledSearchBar>

        <StyledFilterRow>
          {ENTITY_TYPES.map((type) => (
            <StyledFilterChip
              key={type}
              isActive={entityFilter === type}
              onClick={() => setEntityFilter(type)}
            >
              {type}
            </StyledFilterChip>
          ))}
        </StyledFilterRow>

        <StyledResultCount>
          {results.length} result{results.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
          {entityFilter !== 'All' && ` in ${entityFilter}s`}
        </StyledResultCount>

        {results.length === 0 ? (
          <StyledEmptyState>
            {query ? 'No results found. Try a different search term.' : 'Start typing to search...'}
          </StyledEmptyState>
        ) : (
          <StyledResultList>
            {results.slice(0, 50).map((result) => (
              <StyledResultItem
                key={`${result.entity}-${result.id}`}
                to={result.path}
              >
                <StyledResultIcon>
                  <result.Icon size={18} />
                </StyledResultIcon>
                <StyledResultInfo>
                  <StyledResultTitle>{result.title}</StyledResultTitle>
                  <StyledResultSubtitle>{result.subtitle}</StyledResultSubtitle>
                </StyledResultInfo>
                <Tag color={result.tagColor} text={result.tagText} />
                <StyledResultEntity>{result.entity}</StyledResultEntity>
              </StyledResultItem>
            ))}
          </StyledResultList>
        )}
      </StyledContent>
    </StyledPage>
  );
};
