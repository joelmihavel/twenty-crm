import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';

import {
  IconArchive,
  IconBuildingSkyscraper,
  IconCoins,
  IconCreditCard,
  IconDoorEnter,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconMoon,
  IconSun,
  IconTag,
  IconTool,
  IconUser,
  type IconComponent,
} from 'twenty-ui/display';

import { useColorScheme } from './HawkeyeProviders';

const HAWKEYE_BASE = '/hawkeye';

type NavItem = {
  label: string;
  path: string;
  Icon: IconComponent;
  iconColor: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'People',
    items: [
      { label: 'Tenants', path: `${HAWKEYE_BASE}/tenants`, Icon: IconUser, iconColor: 'blue' },
      {
        label: 'Merchants',
        path: `${HAWKEYE_BASE}/merchants`,
        Icon: IconBuildingSkyscraper,
        iconColor: 'purple',
      },
      { label: 'Vendors', path: `${HAWKEYE_BASE}/vendors`, Icon: IconTool, iconColor: 'orange' },
    ],
  },
  {
    title: 'Property',
    items: [
      {
        label: 'Properties (PID)',
        path: `${HAWKEYE_BASE}/properties`,
        Icon: IconHome,
        iconColor: 'green',
      },
      {
        label: 'Rooms (RID)',
        path: `${HAWKEYE_BASE}/rooms`,
        Icon: IconDoorEnter,
        iconColor: 'turquoise',
      },
    ],
  },
  {
    title: 'Agreement',
    items: [
      {
        label: 'Contracts',
        path: `${HAWKEYE_BASE}/contracts`,
        Icon: IconFileText,
        iconColor: 'sky',
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Transactions',
        path: `${HAWKEYE_BASE}/transactions`,
        Icon: IconCreditCard,
        iconColor: 'red',
      },
      {
        label: 'Overheads',
        path: `${HAWKEYE_BASE}/overheads`,
        Icon: IconCoins,
        iconColor: 'amber',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Tickets', path: `${HAWKEYE_BASE}/tickets`, Icon: IconTag, iconColor: 'pink' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      {
        label: 'Catalogs (FSN)',
        path: `${HAWKEYE_BASE}/catalogs`,
        Icon: IconLayoutGrid,
        iconColor: 'violet',
      },
      {
        label: 'Items',
        path: `${HAWKEYE_BASE}/items`,
        Icon: IconArchive,
        iconColor: 'iris',
      },
    ],
  },
];

// Custom drawer container — avoids Twenty's NavigationDrawer which renders
// NavigationDrawerHeader → MultiWorkspaceDropdownButton (needs auth state).
// We keep all the child components (NavigationDrawerItem, Section, SectionTitle)
// since they only depend on Jotai atoms with defaults.
const StyledDrawer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
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

const StyledSpacer = styled.div`
  flex: 1;
`;

export const HawkeyeNavigationDrawer = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <StyledDrawer>
      <StyledHeader>
        <StyledLogo>Hawkeye</StyledLogo>
        <StyledThemeToggle
          onClick={toggleColorScheme}
          title={colorScheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {colorScheme === 'light' ? (
            <IconMoon size={16} />
          ) : (
            <IconSun size={16} />
          )}
        </StyledThemeToggle>
      </StyledHeader>

      {sections.map((section) => (
        <NavigationDrawerSection key={section.title}>
          <NavigationDrawerSectionTitle label={section.title} />
          {section.items.map((item) => (
            <NavigationDrawerItem
              key={item.path}
              label={item.label}
              Icon={item.Icon}
              iconColor={item.iconColor}
              to={item.path}
              active={currentPath.startsWith(item.path)}
            />
          ))}
        </NavigationDrawerSection>
      ))}

      <StyledSpacer />
    </StyledDrawer>
  );
};
