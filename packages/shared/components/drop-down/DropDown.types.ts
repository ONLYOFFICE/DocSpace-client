import { TDirectionX, TDirectionY } from "../../types";
import { TTheme } from "../../themes";

export interface DropDownProps {
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Required for determining a click outside DropDown with the withBackdrop parameter */
  clickOutsideAction?: (e: Event, open: boolean) => void;
  disableOnClickOutside?: boolean;
  enableOnClickOutside?: () => void;
  /** Sets the opening direction relative to the parent */
  directionX?: TDirectionX;
  /** Sets the opening direction relative to the parent */
  directionY?: TDirectionY;
  /** Accepts id */
  id?: string;
  /** Required for specifying the exact width of the component; for example; 100% */
  manualWidth?: string;
  /** Required for specifying the exact distance from the parent component */
  manualX?: string;
  /** Required for specifying the exact distance from the parent component */
  manualY?: string;
  /** Required if the scrollbar is displayed */
  maxHeight?: number;
  /** Sets the dropdown to be opened */
  open?: boolean;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Used to display backdrop */
  withBackdrop?: boolean;
  /** Count of columns */
  columnCount?: number;
  /** Sets the disabled items to display */
  showDisabledItems?: boolean;
  forwardedRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Sets the operation mode of the component. The default option is set to portal mode */
  isDefaultMode?: boolean;
  /** Used to open people and group selectors correctly when the section width is small */
  smallSectionWidth?: boolean;
  /** Disables check position. Used to set the direction explicitly */
  fixedDirection?: boolean;
  /** Enables blur for backdrop */
  withBlur?: boolean;
  /** Specifies the offset */
  offsetLeft?: number;

  right?: string;
  top?: string;
  isMobileView?: boolean;
  isNoFixedHeightOptions?: boolean;
  enableKeyboardEvents?: boolean;
  appendTo?: HTMLElement;
  isAside?: boolean;
  withBackground?: boolean;
  eventTypes?: string[];
  forceCloseClickOutside?: boolean;
  withoutBackground?: boolean;
}

export interface VirtualListProps {
  width: number;
  theme: TTheme;
  isOpen: boolean;
  itemCount: number;
  maxHeight?: number;
  calculatedHeight: number;
  isNoFixedHeightOptions: boolean;
  cleanChildren?: React.ReactNode;
  children: React.ReactElement | React.ReactNode;
  Row: React.MemoExoticComponent<
    ({ data, index, style }: RowProps) => JSX.Element
  >;
  enableKeyboardEvents: boolean;
  getItemSize: (index: number) => number;
}

export interface RowProps {
  data: {
    children?: React.ReactNode;
    theme: TTheme;
    activeIndex?: number;
    activedescendant?: number;
    handleMouseMove?: (index: number) => void;
  };
  index: number;
  style: React.CSSProperties;
}
