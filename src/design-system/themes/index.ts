import { colors, spacing, typography } from '../tokens';

export interface ThemeConfig {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
}

export const lightTheme: ThemeConfig = {
  colors,
  spacing,
  typography,
};

export const darkTheme: ThemeConfig = {
  colors: {
    ...colors,
    // Dark theme color overrides will be added here
  },
  spacing,
  typography,
};

export const defaultTheme = lightTheme;