import { useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@linaria/react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import {
  IconHistory,
  IconSwitchHorizontal,
  IconEdit,
  IconLink,
  IconNotes,
  IconCreditCard,
  IconFile,
  IconUser,
} from 'twenty-ui/display';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { type HistoryEntry, type HistoryEntryType } from '../types/history.types';
import { mockTenants } from '../data/mock-tenants';
import { mockMerchants } from '../data/mock-merchants';
import { mockVendors } from '../data/mock-vendors';
import { mockProperties } from '../data/mock-properties';
import { mockRooms } from '../data/mock-rooms';
import { mockContracts } from '../data/mock-contracts';
import { mockTickets } from '../data/mock-tickets';
import { mockCatalogs } from '../data/mock-catalogs';
import { mockItems } from '../data/mock-items';
import { mockOverheads } from '../data/mock-overheads';
import { timeAgo } from '../utils/format';

const HAWKEYE = '/hawkeye';

// ── Aggregate history ────────────────────────────────────────────

type AggregatedEntry = HistoryEntry & {
  entityType: string;
  entityId: string;
  entityLabel: string;
  entityPath: string;
};

const aggregateHistory = (): AggregatedEntry[] => {
  const entries: AggregatedEntry[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addEntries = <T extends { id: string; history?: HistoryEntry[] }>(
    records: T[],
    entityType: string,
    labelFn: (r: T) => string,
    basePath: string,
  ) => {
    for (const r of records) {
      if (r.history) {
        for (const entry of r.history) {
          entries.push({
            ...entry,
            entityType,
            entityId: r.id,
            entityLabel: labelFn(r),
            entityPath: `${basePath}/${encodeURIComponent(r.id)}`,
          });
        }
      }
    }
  };

  addEntries(mockTenants, 'Tenant', (r) => `${r.first_name} ${r.last_name}`, `${HAWKEYE}/tenants`);
  addEntries(mockMerchants, 'Merchant', (r) => `${r.prefix} ${r.first_name} ${r.last_name}`, `${HAWKEYE}/merchants`);
  addEntries(mockVendors, 'Vendor', (r) => r.vendor_name, `${HAWKEYE}/vendors`);
  addEntries(mockProperties, 'Property', (r) => `${r.id} — ${r.building_society}`, `${HAWKEYE}/properties`);
  addEntries(mockRooms, 'Room', (r) => `${r.id} (${r.pid})`, `${HAWKEYE}/rooms`);
  addEntries(mockContracts, 'Contract', (r) => r.party_name, `${HAWKEYE}/contracts`);
  addEntries(mockTickets, 'Ticket', (r) => `#${r.id} — ${r.ticket_name}`, `${HAWKEYE}/tickets`);
  addEntries(mockCatalogs, 'Catalog', (r) => `${r.fsin_code} — ${r.item_name}`, `${HAWKEYE}/catalogs`);
  addEntries(mockItems, 'Item', (r) => r.item_code, `${HAWKEYE}/items`);
  addEntries(mockOverheads, 'Overhead', (r) => `${r.pid} — ${r.category_type}`, `${HAWKEYE}/overheads`);

  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
};

// ── Icon map ─────────────────────────────────────────────────────

const typeIcons: Record<HistoryEntryType, typeof IconHistory> = {
  stage_change: IconSwitchHorizontal,
  field_update: IconEdit,
  linked_event: IconLink,
  note: IconNotes,
  payment: IconCreditCard,
  document: IconFile,
  assignment: IconUser,
};

const typeColors: Record<HistoryEntryType, 'green' | 'red' | 'orange' | 'blue' | 'gray'> = {
  stage_change: 'blue',
  field_update: 'gray',
  linked_event: 'green',
  note: 'gray',
  payment: 'green',
  document: 'blue',
  assignment: 'orange',
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

const StyledEntryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEntry = styled(Link)`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} 0;
  text-decoration: none;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledIconWrapper = styled.div<{ color: string }>`
  align-items: center;
  background: ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledEntryInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledEntrySummary = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEntryMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEntryEntity = styled.span`
  color: ${themeCssVariables.accent.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledChangeValues = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledShowMore = styled.button`
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

// ── Component ─────────────────────────────────────────────────────

const TYPE_FILTERS = [
  'All', 'stage_change', 'field_update', 'linked_event',
  'note', 'payment', 'document', 'assignment',
];

const TYPE_LABELS: Record<string, string> = {
  All: 'All',
  stage_change: 'Stage Changes',
  field_update: 'Field Updates',
  linked_event: 'Linked Events',
  note: 'Notes',
  payment: 'Payments',
  document: 'Documents',
  assignment: 'Assignments',
};

const allEntries = aggregateHistory();

export const HawkeyeActivityFeed = () => {
  const { theme } = useContext(ThemeContext);
  const [typeFilter, setTypeFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(30);

  const filtered = useMemo(() => {
    if (typeFilter === 'All') return allEntries;
    return allEntries.filter((e) => e.type === typeFilter);
  }, [typeFilter]);

  return (
    <StyledPage>
      <PageHeader title="Activity Feed" Icon={IconHistory} />
      <StyledContent>
        <StyledFilterRow>
          {TYPE_FILTERS.map((type) => (
            <StyledFilterChip
              key={type}
              isActive={typeFilter === type}
              onClick={() => {
                setTypeFilter(type);
                setVisibleCount(30);
              }}
            >
              {TYPE_LABELS[type]}
            </StyledFilterChip>
          ))}
        </StyledFilterRow>

        <StyledCount>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </StyledCount>

        <StyledEntryList>
          {filtered.slice(0, visibleCount).map((entry) => {
            const EntryIcon = typeIcons[entry.type];
            return (
              <StyledEntry
                key={entry.id}
                to={entry.entityPath}
              >
                <StyledIconWrapper color={themeCssVariables.background.tertiary}>
                  <EntryIcon size={theme.icon.size.sm} />
                </StyledIconWrapper>
                <StyledEntryInfo>
                  <StyledEntrySummary>{entry.summary}</StyledEntrySummary>
                  <StyledEntryMeta>
                    <StyledEntryEntity>{entry.entityType}: {entry.entityLabel}</StyledEntryEntity>
                    <span>·</span>
                    <span>{entry.actor}</span>
                    <span>·</span>
                    <span>{timeAgo(entry.timestamp)}</span>
                    <Tag color={typeColors[entry.type]} text={entry.type.replace('_', ' ')} />
                  </StyledEntryMeta>
                  {entry.previousValue && entry.newValue && (
                    <StyledChangeValues>
                      {entry.previousValue} → {entry.newValue}
                    </StyledChangeValues>
                  )}
                </StyledEntryInfo>
              </StyledEntry>
            );
          })}
        </StyledEntryList>

        {visibleCount < filtered.length && (
          <StyledShowMore
            onClick={() => setVisibleCount((prev) => prev + 30)}
          >
            Show more ({filtered.length - visibleCount} remaining)
          </StyledShowMore>
        )}
      </StyledContent>
    </StyledPage>
  );
};
