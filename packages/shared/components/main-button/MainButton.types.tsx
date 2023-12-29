import { ContextMenuModel } from "../context-menu";

export interface MainButtonProps {
  /** Button text */
  text?: string;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Activates a drop-down list for MainButton */
  isDropdown?: boolean;
  /** Sets a callback function that is triggered when the button is clicked */
  onAction?: (e: React.MouseEvent) => void;
  /** Opens DropDown */
  opened?: boolean; // TODO: Make us whole
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Data model menu */
  model: ContextMenuModel[];
}

export interface MainButtonThemeProps extends MainButtonProps {
  onClick?: (e: React.MouseEvent) => void;
}
