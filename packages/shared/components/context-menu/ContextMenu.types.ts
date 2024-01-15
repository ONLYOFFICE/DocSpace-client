export type ContextMenuType = {
  id?: string;
  key: string | number;
  label: string | React.ReactNode;
  icon?: string;
  disabled?: boolean;
  onClick?: (
    value:
      | {
          originalEvent: React.MouseEvent | React.ChangeEvent<HTMLInputElement>;
          action?: string | boolean;
          item?: ContextMenuType;
        }
      | React.MouseEvent
      | React.ChangeEvent<HTMLInputElement>,
    item?: ContextMenuType,
  ) => void;
  isSeparator?: undefined;
  url?: string;
  items?: ContextMenuType[];
  action?: string;
  className?: string;
  disableColor?: string;
  style?: React.CSSProperties;
  target?: string;
  isLoader?: boolean;
  isHeader?: boolean;
  onLoad?: () => Promise<ContextMenuModel[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template?: any;
  isOutsideLink?: boolean;
  withToggle?: boolean;
  checked?: boolean;
};

export type SeparatorType = {
  id?: string;
  key: string | number;
  isSeparator: boolean;
  disabled?: boolean;
  className?: string;
  disableColor?: string;
  isLoader?: boolean;
};

export type HeaderType = {
  title: string;
  icon?: string;
  avatar?: string;
  color?: string;
};

export type ContextMenuModel = ContextMenuType | SeparatorType;

export type TGetContextMenuModel = () => ContextMenuModel[];

export interface ContextMenuProps {
  /** Unique identifier of the element */
  id?: string;
  /** An array of menuitems */
  model: ContextMenuModel[];
  /** An object of header with icon and label */
  header?: HeaderType;
  /** Inline style of the component */
  style?: React.CSSProperties;
  /** Style class of the component */
  className?: string;
  /** Attaches the menu to document instead of a particular item */
  global?: boolean;
  /** Sets the context menu to be rendered with a backdrop */
  withBackdrop?: boolean;
  /** Ignores changeView restrictions for rendering backdrop */
  ignoreChangeView?: boolean;
  /** Sets zIndex layering value automatically */
  autoZIndex?: boolean;
  /** Sets automatic layering management */
  baseZIndex?: number;
  /** DOM element instance where the menu is mounted */
  appendTo?: HTMLElement;
  /** Specifies a callback function that is invoked when a popup menu is shown */
  onShow?: (
    e:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Specifies a callback function that is invoked when a popup menu is hidden */
  onHide?: (
    e:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Displays a reference to another component */
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Scales width by the container component */
  scaled?: boolean;
  /** Fills the icons with default colors */
  fillIcon?: boolean;
  /** Function that returns an object containing the elements of the context menu */
  getContextModel?: TGetContextMenuModel;
  /** Specifies the offset  */
  leftOffset?: number;
  rightOffset?: number;
  isRoom?: boolean;
  isArchive?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

export type TContextMenuRef = {
  show: (e: React.MouseEvent) => void;
  hide: (e: React.MouseEvent) => {};
};
