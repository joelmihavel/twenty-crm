import { useState, useCallback, type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';

import { type HawkeyeColumn, type FieldGroup } from '../types/entities';
import { HawkeyeTable } from './HawkeyeTable';
import { HawkeyeSidePanel } from './HawkeyeSidePanel';
import { ViewToggle, type ViewMode } from '@/hawkeye/components/ViewToggle';
import { HawkeyeBoardView, type BoardColumn, type BoardCardField, type BoardCardTag } from '@/hawkeye/components/HawkeyeBoardView';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';


const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-left: 0;
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const StyledTablePanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
`;

type HawkeyeListPageProps<T> = {
  title: string;
  Icon: IconComponent;
  iconColor?: string;
  columns: HawkeyeColumn<T>[];
  data: T[];
  idKey: keyof T & string;
  basePath: string;
  fieldGroups: FieldGroup<T>[];
  titleFn: (record: T) => string;
  onRowClick?: (record: T) => void;
  headerExtra?: ReactNode;
  boardColumns?: BoardColumn[];
  boardStatusKey?: keyof T & string;
  boardCardFields?: (record: T) => BoardCardField[];
  boardCardTags?: (record: T) => BoardCardTag[];
  renderRelations?: (record: T, onRecordClick: (basePath: string, recordId: string) => void) => ReactNode;
  renderCharts?: () => ReactNode;
  renderActions?: (record: T, onFieldChange: (key: string, value: unknown) => void) => ReactNode;
};

export const HawkeyeListPage = <T,>({
  title,
  Icon,
  iconColor,
  columns,
  data: initialData,
  idKey,
  basePath,
  fieldGroups,
  titleFn,
  onRowClick: onRowClickOverride,
  headerExtra,
  boardColumns,
  boardStatusKey,
  boardCardFields,
  boardCardTags,
  renderRelations,
  renderCharts,
  renderActions,
}: HawkeyeListPageProps<T>) => {
  const [data, setData] = useState(initialData);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleRowClick = useCallback((record: T) => {
    if (onRowClickOverride) {
      onRowClickOverride(record);
      return;
    }
    setSelectedRecord((prev) =>
      prev && String((prev as Record<string, unknown>)[idKey]) === String((record as Record<string, unknown>)[idKey])
        ? null
        : record,
    );
  }, [idKey, onRowClickOverride]);

  const handleClosePanel = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      setSelectedRecord((prev) => {
        if (!prev) return prev;
        const recordId = String((prev as Record<string, unknown>)[idKey]);
        setData((prevData) =>
          prevData.map((r) =>
            String((r as Record<string, unknown>)[idKey]) === recordId
              ? { ...r, [key]: value }
              : r,
          ) as T[],
        );
        return { ...prev, [key]: value } as T;
      });
    },
    [idKey],
  );

  const handleCellChange = useCallback(
    (recordId: string, key: string, value: unknown) => {
      setData((prev) =>
        prev.map((r) =>
          String((r as Record<string, unknown>)[idKey]) === recordId
            ? { ...r, [key]: value }
            : r,
        ) as T[],
      );
      // Keep sidebar in sync if the edited record is selected
      setSelectedRecord((prev) => {
        if (!prev) return prev;
        if (String((prev as Record<string, unknown>)[idKey]) === recordId) {
          return { ...prev, [key]: value } as T;
        }
        return prev;
      });
    },
    [idKey],
  );

  const renderSidePanel = () => (
    <HawkeyeSidePanel
      record={selectedRecord}
      title={selectedRecord ? titleFn(selectedRecord) : ''}
      fieldGroups={fieldGroups}
      onClose={handleClosePanel}
      renderRelations={renderRelations}
      basePath={basePath}
      onFieldChange={handleFieldChange}
      renderActions={renderActions ? (rec: T) => renderActions(rec, handleFieldChange) : undefined}
    />
  );

  return (
    <StyledPageContainer>
      <PageHeader
        title={title}
        Icon={iconColor ? () => <NavigationMenuItemStyleIcon Icon={Icon} color={iconColor} /> : Icon}
      >
        {boardColumns && (
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        )}
        {headerExtra}
      </PageHeader>
      <StyledMainContainer>
        {viewMode === 'list' ? (
          <>
            <StyledLeftContainer>
              {renderCharts?.()}
              <StyledTablePanel>
                <HawkeyeTable
                  columns={columns}
                  data={data}
                  idKey={idKey}
                  basePath={basePath}
                  onRowClick={handleRowClick}
                  selectedId={
                    selectedRecord
                      ? String((selectedRecord as Record<string, unknown>)[idKey])
                      : null
                  }
                  onCellChange={handleCellChange}
                />
              </StyledTablePanel>
            </StyledLeftContainer>
            {renderSidePanel()}
          </>
        ) : (
          <>
            <StyledLeftContainer>
              {renderCharts?.()}
              <HawkeyeBoardView
                data={data}
                columns={boardColumns!}
                statusKey={boardStatusKey!}
                idKey={idKey}
                basePath={basePath}
                titleFn={titleFn}
                cardFields={boardCardFields}
                cardTags={boardCardTags}
                onCardClick={handleRowClick}
              />
            </StyledLeftContainer>
            {renderSidePanel()}
          </>
        )}
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
