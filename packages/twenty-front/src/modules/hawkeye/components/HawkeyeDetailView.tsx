import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  Icon123,
  IconArrowLeft,
  IconCalendarEvent,
  IconCheckbox,
  IconCurrencyDollar,
  IconFile,
  IconLink,
  IconMail,
  IconPhone,
  IconTag,
  IconTextSize,
  type IconComponent,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { Tag } from 'twenty-ui/components';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { type FieldGroup } from '../types/entities';

// Map field type → icon (same mapping as column headers)
const typeIconMap: Record<string, IconComponent> = {
  text: IconTextSize,
  email: IconMail,
  phone: IconPhone,
  date: IconCalendarEvent,
  currency: IconCurrencyDollar,
  enum: IconTag,
  boolean: IconCheckbox,
  number: Icon123,
  url: IconLink,
  file: IconFile,
  longtext: IconTextSize,
};

// ── Container ─────────────────────────────────────────────────────
const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

// ── Page variant header (back button + title) ─────────────────────
const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

// ── "Fields" section label ────────────────────────────────────────
const StyledFieldsLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]} 0;
`;

// ── Section wrapper (border-top separator between groups) ─────────
const StyledSectionWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[3]} 0;
`;

// ── Section header (group title) ──────────────────────────────────
const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledSectionTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

// ── PropertyBox (wraps all fields in a group) ─────────────────────
const StyledPropertyBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[3]};
`;

// ── Field row (horizontal: icon+label | value) ────────────────────
const StyledFieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
  width: 100%;
`;

// ── Icon + label container (left side, fixed width) ───────────────
const StyledLabelContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  width: 90px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  width: 16px;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ── Value container (right side, fills remaining width) ───────────
const StyledValueContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 16px;
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]};
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
      return formatDate(value as string) ?? <StyledEmptyValue>—</StyledEmptyValue>;
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
  title: string;
  fieldGroups: FieldGroup<T>[];
  backPath?: string;
  variant?: 'page' | 'panel';
};

export const HawkeyeDetailView = <T,>({
  record,
  title,
  fieldGroups,
  backPath,
  variant = 'page',
}: HawkeyeDetailViewProps<T>) => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      {variant === 'page' && backPath && (
        <StyledHeader>
          <LightIconButton
            Icon={IconArrowLeft}
            accent="secondary"
            size="small"
            onClick={() => navigate(backPath)}
            aria-label="Go back"
          />
          <StyledTitle>{title}</StyledTitle>
        </StyledHeader>
      )}

      <StyledFieldsLabel>Fields</StyledFieldsLabel>

      {fieldGroups.map((group) => (
        <StyledSectionWrapper key={group.label}>
          <StyledSectionHeader>
            <StyledSectionTitle>{group.label}</StyledSectionTitle>
          </StyledSectionHeader>
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
        </StyledSectionWrapper>
      ))}
    </StyledContainer>
  );
};
