import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

import {
  IconArchive,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconChartBar,
  IconChevronDown,
  IconCoins,
  IconCreditCard,
  IconCurrencyRupee,
  IconDoorEnter,
  IconFileCheck,
  IconPercentage,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconLogout,
  IconHistory,
  IconListNumbers,
  IconMoneybag,
  IconPresentation,
  IconSearch,
  IconSettings,
  IconShield,
  IconTag,
  IconTool,
  IconUser,
  IconUserPlus,
  type IconComponent,
} from 'twenty-ui/display';

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

import flentLogoLight from '../assets/flent-logo-light.svg';
import flentLogoDark from '../assets/flent-logo-dark.svg';

const HAWKEYE_BASE = '/hawkeye';

type NavItem = {
  label: string;
  path: string;
  Icon: IconComponent;
  iconColor: string;
  count: number;
};

type NavSection = {
  title: string;
  key: string;
  items: NavItem[];
};

const TENANT_LEAD_STAGES = ['New Inquiry', 'Visit Scheduled', 'Visit Done', 'Negotiation', 'Converted', 'Dead Lead'];
const MERCHANT_LEAD_STAGES = ['To be contacted', 'In touch', 'Qualified', 'Evaluation', 'Negotiations', 'Offer Extended', 'To nurture'];

const tenantLeadCount = mockTenants.filter((t) => TENANT_LEAD_STAGES.includes(t.tenant_lifecycle)).length;
const merchantLeadCount = mockMerchants.filter((m) => MERCHANT_LEAD_STAGES.includes(m.deal_stage)).length;
const activeTenantCount = mockTenants.length - tenantLeadCount;
const activeMerchantCount = mockMerchants.length - merchantLeadCount;

const sections: NavSection[] = [
  {
    title: 'People',
    key: 'people',
    items: [
      { label: 'Leads', path: `${HAWKEYE_BASE}/leads`, Icon: IconUserPlus, iconColor: 'blue', count: tenantLeadCount + merchantLeadCount },
      { label: 'Tenants', path: `${HAWKEYE_BASE}/tenants`, Icon: IconUser, iconColor: 'blue', count: activeTenantCount },
      { label: 'Merchants', path: `${HAWKEYE_BASE}/merchants`, Icon: IconBuildingSkyscraper, iconColor: 'purple', count: activeMerchantCount },
      { label: 'Vendors', path: `${HAWKEYE_BASE}/vendors`, Icon: IconTool, iconColor: 'orange', count: mockVendors.length },
    ],
  },
  {
    title: 'Property',
    key: 'property',
    items: [
      { label: 'Properties', path: `${HAWKEYE_BASE}/properties`, Icon: IconHome, iconColor: 'green', count: mockProperties.length },
      { label: 'Rooms', path: `${HAWKEYE_BASE}/rooms`, Icon: IconDoorEnter, iconColor: 'turquoise', count: mockRooms.length },
    ],
  },
  {
    title: 'Agreement',
    key: 'agreement',
    items: [
      { label: 'Contracts', path: `${HAWKEYE_BASE}/contracts`, Icon: IconFileText, iconColor: 'sky', count: mockContracts.length },
    ],
  },
  {
    title: 'Finance',
    key: 'finance',
    items: [
      { label: 'Transactions', path: `${HAWKEYE_BASE}/transactions`, Icon: IconCreditCard, iconColor: 'red', count: mockTransactions.length },
      { label: 'Overheads', path: `${HAWKEYE_BASE}/overheads`, Icon: IconCoins, iconColor: 'amber', count: mockOverheads.length },
      { label: 'Rent Roll', path: `${HAWKEYE_BASE}/rent-roll`, Icon: IconListNumbers, iconColor: 'green', count: 0 },
      { label: 'Deposits', path: `${HAWKEYE_BASE}/deposit-tracker`, Icon: IconShield, iconColor: 'green', count: 0 },
      { label: 'Collection', path: `${HAWKEYE_BASE}/rent-collection`, Icon: IconMoneybag, iconColor: 'green', count: 0 },
      { label: 'Property P&L', path: `${HAWKEYE_BASE}/property-pnl`, Icon: IconChartBar, iconColor: 'purple', count: 0 },
      { label: 'Deadlines', path: `${HAWKEYE_BASE}/payment-deadlines`, Icon: IconCalendarEvent, iconColor: 'sky', count: 0 },
    ],
  },
  {
    title: 'Operations',
    key: 'operations',
    items: [
      { label: 'Tickets', path: `${HAWKEYE_BASE}/tickets`, Icon: IconTag, iconColor: 'pink', count: mockTickets.length },
      { label: 'Move-out', path: `${HAWKEYE_BASE}/move-out`, Icon: IconLogout, iconColor: 'orange', count: 0 },
    ],
  },
  {
    title: 'Approvals',
    key: 'approvals',
    items: [
      { label: 'SD Settlements', path: `${HAWKEYE_BASE}/sd-settlements`, Icon: IconCurrencyRupee, iconColor: 'amber', count: 0 },
      { label: 'PO Approvals', path: `${HAWKEYE_BASE}/po-approvals`, Icon: IconFileText, iconColor: 'sky', count: 0 },
      { label: 'Contract Approvals', path: `${HAWKEYE_BASE}/contract-approvals`, Icon: IconFileCheck, iconColor: 'sky', count: 0 },
      { label: 'Discount Approvals', path: `${HAWKEYE_BASE}/discount-approvals`, Icon: IconPercentage, iconColor: 'orange', count: 0 },
      { label: 'Move-in Approvals', path: `${HAWKEYE_BASE}/move-in-approvals`, Icon: IconDoorEnter, iconColor: 'green', count: 0 },
    ],
  },
  {
    title: 'Inventory',
    key: 'inventory',
    items: [
      { label: 'Catalogs', path: `${HAWKEYE_BASE}/catalogs`, Icon: IconLayoutGrid, iconColor: 'violet', count: mockCatalogs.length },
      { label: 'Items', path: `${HAWKEYE_BASE}/items`, Icon: IconArchive, iconColor: 'iris', count: mockItems.length },
    ],
  },
];

// ── Styled ────────────────────────────────────────────────────────

const StyledDrawer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
  width: 220px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledLogoMark = styled.img`
  height: 14px;
  object-fit: contain;
  width: 12px;
`;

const StyledLogoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: 'Plus Jakarta Sans', ${themeCssVariables.font.family};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 20px;
`;

const StyledSectionHeader = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  letter-spacing: 0.04em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-transform: uppercase;
  width: 100%;

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledChevron = styled.span<{ isOpen: boolean }>`
  align-items: center;
  display: flex;
  transform: rotate(${({ isOpen }) => (isOpen ? '0deg' : '-90deg')});
  transition: transform 0.15s ease;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 16px;
  text-align: right;
`;

const StyledScrollableSection = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const StyledBottomSection = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  padding-top: ${themeCssVariables.spacing[2]};
`;

// ── Component ─────────────────────────────────────────────────────

export const HawkeyeNavigationDrawer = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme } = useContext(ThemeContext);
  const isDark = theme.name === 'dark';
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <StyledDrawer>
      <StyledHeader>
        <StyledLogoMark
          src={isDark ? flentLogoDark : flentLogoLight}
          alt="Flent"
        />
        <StyledLogoText>Flent Hawkeye</StyledLogoText>
      </StyledHeader>

      {/* Scrollable middle section */}
      <StyledScrollableSection>
        {/* Dashboard */}
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Dashboard"
            Icon={IconPresentation}
            iconColor="gray"
            to={`${HAWKEYE_BASE}/dashboard`}
            active={currentPath === `${HAWKEYE_BASE}/dashboard`}
          />
        </NavigationDrawerSection>

        {/* Entity sections */}
        {sections.map((section) => {
          const isCollapsed = openSection !== section.key;

          return (
            <NavigationDrawerSection key={section.key}>
              <StyledSectionHeader onClick={() => toggleSection(section.key)}>
                <StyledChevron isOpen={!isCollapsed}>
                  <IconChevronDown size={12} />
                </StyledChevron>
                {section.title}
              </StyledSectionHeader>

              {!isCollapsed &&
                section.items.map((item) => (
                  <div key={item.path}>
                    <NavigationDrawerItem
                      label={item.label}
                      Icon={item.Icon}
                      iconColor={item.iconColor}
                      to={item.path}
                      active={
                        currentPath === item.path ||
                        currentPath.startsWith(item.path + '/')
                      }
                      rightOptions={<StyledCount>{item.count}</StyledCount>}
                      alwaysShowRightOptions
                    />
                  </div>
                ))}
            </NavigationDrawerSection>
          );
        })}
      </StyledScrollableSection>

      {/* Fixed bottom utilities */}
      <StyledBottomSection>
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            iconColor="gray"
            to={`${HAWKEYE_BASE}/search`}
            active={currentPath === `${HAWKEYE_BASE}/search`}
          />
          <NavigationDrawerItem
            label="Activity"
            Icon={IconHistory}
            iconColor="gray"
            to={`${HAWKEYE_BASE}/activity`}
            active={currentPath === `${HAWKEYE_BASE}/activity`}
          />
          <NavigationDrawerItem
            label="Settings"
            Icon={IconSettings}
            iconColor="gray"
            to={`${HAWKEYE_BASE}/settings`}
            active={currentPath === `${HAWKEYE_BASE}/settings`}
          />
        </NavigationDrawerSection>
      </StyledBottomSection>
    </StyledDrawer>
  );
};
