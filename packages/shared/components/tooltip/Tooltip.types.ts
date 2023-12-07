export type TTooltipPlace =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export type TFallbackAxisSideDirection = "none" | "start" | "end";

export type TGetTooltipContent = {
  content: string | null;
  activeAnchor: HTMLElement | null;
};

export interface TooltipProps {
  /** Used as HTML id property  */
  id?: string;
  /** Global tooltip placement */
  place?: TTooltipPlace;
  /** Whether to allow fallback to the perpendicular axis of the preferred placement, and if so, which side direction along the axis to prefer. */
  fallbackAxisSideDirection?: TFallbackAxisSideDirection;
  /** Sets a callback function that generates the tip content dynamically */
  getContent?: ({
    content,
    activeAnchor,
  }: TGetTooltipContent) => React.ReactNode | string;
  /** A function to be called after the tooltip is hidden */
  afterHide?: () => {};
  /** A function to be called after the tooltip is shown */
  afterShow?: () => {};
  /** Space between the tooltip element and anchor element (arrow not included in calculation) */
  offset?: number;
  /** Child elements */
  children?: React.ReactNode | string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Background color of the tooltip  */
  color?: string;
  /** Maximum width of the tooltip */
  maxWidth?: string;
  /** The tooltip can be controlled or uncontrolled, this attribute cannot be used to handle show and hide tooltip outside tooltip */
  isOpen?: boolean;
  /** Allow interaction with elements inside the tooltip */
  clickable?: boolean;
  /** Controls whether the tooltip should open when clicking (true) or hovering (false) the anchor element */
  openOnClick?: boolean;
  /** Tooltip will follow the mouse position when it moves inside the anchor element */
  float?: boolean;
  /** The selector for the anchor elements */
  anchorSelect?: string;
  /** Tooltip arrow will not be shown */
  noArrow?: boolean;
  offsetTop?: number;
  offsetLeft?: number;
  reference?: React.RefObject<HTMLDivElement>;
}
