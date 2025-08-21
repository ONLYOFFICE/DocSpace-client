import { IconButtonProps } from "../icon-button/IconButton.types";
import { TTooltipPlace, TooltipProps } from "../tooltip/Tooltip.types";

export type HelpButtonProps = Omit<IconButtonProps, "tooltipContent"> & {
  /** Displays the child elements */
  children?: React.ReactNode;
  /** Sets the unique identifier for the component. */
  id?: string;
  /** Sets the data-tip attribute for the component. */
  dataTip?: string;
  /** Function to retrieve the content of the tooltip. */
  getContent?: () => React.ReactNode;
  /** Position of the tooltip relative to the target element. */
  place?: TTooltipPlace;
  /** Offset distance for the tooltip from the target element. */
  offset?: number;
  /** Custom styles for the component. */
  style?: React.CSSProperties;
  /** Function called after the tooltip is shown. */
  afterShow?: () => void;
  /** Function called after the tooltip is hidden. */
  afterHide?: () => void;
  /** Sets the unique identifier for the tooltip. */
  tooltipId?: string;
  /** Maximum width of the tooltip. */
  tooltipMaxWidth?: string;
  /** Content of the tooltip. */
  tooltipContent?: React.ReactNode;
  /** Additional properties for the tooltip. */
  tooltipProps?: TooltipProps;
  /** Whether to open the tooltip on click. */
  openOnClick?: boolean;
  /** Top offset distance for tooltip positioning. */
  offsetTop?: number;
  /** Right offset distance for tooltip positioning. */
  offsetRight?: number;
  /** Bottom offset distance for tooltip positioning. */
  offsetBottom?: number;
  /** Left offset distance for tooltip positioning. */
  offsetLeft?: number;
  isOpen?: boolean;
  noUserSelect?: boolean;
  /** Sets the data-testid attribute for the component. */
  dataTestId?: string;
};
