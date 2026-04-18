import { styled } from '@linaria/react';
import { useState, useContext, type ReactNode } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  Icon123,
  IconCalendarEvent,
  IconCheckbox,
  IconChevronDown,
  IconCurrencyRupee,
  IconFile,
  IconLink,
  IconMail,
  IconPhone,
  IconTag,
  IconTextSize,
  type IconComponent,
} from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { type FieldGroup } from '../types/entities';

// Map field type to icon
const typeIconMap: Record<string, IconComponent> = {
  text: IconTextSize,
  email: IconMail,
  phone: IconPhone,
  date: IconCalendarEvent,
  currency: IconCurrencyRupee,
  enum: IconTag,
  boolean: IconCheckbox,
  number: Icon123,
  url: IconLink,
  file: IconFile,
  longtext: IconTextSize,
};

// ── Styled Components ────────────────────────────────────────────

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFieldsLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[1]};
`;

const StyledSectionWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[3]} 0 0;
`;

const StyledSectionHeader = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledSectionTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledChevron = styled.span<{ isExpanded: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '0deg' : '-90deg')});
  transition: transform 0.15s ease;
`;

const StyledPropertyBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[3]};
`;

const StyledFieldRow = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 32px;
  padding: ${themeCssVariables.spacing[1]} 0;
  width: 100%;
`;

const StyledLabelContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  width: 100px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  width: 16px;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValueContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 20px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

// ── Formatters ────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (value: string) => {
  const lower = value.toLowerCase();
  if (
    lower.includes('active') ||
    lower.includes('success') ||
    lower.includes('paid') ||
    lower.includes('completed') ||
    lower.includes('available') ||
    lower.includes('qualified') ||
    lower.includes('credit')
  )
    return 'green' as const;
  if (
    lower.includes('churned') ||
    lower.includes('fail') ||
    lower.includes('blocked') ||
    lower.includes('rejected') ||
    lower.includes('debit') ||
    lower.includes('urgent') ||
    lower.includes('high')
  )
    return 'red' as const;
  if (
    lower.includes('pending') ||
    lower.includes('in progress') ||
    lower.includes('under maintenance') ||
    lower.includes('medium')
  )
    return 'orange' as const;
  if (lower.includes('lead') || lower.includes('new') || lower.includes('open'))
    return 'blue' as const;
  return 'gray' as const;
};

const renderFieldValue = (value: unknown, type?: string) => {
  if (value === null || value === undefined || value === '')
    return <StyledEmptyValue>—</StyledEmptyValue>;

  switch (type) {
    case 'currency':
      return formatCurrency(value as number);
    case 'date':
      return (
        formatDate(value as string) ?? <StyledEmptyValue>—</StyledEmptyValue>
      );
    case 'enum':
      return (
        <Tag color={getStatusColor(String(value))} text={String(value)} />
      );
    case 'boolean':
      return <BooleanDisplay value={value as boolean} />;
    case 'number':
      return typeof value === 'number'
        ? value.toLocaleString('en-IN')
        : String(value);
    default:
      return String(value);
  }
};

// ── Component ─────────────────────────────────────────────────────

type HawkeyeDetailViewProps<T> = {
  record: T;
  fieldGroups: FieldGroup<T>[];
  children?: ReactNode;
};

export const HawkeyeDetailView = <T,>({
  record,
  fieldGroups,
  children,
}: HawkeyeDetailViewProps<T>) => {
  const { theme } = useContext(ThemeContext);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <StyledContainer>
      <StyledFieldsLabel>Fields</StyledFieldsLabel>

      {fieldGroups.map((group) => {
        const isExpanded = !collapsedGroups[group.label];

        return (
          <StyledSectionWrapper key={group.label}>
            <StyledSectionHeader onClick={() => toggleGroup(group.label)}>
              <StyledSectionTitleRow>
                <StyledChevron isExpanded={isExpanded}>
                  <IconChevronDown size={theme.icon.size.sm} />
                </StyledChevron>
                <StyledSectionTitle>{group.label}</StyledSectionTitle>
              </StyledSectionTitleRow>
            </StyledSectionHeader>

            {isExpanded && (
              <StyledPropertyBox>
                {group.fields.map((field) => {
                  const FieldIcon = typeIconMap[field.type ?? 'text'];
                  return (
                    <StyledFieldRow key={field.key}>
                      <StyledLabelContainer>
                        {FieldIcon && (
                          <StyledIconContainer>
                            <FieldIcon size={theme.icon.size.md} />
                          </StyledIconContainer>
                        )}
                        <StyledLabel>{field.label}</StyledLabel>
                      </StyledLabelContainer>
                      <StyledValueContainer>
                        {renderFieldValue(record[field.key], field.type)}
                      </StyledValueContainer>
                    </StyledFieldRow>
                  );
                })}
              </StyledPropertyBox>
            )}
          </StyledSectionWrapper>
        );
      })}

      {children}
    </StyledContainer>
  );
};
