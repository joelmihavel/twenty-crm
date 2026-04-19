import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { SearchInput } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
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
  IconPresentation,
  IconSettings,
  IconHistory,
  type IconComponent,
} from 'twenty-ui/display';

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

const NAV_RESULTS: SearchResult[] = [
  { id: 'nav-dashboard', entity: 'Page', Icon: IconPresentation, title: 'Dashboard', subtitle: 'Go to dashboard', path: `${HAWKEYE}/dashboard`, tagColor: 'gray', tagText: 'Page' },
  { id: 'nav-search', entity: 'Page', Icon: IconTag, title: 'Search', subtitle: 'Go to search page', path: `${HAWKEYE}/search`, tagColor: 'gray', tagText: 'Page' },
  { id: 'nav-activity', entity: 'Page', Icon: IconHistory, title: 'Activity Feed', subtitle: 'Go to activity feed', path: `${HAWKEYE}/activity`, tagColor: 'gray', tagText: 'Page' },
  { id: 'nav-settings', entity: 'Page', Icon: IconSettings, title: 'Settings', subtitle: 'Go to settings', path: `${HAWKEYE}/settings`, tagColor: 'gray', tagText: 'Page' },
];

const buildIndex = (): SearchResult[] => {
  const results: SearchResult[] = [...NAV_RESULTS];

  for (const t of mockTenants) {
    results.push({
      id: `tenant-${t.id}`,
      entity: 'Tenant',
      Icon: IconUser,
      title: `${t.first_name} ${t.last_name}`,
      subtitle: t.email || t.mobile_phone,
      path: `${HAWKEYE}/tenants/${t.id}`,
      tagColor: t.tenant_lifecycle === 'Moved In' ? 'green' : t.tenant_lifecycle === 'Dead Lead' ? 'red' : 'blue',
      tagText: t.tenant_lifecycle,
    });
  }

  for (const m of mockMerchants) {
    results.push({
      id: `merchant-${m.id}`,
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
      id: `vendor-${v.id}`,
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
      id: `property-${p.id}`,
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
      id: `room-${r.id}`,
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
      id: `contract-${c.id}`,
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
      id: `txn-${t.id}`,
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
      id: `ticket-${t.id}`,
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
      id: `catalog-${c.id}`,
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
      id: `item-${i.id}`,
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
      id: `overhead-${o.id}`,
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

const searchIndex = buildIndex();

// ── Styled ────────────────────────────────────────────────────────

const StyledOverlay = styled.div<{ isOpen: boolean }>`
  background: ${themeCssVariables.background.transparent.medium};
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: flex-start;
  inset: 0;
  justify-content: center;
  padding-top: 15vh;
  position: fixed;
  z-index: 100;
`;

const StyledPalette = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-height: 480px;
  overflow: hidden;
  width: 560px;
`;

const StyledSearchWrapper = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledResultsContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]} 0;
  text-align: center;
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[3]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledHint = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledKbd = styled.kbd`
  background: ${themeCssVariables.background.transparent.medium};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 3px;
  font-family: inherit;
  font-size: 10px;
  line-height: 1;
  padding: 2px 4px;
`;

// ── Component ─────────────────────────────────────────────────────

type HawkeyeCommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const HawkeyeCommandPalette = ({
  isOpen,
  onClose,
}: HawkeyeCommandPaletteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return NAV_RESULTS;
    return searchIndex
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.entity.toLowerCase().includes(q) ||
          r.tagText.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].path);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <StyledOverlay isOpen={isOpen} onClick={onClose}>
      <StyledPalette onClick={(e) => e.stopPropagation()}>
        <StyledSearchWrapper>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search entities, pages, records..."
            autoFocus
          />
        </StyledSearchWrapper>

        <StyledResultsContainer ref={resultsRef}>
          {results.length === 0 ? (
            <StyledEmptyState>No results found</StyledEmptyState>
          ) : (
            results.map((result, index) => (
              <MenuItem
                key={result.id}
                LeftIcon={result.Icon}
                text={result.title}
                contextualText={result.entity}
                onClick={() => handleSelect(result.path)}
                focused={index === selectedIndex}
                RightComponent={
                  <Tag color={result.tagColor} text={result.tagText} />
                }
              />
            ))
          )}
        </StyledResultsContainer>

        <StyledFooter>
          <StyledHint>
            <StyledKbd>↑↓</StyledKbd> navigate
          </StyledHint>
          <StyledHint>
            <StyledKbd>↵</StyledKbd> select
          </StyledHint>
          <StyledHint>
            <StyledKbd>esc</StyledKbd> close
          </StyledHint>
        </StyledFooter>
      </StyledPalette>
    </StyledOverlay>
  );
};
