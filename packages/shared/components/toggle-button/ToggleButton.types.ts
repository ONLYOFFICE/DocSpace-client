import { TColorScheme } from "../../types";
import { ThemeType } from "../../themes";

export interface ToggleIconProps {
  isChecked?: boolean;
  isLoading?: boolean;
  noAnimation: boolean;
}

export interface ToggleButtonProps {
  /** Returns the value indicating that the toggle button is enabled. */
  isChecked: boolean;
  /** Disables the ToggleButton */
  isDisabled?: boolean;
  /** Sets a callback function that is triggered when the ToggleButton is clicked */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label of the input  */
  label?: string;
  /** Sets component id */
  id?: string;
  /** Class name */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Disable toggle button animation */
  noAnimation?: boolean;
  /** Set loading state */
  isLoading?: boolean;
}

export interface StyledToggleButtonProps {
  isChecked?: boolean;
  isDisabled?: boolean;
  theme: ThemeType;
}

export interface ContainerToggleButtonThemeProps {
  $currentColorScheme?: TColorScheme;
  isChecked?: boolean;
  isDisabled?: boolean;
}

export interface ToggleButtomThemeProps
  extends Omit<ContainerToggleButtonThemeProps, "$currentColorScheme"> {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
