import { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconShield } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { formatINR } from '@/hawkeye/utils/format';
import { getDepositTracker } from '@/hawkeye/services/analytics.service';
import { type DepositEntry } from '@/hawkeye/types/analytics.types';

// ── Styled Components ─────────────────────────────────────────────

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
  margin-bottom: ${themeCssVariables.spacing[4]};
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
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
  white-space: nowrap;
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  padding: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledLoading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

// ── Tag color mappings ────────────────────────────────────────────

const DEPOSIT_STATUS_COLOR: Record<
  DepositEntry['depositStatus'],
  'green' | 'orange' | 'blue' | 'red'
> = {
  Paid: 'green',
  Partial: 'orange',
  Pending: 'blue',
  'Refund Due': 'red',
};

const FMR_STATUS_COLOR: Record<string, 'green' | 'orange'> = {
  Paid: 'green',
  Pending: 'orange',
};

// ── Component ─────────────────────────────────────────────────────

export const DepositTrackerPage = () => {
  const [data, setData] = useState<DepositEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDepositTracker().then((entries) => {
      if (!cancelled) {
        setData(entries);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Summary calculations ──────────────────────────────────────

  const totalHeld = data
    .filter((d) => d.depositStatus === 'Paid')
    .reduce((sum, d) => sum + d.totalDeposit, 0);

  const partialCount = data.filter(
    (d) => d.depositStatus === 'Partial',
  ).length;

  const pendingCount = data.filter(
    (d) => d.depositStatus === 'Pending',
  ).length;

  const refundDueEntries = data.filter(
    (d) => d.depositStatus === 'Refund Due',
  );
  const refundDueCount = refundDueEntries.length;
  const refundDueTotal = refundDueEntries.reduce(
    (sum, d) => sum + d.totalDeposit,
    0,
  );

  return (
    <StyledPageContainer>
      <PageHeader
        title="Deposit Tracker"
        Icon={() => (
          <NavigationMenuItemStyleIcon
            Icon={IconShield}
            color="green"
          />
        )}
      />

      <StyledContent>
        {loading ? (
          <StyledLoading>Loading deposit data...</StyledLoading>
        ) : (
          <>
            <StyledSummaryGrid>
              <StyledSummaryCard>
                <StyledSummaryLabel>Total Held</StyledSummaryLabel>
                <StyledSummaryValue>{formatINR(totalHeld)}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Partial</StyledSummaryLabel>
                <StyledSummaryValue>{partialCount}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Pending</StyledSummaryLabel>
                <StyledSummaryValue>{pendingCount}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Refund Due</StyledSummaryLabel>
                <StyledSummaryValue>
                  {refundDueCount} ({formatINR(refundDueTotal)})
                </StyledSummaryValue>
              </StyledSummaryCard>
            </StyledSummaryGrid>

            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>Contract ID</StyledTh>
                    <StyledTh>Tenant</StyledTh>
                    <StyledTh>PID</StyledTh>
                    <StyledTh>RID</StyledTh>
                    <StyledTh>Security Deposit</StyledTh>
                    <StyledTh>Caution Deposit</StyledTh>
                    <StyledTh>Total</StyledTh>
                    <StyledTh>FMR Status</StyledTh>
                    <StyledTh>Deposit Status</StyledTh>
                    <StyledTh>Contract End</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry) => (
                    <tr key={entry.contractId}>
                      <StyledTd>{entry.contractId}</StyledTd>
                      <StyledTd>{entry.tenantName}</StyledTd>
                      <StyledTd>{entry.pid}</StyledTd>
                      <StyledTd>{entry.rid}</StyledTd>
                      <StyledTd>{formatINR(entry.securityDeposit)}</StyledTd>
                      <StyledTd>{formatINR(entry.cautionDeposit)}</StyledTd>
                      <StyledTd>{formatINR(entry.totalDeposit)}</StyledTd>
                      <StyledTd>
                        <Tag
                          text={entry.fmrStatus}
                          color={
                            FMR_STATUS_COLOR[entry.fmrStatus] ?? 'orange'
                          }
                        />
                      </StyledTd>
                      <StyledTd>
                        <Tag
                          text={entry.depositStatus}
                          color={DEPOSIT_STATUS_COLOR[entry.depositStatus]}
                        />
                      </StyledTd>
                      <StyledTd>{entry.contractEnd}</StyledTd>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </StyledTableWrapper>
          </>
        )}
      </StyledContent>
    </StyledPageContainer>
  );
};
