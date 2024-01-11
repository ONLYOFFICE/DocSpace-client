import { TTooltipPlace, TooltipProps } from "../tooltip/Tooltip.types";

export interface HelpButtonProps {
  /** Displays the child elements  */
  children?: React.ReactNode;
  /** Sets the tooltip content  */
  tooltipContent: string | React.ReactNode;
  /** Required to set additional properties of the tooltip */
  tooltipProps?: TooltipProps;
  /** Sets the maximum width of the tooltip  */
  tooltipMaxWidth?: string;
  /** Sets the tooltip id */
  tooltipId?: string;
  /** Global tooltip placement */
  place?: TTooltipPlace;
  /** Specifies the icon name */
  iconName?: string;
  /** Icon color */
  color?: string;
  /** The data-* attribute is used to store custom data private to the page or application. Required to display a tip over the hovered element */
  dataTip?: string;
  /** Sets a callback function that generates the tip content dynamically */
  getContent?: () => string | React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Button height and width value */
  size?: number;
  offset?: number;
  afterShow?: () => void;
  afterHide?: () => void;
  offsetTop?: number;
  offsetRight?: number;
  offsetBottom?: number;
  offsetLeft?: number;
}
