import { TColorScheme } from "../../types";
import { TTheme } from "../../themes";

export interface ThemeProviderProps {
  /** Applies a theme to all children components */
  theme: TTheme;
  /** Applies a currentColorScheme to all children components */
  currentColorScheme: TColorScheme;
  /** Child elements */
  children: React.ReactNode;
}
