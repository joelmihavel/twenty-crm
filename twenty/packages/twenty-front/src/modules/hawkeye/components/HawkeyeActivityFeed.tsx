import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { MenuItem } from 'twenty-ui/navigation';
import { Button } from 'twenty-ui/input';
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
  background: ${themeCssVariables.background.primary};
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
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledFilterChip = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive ? themeCssVariables.font.color.primary : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: background-color 0.1s ease, color 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEntryList = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;

  & > * {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledEntryMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledShowMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[4]};
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
  const navigate = useNavigate();
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
              <MenuItem
                key={entry.id}
                LeftIcon={EntryIcon}
                text={entry.summary}
                contextualText={timeAgo(entry.timestamp)}
                onClick={() => navigate(entry.entityPath)}
                RightComponent={
                  <Tag color={typeColors[entry.type]} text={entry.type.replace('_', ' ')} />
                }
              />
            );
          })}
        </StyledEntryList>

        {visibleCount < filtered.length && (
          <StyledShowMoreWrapper>
            <Button
              title={`Show more (${filtered.length - visibleCount} remaining)`}
              variant="secondary"
              size="small"
              onClick={() => setVisibleCount((prev) => prev + 30)}
            />
          </StyledShowMoreWrapper>
        )}
      </StyledContent>
    </StyledPage>
  );
};
