import { styled } from '@linaria/react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

import {
  IconArchive,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconCoins,
  IconCreditCard,
  IconCurrencyRupee,
  IconHistory,
  IconDoorEnter,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconMoon,
  IconPresentation,
  IconSearch,
  IconSettings,
  IconSun,
  IconTag,
  IconTool,
  IconUser,
  IconUserPlus,
  IconLogout,
  type IconComponent,
} from 'twenty-ui/display';

import { useColorScheme } from './HawkeyeProviders';

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
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
  width: 220px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledLogo = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledThemeToggle = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
  width: 28px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledSearchWrapper = styled.div`
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

const StyledSearchInput = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledSearchField = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
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

const StyledSpacer = styled.div`
  flex: 1;
`;

// ── Component ─────────────────────────────────────────────────────

export const HawkeyeNavigationDrawer = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const query = searchQuery.toLowerCase().trim();

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: query
        ? section.items.filter((item) =>
            item.label.toLowerCase().includes(query),
          )
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  return (
    <StyledDrawer>
      <StyledHeader>
        <StyledLogo>Hawkeye</StyledLogo>
        <StyledThemeToggle
          onClick={toggleColorScheme}
          title={
            colorScheme === 'light'
              ? 'Switch to dark mode'
              : 'Switch to light mode'
          }
        >
          {colorScheme === 'light' ? (
            <IconMoon size={16} />
          ) : (
            <IconSun size={16} />
          )}
        </StyledThemeToggle>
      </StyledHeader>

      {/* Search */}
      <StyledSearchWrapper>
        <StyledSearchInput>
          <IconSearch size={14} />
          <StyledSearchField
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </StyledSearchInput>
      </StyledSearchWrapper>

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
      {filteredSections.map((section) => {
        const isCollapsed = collapsedSections[section.key] && !query;

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

      <StyledSpacer />

      {/* Utilities */}
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
    </StyledDrawer>
  );
};
