import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from 'twenty-ui/theme-constants';

type ColorSchemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
};

export const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: 'light',
  toggleColorScheme: () => {},
});

export const useColorScheme = () => useContext(ColorSchemeContext);

export const HawkeyeProviders = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const toggleColorScheme = () =>
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      <ThemeProvider colorScheme={colorScheme}>
        <Outlet />
      </ThemeProvider>
    </ColorSchemeContext.Provider>
  );
};
