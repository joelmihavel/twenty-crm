import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type IconComponent } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

type SummaryItem = {
  label: string;
  value: string | number;
  Icon?: IconComponent;
  tag?: { text: string; color: 'green' | 'red' | 'orange' | 'blue' | 'gray' };
};

const StyledCard = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]};
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
`;

const StyledItemHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledItemValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

type HawkeyeSummaryCardProps = {
  items: SummaryItem[];
};

export const HawkeyeSummaryCard = ({ items }: HawkeyeSummaryCardProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCard>
      {items.map((item) => (
        <StyledItem key={item.label}>
          <StyledItemHeader>
            {item.Icon && <item.Icon size={theme.icon.size.sm} />}
            {item.label}
          </StyledItemHeader>
          <StyledItemValue>
            {item.tag ? (
              <Tag color={item.tag.color} text={item.tag.text} />
            ) : (
              item.value
            )}
          </StyledItemValue>
        </StyledItem>
      ))}
    </StyledCard>
  );
};
