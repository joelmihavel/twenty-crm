import { styled } from '@linaria/react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { Checkbox } from 'twenty-ui/input';
import { MenuItem, RoundedLink } from 'twenty-ui/navigation';
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCurrencyRupee,
  IconEyeOff,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from 'twenty-ui/display';

import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';

import { type HawkeyeColumn } from '../types/entities';

const MIN_COLUMN_WIDTH = 80;
const CHECKBOX_COLUMN_WIDTH = 32;

// ── Outer scroll wrapper (horizontal only — vertical scroll is handled by parent) ──
const StyledScrollContainer = styled.div`
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
`;

// Inner table — sized by columns, can be wider than viewport
const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100%;
  position: relative;
  width: fit-content;
`;

// ── Sticky header row ────────────────────────────────────────────
const StyledHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: 0;
  z-index: 5;
`;

// Wrap header cells for relative positioning of resize handle + dropdown
const StyledHeaderCellWrapper = styled.div`
  position: relative;

  &:last-child {
    border-right: none;
  }
`;

// Column resize handle
const StyledResizeHandle = styled.div`
  cursor: col-resize;
  height: 100%;
  position: absolute;
  right: -2px;
  top: 0;
  width: 5px;
  z-index: 1;

  &:hover {
    background: ${themeCssVariables.color.blue};
    opacity: 0.4;
  }

  &:active {
    background: ${themeCssVariables.color.blue};
    opacity: 0.6;
  }
`;

// Header icon wrapper
const StyledHeaderIcon = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

// Sort direction indicator
const StyledSortIndicator = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

// ── Checkbox column cells ────────────────────────────────────────
const StyledCheckboxCell = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: ${CHECKBOX_COLUMN_WIDTH}px;
`;

const StyledCheckboxHeaderCell = styled(StyledCheckboxCell)`
  border-right: 1px solid ${themeCssVariables.border.color.light};
`;

// ── Column header dropdown ───────────────────────────────────────
const StyledDropdownOverlay = styled.div`
  backdrop-filter: ${themeCssVariables.blur.medium};
  background: ${themeCssVariables.background.transparent.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  left: 0;
  min-width: 160px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]};
  position: absolute;
  top: 100%;
  z-index: 30;
`;

const StyledDropdownItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

// ── Filter bar ──────────────────────────────────────────────────
const StyledFilterBar = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 36px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  position: sticky;
  top: 32px;
  z-index: 4;
`;

const StyledFilterChip = styled.div`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.medium};
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
`;

const StyledFilterLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const StyledFilterInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 80px;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledFilterRemove = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 16px;
  justify-content: center;
  padding: 0;
  width: 16px;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

// ── Sort indicator chip in filter bar ────────────────────────────
const StyledSortChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

// ── Footer (aggregate bar) ───────────────────────────────────────
const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: row;
  position: sticky;
  bottom: 0;
  z-index: 5;
`;

const StyledFooterCell = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledFooterValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-left: ${themeCssVariables.spacing[1]};
`;

// ── Empty state ──────────────────────────────────────────────────
const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: 200px;
  justify-content: center;
  width: 100%;
`;

// ── Chip for first column (avatar + name) ─────────────────────────
const StyledChipCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledAvatar = styled.div<{ $color: string }>`
  align-items: center;
  background-color: ${({ $color }) => $color};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const StyledChipText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ── Types ────────────────────────────────────────────────────────

type SortDirection = 'asc' | 'desc';

type SortState = {
  columnKey: string;
  direction: SortDirection;
} | null;

type FilterState = Record<string, string>;

type HawkeyeTableProps<T> = {
  columns: HawkeyeColumn<T>[];
  data: T[];
  idKey: keyof T & string;
  basePath: string;
  onRowClick?: (record: T) => void;
  selectedId?: string | null;
};

// ── Formatters ───────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return '—';
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

// Avatar color palette (deterministic by first char)
const AVATAR_COLORS = [
  '#6941C6', '#3538CD', '#0E6027', '#C4320A', '#B42318',
  '#175CD3', '#363F72', '#C11574', '#026AA2', '#854708',
];

const getAvatarColor = (text: string) => {
  const code = text.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ── Sort comparator ─────────────────────────────────────────────

const compareValues = <T,>(
  a: T,
  b: T,
  key: keyof T & string,
  type: string | undefined,
  direction: SortDirection,
): number => {
  const aVal = a[key];
  const bVal = b[key];

  // Nulls always last
  if (aVal === null || aVal === undefined || aVal === '') return 1;
  if (bVal === null || bVal === undefined || bVal === '') return -1;

  let result: number;

  switch (type) {
    case 'number':
    case 'currency':
      result = (aVal as number) - (bVal as number);
      break;
    case 'date':
      result = new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
      break;
    case 'boolean':
      result = (aVal === bVal) ? 0 : (aVal ? -1 : 1);
      break;
    default:
      result = String(aVal).localeCompare(String(bVal), 'en', { sensitivity: 'base' });
  }

  return direction === 'desc' ? -result : result;
};

// ── Filter matcher ──────────────────────────────────────────────

const matchesFilter = <T,>(
  row: T,
  key: keyof T & string,
  type: string | undefined,
  filterValue: string,
): boolean => {
  const value = row[key];
  if (value === null || value === undefined || value === '') {
    return filterValue === '';
  }

  const search = filterValue.toLowerCase();

  switch (type) {
    case 'number':
    case 'currency':
      return String(value).includes(search);
    case 'boolean':
      return (
        (search === 'yes' && value === true) ||
        (search === 'no' && value === false) ||
        (search === 'true' && value === true) ||
        (search === 'false' && value === false) ||
        'yes'.startsWith(search) && value === true ||
        'no'.startsWith(search) && value === false
      );
    default:
      return String(value).toLowerCase().includes(search);
  }
};

// ── Styled cell sub-components ───────────────────────────────────

const StyledCurrencyCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 20px;
  overflow: hidden;
`;

const StyledCurrencyIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledDateCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ── Cell renderers ───────────────────────────────────────────────

const getInitials = (text: string) => {
  const parts = text.split(/[\s—\-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
};

const renderChipCell = (text: string) => {
  const initials = getInitials(text);
  return (
    <StyledChipCell>
      <StyledAvatar $color={getAvatarColor(text)}>{initials}</StyledAvatar>
      <StyledChipText>{text}</StyledChipText>
    </StyledChipCell>
  );
};

const renderCell = <T,>(row: T, col: HawkeyeColumn<T>, isFirstColumn: boolean) => {
  const value = row[col.key];

  if (value === null || value === undefined || value === '') {
    return <EllipsisDisplay>—</EllipsisDisplay>;
  }

  if (isFirstColumn && (col.type === 'text' || col.type === undefined)) {
    return renderChipCell(String(value));
  }

  switch (col.type) {
    case 'currency':
      return (
        <StyledCurrencyCell>
          <StyledCurrencyIcon>
            <IconCurrencyRupee size={14} />
          </StyledCurrencyIcon>
          {formatCurrency(value as number)}
        </StyledCurrencyCell>
      );
    case 'date':
      return <StyledDateCell>{formatDate(value as string)}</StyledDateCell>;
    case 'enum':
      return (
        <Tag
          color={getStatusColor(String(value))}
          text={String(value)}
          preventShrink
        />
      );
    case 'boolean':
      return <BooleanDisplay value={value as boolean} />;
    case 'number':
      return (
        <EllipsisDisplay>
          {typeof value === 'number'
            ? value.toLocaleString('en-IN')
            : String(value)}
        </EllipsisDisplay>
      );
    case 'email': {
      const str = String(value);
      return (
        <RoundedLink
          href={`mailto:${str}`}
          label={str}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    case 'phone': {
      const str = String(value);
      return (
        <RoundedLink
          href={`tel:${str}`}
          label={str}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    case 'url': {
      const str = String(value);
      return (
        <RoundedLink
          href={str.startsWith('http') ? str : `https://${str}`}
          label={str}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    default:
      return <EllipsisDisplay>{String(value)}</EllipsisDisplay>;
  }
};

// ── Column header dropdown component ────────────────────────────

const ColumnHeaderDropdown = ({
  onClose,
  columnIndex,
  totalColumns,
  onMoveLeft,
  onMoveRight,
  onHide,
  onFilter,
  onSort,
  currentSortDirection,
}: {
  onClose: () => void;
  columnIndex: number;
  totalColumns: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onHide: () => void;
  onFilter: () => void;
  onSort: () => void;
  currentSortDirection: SortDirection | null;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <StyledDropdownOverlay ref={dropdownRef}>
      <StyledDropdownItemsContainer>
        <MenuItem
          LeftIcon={IconFilter}
          text="Filter"
          onClick={() => { onFilter(); onClose(); }}
        />
        <MenuItem
          LeftIcon={currentSortDirection === 'asc' ? IconSortDescending : IconSortAscending}
          text={
            currentSortDirection === 'asc'
              ? 'Sort descending'
              : currentSortDirection === 'desc'
                ? 'Remove sort'
                : 'Sort ascending'
          }
          onClick={() => { onSort(); onClose(); }}
        />
        {columnIndex > 0 && (
          <MenuItem
            LeftIcon={IconArrowLeft}
            text="Move left"
            onClick={() => { onMoveLeft(); onClose(); }}
          />
        )}
        {columnIndex < totalColumns - 1 && (
          <MenuItem
            LeftIcon={IconArrowRight}
            text="Move right"
            onClick={() => { onMoveRight(); onClose(); }}
          />
        )}
        {columnIndex > 0 && (
          <MenuItem
            LeftIcon={IconEyeOff}
            text="Hide"
            onClick={() => { onHide(); onClose(); }}
          />
        )}
      </StyledDropdownItemsContainer>
    </StyledDropdownOverlay>
  );
};

// ── Main table component ─────────────────────────────────────────

export const HawkeyeTable = <T,>({
  columns: initialColumns,
  data,
  idKey,
  basePath,
  onRowClick,
  selectedId,
}: HawkeyeTableProps<T>) => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Mutable column order + visibility
  const [columns, setColumns] = useState(initialColumns);

  // Track column widths for resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialColumns.forEach((col) => {
      initial[col.key] = col.width ?? 150;
    });
    return initial;
  });

  // Row selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Sort state
  const [sort, setSort] = useState<SortState>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({});

  // Column header dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter input refs for auto-focus
  const filterInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Sort handler ──────────────────────────────────────────────
  const handleSort = useCallback((columnKey: string) => {
    setSort((prev) => {
      if (!prev || prev.columnKey !== columnKey) {
        return { columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { columnKey, direction: 'desc' };
      }
      return null;
    });
  }, []);

  // ── Filter handlers ───────────────────────────────────────────
  const handleAddFilter = useCallback((columnKey: string) => {
    setFilters((prev) => {
      if (columnKey in prev) return prev;
      return { ...prev, [columnKey]: '' };
    });
    // Focus the input after render
    requestAnimationFrame(() => {
      filterInputRefs.current[columnKey]?.focus();
    });
  }, []);

  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }));
  }, []);

  const handleRemoveFilter = useCallback((columnKey: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
  }, []);

  // ── Process data (filter → sort) ──────────────────────────────
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    const activeFilters = Object.entries(filters).filter(([, v]) => v.length > 0);
    if (activeFilters.length > 0) {
      result = result.filter((row) =>
        activeFilters.every(([key, filterValue]) => {
          const col = columns.find((c) => c.key === key);
          return matchesFilter(row, key as keyof T & string, col?.type, filterValue);
        }),
      );
    }

    // Apply sort
    if (sort) {
      const col = columns.find((c) => c.key === sort.columnKey);
      result.sort((a, b) =>
        compareValues(a, b, sort.columnKey as keyof T & string, col?.type, sort.direction),
      );
    }

    return result;
  }, [data, filters, sort, columns]);

  // ── Selection ─────────────────────────────────────────────────
  const allSelected = processedData.length > 0 && selectedRows.size === processedData.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map((row) => String(row[idKey]))));
    }
  }, [allSelected, processedData, idKey]);

  const handleSelectRow = useCallback((rowId: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  // ── Column operations ─────────────────────────────────────────
  const handleMoveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleHideColumn = useCallback((index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Resize ────────────────────────────────────────────────────
  const resizingRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (key: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columnWidths[key] ?? 150;
      resizingRef.current = { key, startX, startWidth };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const delta = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(
          MIN_COLUMN_WIDTH,
          resizingRef.current.startWidth + delta,
        );
        setColumnWidths((prev) => ({
          ...prev,
          [resizingRef.current!.key]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths],
  );

  // ── Layout helpers ────────────────────────────────────────────
  const gridTemplateColumns =
    `${CHECKBOX_COLUMN_WIDTH}px ` +
    columns
      .map((col, idx) => {
        if (idx === columns.length - 1) return '1fr';
        const width = columnWidths[col.key] ?? col.width ?? 150;
        return `${width}px`;
      })
      .join(' ');

  const buildColumnStyle = useCallback(
    (col: HawkeyeColumn<T>, isLast: boolean) => {
      const width = columnWidths[col.key] ?? col.width ?? 150;
      return {
        flex: isLast ? '1 1 0' : `0 0 ${width}px`,
        minWidth: isLast ? `${MIN_COLUMN_WIDTH}px` : `${width}px`,
        maxWidth: isLast ? undefined : `${width}px`,
      };
    },
    [columnWidths],
  );

  // ── Active filter/sort state for the bar ──────────────────────
  const hasActiveFilters = Object.keys(filters).length > 0;
  const hasActiveSort = sort !== null;
  const showBar = hasActiveFilters || hasActiveSort;

  if (data.length === 0) {
    return <StyledEmptyState>No records found</StyledEmptyState>;
  }

  return (
    <StyledScrollContainer>
      <StyledTableContainer>
        {/* ── Header row (sticky) ── */}
        <StyledHeaderRow>
          <StyledCheckboxHeaderCell>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
              hoverable
            />
          </StyledCheckboxHeaderCell>
          {columns.map((col, idx) => {
            const isLast = idx === columns.length - 1;
            const isSortedColumn = sort?.columnKey === col.key;
            return (
              <StyledHeaderCellWrapper
                key={col.key}
                style={buildColumnStyle(col, isLast)}
              >
                <TableHeader
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === col.key ? null : col.key,
                    )
                  }
                >
                  {col.Icon && (
                    <StyledHeaderIcon>
                      <col.Icon size={theme.icon.size.md} />
                    </StyledHeaderIcon>
                  )}
                  {col.label}
                  {isSortedColumn && (
                    <StyledSortIndicator>
                      {sort.direction === 'asc' ? (
                        <IconArrowUp size={14} />
                      ) : (
                        <IconArrowDown size={14} />
                      )}
                    </StyledSortIndicator>
                  )}
                </TableHeader>
                {openDropdown === col.key && (
                  <ColumnHeaderDropdown
                    columnIndex={idx}
                    totalColumns={columns.length}
                    onClose={() => setOpenDropdown(null)}
                    onMoveLeft={() => handleMoveColumn(idx, idx - 1)}
                    onMoveRight={() => handleMoveColumn(idx, idx + 1)}
                    onHide={() => handleHideColumn(idx)}
                    onFilter={() => handleAddFilter(col.key)}
                    onSort={() => handleSort(col.key)}
                    currentSortDirection={
                      sort?.columnKey === col.key ? sort.direction : null
                    }
                  />
                )}
                {!isLast && (
                  <StyledResizeHandle
                    onMouseDown={(e) => handleResizeStart(col.key, e)}
                  />
                )}
              </StyledHeaderCellWrapper>
            );
          })}
        </StyledHeaderRow>

        {/* ── Filter / sort bar ── */}
        {showBar && (
          <StyledFilterBar>
            {/* Sort chip */}
            {hasActiveSort && sort && (
              <StyledSortChip>
                {sort.direction === 'asc' ? (
                  <IconArrowUp size={12} />
                ) : (
                  <IconArrowDown size={12} />
                )}
                {columns.find((c) => c.key === sort.columnKey)?.label ?? sort.columnKey}
                <StyledFilterRemove onClick={() => setSort(null)}>
                  <IconX size={10} />
                </StyledFilterRemove>
              </StyledSortChip>
            )}

            {/* Filter chips */}
            {Object.keys(filters).map((key) => {
              const col = columns.find((c) => c.key === key);
              return (
                <StyledFilterChip key={key}>
                  <StyledFilterLabel>
                    {col?.label ?? key} contains
                  </StyledFilterLabel>
                  <StyledFilterInput
                    ref={(el) => { filterInputRefs.current[key] = el; }}
                    value={filters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    placeholder="type..."
                    autoFocus
                  />
                  <StyledFilterRemove onClick={() => handleRemoveFilter(key)}>
                    <IconX size={10} />
                  </StyledFilterRemove>
                </StyledFilterChip>
              );
            })}
          </StyledFilterBar>
        )}

        {/* ── Data rows ── */}
        {processedData.length === 0 ? (
          <StyledEmptyState>No records match the current filters</StyledEmptyState>
        ) : (
          processedData.map((row) => {
            const rowId = String(row[idKey]);
            return (
              <TableRow
                key={rowId}
                isSelected={
                  selectedRows.has(rowId) || selectedId === rowId
                }
                gridTemplateColumns={gridTemplateColumns}
              >
                <StyledCheckboxCell
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRow(rowId);
                  }}
                >
                  <Checkbox
                    checked={selectedRows.has(rowId)}
                    hoverable
                  />
                </StyledCheckboxCell>
                {columns.map((col, idx) => (
                  <TableCell
                    key={col.key}
                    color={themeCssVariables.font.color.primary}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    clickable
                    onClick={() =>
                      onRowClick
                        ? onRowClick(row)
                        : navigate(
                            `${basePath}/${encodeURIComponent(rowId)}`,
                          )
                    }
                  >
                    {renderCell(row, col, idx === 0)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}

        {/* ── Footer (aggregate bar) ── */}
        <StyledFooter>
          <StyledFooterCell
            style={{ flex: '0 0 auto', minWidth: `${CHECKBOX_COLUMN_WIDTH}px` }}
          />
          <StyledFooterCell style={{ flex: 1 }}>
            Count all <StyledFooterValue>{processedData.length}</StyledFooterValue>
            {processedData.length !== data.length && (
              <StyledFilterLabel style={{ marginLeft: '8px' }}>
                of {data.length}
              </StyledFilterLabel>
            )}
          </StyledFooterCell>
        </StyledFooter>
      </StyledTableContainer>
    </StyledScrollContainer>
  );
};
