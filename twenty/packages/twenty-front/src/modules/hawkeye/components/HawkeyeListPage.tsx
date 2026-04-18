import { useState, useCallback, type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { type HawkeyeColumn, type FieldGroup } from '../types/entities';
import { HawkeyeTable } from './HawkeyeTable';
import { HawkeyeSidePanel } from './HawkeyeSidePanel';
import { ViewToggle, type ViewMode } from '@/hawkeye/components/ViewToggle';
import { HawkeyeBoardView, type BoardColumn, type BoardCardField, type BoardCardTag } from '@/hawkeye/components/HawkeyeBoardView';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';


// Wraps PageContainer to ensure it fills available height
const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

// Matches PageBody > StyledMainContainer exactly
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

// Matches PageBody > StyledLeftContainer — this is the scroll parent
const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

// Table panel — same visuals as PagePanel but sized to content so
// the parent StyledLeftContainer handles vertical scroll
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
  /** Summary charts shown above the board/table view */
  renderCharts?: () => ReactNode;
};

export const HawkeyeListPage = <T,>({
  title,
  Icon,
  columns,
  data,
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
}: HawkeyeListPageProps<T>) => {
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

  return (
    <StyledPageContainer>
      <PageHeader title={title} Icon={Icon}>
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
                />
              </StyledTablePanel>
            </StyledLeftContainer>
            <HawkeyeSidePanel
              record={selectedRecord}
              title={selectedRecord ? titleFn(selectedRecord) : ''}
              fieldGroups={fieldGroups}
              onClose={handleClosePanel}
              renderRelations={renderRelations}
              basePath={basePath}
            />
          </>
        ) : (
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
            />
          </StyledLeftContainer>
        )}
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
