import { TColorScheme } from "../../types";
import { ThemeType } from "../../themes";

export interface ThemeProviderProps {
  /** Applies a theme to all children components */
  theme: ThemeType;
  /** Applies a currentColorScheme to all children components */
  currentColorScheme: TColorScheme;
  /** Child elements */
  children: React.ReactNode;
}
