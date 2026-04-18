import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconCreditCard,
  IconEdit,
  IconFile,
  IconLink,
  IconNotes,
  IconSwitchHorizontal,
  IconUser,
  type IconComponent,
} from 'twenty-ui/display';
import { type HistoryEntry, type HistoryEntryType } from '../types/history.types';
import { timeAgo } from '../utils/format';

const typeIconMap: Record<HistoryEntryType, IconComponent> = {
  stage_change: IconSwitchHorizontal,
  field_update: IconEdit,
  linked_event: IconLink,
  note: IconNotes,
  payment: IconCreditCard,
  document: IconFile,
  assignment: IconUser,
};

const typeColorMap: Record<HistoryEntryType, string> = {
  stage_change: themeCssVariables.accent.primary,
  field_update: themeCssVariables.font.color.tertiary,
  linked_event: themeCssVariables.font.color.secondary,
  note: themeCssVariables.font.color.tertiary,
  payment: themeCssVariables.accent.primary,
  document: themeCssVariables.font.color.tertiary,
  assignment: themeCssVariables.font.color.secondary,
};

// ── Styled ────────────────────────────────────────────────────────

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]} 0;
`;

const StyledHeading = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEntry = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: relative;
`;

const StyledIconColumn = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 24px;
`;

const StyledIconCircle = styled.div<{ color: string }>`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${({ color }) => color};
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
  z-index: 1;
`;

const StyledLine = styled.div`
  background: ${themeCssVariables.border.color.light};
  flex: 1;
  margin-top: 2px;
  width: 1px;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-top: 2px;
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLinkedLabel = styled.span`
  color: ${themeCssVariables.accent.primary};
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;

  &:hover {
    text-decoration-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledFieldChange = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
  text-align: center;
`;

// ── Component ─────────────────────────────────────────────────────

type HawkeyeTimelineProps = {
  history: HistoryEntry[];
  onLinkedClick?: (linkedObject: NonNullable<HistoryEntry['linkedObject']>) => void;
};

export const HawkeyeTimeline = ({
  history,
  onLinkedClick,
}: HawkeyeTimelineProps) => {
  const { theme } = useContext(ThemeContext);

  if (!history || history.length === 0) {
    return (
      <StyledWrapper>
        <StyledHeading>Timeline</StyledHeading>
        <StyledEmptyState>No history entries yet</StyledEmptyState>
      </StyledWrapper>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <StyledWrapper>
      <StyledHeading>Timeline</StyledHeading>
      <StyledList>
        {sorted.map((entry, index) => {
          const EntryIcon = typeIconMap[entry.type] ?? IconNotes;
          const iconColor = typeColorMap[entry.type] ?? themeCssVariables.font.color.tertiary;
          const isLast = index === sorted.length - 1;

          return (
            <StyledEntry key={entry.id}>
              <StyledIconColumn>
                <StyledIconCircle color={iconColor}>
                  <EntryIcon size={theme.icon.size.sm} />
                </StyledIconCircle>
                {!isLast && <StyledLine />}
              </StyledIconColumn>

              <StyledContent>
                <StyledSummary>{entry.summary}</StyledSummary>

                {entry.detail && (
                  <StyledDetail>{entry.detail}</StyledDetail>
                )}

                {entry.previousValue && entry.newValue && (
                  <StyledFieldChange>
                    {entry.previousValue} → {entry.newValue}
                  </StyledFieldChange>
                )}

                {entry.linkedObject && (
                  <StyledLinkedLabel
                    onClick={() => onLinkedClick?.(entry.linkedObject!)}
                  >
                    {entry.linkedObject.label}
                  </StyledLinkedLabel>
                )}

                <StyledMeta>
                  {entry.actor} · {timeAgo(entry.timestamp)}
                </StyledMeta>
              </StyledContent>
            </StyledEntry>
          );
        })}
      </StyledList>
    </StyledWrapper>
  );
};
