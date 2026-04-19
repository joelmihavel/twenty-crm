import { useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconUser, IconBuildingSkyscraper, IconUserPlus } from 'twenty-ui/display';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';

import { HawkeyeTable } from '@/hawkeye/components/HawkeyeTable';
import { HawkeyeBoardView, type BoardColumn } from '@/hawkeye/components/HawkeyeBoardView';
import { HawkeyeSidePanel } from '@/hawkeye/components/HawkeyeSidePanel';
import { ViewToggle, type ViewMode } from '@/hawkeye/components/ViewToggle';

import { mockTenants } from '../data/mock-tenants';
import { mockMerchants } from '../data/mock-merchants';
import {
  tenantColumns,
  tenantFieldGroups,
  merchantColumns,
  merchantFieldGroups,
} from '../data/column-definitions';

import { type Tenant } from '../types/tenant.types';
import { type Merchant } from '../types/merchant.types';

// ── Tenant Lead Lifecycle Stages ───────────────────────────────────

const TENANT_LEAD_STAGES = new Set([
  'New Inquiry',
  'Visit Scheduled',
  'Visit Done',
  'Negotiation',
  'Converted',
  'Dead Lead',
]);

const MERCHANT_LEAD_STAGES = new Set([
  'To be contacted',
  'In touch',
  'Qualified',
  'Evaluation',
  'Negotiations',
  'Offer Extended',
  'To nurture',
]);

// ── Board Columns ──────────────────────────────────────────────────

const tenantLeadBoardColumns: BoardColumn[] = [
  { key: 'New Inquiry', label: 'New Inquiry', tagColor: 'blue' },
  { key: 'Visit Scheduled', label: 'Visit Scheduled', tagColor: 'blue' },
  { key: 'Visit Done', label: 'Visit Done', tagColor: 'blue' },
  { key: 'Negotiation', label: 'Negotiation', tagColor: 'orange' },
  { key: 'Converted', label: 'Converted', tagColor: 'green' },
  { key: 'Dead Lead', label: 'Dead Lead', tagColor: 'red' },
];

const merchantLeadBoardColumns: BoardColumn[] = [
  { key: 'To be contacted', label: 'To be contacted', tagColor: 'gray' },
  { key: 'In touch', label: 'In touch', tagColor: 'blue' },
  { key: 'Qualified', label: 'Qualified', tagColor: 'blue' },
  { key: 'Evaluation', label: 'Evaluation', tagColor: 'orange' },
  { key: 'Negotiations', label: 'Negotiations', tagColor: 'orange' },
  { key: 'Offer Extended', label: 'Offer Extended', tagColor: 'green' },
  { key: 'To nurture', label: 'To nurture', tagColor: 'gray' },
];

// ── Filtered Data ──────────────────────────────────────────────────

const tenantLeads = mockTenants.filter((t) =>
  TENANT_LEAD_STAGES.has(t.tenant_lifecycle),
);

const merchantLeads = mockMerchants.filter((m) =>
  MERCHANT_LEAD_STAGES.has(m.deal_stage),
);

// ── Tab type ───────────────────────────────────────────────────────

type LeadsTab = 'tenant' | 'merchant';

// ── Styled Components ─────────────────────────────────────────────

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-left: 0;
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledBoardMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const StyledHeaderControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTabBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTabButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive ? themeCssVariables.font.color.primary : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive ? themeCssVariables.font.weight.medium : themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: color 100ms ease-linear, background 100ms ease-linear;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// ── Component ─────────────────────────────────────────────────────

export const LeadsPage = () => {
  const [activeTab, setActiveTab] = useState<LeadsTab>('tenant');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const handleTenantRowClick = useCallback((record: Tenant) => {
    setSelectedTenant((prev) =>
      prev && prev.id === record.id ? null : record,
    );
  }, []);

  const handleMerchantRowClick = useCallback((record: Merchant) => {
    setSelectedMerchant((prev) =>
      prev && prev.id === record.id ? null : record,
    );
  }, []);

  const handleCloseTenantPanel = useCallback(() => {
    setSelectedTenant(null);
  }, []);

  const handleCloseMerchantPanel = useCallback(() => {
    setSelectedMerchant(null);
  }, []);

  const handleTabChange = useCallback((tab: LeadsTab) => {
    setActiveTab(tab);
    setSelectedTenant(null);
    setSelectedMerchant(null);
  }, []);

  const isTenant = activeTab === 'tenant';
  const currentData = isTenant ? tenantLeads : merchantLeads;
  const selectedRecord = isTenant ? selectedTenant : selectedMerchant;

  return (
    <StyledPageContainer>
      <PageHeader title="Leads" Icon={() => <NavigationMenuItemStyleIcon Icon={IconUserPlus} color="blue" />}>
        <StyledHeaderControls>
          <StyledTabBar>
            <StyledTabButton
              isActive={activeTab === 'tenant'}
              onClick={() => handleTabChange('tenant')}
            >
              <IconUser size={14} />
              Tenant Leads
            </StyledTabButton>
            <StyledTabButton
              isActive={activeTab === 'merchant'}
              onClick={() => handleTabChange('merchant')}
            >
              <IconBuildingSkyscraper size={14} />
              Merchant Leads
            </StyledTabButton>
          </StyledTabBar>
          <StyledCount>{currentData.length}</StyledCount>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </StyledHeaderControls>
      </PageHeader>

      {viewMode === 'list' ? (
        <StyledMainContainer>
          <StyledLeftContainer>
            <PagePanel>
              {isTenant ? (
                <HawkeyeTable
                  columns={tenantColumns}
                  data={tenantLeads}
                  idKey="id"
                  basePath="/hawkeye/tenants"
                  onRowClick={handleTenantRowClick}
                  selectedId={selectedTenant ? selectedTenant.id : null}
                />
              ) : (
                <HawkeyeTable
                  columns={merchantColumns}
                  data={merchantLeads}
                  idKey="id"
                  basePath="/hawkeye/merchants"
                  onRowClick={handleMerchantRowClick}
                  selectedId={selectedMerchant ? selectedMerchant.id : null}
                />
              )}
            </PagePanel>
          </StyledLeftContainer>
          {isTenant ? (
            <HawkeyeSidePanel
              record={selectedTenant}
              title={selectedTenant ? `${selectedTenant.first_name} ${selectedTenant.last_name}` : ''}
              fieldGroups={tenantFieldGroups}
              onClose={handleCloseTenantPanel}
            />
          ) : (
            <HawkeyeSidePanel
              record={selectedMerchant}
              title={selectedMerchant ? `${selectedMerchant.prefix} ${selectedMerchant.first_name} ${selectedMerchant.last_name}` : ''}
              fieldGroups={merchantFieldGroups}
              onClose={handleCloseMerchantPanel}
            />
          )}
        </StyledMainContainer>
      ) : (
        <StyledBoardMainContainer>
          <StyledLeftContainer>
            <PagePanel>
              {isTenant ? (
                <HawkeyeBoardView
                  data={tenantLeads}
                  columns={tenantLeadBoardColumns}
                  statusKey="tenant_lifecycle"
                  idKey="id"
                  basePath="/hawkeye/tenants"
                  titleFn={(t) => `${t.first_name} ${t.last_name}`}
                  cardFields={(t) => [
                    { label: 'Phone', value: t.mobile_phone },
                    { label: 'Channel', value: t.first_inquiry_channel },
                  ]}
                />
              ) : (
                <HawkeyeBoardView
                  data={merchantLeads}
                  columns={merchantLeadBoardColumns}
                  statusKey="deal_stage"
                  idKey="id"
                  basePath="/hawkeye/merchants"
                  titleFn={(m) => `${m.prefix} ${m.first_name} ${m.last_name}`}
                  cardFields={(m) => [
                    { label: 'Type', value: m.merchant_type },
                    { label: 'City', value: m.current_city },
                  ]}
                />
              )}
            </PagePanel>
          </StyledLeftContainer>
        </StyledBoardMainContainer>
      )}
    </StyledPageContainer>
  );
};
