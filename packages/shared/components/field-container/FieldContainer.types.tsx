import { TTooltipPlace } from "../tooltip";

export interface FieldContainerProps {
  /** Vertical or horizontal alignment */
  isVertical?: boolean;
  /** Remove default margin property */
  removeMargin?: boolean;
  /** Accepts class */
  className?: string;
  /** Indicates that the field is required to fill */
  isRequired?: boolean;
  /** Indicates that the field is incorrect */
  hasError?: boolean;
  /** Sets visibility of the field label section */
  labelVisible?: boolean;
  /** Field label text or element */
  labelText?: string | React.ReactNode;
  /** Icon source */
  icon?: string;
  /** Renders the help button inline instead of the separate div */
  inlineHelpButton?: boolean;
  /** Children elements */
  children: React.ReactNode;
  /** Tooltip content */
  tooltipContent?: string | React.ReactNode;
  /** Sets the global position of the tooltip */
  place?: TTooltipPlace;
  /** Tooltip header content (tooltip opened in aside) */
  helpButtonHeaderContent?: string;
  /** Max label width in horizontal alignment */
  maxLabelWidth?: string;
  /** Error message text */
  errorMessage?: string;
  /** Error text color */
  errorColor?: string;
  /** Error text width */
  errorMessageWidth?: string;
  /** Accepts id  */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Specifies the offset */
  offsetRight?: number;
  /** Sets the maximum width of the tooltip  */
  tooltipMaxWidth?: string;
  tooltipClass?: string;
}
