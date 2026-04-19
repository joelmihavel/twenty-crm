import { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconChartBar } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';

import { getPropertyPnl } from '@/hawkeye/services/analytics.service';
import { type PropertyPnlEntry } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';

// ── Margin % → Tag color mapping ─────────────────────────────────

const marginTagColor = (pct: number): 'green' | 'orange' | 'red' => {
  if (pct >= 30) return 'green';
  if (pct >= 20) return 'orange';
  return 'red';
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

// ── Component ─────────────────────────────────────────────────────

export const PropertyPnlPage = () => {
  const [data, setData] = useState<PropertyPnlEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPropertyPnl().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalRevenue = data.reduce((sum, r) => sum + r.tenantRevenue, 0);
  const totalCogs = data.reduce(
    (sum, r) => sum + r.merchantRent + r.overheadsCost,
    0,
  );
  const totalNetMargin = data.reduce((sum, r) => sum + r.netMargin, 0);

  return (
    <StyledPageContainer>
      <PageHeader
        title="Property P&L"
        Icon={() => (
          <NavigationMenuItemStyleIcon Icon={IconChartBar} color="purple" />
        )}
      />

      <StyledContent>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <StyledSummaryGrid>
              <StyledSummaryCard>
                <StyledSummaryLabel>Total Revenue</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{formatINR(totalRevenue)}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Total COGS</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{formatINR(totalCogs)}</StyledSummaryValue>
              </StyledSummaryCard>
              <StyledSummaryCard>
                <StyledSummaryLabel>Net Margin</StyledSummaryLabel>
                <br />
                <StyledSummaryValue>{formatINR(totalNetMargin)}</StyledSummaryValue>
              </StyledSummaryCard>
            </StyledSummaryGrid>

            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>PID</StyledTh>
                    <StyledTh>Address</StyledTh>
                    <StyledTh>Cluster</StyledTh>
                    <StyledTh>Tenant Revenue</StyledTh>
                    <StyledTh>Merchant Rent</StyledTh>
                    <StyledTh>Overheads</StyledTh>
                    <StyledTh>Net Margin</StyledTh>
                    <StyledTh>Margin %</StyledTh>
                    <StyledTh>Occupancy</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.pid}>
                      <StyledTd>{row.pid}</StyledTd>
                      <StyledTd>{row.address}</StyledTd>
                      <StyledTd>{row.cluster}</StyledTd>
                      <StyledTd>{formatINR(row.tenantRevenue)}</StyledTd>
                      <StyledTd>{formatINR(row.merchantRent)}</StyledTd>
                      <StyledTd>{formatINR(row.overheadsCost)}</StyledTd>
                      <StyledTd style={{ color: '#16a34a' }}>
                        {formatINR(row.netMargin)}
                      </StyledTd>
                      <StyledTd>
                        <Tag
                          color={marginTagColor(row.marginPercent)}
                          text={`${row.marginPercent.toFixed(1)}%`}
                        />
                      </StyledTd>
                      <StyledTd>{row.occupancy}</StyledTd>
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
