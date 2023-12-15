import { TColorScheme } from "../../themes";
import { FloatingButtonIcons } from "./FloatingButton.enums";

export interface FloatingButtonProps {
  /** Accepts id */
  id?: string;
  /** Accepts class */
  className?: string;
  /** Accepts CSS style */
  style?: React.CSSProperties;
  /** Sets the icon on the button */
  icon: FloatingButtonIcons;
  /** Displays the alert */
  alert?: boolean;
  /** Loading indicator */
  percent: number;
  /**  Sets a callback function that is triggered when the button is clicked */
  onClick?: () => void;
  /** CSS color */
  color?: string;
  clearUploadedFilesHistory?: () => void;
  showTwoProgress?: boolean;
}

export interface DefaultStylesProps {
  color?: string;
  displayProgress: boolean;
  $currentColorScheme?: TColorScheme;
}

export interface FloatingButtonThemeProps extends FloatingButtonProps {
  ref: React.LegacyRef<HTMLDivElement>;
  $currentColorScheme?: TColorScheme;
  icon: FloatingButtonIcons;
  displayProgress: boolean;
}
