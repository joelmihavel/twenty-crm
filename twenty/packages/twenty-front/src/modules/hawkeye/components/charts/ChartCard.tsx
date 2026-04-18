import { type ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { IconChartBar, IconAlertTriangle } from 'twenty-ui/display';

const StyledChartCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledChartTitle = styled.h4`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[1]};
`;

const StyledChartSubtitle = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0 0 ${themeCssVariables.spacing[4]};
`;

const StyledStateContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
`;

const StyledStateText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ChartCardProps = {
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  children: ReactNode;
};

export const ChartCard = ({
  title,
  subtitle,
  height = 220,
  loading,
  error,
  empty,
  children,
}: ChartCardProps) => {
  const { theme } = useContext(ThemeContext);

  const renderState = () => {
    if (loading) {
      return (
        <StyledStateContainer>
          <StyledStateText>Loading...</StyledStateText>
        </StyledStateContainer>
      );
    }
    if (error) {
      return (
        <StyledStateContainer>
          <IconAlertTriangle size={28} color={theme.color.orange} />
          <StyledStateText>Failed to load chart data</StyledStateText>
        </StyledStateContainer>
      );
    }
    if (empty) {
      return (
        <StyledStateContainer>
          <IconChartBar size={32} color={theme.font.color.tertiary} />
          <StyledStateText>No data available yet</StyledStateText>
        </StyledStateContainer>
      );
    }
    return null;
  };

  const stateContent = renderState();

  return (
    <StyledChartCard>
      <StyledChartTitle>{title}</StyledChartTitle>
      {subtitle && <StyledChartSubtitle>{subtitle}</StyledChartSubtitle>}
      <div style={{ height }}>
        {stateContent ?? children}
      </div>
    </StyledChartCard>
  );
};
