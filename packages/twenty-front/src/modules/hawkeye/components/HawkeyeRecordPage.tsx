import { useParams, Navigate } from 'react-router-dom';
import { styled } from '@linaria/react';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldGroup } from '../types/entities';
import { HawkeyeDetailView } from './HawkeyeDetailView';

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
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  width: 100%;
`;

type HawkeyeRecordPageProps<T> = {
  data: T[];
  idKey: keyof T & string;
  titleFn: (record: T) => string;
  fieldGroups: FieldGroup<T>[];
  basePath: string;
};

export const HawkeyeRecordPage = <T,>({
  data,
  idKey,
  titleFn,
  fieldGroups,
  basePath,
}: HawkeyeRecordPageProps<T>) => {
  const params = useParams<{ id: string }>();

  const record = data.find(
    (r) => String(r[idKey]) === decodeURIComponent(params.id ?? ''),
  );

  if (!record) {
    return <Navigate to={basePath} replace />;
  }

  return (
    <StyledPageContainer>
      <PageHeader title={titleFn(record)} />
      <StyledMainContainer>
        <StyledLeftContainer>
          <PagePanel>
            <HawkeyeDetailView
              record={record}
              title={titleFn(record)}
              fieldGroups={fieldGroups}
              backPath={basePath}
              variant="page"
            />
          </PagePanel>
        </StyledLeftContainer>
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
