import { useState, useContext, type ReactNode } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { styled } from '@linaria/react';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconHome,
  IconHistory,
  IconLink as IconRelation,
} from 'twenty-ui/display';

import { type FieldGroup } from '../types/entities';
import { type HistoryEntry } from '../types/history.types';
import { HawkeyeDetailView } from './HawkeyeDetailView';
import { HawkeyeTimeline } from './HawkeyeTimeline';
import { timeAgo } from '../utils/format';

// ── Styled Components ─────────────────────────────────────────────

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  width: 100%;
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

// ── Summary Card (matches Twenty's ShowPageSummaryCard) ───────────

const StyledSummaryCard = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledRecordAvatar = styled.div<{ bgColor: string }>`
  align-items: center;
  background: ${({ bgColor }) => bgColor};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: white;
  display: flex;
  font-size: 16px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledRecordInfo = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRecordTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledRecordDate = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// ── Tab Bar ───────────────────────────────────────────────────────

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

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

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

const getInitials = (name: string) => {
  const parts = name.split(/[\s—-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// ── Helpers ───────────────────────────────────────────────────────

type RecordTab = 'home' | 'relations' | 'timeline';

const hasHistory = (record: unknown): record is { history: HistoryEntry[] } =>
  Array.isArray((record as Record<string, unknown>).history);

const getCreatedDate = (record: unknown): string | null => {
  const r = record as Record<string, unknown>;
  const dateStr = r.create_date ?? r.created_at ?? r.first_added;
  return typeof dateStr === 'string' ? dateStr : null;
};

// ── Component ─────────────────────────────────────────────────────

type HawkeyeRecordPageProps<T> = {
  data: T[];
  idKey: keyof T & string;
  titleFn: (record: T) => string;
  fieldGroups: FieldGroup<T>[];
  basePath: string;
  renderExtra?: (record: T) => ReactNode;
  renderSummary?: (record: T) => ReactNode;
  renderRelations?: (record: T) => ReactNode;
  useTabs?: boolean;
};

export const HawkeyeRecordPage = <T,>({
  data,
  idKey,
  titleFn,
  fieldGroups,
  basePath,
  renderExtra,
  renderSummary,
  renderRelations,
  useTabs = false,
}: HawkeyeRecordPageProps<T>) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<RecordTab>('home');

  const record = data.find(
    (r) => String(r[idKey]) === decodeURIComponent(params.id ?? ''),
  );

  if (!record) {
    return <Navigate to={basePath} replace />;
  }

  const title = titleFn(record);
  const createdDate = getCreatedDate(record);
  const showTimeline = hasHistory(record);
  const showRelations = !!renderRelations;

  if (useTabs) {
    return (
      <StyledPageContainer>
        <PageHeader
          hasClosePageButton
          onClosePage={() => navigate(-1)}
          title={title}
        />
        <StyledMainContainer>
          <StyledLeftContainer>
            <PagePanel>
              <StyledContentWrapper>
                {/* Summary Card */}
                <StyledSummaryCard>
                  <StyledRecordAvatar bgColor={getAvatarColor(title)}>
                    {getInitials(title)}
                  </StyledRecordAvatar>
                  <StyledRecordInfo>
                    <StyledRecordTitle>{title}</StyledRecordTitle>
                    {createdDate && (
                      <StyledRecordDate>
                        Created {timeAgo(createdDate)}
                      </StyledRecordDate>
                    )}
                  </StyledRecordInfo>
                </StyledSummaryCard>

                {/* KPI Summary (if provided) */}
                {renderSummary?.(record)}

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
                  {showRelations && (
                    <StyledTab
                      isActive={activeTab === 'relations'}
                      onClick={() => setActiveTab('relations')}
                    >
                      <IconRelation size={theme.icon.size.sm} />
                      Relations
                    </StyledTab>
                  )}
                </StyledTabBar>

                {/* Tab Content */}
                <StyledTabContent>
                  {activeTab === 'home' && (
                    <HawkeyeDetailView
                      record={record}
                      fieldGroups={fieldGroups}
                    >
                      {renderRelations?.(record)}
                    </HawkeyeDetailView>
                  )}
                  {activeTab === 'timeline' && showTimeline && (
                    <HawkeyeTimeline history={(record as any).history} />
                  )}
                  {activeTab === 'relations' && renderRelations?.(record)}
                </StyledTabContent>
              </StyledContentWrapper>
            </PagePanel>
          </StyledLeftContainer>
        </StyledMainContainer>
      </StyledPageContainer>
    );
  }

  // Default: single-scroll layout (no tabs)
  return (
    <StyledPageContainer>
      <PageHeader
        hasClosePageButton
        onClosePage={() => navigate(-1)}
        title={title}
      />
      <StyledMainContainer>
        <StyledLeftContainer>
          <PagePanel>
            {renderSummary?.(record)}
            <HawkeyeDetailView
              record={record}
              fieldGroups={fieldGroups}
            >
              {renderExtra?.(record)}
            </HawkeyeDetailView>
          </PagePanel>
        </StyledLeftContainer>
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
