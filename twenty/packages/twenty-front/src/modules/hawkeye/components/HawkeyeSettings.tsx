import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { IconSettings, IconMoon, IconSun } from 'twenty-ui/display';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { useColorScheme } from './HawkeyeProviders';

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
  max-width: 640px;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledSection = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledSectionHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledRowLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledRowTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledRowDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledThemeButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledThemeButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.accent.primary : themeCssVariables.background.primary};
  border: 1px solid ${({ isActive }) =>
    isActive ? themeCssVariables.accent.primary : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive ? themeCssVariables.background.primary : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  transition: all 0.1s ease;
`;

const StyledInfoGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr 1fr;
`;

const StyledInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledInfoLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledInfoValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// ── Component ─────────────────────────────────────────────────────

export const HawkeyeSettings = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <StyledPage>
      <PageHeader title="Settings" Icon={IconSettings} />
      <StyledContent>
        {/* Appearance */}
        <StyledSection>
          <StyledSectionHeader>Appearance</StyledSectionHeader>
          <StyledRow>
            <StyledRowLabel>
              <StyledRowTitle>Theme</StyledRowTitle>
              <StyledRowDescription>
                Choose between light and dark mode
              </StyledRowDescription>
            </StyledRowLabel>
            <StyledThemeButtons>
              <StyledThemeButton
                isActive={colorScheme === 'light'}
                onClick={() => {
                  if (colorScheme !== 'light') toggleColorScheme();
                }}
              >
                <IconSun size={14} />
                Light
              </StyledThemeButton>
              <StyledThemeButton
                isActive={colorScheme === 'dark'}
                onClick={() => {
                  if (colorScheme !== 'dark') toggleColorScheme();
                }}
              >
                <IconMoon size={14} />
                Dark
              </StyledThemeButton>
            </StyledThemeButtons>
          </StyledRow>
        </StyledSection>

        {/* Data */}
        <StyledSection>
          <StyledSectionHeader>Data Source</StyledSectionHeader>
          <StyledRow>
            <StyledRowLabel>
              <StyledRowTitle>Backend Connection</StyledRowTitle>
              <StyledRowDescription>
                Currently using mock data
              </StyledRowDescription>
            </StyledRowLabel>
            <Tag color="orange" text="Mock Data" />
          </StyledRow>
          <StyledRow>
            <StyledRowLabel>
              <StyledRowTitle>API Endpoint</StyledRowTitle>
              <StyledRowDescription>
                Not configured — connect to Flent API when ready
              </StyledRowDescription>
            </StyledRowLabel>
            <Tag color="gray" text="Not Connected" />
          </StyledRow>
        </StyledSection>

        {/* About */}
        <StyledSection>
          <StyledSectionHeader>About Hawkeye</StyledSectionHeader>
          <StyledRow>
            <StyledInfoGrid>
              <StyledInfoItem>
                <StyledInfoLabel>Version</StyledInfoLabel>
                <StyledInfoValue>5.0.0-alpha</StyledInfoValue>
              </StyledInfoItem>
              <StyledInfoItem>
                <StyledInfoLabel>Framework</StyledInfoLabel>
                <StyledInfoValue>Twenty CRM</StyledInfoValue>
              </StyledInfoItem>
              <StyledInfoItem>
                <StyledInfoLabel>Built By</StyledInfoLabel>
                <StyledInfoValue>Flent Engineering</StyledInfoValue>
              </StyledInfoItem>
              <StyledInfoItem>
                <StyledInfoLabel>Entities</StyledInfoLabel>
                <StyledInfoValue>11 object types</StyledInfoValue>
              </StyledInfoItem>
            </StyledInfoGrid>
          </StyledRow>
        </StyledSection>
      </StyledContent>
    </StyledPage>
  );
};
