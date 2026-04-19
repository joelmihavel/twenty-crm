import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { Card, CardContent, CardHeader } from 'twenty-ui/layout';
import { IconSettings, IconMoon, IconSun } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
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

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
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
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledInfoGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr 1fr;
  width: 100%;
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
        <Card rounded fullWidth>
          <CardHeader>Appearance</CardHeader>
          <CardContent divider>
            <StyledRow>
              <StyledRowLabel>
                <StyledRowTitle>Theme</StyledRowTitle>
                <StyledRowDescription>
                  Choose between light and dark mode
                </StyledRowDescription>
              </StyledRowLabel>
              <StyledThemeButtons>
                <Button
                  title="Light"
                  Icon={IconSun}
                  variant={colorScheme === 'light' ? 'primary' : 'secondary'}
                  accent={colorScheme === 'light' ? 'blue' : 'default'}
                  size="small"
                  onClick={() => {
                    if (colorScheme !== 'light') toggleColorScheme();
                  }}
                />
                <Button
                  title="Dark"
                  Icon={IconMoon}
                  variant={colorScheme === 'dark' ? 'primary' : 'secondary'}
                  accent={colorScheme === 'dark' ? 'blue' : 'default'}
                  size="small"
                  onClick={() => {
                    if (colorScheme !== 'dark') toggleColorScheme();
                  }}
                />
              </StyledThemeButtons>
            </StyledRow>
          </CardContent>
        </Card>

        {/* Data */}
        <Card rounded fullWidth>
          <CardHeader>Data Source</CardHeader>
          <CardContent divider>
            <StyledRow>
              <StyledRowLabel>
                <StyledRowTitle>Backend Connection</StyledRowTitle>
                <StyledRowDescription>
                  Currently using mock data
                </StyledRowDescription>
              </StyledRowLabel>
              <Tag color="orange" text="Mock Data" />
            </StyledRow>
          </CardContent>
          <CardContent>
            <StyledRow>
              <StyledRowLabel>
                <StyledRowTitle>API Endpoint</StyledRowTitle>
                <StyledRowDescription>
                  Not configured — connect to Flent API when ready
                </StyledRowDescription>
              </StyledRowLabel>
              <Tag color="gray" text="Not Connected" />
            </StyledRow>
          </CardContent>
        </Card>

        {/* About */}
        <Card rounded fullWidth>
          <CardHeader>About Hawkeye</CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </StyledContent>
    </StyledPage>
  );
};
