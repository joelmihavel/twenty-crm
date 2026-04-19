import { styled } from '@linaria/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { IconMoon, IconSearch, IconSun } from 'twenty-ui/display';

import { HawkeyeNavigationDrawer } from './HawkeyeNavigationDrawer';
import { HawkeyeCommandPalette } from './HawkeyeCommandPalette';
import { useColorScheme } from './HawkeyeProviders';

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
  flex-direction: column;
  overflow: hidden;
`;

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: 40px;
  justify-content: flex-end;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledSearchButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  height: 28px;
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: background-color 0.1s ease, border-color 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.font.color.tertiary};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledKbd = styled.kbd`
  background: ${themeCssVariables.background.transparent.medium};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 3px;
  color: ${themeCssVariables.font.color.light};
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  padding: 2px 4px;
`;

const StyledThemeToggle = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
  width: 28px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const HawkeyeLayout = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { theme } = useContext(ThemeContext);

  const handleOpen = useCallback(() => setIsCommandPaletteOpen(true), []);
  const handleClose = useCallback(() => setIsCommandPaletteOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <StyledLayout>
      <StyledPageContainer>
        <StyledNavigationDrawerWrapper>
          <HawkeyeNavigationDrawer />
        </StyledNavigationDrawerWrapper>
        <StyledMainContainer>
          <StyledTopBar>
            <StyledSearchButton onClick={handleOpen}>
              <IconSearch size={14} />
              Search
              <StyledKbd>⌘K</StyledKbd>
            </StyledSearchButton>
            <StyledThemeToggle
              onClick={toggleColorScheme}
              title={
                colorScheme === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
              }
            >
              {colorScheme === 'light' ? (
                <IconMoon size={14} />
              ) : (
                <IconSun size={14} />
              )}
            </StyledThemeToggle>
          </StyledTopBar>
          <StyledContentWrapper>
            <Outlet />
          </StyledContentWrapper>
        </StyledMainContainer>
      </StyledPageContainer>

      <HawkeyeCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={handleClose}
      />
    </StyledLayout>
  );
};
