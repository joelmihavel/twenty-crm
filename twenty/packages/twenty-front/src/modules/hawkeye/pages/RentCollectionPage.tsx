import { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconMoneybag } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { formatINR } from '@/hawkeye/utils/format';
import { getRentCollection } from '@/hawkeye/services/analytics.service';
import { type RentCollectionEntry } from '@/hawkeye/types/analytics.types';

// ── Status Tag Colors ────────────────────────────────────────────

type TagColorName = 'green' | 'orange' | 'red' | 'blue';

const STATUS_TAG_COLOR: Record<RentCollectionEntry['status'], TagColorName> = {
  Paid: 'green',
  Partial: 'orange',
  Overdue: 'red',
  Upcoming: 'blue',
};

// ── Styled Components ────────────────────────────────────────────

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledContent = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledSummaryGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSummaryValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledProgressBar = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 4px;
  height: 8px;
  margin-bottom: ${themeCssVariables.spacing[4]};
  overflow: hidden;
  width: 100%;
`;

const StyledProgressFill = styled.div<{ widthPercent: number }>`
  background: ${themeCssVariables.tag.background.green};
  border-radius: 4px;
  height: 100%;
  transition: width 0.3s ease;
  width: ${({ widthPercent }) => `${widthPercent}%`};
`;

const StyledTableWrapper = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
  width: 100%;
`;

const StyledTh = styled.th`
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  white-space: nowrap;
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledOutstanding = styled.span<{ hasOutstanding: boolean }>`
  color: ${({ hasOutstanding }) =>
    hasOutstanding
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-weight: ${({ hasOutstanding }) =>
    hasOutstanding
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
`;

// ── Component ────────────────────────────────────────────────────

export const RentCollectionPage = () => {
  const [data, setData] = useState<RentCollectionEntry[]>([]);

  useEffect(() => {
    getRentCollection().then(setData);
  }, []);

  const totalExpected = data.reduce((sum, r) => sum + r.expectedRent, 0);
  const totalCollected = data.reduce((sum, r) => sum + r.collectedAmount, 0);
  const totalOutstanding = data.reduce((sum, r) => sum + r.outstanding, 0);
  const collectionRate =
    totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <StyledPageContainer>
      <PageHeader
        title="Rent Collection"
        Icon={() => (
          <NavigationMenuItemStyleIcon Icon={IconMoneybag} color="green" />
        )}
      />

      <StyledContent>
        <StyledSummaryGrid>
          <StyledSummaryCard>
            <StyledSummaryLabel>Total Expected</StyledSummaryLabel>
            <StyledSummaryValue>{formatINR(totalExpected)}</StyledSummaryValue>
          </StyledSummaryCard>
          <StyledSummaryCard>
            <StyledSummaryLabel>Total Collected</StyledSummaryLabel>
            <StyledSummaryValue>{formatINR(totalCollected)}</StyledSummaryValue>
          </StyledSummaryCard>
          <StyledSummaryCard>
            <StyledSummaryLabel>Outstanding</StyledSummaryLabel>
            <StyledSummaryValue>{formatINR(totalOutstanding)}</StyledSummaryValue>
          </StyledSummaryCard>
          <StyledSummaryCard>
            <StyledSummaryLabel>Collection Rate</StyledSummaryLabel>
            <StyledSummaryValue>{collectionRate}%</StyledSummaryValue>
          </StyledSummaryCard>
        </StyledSummaryGrid>

        <StyledProgressBar>
          <StyledProgressFill widthPercent={collectionRate} />
        </StyledProgressBar>

        <StyledTableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>Tenant</StyledTh>
                <StyledTh>PID</StyledTh>
                <StyledTh>RID</StyledTh>
                <StyledTh>Expected</StyledTh>
                <StyledTh>Collected</StyledTh>
                <StyledTh>Outstanding</StyledTh>
                <StyledTh>Due Date</StyledTh>
                <StyledTh>Status</StyledTh>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={`${entry.tenantId}-${entry.rid}`}>
                  <StyledTd>{entry.tenantName}</StyledTd>
                  <StyledTd>{entry.pid}</StyledTd>
                  <StyledTd>{entry.rid}</StyledTd>
                  <StyledTd>{formatINR(entry.expectedRent)}</StyledTd>
                  <StyledTd>{formatINR(entry.collectedAmount)}</StyledTd>
                  <StyledTd>
                    <StyledOutstanding hasOutstanding={entry.outstanding > 0}>
                      {formatINR(entry.outstanding)}
                    </StyledOutstanding>
                  </StyledTd>
                  <StyledTd>{entry.dueDate}</StyledTd>
                  <StyledTd>
                    <Tag color={STATUS_TAG_COLOR[entry.status]} text={entry.status} />
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledTableWrapper>
      </StyledContent>
    </StyledPageContainer>
  );
};
