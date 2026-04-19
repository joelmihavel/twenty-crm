import { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconCalendarEvent } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';

import { getPaymentDeadlines } from '@/hawkeye/services/analytics.service';
import { type PaymentDeadlineEntry } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';

// ── Type → Tag color mapping ─────────────────────────────────────

const TYPE_TAG_COLOR: Record<PaymentDeadlineEntry['entityType'], 'blue' | 'purple' | 'orange'> = {
  'Tenant Rent': 'blue',
  'Merchant Rent': 'purple',
  Overhead: 'orange',
};

// ── Status → Tag color mapping ───────────────────────────────────

const STATUS_TAG_COLOR: Record<PaymentDeadlineEntry['status'], 'red' | 'orange' | 'blue'> = {
  Overdue: 'red',
  'Due Today': 'orange',
  Upcoming: 'blue',
};

// ── Styled Components ─────────────────────────────────────────────

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledSummaryCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSummaryLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledSummaryValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTableWrapper = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  white-space: nowrap;
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  white-space: nowrap;
`;

const StyledOverdueRow = styled.tr`
  background: rgba(239, 68, 68, 0.04);
`;

// ── Component ─────────────────────────────────────────────────────

export const PaymentDeadlinesPage = () => {
  const [data, setData] = useState<PaymentDeadlineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPaymentDeadlines().then((result) => {
      if (!cancelled) {
        // Sort by dueDate ascending
        const sorted = [...result].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );
        setData(sorted);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalDue = data.reduce((sum, r) => sum + r.amount, 0);
  const overdueEntries = data.filter((r) => r.status === 'Overdue');
  const overdueAmount = overdueEntries.reduce((sum, r) => sum + r.amount, 0);
  const dueTodayCount = data.filter((r) => r.status === 'Due Today').length;

  return (
    <StyledPageContainer>
      <PageHeader
        title="Payment Deadlines"
        Icon={() => (
          <NavigationMenuItemStyleIcon Icon={IconCalendarEvent} color="sky" />
        )}
      />

      <StyledContent>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <StyledSummaryGrid>
              <StyledSummaryCard>
                <StyledSummaryLabel>Total Due</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{formatINR(totalDue)}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>
                  Overdue ({overdueEntries.length})
                </StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{formatINR(overdueAmount)}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Due Today</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{dueTodayCount}</StyledSummaryValue>
              </StyledSummaryCard>
            </StyledSummaryGrid>

            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>Type</StyledTh>
                    <StyledTh>Entity</StyledTh>
                    <StyledTh>PID</StyledTh>
                    <StyledTh>Amount</StyledTh>
                    <StyledTh>Due Date</StyledTh>
                    <StyledTh>Day of Month</StyledTh>
                    <StyledTh>Status</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => {
                    const RowComponent =
                      row.status === 'Overdue' ? StyledOverdueRow : 'tr';

                    return (
                      <RowComponent key={`${row.entityId}-${row.dueDate}`}>
                        <StyledTd>
                          <Tag
                            color={TYPE_TAG_COLOR[row.entityType]}
                            text={row.entityType}
                          />
                        </StyledTd>
                        <StyledTd>{row.entityName}</StyledTd>
                        <StyledTd>{row.pid}</StyledTd>
                        <StyledTd>{formatINR(row.amount)}</StyledTd>
                        <StyledTd>{row.dueDate}</StyledTd>
                        <StyledTd>{row.dayOfMonth}</StyledTd>
                        <StyledTd>
                          <Tag
                            color={STATUS_TAG_COLOR[row.status]}
                            text={row.status}
                          />
                        </StyledTd>
                      </RowComponent>
                    );
                  })}
                </tbody>
              </StyledTable>
            </StyledTableWrapper>
          </>
        )}
      </StyledContent>
    </StyledPageContainer>
  );
};
