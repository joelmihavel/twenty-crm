import { useState, useCallback } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';

import { type HawkeyeColumn, type FieldGroup } from '../types/entities';
import { HawkeyeTable } from './HawkeyeTable';
import { HawkeyeSidePanel } from './HawkeyeSidePanel';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

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

// Matches PageBody > StyledLeftContainer
const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
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
}: HawkeyeListPageProps<T>) => {
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const handleRowClick = useCallback((record: T) => {
    setSelectedRecord((prev) =>
      prev && String((prev as Record<string, unknown>)[idKey]) === String((record as Record<string, unknown>)[idKey])
        ? null
        : record,
    );
  }, [idKey]);

  const handleClosePanel = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  return (
    <StyledPageContainer>
      <PageHeader title={title} Icon={Icon}>
        <StyledCount>{data.length}</StyledCount>
      </PageHeader>
      <StyledMainContainer>
        <StyledLeftContainer>
          <PagePanel>
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
          </PagePanel>
        </StyledLeftContainer>
        <HawkeyeSidePanel
          record={selectedRecord}
          title={selectedRecord ? titleFn(selectedRecord) : ''}
          fieldGroups={fieldGroups}
          onClose={handleClosePanel}
        />
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
