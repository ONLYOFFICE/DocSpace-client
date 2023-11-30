import { TColorScheme } from "../../themes";
import { ButtonSize } from "./Button.enums";

export interface ButtonProps {
  /** Button text */
  label: string;
  title?: string;
  /** Sets the button primary */
  primary?: boolean;
  /** Size of the button.
   The normal size equals 36px and 40px in height on the Desktop and Touchcreen devices. */
  size: ButtonSize;
  /** Scales the width of the button to 100% */
  scale?: boolean;
  /** Icon node element */
  icon?: React.ReactNode;
  /** Button tab index */
  tabIndex?: number;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts CSS style */
  style?: React.CSSProperties;
  /** Sets the button to show a hovered state */
  isHovered?: boolean;
  /** Disable hover effect */
  disableHover?: boolean;
  /** Sets the button to show a clicked state */
  isClicked?: boolean;
  /** Sets the button to show a disabled state */
  isDisabled?: boolean;
  /** Sets a button to show a loader icon */
  isLoading?: boolean;
  /** Sets the minimal button width */
  minWidth?: string;
  /** Sets the action initiated upon clicking the button */
  onClick?: () => void;
}

export interface ButtonThemeProps extends ButtonProps {
  ref: React.LegacyRef<HTMLButtonElement>;
  $currentColorScheme?: TColorScheme;
  interfaceDirection?: string;
}
