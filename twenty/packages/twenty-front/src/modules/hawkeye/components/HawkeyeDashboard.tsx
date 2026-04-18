import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import {
  IconArchive,
  IconBuildingSkyscraper,
  IconCoins,
  IconColumns,
  IconCreditCard,
  IconDoorEnter,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconTag,
  IconTool,
  IconUser,
  type IconComponent,
} from 'twenty-ui/display';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { LeadSourcesChart } from '@/hawkeye/components/charts/demand/LeadSourcesChart';
import { ConversionFunnelChart } from '@/hawkeye/components/charts/demand/ConversionFunnelChart';
import { ConversionTrendChart } from '@/hawkeye/components/charts/demand/ConversionTrendChart';
import { PipelineBreakdownChart } from '@/hawkeye/components/charts/demand/PipelineBreakdownChart';
import { VisitConversionChart } from '@/hawkeye/components/charts/demand/VisitConversionChart';
import { CollectionTrendChart } from '@/hawkeye/components/charts/rent/CollectionTrendChart';
import { CollectionStatusChart } from '@/hawkeye/components/charts/rent/CollectionStatusChart';
import { OverdueAgingChart } from '@/hawkeye/components/charts/rent/OverdueAgingChart';
import { LandlordPayoutChart } from '@/hawkeye/components/charts/rent/LandlordPayoutChart';

import { mockTenants } from '../data/mock-tenants';
import { mockMerchants } from '../data/mock-merchants';
import { mockVendors } from '../data/mock-vendors';
import { mockProperties } from '../data/mock-properties';
import { mockRooms } from '../data/mock-rooms';
import { mockContracts } from '../data/mock-contracts';
import { mockTransactions } from '../data/mock-transactions';
import { mockTickets } from '../data/mock-tickets';
import { mockCatalogs } from '../data/mock-catalogs';
import { mockItems } from '../data/mock-items';
import { mockOverheads } from '../data/mock-overheads';
import { formatINR } from '../utils/format';

// ── Styled ────────────────────────────────────────────────────────

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSectionSubtitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

const StyledCard = styled(Link)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
  transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardIcon = styled.div<{ color: string }>`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
`;

const StyledCardLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledCardValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMetricGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledMetricCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMetricLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMetricValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMetricDetail = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

// Progress bar for occupancy
const StyledProgressBar = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 8px;
  overflow: hidden;
  width: 100%;
`;

const StyledProgressFill = styled.div<{ percent: number; color: string }>`
  background: ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 100%;
  transition: width 0.3s ease;
  width: ${({ percent }) => percent}%;
`;

// Pipeline funnel
const StyledFunnelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: 2px 0;
`;

const StyledFunnelLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  min-width: 100px;
  text-align: right;
`;

const StyledFunnelBar = styled.div<{ width: number; color: string }>`
  background: ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 18px;
  min-width: ${({ width }) => (width > 0 ? '4px' : '0')};
  transition: width 0.3s ease;
  width: ${({ width }) => width}%;
`;

const StyledFunnelCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 20px;
`;

// Two-column layout
const StyledTwoColumn = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Recent list
const StyledRecentList = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledRecentHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledRecentItem = styled(Link)`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  text-decoration: none;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledRecentLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRecentMeta = styled.span`
  flex-shrink: 0;
`;

// Board quick links
const StyledBoardLinks = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

const StyledBoardLink = styled(Link)`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-decoration: none;
  transition: border-color 0.1s ease-in-out;

  &:hover {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledBoardLinkText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledBoardLinkTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBoardLinkSub = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

// ── Computed metrics ──────────────────────────────────────────────

const occupiedRooms = mockRooms.filter((r) => r.room_status === 'Occupied');
const availableRooms = mockRooms.filter((r) => r.room_status === 'Available');
const maintenanceRooms = mockRooms.filter(
  (r) => r.room_status === 'Under Maintenance',
);
const blockedRooms = mockRooms.filter((r) => r.room_status === 'Blocked');
const occupancyRate = mockRooms.length > 0
  ? Math.round((occupiedRooms.length / mockRooms.length) * 100)
  : 0;

const openTickets = mockTickets.filter(
  (t) =>
    t.ticket_status === 'New Request' ||
    t.ticket_status === 'Waiting on Customer' ||
    t.ticket_status === 'Waiting on Vendor',
);

const totalRevenue = mockTransactions
  .filter((t) => t.credit_debit === 'Credit')
  .reduce((sum, t) => sum + t.amount, 0);
const totalExpenses = mockTransactions
  .filter((t) => t.credit_debit === 'Debit')
  .reduce((sum, t) => sum + t.amount, 0);
const netIncome = totalRevenue - totalExpenses;

const activeContracts = mockContracts.filter(
  (c) => c.agreement_lifecycle === 'Active',
);
const totalMonthlyRent = activeContracts.reduce(
  (sum, c) => sum + c.monthly_license_fee,
  0,
);

const totalOverheadsCost = mockOverheads.reduce(
  (sum, o) => sum + (o.maintenance_amount ?? 0) + (o.wifi_amount ?? 0) + (o.helper_salary ?? 0),
  0,
);

const itemsUnderRepair = mockItems.filter(
  (i) => i.state === 'WIB' || i.state === 'WOB',
);
const deadItems = mockItems.filter((i) => i.state === 'DEAD');

// Tenant pipeline
const pipelineStages = [
  { label: 'New Inquiry', color: themeCssVariables.accent.primary },
  { label: 'Visit Scheduled', color: themeCssVariables.accent.primary },
  { label: 'Visit Done', color: themeCssVariables.accent.primary },
  { label: 'Negotiation', color: themeCssVariables.accent.secondary },
  { label: 'Converted', color: themeCssVariables.accent.tertiary },
  { label: 'Moved In', color: themeCssVariables.accent.quaternary },
] as const;

const pipelineCounts = pipelineStages.map((stage) => ({
  ...stage,
  count: mockTenants.filter((t) => t.tenant_lifecycle === stage.label).length,
}));
const maxPipelineCount = Math.max(...pipelineCounts.map((p) => p.count), 1);

// Recent transactions (sorted by date, newest first)
const recentTransactions = [...mockTransactions]
  .sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime(),
  )
  .slice(0, 5);

type CountCard = {
  label: string;
  count: number;
  Icon: IconComponent;
  color: string;
  path: string;
};

const countCards: CountCard[] = [
  { label: 'Tenants', count: mockTenants.length, Icon: IconUser, color: themeCssVariables.accent.primary, path: '/hawkeye/tenants' },
  { label: 'Merchants', count: mockMerchants.length, Icon: IconBuildingSkyscraper, color: themeCssVariables.accent.secondary, path: '/hawkeye/merchants' },
  { label: 'Properties', count: mockProperties.length, Icon: IconHome, color: themeCssVariables.accent.tertiary, path: '/hawkeye/properties' },
  { label: 'Rooms', count: mockRooms.length, Icon: IconDoorEnter, color: themeCssVariables.accent.quaternary, path: '/hawkeye/rooms' },
  { label: 'Contracts', count: mockContracts.length, Icon: IconFileText, color: themeCssVariables.accent.primary, path: '/hawkeye/contracts' },
  { label: 'Transactions', count: mockTransactions.length, Icon: IconCreditCard, color: themeCssVariables.accent.secondary, path: '/hawkeye/transactions' },
  { label: 'Tickets', count: mockTickets.length, Icon: IconTag, color: themeCssVariables.accent.tertiary, path: '/hawkeye/tickets' },
  { label: 'Vendors', count: mockVendors.length, Icon: IconTool, color: themeCssVariables.accent.quaternary, path: '/hawkeye/vendors' },
  { label: 'Catalogs', count: mockCatalogs.length, Icon: IconLayoutGrid, color: themeCssVariables.accent.primary, path: '/hawkeye/catalogs' },
  { label: 'Items', count: mockItems.length, Icon: IconArchive, color: themeCssVariables.accent.secondary, path: '/hawkeye/items' },
  { label: 'Overheads', count: mockOverheads.length, Icon: IconCoins, color: themeCssVariables.accent.tertiary, path: '/hawkeye/overheads' },
];

// ── Component ─────────────────────────────────────────────────────

export const HawkeyeDashboard = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledPage>
      <PageHeader title="Dashboard" />
      <StyledContent>
        {/* Record counts */}
        <StyledSectionTitle>
          Overview
          <StyledSectionSubtitle>
            {mockProperties.length} properties · {mockRooms.length} rooms · {mockTenants.length} tenants
          </StyledSectionSubtitle>
        </StyledSectionTitle>
        <StyledCardGrid>
          {countCards.map((card) => (
            <StyledCard
              key={card.label}
              to={card.path}
            >
              <StyledCardHeader>
                <StyledCardIcon color={card.color}>
                  <card.Icon size={theme.icon.size.md} />
                </StyledCardIcon>
                <StyledCardLabel>{card.label}</StyledCardLabel>
              </StyledCardHeader>
              <StyledCardValue>{card.count}</StyledCardValue>
            </StyledCard>
          ))}
        </StyledCardGrid>

        {/* Key metrics */}
        <StyledSectionTitle>Key Metrics</StyledSectionTitle>
        <StyledMetricGrid>
          <StyledMetricCard>
            <StyledMetricLabel>Occupancy Rate</StyledMetricLabel>
            <StyledMetricValue>{occupancyRate}%</StyledMetricValue>
            <StyledProgressBar>
              <StyledProgressFill
                percent={occupancyRate}
                color={
                  occupancyRate >= 80
                    ? themeCssVariables.accent.tertiary
                    : occupancyRate >= 50
                      ? themeCssVariables.accent.secondary
                      : themeCssVariables.accent.primary
                }
              />
            </StyledProgressBar>
            <StyledMetricDetail>
              <Tag color="green" text={`${occupiedRooms.length} occupied`} />
              <Tag color="blue" text={`${availableRooms.length} available`} />
              {maintenanceRooms.length > 0 && (
                <Tag
                  color="orange"
                  text={`${maintenanceRooms.length} maintenance`}
                />
              )}
              {blockedRooms.length > 0 && (
                <Tag color="red" text={`${blockedRooms.length} blocked`} />
              )}
            </StyledMetricDetail>
          </StyledMetricCard>

          <StyledMetricCard>
            <StyledMetricLabel>Net Income</StyledMetricLabel>
            <StyledMetricValue>{formatINR(netIncome)}</StyledMetricValue>
            <StyledMetricDetail>
              <Tag color="green" text={`${formatINR(totalRevenue)} revenue`} />
              <Tag color="red" text={`${formatINR(totalExpenses)} expenses`} />
            </StyledMetricDetail>
          </StyledMetricCard>

          <StyledMetricCard>
            <StyledMetricLabel>Monthly Rent (Active)</StyledMetricLabel>
            <StyledMetricValue>{formatINR(totalMonthlyRent)}</StyledMetricValue>
            <StyledMetricDetail>
              <Tag
                color="green"
                text={`${activeContracts.length} active contracts`}
              />
              <Tag
                color="gray"
                text={`${formatINR(totalOverheadsCost)} overheads`}
              />
            </StyledMetricDetail>
          </StyledMetricCard>

          <StyledMetricCard>
            <StyledMetricLabel>Open Tickets</StyledMetricLabel>
            <StyledMetricValue>{openTickets.length}</StyledMetricValue>
            <StyledMetricDetail>
              <Tag
                color="orange"
                text={`${itemsUnderRepair.length} items under repair`}
              />
              {deadItems.length > 0 && (
                <Tag color="red" text={`${deadItems.length} dead items`} />
              )}
            </StyledMetricDetail>
          </StyledMetricCard>
        </StyledMetricGrid>

        {/* Demand Analytics */}
        <StyledSectionTitle>Demand Analytics</StyledSectionTitle>
        <StyledTwoColumn>
          <LeadSourcesChart />
          <ConversionFunnelChart />
          <ConversionTrendChart />
          <PipelineBreakdownChart />
          <VisitConversionChart />
        </StyledTwoColumn>

        {/* Rent Analytics */}
        <StyledSectionTitle>Rent Analytics</StyledSectionTitle>
        <StyledTwoColumn>
          <CollectionTrendChart />
          <CollectionStatusChart />
          <OverdueAgingChart />
          <LandlordPayoutChart />
        </StyledTwoColumn>

        {/* Tenant Pipeline + Recent Transactions */}
        <StyledTwoColumn>
          <div>
            <StyledSectionTitle>Tenant Pipeline</StyledSectionTitle>
            <StyledMetricCard style={{ marginTop: 12 }}>
              {pipelineCounts.map((stage) => (
                <StyledFunnelRow key={stage.label}>
                  <StyledFunnelLabel>{stage.label}</StyledFunnelLabel>
                  <StyledFunnelBar
                    width={(stage.count / maxPipelineCount) * 100}
                    color={stage.color}
                  />
                  <StyledFunnelCount>{stage.count}</StyledFunnelCount>
                </StyledFunnelRow>
              ))}
            </StyledMetricCard>
          </div>

          <div>
            <StyledSectionTitle>Recent Transactions</StyledSectionTitle>
            <StyledRecentList style={{ marginTop: 12 }}>
              <StyledRecentHeader>Latest 5 transactions</StyledRecentHeader>
              {recentTransactions.map((txn) => (
                <StyledRecentItem
                  key={txn.id}
                  to={`/hawkeye/transactions/${txn.id}`}
                >
                  <StyledRecentLabel>
                    {txn.purpose_category_1} — {formatINR(txn.amount)}
                  </StyledRecentLabel>
                  <StyledRecentMeta>
                    <Tag
                      color={txn.credit_debit === 'Credit' ? 'green' : 'red'}
                      text={txn.credit_debit}
                    />
                  </StyledRecentMeta>
                </StyledRecentItem>
              ))}
            </StyledRecentList>
          </div>
        </StyledTwoColumn>

        {/* Recent Tickets + Board Quick Links */}
        <StyledTwoColumn>
          <div>
            <StyledSectionTitle>Recent Tickets</StyledSectionTitle>
            <StyledRecentList style={{ marginTop: 12 }}>
              <StyledRecentHeader>Latest 5 tickets</StyledRecentHeader>
              {mockTickets.slice(0, 5).map((ticket) => (
                <StyledRecentItem
                  key={ticket.id}
                  to={`/hawkeye/tickets/${ticket.id}`}
                >
                  <StyledRecentLabel>
                    #{ticket.id} — {ticket.ticket_name}
                  </StyledRecentLabel>
                  <StyledRecentMeta>
                    <Tag
                      color={
                        ticket.ticket_status === 'Closed'
                          ? 'green'
                          : ticket.ticket_status === 'Blocked'
                            ? 'red'
                            : 'orange'
                      }
                      text={ticket.ticket_status}
                    />
                  </StyledRecentMeta>
                </StyledRecentItem>
              ))}
            </StyledRecentList>
          </div>

          <div>
            <StyledSectionTitle>Board Views</StyledSectionTitle>
            <StyledBoardLinks style={{ marginTop: 12 }}>
              <StyledBoardLink
                to="/hawkeye/tenants/board"
              >
                <IconColumns size={theme.icon.size.md} />
                <StyledBoardLinkText>
                  <StyledBoardLinkTitle>Tenant Pipeline</StyledBoardLinkTitle>
                  <StyledBoardLinkSub>
                    {mockTenants.length} tenants across{' '}
                    {pipelineCounts.filter((s) => s.count > 0).length} stages
                  </StyledBoardLinkSub>
                </StyledBoardLinkText>
              </StyledBoardLink>

              <StyledBoardLink
                to="/hawkeye/tickets/board"
              >
                <IconColumns size={theme.icon.size.md} />
                <StyledBoardLinkText>
                  <StyledBoardLinkTitle>Tickets Board</StyledBoardLinkTitle>
                  <StyledBoardLinkSub>
                    {openTickets.length} open tickets
                  </StyledBoardLinkSub>
                </StyledBoardLinkText>
              </StyledBoardLink>

              <StyledBoardLink
                to="/hawkeye/rooms/board"
              >
                <IconColumns size={theme.icon.size.md} />
                <StyledBoardLinkText>
                  <StyledBoardLinkTitle>Rooms Board</StyledBoardLinkTitle>
                  <StyledBoardLinkSub>
                    {occupancyRate}% occupancy
                  </StyledBoardLinkSub>
                </StyledBoardLinkText>
              </StyledBoardLink>

              <StyledBoardLink
                to="/hawkeye/contracts/board"
              >
                <IconColumns size={theme.icon.size.md} />
                <StyledBoardLinkText>
                  <StyledBoardLinkTitle>Contracts Board</StyledBoardLinkTitle>
                  <StyledBoardLinkSub>
                    {activeContracts.length} active contracts
                  </StyledBoardLinkSub>
                </StyledBoardLinkText>
              </StyledBoardLink>
            </StyledBoardLinks>
          </div>
        </StyledTwoColumn>
      </StyledContent>
    </StyledPage>
  );
};
