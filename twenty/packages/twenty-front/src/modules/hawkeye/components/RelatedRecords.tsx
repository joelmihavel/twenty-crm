import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconArrowUpRight,
  IconChevronDown,
  IconPlus,
} from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

// ── Section Container (matches Twenty's RecordDetailSectionContainer) ──

const StyledSectionWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTitleRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitleLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledActionButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  padding: 0;
  transition: color 0.1s ease;
  width: 24px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

// ── Record Chip (pill) ──────────────────────────────────────────

const StyledRecordsList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[3]};
`;

const StyledRecordChip = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 32px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: background 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledRecordAvatar = styled.div<{ bgColor: string }>`
  align-items: center;
  background: ${({ bgColor }) => bgColor};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: white;
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledRecordName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRecordChevron = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
`;

// ── Default avatar colors ────────────────────────────────────────

const AVATAR_COLORS = [
  '#e54d2e', '#e5484d', '#8e4ec6', '#6e56cf',
  '#3e63dd', '#0090ff', '#12a594', '#30a46c',
  '#f76b15', '#e8a634',
];

const getAvatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ── Component ─────────────────────────────────────────────────────

export type RelatedColumn<T> = {
  key: keyof T & string;
  label: string;
  render?: (value: unknown, record: T) => ReactNode;
};

type RelatedRecordsProps<T> = {
  title: string;
  records: T[];
  columns: RelatedColumn<T>[];
  idKey: keyof T & string;
  basePath: string;
  titleFn?: (record: T) => string;
  /** When provided, clicking a record chip calls this instead of navigating */
  onRecordClick?: (basePath: string, recordId: string) => void;
};

export const RelatedRecords = <T,>({
  title,
  records,
  columns,
  idKey,
  basePath,
  titleFn,
  onRecordClick,
}: RelatedRecordsProps<T>) => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const getRecordTitle = (record: T) => {
    if (titleFn) return titleFn(record);
    // Fall back to first column value
    return String(record[columns[0]?.key] ?? record[idKey] ?? '—');
  };

  const getInitials = (name: string) => {
    const parts = name.split(/[\s—-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <StyledSectionWrapper>
      <StyledSectionHeader>
        <StyledTitleRow>
          <StyledTitleLabel>{title}</StyledTitleLabel>
        </StyledTitleRow>
        <StyledActions>
          {records.length > 0 && (
            <StyledActionButton
              title={`View all ${title}`}
              onClick={() => navigate(basePath)}
            >
              <IconArrowUpRight size={theme.icon.size.md} />
            </StyledActionButton>
          )}
          <StyledActionButton title={`Add ${title}`}>
            <IconPlus size={theme.icon.size.md} />
          </StyledActionButton>
        </StyledActions>
      </StyledSectionHeader>

      {records.length === 0 ? (
        <StyledEmpty>No {title.toLowerCase()}</StyledEmpty>
      ) : (
        <StyledRecordsList>
          {records.map((record) => {
            const id = String(record[idKey]);
            const name = getRecordTitle(record);
            const initials = getInitials(name);
            const color = getAvatarColor(id);

            return (
              <StyledRecordChip
                key={id}
                onClick={() =>
                  onRecordClick
                    ? onRecordClick(basePath, id)
                    : navigate(`${basePath}/${id}`)
                }
              >
                <StyledRecordAvatar bgColor={color}>
                  {initials}
                </StyledRecordAvatar>
                <StyledRecordName>{name}</StyledRecordName>
                <StyledRecordChevron>
                  <IconChevronDown size={theme.icon.size.sm} />
                </StyledRecordChevron>
              </StyledRecordChip>
            );
          })}
        </StyledRecordsList>
      )}
    </StyledSectionWrapper>
  );
};

// Helper for rendering Tag in related tables
export const renderTag = (value: unknown) => {
  const str = String(value ?? '');
  if (!str) return '—';
  const lower = str.toLowerCase();
  let color: 'green' | 'red' | 'orange' | 'blue' | 'gray' = 'gray';
  if (
    lower.includes('active') ||
    lower.includes('occupied') ||
    lower.includes('paid') ||
    lower.includes('credit') ||
    lower.includes('closed')
  )
    color = 'green';
  else if (
    lower.includes('churned') ||
    lower.includes('blocked') ||
    lower.includes('debit') ||
    lower.includes('dead') ||
    lower.includes('terminated')
  )
    color = 'red';
  else if (
    lower.includes('pending') ||
    lower.includes('progress') ||
    lower.includes('maintenance') ||
    lower.includes('waiting')
  )
    color = 'orange';
  else if (
    lower.includes('available') ||
    lower.includes('new') ||
    lower.includes('lead') ||
    lower.includes('open')
  )
    color = 'blue';
  return <Tag color={color} text={str} />;
};

export const renderCurrency = (value: unknown) => {
  if (typeof value !== 'number') return '—';
  return '₹' + value.toLocaleString('en-IN');
};
