import { styled } from '@linaria/react';
import { useState, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconArrowLeft,
  IconHome,
  IconHistory,
  IconX,
} from 'twenty-ui/display';

import { type FieldGroup } from '../types/entities';
import { type HistoryEntry } from '../types/history.types';
import { findRecord, getEntityConfig, type EntityConfig } from '../data/entity-config';
import { HawkeyeDetailView } from './HawkeyeDetailView';
import { HawkeyeTimeline } from './HawkeyeTimeline';
import { RelatedRecords } from './RelatedRecords';
import { timeAgo } from '../utils/format';

const SIDE_PANEL_WIDTH = 400;

// ── Avatar colors ─────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#e54d2e', '#e5484d', '#8e4ec6', '#6e56cf',
  '#3e63dd', '#0090ff', '#12a594', '#30a46c',
  '#f76b15', '#e8a634',
];

const getAvatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ── Styled Components ─────────────────────────────────────────────

const StyledPanelWrapper = styled.div<{ isOpen: boolean }>`
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  transition: width 0.2s ease-in-out;
  width: ${({ isOpen }) => (isOpen ? `${SIDE_PANEL_WIDTH}px` : '0px')};
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: ${SIDE_PANEL_WIDTH}px;
`;

// ── Summary Header (matches Twenty's ShowPageSummaryCard - horizontal) ──

const StyledSummaryHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 48px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  padding: 0;
  width: 24px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledAvatar = styled.div<{ bgColor: string }>`
  align-items: center;
  background: ${({ bgColor }) => bgColor};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: white;
  display: flex;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledHeaderTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHeaderDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  white-space: nowrap;
`;

// ── Tab Bar (matches Twenty's TabList) ────────────────────────────

const StyledTabBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: 0;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.accent.primary : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition: color 0.1s ease, border-color 0.1s ease;
  white-space: nowrap;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

// ── Tab Content ───────────────────────────────────────────────────

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const StyledActionsBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

// ── Type helpers ──────────────────────────────────────────────────

type SidePanelTab = 'home' | 'timeline';

const hasHistory = (record: unknown): record is { history: HistoryEntry[] } =>
  Array.isArray((record as Record<string, unknown>).history);

const getCreatedDate = (record: unknown): string | null => {
  const r = record as Record<string, unknown>;
  const dateStr = r.create_date ?? r.created_at ?? r.first_added;
  return typeof dateStr === 'string' ? dateStr : null;
};

// ── View stack entry ──────────────────────────────────────────────

type StackEntry = {
  record: unknown;
  title: string;
  fieldGroups: FieldGroup<unknown>[];
  basePath: string;
  config?: EntityConfig;
};

// ── Component ─────────────────────────────────────────────────────

type HawkeyeSidePanelProps<T> = {
  record: T | null;
  title: string;
  fieldGroups: FieldGroup<T>[];
  onClose: () => void;
  renderRelations?: (record: T, onRecordClick: (basePath: string, recordId: string) => void) => ReactNode;
  basePath?: string;
  onFieldChange?: (key: string, value: unknown) => void;
  renderActions?: (record: T) => ReactNode;
};

export const HawkeyeSidePanel = <T,>({
  record,
  title,
  fieldGroups,
  onClose,
  renderRelations,
  basePath,
  onFieldChange,
  renderActions,
}: HawkeyeSidePanelProps<T>) => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('home');
  const [viewStack, setViewStack] = useState<StackEntry[]>([]);
  const isOpen = record !== null;

  // Reset stack when the root record changes
  useEffect(() => {
    setViewStack([]);
    setActiveTab('home');
  }, [record]);

  const handleDrillDown = useCallback((targetBasePath: string, recordId: string) => {
    const result = findRecord(targetBasePath, recordId);
    if (!result) return;
    const { record: foundRecord, config } = result;
    setViewStack((prev) => [
      ...prev,
      {
        record: foundRecord,
        title: config.titleFn(foundRecord),
        fieldGroups: config.fieldGroups,
        basePath: targetBasePath,
        config,
      },
    ]);
    setActiveTab('home');
  }, []);

  const handleBack = useCallback(() => {
    setViewStack((prev) => prev.slice(0, -1));
    setActiveTab('home');
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(/[\s—-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Determine what to render: drilled-down record or root record
  const isDrilledDown = viewStack.length > 0;
  const currentEntry = isDrilledDown ? viewStack[viewStack.length - 1] : null;
  const currentRecord = currentEntry ? currentEntry.record : record;
  const currentTitle = currentEntry ? currentEntry.title : title;
  const currentFieldGroups = currentEntry
    ? currentEntry.fieldGroups
    : (fieldGroups as FieldGroup<unknown>[]);
  const currentConfig = currentEntry?.config;

  const showTimeline = !!(currentRecord && hasHistory(currentRecord));
  const createdDate = currentRecord ? getCreatedDate(currentRecord) : null;

  return (
    <StyledPanelWrapper isOpen={isOpen}>
      {record && (
        <StyledPanel>
          {/* Summary Header */}
          <StyledSummaryHeader>
            {isDrilledDown ? (
              <StyledCloseButton onClick={handleBack} title="Go back">
                <IconArrowLeft size={theme.icon.size.md} />
              </StyledCloseButton>
            ) : (
              <StyledCloseButton onClick={onClose} title="Close panel">
                <IconX size={theme.icon.size.md} />
              </StyledCloseButton>
            )}
            <StyledAvatar bgColor={getAvatarColor(currentTitle)}>
              {getInitials(currentTitle)}
            </StyledAvatar>
            <StyledHeaderTitle>{currentTitle}</StyledHeaderTitle>
            {createdDate && (
              <StyledHeaderDate>
                {timeAgo(createdDate)}
              </StyledHeaderDate>
            )}
          </StyledSummaryHeader>

          {/* Tab Bar */}
          <StyledTabBar>
            <StyledTab
              isActive={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            >
              <IconHome size={theme.icon.size.sm} />
              Home
            </StyledTab>
            {showTimeline && (
              <StyledTab
                isActive={activeTab === 'timeline'}
                onClick={() => setActiveTab('timeline')}
              >
                <IconHistory size={theme.icon.size.sm} />
                Timeline
              </StyledTab>
            )}
          </StyledTabBar>

          {/* Actions */}
          {!isDrilledDown && renderActions && record && (
            <StyledActionsBar>
              {renderActions(record)}
            </StyledActionsBar>
          )}

          {/* Tab Content */}
          <StyledTabContent>
            {activeTab === 'home' && (
              <>
                <HawkeyeDetailView
                  record={currentRecord}
                  fieldGroups={currentFieldGroups}
                  onFieldChange={!isDrilledDown ? onFieldChange : undefined}
                />
                {/* Relations: always use registry when available for consistency */}
                {(() => {
                  const config = isDrilledDown
                    ? currentConfig
                    : basePath
                      ? getEntityConfig(basePath)
                      : undefined;
                  return (
                    <>
                      {config?.getRelations &&
                        config.getRelations(currentRecord!).map((section) => (
                          <RelatedRecords<Record<string, unknown>>
                            key={section.title}
                            title={section.title}
                            records={section.records as Record<string, unknown>[]}
                            idKey={section.idKey}
                            basePath={section.basePath}
                            columns={[{ key: section.idKey, label: 'ID' }]}
                            titleFn={section.titleFn as (record: Record<string, unknown>) => string}
                            onRecordClick={handleDrillDown}
                          />
                        ))}
                      {config?.renderCustomContent &&
                        config.renderCustomContent(currentRecord!)}
                      {!isDrilledDown &&
                        renderRelations &&
                        renderRelations(record, handleDrillDown)}
                    </>
                  );
                })()}
              </>
            )}
            {activeTab === 'timeline' && showTimeline && (
              <HawkeyeTimeline history={(currentRecord as any).history} />
            )}
          </StyledTabContent>
        </StyledPanel>
      )}
    </StyledPanelWrapper>
  );
};
