import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

// Returns a consistent color palette derived from Twenty's theme tokens.
// Use these values for every stroke, fill, and axis color in every chart.
// When the theme switches (light ↔ dark), charts re-render with the correct palette automatically.
export function useChartColors() {
  const { theme } = useContext(ThemeContext);

  return {
    // Series colors — use in order for multi-series charts
    blue: theme.color.blue,
    green: theme.color.green,
    orange: theme.color.orange,
    red: theme.color.red,
    purple: theme.color.purple,
    sky: theme.color.sky,
    yellow: theme.color.yellow,
    gray: theme.color.gray,
    turquoise: theme.color.turquoise,
    pink: theme.color.pink,

    // Chart structure
    gridStroke: theme.border.color.medium,
    axisStroke: theme.font.color.tertiary,
    axisLine: theme.border.color.medium,
    tooltipBg: theme.background.primary,
    tooltipBorder: theme.border.color.medium,
    tooltipText: theme.font.color.primary,
    legendText: theme.font.color.secondary,
    background: 'transparent',
  };
}
