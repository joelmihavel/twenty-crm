import { styled } from '@linaria/react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import { Checkbox } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from 'twenty-ui/display';

import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';

import { type HawkeyeColumn } from '../types/entities';

const MIN_COLUMN_WIDTH = 80;
const CHECKBOX_COLUMN_WIDTH = 32;

// ── Outer scroll wrapper ──────────────────────────────────────────
const StyledScrollContainer = styled.div`
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
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

// ── Cell renderers ───────────────────────────────────────────────

const renderChipCell = (text: string) => {
  const initial = text.charAt(0).toUpperCase();
  return (
    <StyledChipCell>
      <StyledAvatar $color={getAvatarColor(text)}>{initial}</StyledAvatar>
      <StyledChipText>{text}</StyledChipText>
    </StyledChipCell>
  );
};

const renderCell = <T,>(row: T, col: HawkeyeColumn<T>, isFirstColumn: boolean) => {
  const value = row[col.key];

  if (value === null || value === undefined || value === '') return '—';

  if (isFirstColumn && (col.type === 'text' || col.type === undefined)) {
    return renderChipCell(String(value));
  }

  switch (col.type) {
    case 'currency':
      return formatCurrency(value as number);
    case 'date':
      return formatDate(value as string);
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

// ── Column header dropdown component ────────────────────────────

const ColumnHeaderDropdown = ({
  onClose,
  columnIndex,
  totalColumns,
  onMoveLeft,
  onMoveRight,
  onHide,
}: {
  onClose: () => void;
  columnIndex: number;
  totalColumns: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onHide: () => void;
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
        <MenuItem LeftIcon={IconFilter} text="Filter" onClick={onClose} />
        <MenuItem LeftIcon={IconSortDescending} text="Sort" onClick={onClose} />
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
  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => String(row[idKey]))));
    }
  }, [allSelected, data, idKey]);

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

  // Column header dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // Resize state
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

  // Build gridTemplateColumns for data rows
  const gridTemplateColumns =
    `${CHECKBOX_COLUMN_WIDTH}px ` +
    columns
      .map((col, idx) => {
        if (idx === columns.length - 1) return '1fr';
        const width = columnWidths[col.key] ?? col.width ?? 150;
        return `${width}px`;
      })
      .join(' ');

  // Build style for a header cell
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
                </TableHeader>
                {openDropdown === col.key && (
                  <ColumnHeaderDropdown
                    columnIndex={idx}
                    totalColumns={columns.length}
                    onClose={() => setOpenDropdown(null)}
                    onMoveLeft={() => handleMoveColumn(idx, idx - 1)}
                    onMoveRight={() => handleMoveColumn(idx, idx + 1)}
                    onHide={() => handleHideColumn(idx)}
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

        {/* ── Data rows ── */}
        {data.map((row) => {
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
        })}

        {/* ── Footer (aggregate bar) ── */}
        <StyledFooter>
          <StyledFooterCell
            style={{ flex: '0 0 auto', minWidth: `${CHECKBOX_COLUMN_WIDTH}px` }}
          />
          <StyledFooterCell style={{ flex: 1 }}>
            Count all <StyledFooterValue>{data.length}</StyledFooterValue>
          </StyledFooterCell>
        </StyledFooter>
      </StyledTableContainer>
    </StyledScrollContainer>
  );
};
