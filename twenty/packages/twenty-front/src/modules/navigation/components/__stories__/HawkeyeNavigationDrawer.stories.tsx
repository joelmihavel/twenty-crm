import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  IconArchive,
  IconBuildingSkyscraper,
  IconCoins,
  IconCreditCard,
  IconDoorEnter,
  IconFileText,
  IconHome,
  IconLayoutGrid,
  IconSearch,
  IconSettings,
  IconTag,
  IconTool,
  IconUser,
} from 'twenty-ui/display';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { LoadedDecorator } from '~/testing/decorators/LoadedDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const meta: Meta<typeof NavigationDrawer> = {
  title: 'Hawkeye/Navigation/HawkeyeNavigationDrawer',
  component: NavigationDrawer,
  decorators: [
    ComponentWithRouterDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
    LoadedDecorator,
    (Story) => {
      const setCurrentWorkspaceMember = useSetAtomState(
        currentWorkspaceMemberState,
      );
      useEffect(() => {
        setTestObjectMetadataItemsInMetadataStore(
          jotaiStore,
          getTestEnrichedObjectMetadataItemsMock(),
        );
        setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      }, [setCurrentWorkspaceMember]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
  argTypes: { children: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawer>;

export const Default: Story = {
  args: {
    title: 'Hawkeye',
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            modifier={{ keyboard: [`${getOsControlSymbol()}`, 'K'] }}
          />
        </NavigationDrawerSection>

        {/* ── People ───────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="People" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Tenants"
              to="/objects/tenants"
              Icon={IconUser}
              active
            />
            <NavigationDrawerSubItem
              label="Merchants"
              to="/objects/merchants"
              Icon={IconBuildingSkyscraper}
              subItemState="intermediate-after-selected"
            />
            <NavigationDrawerSubItem
              label="Vendors"
              to="/objects/vendors"
              Icon={IconTool}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        {/* ── Property ─────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Property" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Properties (PID)"
              to="/objects/properties"
              Icon={IconHome}
            />
            <NavigationDrawerSubItem
              label="Rooms (RID)"
              to="/objects/rooms"
              Icon={IconDoorEnter}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        {/* ── Agreement ────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Agreement" />
          <NavigationDrawerItem
            label="Contracts"
            to="/objects/contracts"
            Icon={IconFileText}
          />
        </NavigationDrawerSection>

        {/* ── Finance ──────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Finance" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Transactions"
              to="/objects/transactions"
              Icon={IconCreditCard}
            />
            <NavigationDrawerSubItem
              label="Overheads"
              to="/objects/overheads"
              Icon={IconCoins}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        {/* ── Operations ───────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Operations" />
          <NavigationDrawerItem
            label="Tickets"
            to="/objects/operationsTickets"
            Icon={IconTag}
          />
        </NavigationDrawerSection>

        {/* ── Inventory ────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Inventory" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Catalogs (FSN)"
              to="/objects/catalogs"
              Icon={IconLayoutGrid}
            />
            <NavigationDrawerSubItem
              label="Items"
              to="/objects/inventoryItems"
              Icon={IconArchive}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        {/* ── Other ────────────────────────────────────── */}
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Other" />
          <NavigationDrawerItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
          />
        </NavigationDrawerSection>
      </>
    ),
  },
};

export const PeopleActive: Story = {
  args: {
    title: 'Hawkeye',
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            modifier={{ keyboard: [`${getOsControlSymbol()}`, 'K'] }}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="People" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Tenants"
              to="/objects/tenants"
              Icon={IconUser}
              active
            />
            <NavigationDrawerSubItem
              label="Merchants"
              to="/objects/merchants"
              Icon={IconBuildingSkyscraper}
              subItemState="intermediate-after-selected"
            />
            <NavigationDrawerSubItem
              label="Vendors"
              to="/objects/vendors"
              Icon={IconTool}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Property" />
          <NavigationDrawerItem
            label="Properties (PID)"
            to="/objects/properties"
            Icon={IconHome}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Agreement" />
          <NavigationDrawerItem
            label="Contracts"
            to="/objects/contracts"
            Icon={IconFileText}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Finance" />
          <NavigationDrawerItem
            label="Transactions"
            to="/objects/transactions"
            Icon={IconCreditCard}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Operations" />
          <NavigationDrawerItem
            label="Tickets"
            to="/objects/operationsTickets"
            Icon={IconTag}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Inventory" />
          <NavigationDrawerItem
            label="Catalogs (FSN)"
            to="/objects/catalogs"
            Icon={IconLayoutGrid}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Other" />
          <NavigationDrawerItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
          />
        </NavigationDrawerSection>
      </>
    ),
  },
};

export const FinanceActive: Story = {
  args: {
    title: 'Hawkeye',
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            modifier={{ keyboard: [`${getOsControlSymbol()}`, 'K'] }}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="People" />
          <NavigationDrawerItem
            label="Tenants"
            to="/objects/tenants"
            Icon={IconUser}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Property" />
          <NavigationDrawerItem
            label="Properties (PID)"
            to="/objects/properties"
            Icon={IconHome}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Agreement" />
          <NavigationDrawerItem
            label="Contracts"
            to="/objects/contracts"
            Icon={IconFileText}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Finance" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Transactions"
              to="/objects/transactions"
              Icon={IconCreditCard}
              active
            />
            <NavigationDrawerSubItem
              label="Overheads"
              to="/objects/overheads"
              Icon={IconCoins}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Operations" />
          <NavigationDrawerItem
            label="Tickets"
            to="/objects/operationsTickets"
            Icon={IconTag}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Inventory" />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Catalogs (FSN)"
              to="/objects/catalogs"
              Icon={IconLayoutGrid}
            />
            <NavigationDrawerSubItem
              label="Items"
              to="/objects/inventoryItems"
              Icon={IconArchive}
              subItemState="last-not-selected"
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Other" />
          <NavigationDrawerItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
          />
        </NavigationDrawerSection>
      </>
    ),
  },
};
