import { TDirectionX, TDirectionY } from "../../types";
import { ContextMenuModel } from "../context-menu";
import { ContextMenuButtonDisplayType } from "./ContextMenuButton.enums";

export interface ContextMenuButtonProps {
  /** Sets the button to present an opened state */
  opened?: boolean;
  /** Array of options for display */
  data: ContextMenuModel[];
  /** Function for converting to inner data */
  getData: () => ContextMenuModel[];
  /** Specifies the icon title */
  title?: string;
  /** Specifies the icon name */
  iconName?: string;
  /** Specifies the icon size */
  size?: number;
  /** Specifies the icon color */
  color?: string;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Specifies the icon hover color */
  hoverColor?: string;
  /** Specifies the icon click color */
  clickColor?: string;
  /** Specifies the icon hover name */
  iconHoverName?: string;
  /** Specifies the icon click name */
  iconClickName?: string;
  /** Specifies the icon open name */
  iconOpenName?: string;
  /** Triggers a callback function when the mouse enters the button borders */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse leaves the button borders */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse moves over the button borders */
  onMouseOver?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse moves out of the button borders */
  onMouseOut?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  /** Direction X */
  directionX?: TDirectionX;
  /** Direction Y */
  directionY?: TDirectionY;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets the number of columns */
  columnCount?: number;
  /** Sets the display type */
  displayType: ContextMenuButtonDisplayType;
  /** Closing event */
  onClose?: () => void;
  /** Sets the drop down open with the portal */
  usePortal?: boolean;
  /** Sets the class of the drop down element */
  dropDownClassName?: string;
  /** Sets the class of the icon button */
  iconClassName?: string;
  /** Enables displaying the icon borders  */
  displayIconBorder?: boolean;
  isFill?: boolean;
  zIndex?: number;
  asideHeader?: React.ReactNode;
}
