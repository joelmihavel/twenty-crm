import { styled } from '@linaria/react';
import { useState, useContext, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  Icon123,
  IconCalendarEvent,
  IconCheckbox,
  IconChevronDown,
  IconCurrencyRupee,
  IconDownload,
  IconFile,
  IconLink,
  IconMail,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconTag,
  IconTextSize,
  IconUpload,
  type IconComponent,
} from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { type FieldGroup } from '../types/entities';

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
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 20px;
  min-width: 0;
  overflow: hidden;
  padding: 2px 4px;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.light};
  }
`;

const StyledEditIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: none;
  flex-shrink: 0;
  margin-left: auto;
  padding-left: ${themeCssVariables.spacing[1]};

  ${StyledValueContainer}:hover & {
    display: flex;
  }
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledInlineInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.accent.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: 0 0 0 3px ${themeCssVariables.accent.quaternary};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 20px;
  outline: none;
  padding: 2px 4px;
  width: 100%;
`;

const StyledInlineTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.accent.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: 0 0 0 3px ${themeCssVariables.accent.quaternary};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 60px;
  outline: none;
  padding: 4px;
  resize: vertical;
  width: 100%;
`;

const StyledInlineSelect = styled.select`
  appearance: none;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.accent.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: 0 0 0 3px ${themeCssVariables.accent.quaternary};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 24px;
  outline: none;
  padding: 2px 4px;
  width: 100%;
`;

const StyledBooleanToggle = styled.button<{ isChecked: boolean }>`
  align-items: center;
  background: ${({ isChecked }) =>
    isChecked
      ? themeCssVariables.accent.primary
      : themeCssVariables.background.tertiary};
  border: 1px solid ${({ isChecked }) =>
    isChecked
      ? themeCssVariables.accent.primary
      : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isChecked }) =>
    isChecked ? '#fff' : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  justify-content: center;
  min-width: 48px;
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: all 0.1s ease;
`;

// File display styled components
const StyledFileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

const StyledFileThumbnail = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 80px;
  justify-content: center;
  position: relative;
  width: 120px;
`;

const StyledFileLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  max-width: 100px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFileOverlay = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: 0;
  display: none;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  ${StyledFileThumbnail}:hover & {
    display: flex;
  }
`;

const StyledFileActionButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: ${themeCssVariables.border.radius.xs};
  color: #fff;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 28px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
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
    case 'file': {
      const fileName = String(value).split('/').pop() ?? String(value);
      return (
        <StyledFileContainer>
          <StyledFileThumbnail>
            <IconPhoto size={24} />
            <StyledFileLabel>{fileName}</StyledFileLabel>
            <StyledFileOverlay>
              <StyledFileActionButton title="Download">
                <IconDownload size={14} />
              </StyledFileActionButton>
              <StyledFileActionButton title="Replace">
                <IconUpload size={14} />
              </StyledFileActionButton>
            </StyledFileOverlay>
          </StyledFileThumbnail>
        </StyledFileContainer>
      );
    }
    case 'number':
      return typeof value === 'number'
        ? value.toLocaleString('en-IN')
        : String(value);
    default:
      return String(value);
  }
};

// ── Editable Field Component ─────────────────────────────────────

type EditableFieldProps = {
  value: unknown;
  type?: string;
  fieldKey: string;
  options?: string[];
  onSave?: (key: string, value: unknown) => void;
};

const EditableField = ({ value, type, fieldKey, options, onSave }: EditableFieldProps) => {
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && type !== 'enum') {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, type]);

  const handleOpen = useCallback(() => {
    if (!onSave) return;
    if (type === 'file') return;
    if (type === 'boolean') {
      onSave(fieldKey, !value);
      return;
    }
    setDraft(value === null || value === undefined ? '' : String(value));
    setIsEditing(true);
  }, [onSave, type, value, fieldKey]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    if (!onSave) return;
    let parsed: unknown = draft;
    if (type === 'number' || type === 'currency') {
      const num = Number(draft);
      if (!isNaN(num)) parsed = num;
    }
    onSave(fieldKey, parsed);
  }, [onSave, fieldKey, draft, type]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && type !== 'longtext') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel, type],
  );

  if (isEditing) {
    if (type === 'enum' && options && options.length > 0) {
      return (
        <StyledInlineSelect
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (onSave) onSave(fieldKey, e.target.value);
            setIsEditing(false);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </StyledInlineSelect>
      );
    }

    if (type === 'longtext') {
      return (
        <StyledInlineTextarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      );
    }

    const inputType =
      type === 'date'
        ? 'date'
        : type === 'number' || type === 'currency'
          ? 'number'
          : type === 'email'
            ? 'email'
            : type === 'url'
              ? 'url'
              : 'text';

    return (
      <StyledInlineInput
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={inputType}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <StyledValueContainer onClick={handleOpen}>
      {renderFieldValue(value, type)}
      {onSave && type !== 'file' && (
        <StyledEditIcon>
          <IconPencil size={theme.icon.size.sm} />
        </StyledEditIcon>
      )}
    </StyledValueContainer>
  );
};

// ── Component ─────────────────────────────────────────────────────

type HawkeyeDetailViewProps<T> = {
  record: T;
  fieldGroups: FieldGroup<T>[];
  children?: ReactNode;
  onFieldChange?: (key: string, value: unknown) => void;
};

export const HawkeyeDetailView = <T,>({
  record,
  fieldGroups,
  children,
  onFieldChange,
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
                      <EditableField
                        value={record[field.key]}
                        type={field.type}
                        fieldKey={field.key}
                        options={field.options}
                        onSave={onFieldChange}
                      />
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
