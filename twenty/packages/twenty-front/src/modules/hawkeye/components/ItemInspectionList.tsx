import { useState, useCallback, useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { IconBox } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { type Item } from '../types/item.types';

// ── Types ─────────────────────────────────────────────────────────

type InspectionStatus = 'Pending' | 'Pass' | 'Fail' | 'NA';

type TagColorName = 'green' | 'red' | 'gray' | 'orange' | 'blue';

// ── State labels ──────────────────────────────────────────────────

const STATE_LABELS: Record<string, string> = {
  BUY: 'Purchased',
  WIB: 'Warehouse In',
  WOB: 'Warehouse Out',
  PIB: 'In Property',
  POB: 'Property Out',
  WORK: 'Under Repair',
  DEAD: 'Dead',
};

const STATE_TAG_COLOR: Record<string, TagColorName> = {
  BUY: 'blue',
  WIB: 'blue',
  WOB: 'orange',
  PIB: 'green',
  POB: 'orange',
  WORK: 'orange',
  DEAD: 'red',
};

const INSPECTION_TAG_COLOR: Record<InspectionStatus, TagColorName> = {
  Pending: 'orange',
  Pass: 'green',
  Fail: 'red',
  NA: 'gray',
};

// ── Styled Components ─────────────────────────────────────────────

const StyledSectionWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitleLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[3]};
`;

const StyledItemRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
  transition: background 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StyledItemHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledItemIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledItemName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledItemMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledItemFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-left: 22px;
`;

const StyledStatusButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const StyledStatusButton = styled.button<{ isActive: boolean; tagColor: TagColorName }>`
  background: ${({ isActive, tagColor }) =>
    isActive
      ? themeCssVariables.tag.background[tagColor]
      : 'transparent'};
  border: 1px solid ${({ isActive }) =>
    isActive
      ? themeCssVariables.border.color.medium
      : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive, tagColor }) =>
    isActive
      ? themeCssVariables.tag.text[tagColor]
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 2px 8px;
  transition: all 100ms ease-linear;

  &:hover {
    background: ${({ tagColor }) => themeCssVariables.tag.background[tagColor]};
    color: ${({ tagColor }) => themeCssVariables.tag.text[tagColor]};
  }
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
`;

const StyledSummaryRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledSummaryChip = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

// ── Component ─────────────────────────────────────────────────────

type ItemInspectionListProps = {
  items: Item[];
  title?: string;
  /** When true, show inline Pass/Fail/NA buttons for inspection */
  showInspection?: boolean;
};

export const ItemInspectionList = ({
  items,
  title = 'Room Inventory',
  showInspection = false,
}: ItemInspectionListProps) => {
  const { theme } = useContext(ThemeContext);
  const [inspectionStatus, setInspectionStatus] = useState<Record<string, InspectionStatus>>({});

  const handleStatusChange = useCallback(
    (itemId: string, status: InspectionStatus) => {
      setInspectionStatus((prev) => ({
        ...prev,
        [itemId]: status,
      }));
    },
    [],
  );

  const passedCount = Object.values(inspectionStatus).filter((s) => s === 'Pass').length;
  const failedCount = Object.values(inspectionStatus).filter((s) => s === 'Fail').length;

  return (
    <StyledSectionWrapper>
      <StyledSectionHeader>
        <StyledTitleRow>
          <StyledTitleLabel>{title}</StyledTitleLabel>
          <StyledCount>({items.length})</StyledCount>
        </StyledTitleRow>
      </StyledSectionHeader>

      {showInspection && items.length > 0 && (
        <StyledSummaryRow>
          <StyledSummaryChip>{passedCount} passed</StyledSummaryChip>
          <StyledSummaryChip>{failedCount} failed</StyledSummaryChip>
          <StyledSummaryChip>
            {items.length - passedCount - failedCount - Object.values(inspectionStatus).filter((s) => s === 'NA').length} pending
          </StyledSummaryChip>
        </StyledSummaryRow>
      )}

      {items.length === 0 ? (
        <StyledEmpty>No items in this room</StyledEmpty>
      ) : (
        <StyledItemList>
          {items.map((item) => {
            const status = inspectionStatus[item.id] ?? 'Pending';
            return (
              <StyledItemRow key={item.id}>
                <StyledItemHeader>
                  <StyledItemIcon>
                    <IconBox size={theme.icon.size.sm} />
                  </StyledItemIcon>
                  <StyledItemName>{item.product_name}</StyledItemName>
                  <StyledItemMeta>{item.item_code}</StyledItemMeta>
                </StyledItemHeader>
                <StyledItemFooter>
                  <Tag
                    color={STATE_TAG_COLOR[item.state] ?? 'gray'}
                    text={STATE_LABELS[item.state] ?? item.state}
                  />
                  {item.qa_flag && (
                    <Tag
                      color={item.qa_flag === 'Passed' ? 'green' : item.qa_flag === 'Failed' ? 'red' : 'gray'}
                      text={`QA: ${item.qa_flag}`}
                    />
                  )}
                  {showInspection && (
                    <StyledStatusButtons>
                      {(['Pass', 'Fail', 'NA'] as InspectionStatus[]).map((s) => (
                        <StyledStatusButton
                          key={s}
                          isActive={status === s}
                          tagColor={INSPECTION_TAG_COLOR[s]}
                          onClick={() => handleStatusChange(item.id, s)}
                        >
                          {s}
                        </StyledStatusButton>
                      ))}
                    </StyledStatusButtons>
                  )}
                </StyledItemFooter>
              </StyledItemRow>
            );
          })}
        </StyledItemList>
      )}
    </StyledSectionWrapper>
  );
};
