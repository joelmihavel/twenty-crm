import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { HawkeyeNavigationDrawer } from './HawkeyeNavigationDrawer';

const StyledLayout = styled.div`
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;

  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: 4px;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

const StyledPageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
`;

const StyledNavigationDrawerWrapper = styled.div`
  flex-shrink: 0;
`;

const StyledMainContainer = styled.div`
  display: flex;
  flex: 0 1 100%;
  overflow: hidden;
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const HawkeyeLayout = () => {
  return (
    <StyledLayout>
      <StyledPageContainer>
        <StyledNavigationDrawerWrapper>
          <HawkeyeNavigationDrawer />
        </StyledNavigationDrawerWrapper>
        <StyledMainContainer>
          <StyledContentWrapper>
            <Outlet />
          </StyledContentWrapper>
        </StyledMainContainer>
      </StyledPageContainer>
    </StyledLayout>
  );
};
