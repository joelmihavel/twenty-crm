import { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconListNumbers } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';

import { getRentRoll } from '@/hawkeye/services/analytics.service';
import { type RentRollEntry } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';

// ── Status → Tag color mapping ───────────────────────────────────

const STATUS_TAG_COLOR: Record<RentRollEntry['status'], 'green' | 'orange' | 'red'> = {
  Active: 'green',
  Expiring: 'orange',
  Expired: 'red',
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
  grid-template-columns: repeat(4, 1fr);
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

// ── Component ─────────────────────────────────────────────────────

export const RentRollPage = () => {
  const [data, setData] = useState<RentRollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRentRoll().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalMonthlyRevenue = data.reduce((sum, r) => sum + r.totalRent, 0);
  const activeContracts = data.filter((r) => r.status === 'Active').length;
  const expiringSoon = data.filter((r) => r.status === 'Expiring').length;
  const expired = data.filter((r) => r.status === 'Expired').length;

  return (
    <StyledPageContainer>
      <PageHeader
        title="Rent Roll"
        Icon={() => (
          <NavigationMenuItemStyleIcon Icon={IconListNumbers} color="green" />
        )}
      />

      <StyledContent>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <StyledSummaryGrid>
              <StyledSummaryCard>
                <StyledSummaryLabel>Total Monthly Revenue</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>
                  {formatINR(totalMonthlyRevenue)}
                </StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Active Contracts</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{activeContracts}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Expiring Soon</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{expiringSoon}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Expired</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{expired}</StyledSummaryValue>
              </StyledSummaryCard>
            </StyledSummaryGrid>

            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>PID</StyledTh>
                    <StyledTh>RID</StyledTh>
                    <StyledTh>Tenant</StyledTh>
                    <StyledTh>License Fee</StyledTh>
                    <StyledTh>Maintenance</StyledTh>
                    <StyledTh>Furnishing</StyledTh>
                    <StyledTh>Convenience</StyledTh>
                    <StyledTh>GST</StyledTh>
                    <StyledTh>Total Rent</StyledTh>
                    <StyledTh>Contract End</StyledTh>
                    <StyledTh>Status</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={`${row.pid}-${row.rid}-${row.tenantId}`}>
                      <StyledTd>{row.pid}</StyledTd>
                      <StyledTd>{row.rid}</StyledTd>
                      <StyledTd>{row.tenantName}</StyledTd>
                      <StyledTd>{formatINR(row.monthlyLicenseFee)}</StyledTd>
                      <StyledTd>{formatINR(row.maintenanceFee)}</StyledTd>
                      <StyledTd>{formatINR(row.furnishingFee)}</StyledTd>
                      <StyledTd>{formatINR(row.convenienceFee)}</StyledTd>
                      <StyledTd>{formatINR(row.gst)}</StyledTd>
                      <StyledTd>{formatINR(row.totalRent)}</StyledTd>
                      <StyledTd>{row.contractEnd}</StyledTd>
                      <StyledTd>
                        <Tag color={STATUS_TAG_COLOR[row.status]} text={row.status} />
                      </StyledTd>
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
