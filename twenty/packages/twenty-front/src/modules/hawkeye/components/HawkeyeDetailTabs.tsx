import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
  count?: number;
};

const StyledTabBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: 0;
  overflow-x: auto;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.accent.primary : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition: color 0.1s ease, border-color 0.1s ease;
  white-space: nowrap;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledTabCount = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-left: ${themeCssVariables.spacing[1]};
  padding: 1px 6px;
`;

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

type HawkeyeDetailTabsProps = {
  tabs: Tab[];
  defaultTab?: string;
};

export const HawkeyeDetailTabs = ({
  tabs,
  defaultTab,
}: HawkeyeDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultTab ?? tabs[0]?.key ?? '',
  );

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <>
      <StyledTabBar>
        {tabs.map((tab) => (
          <StyledTab
            key={tab.key}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <StyledTabCount>{tab.count}</StyledTabCount>
            )}
          </StyledTab>
        ))}
      </StyledTabBar>
      <StyledTabContent>{activeContent}</StyledTabContent>
    </>
  );
};
