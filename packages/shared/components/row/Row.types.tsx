import { ContextMenuModel } from "../context-menu";

export type TData = { contextOptions: ContextMenuModel[] };
export type TMode = "modern" | "default";

export interface RowProps {
  /** Required for hosting the Checkbox component. Its location is always fixed in the first position.
   * If there is no value, the occupied space is distributed among the other child elements. */
  checked: boolean;
  /** Displays the child elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Required for displaying a certain element in the row */
  contentElement?: React.ReactNode;
  /** Sets the width of the ContextMenuButton component. */
  contextButtonSpacerWidth?: string;
  /** Required for hosting the ContextMenuButton component. It is always located near the right border of the container,
   * regardless of the contents of the child elements. If there is no value, the occupied space is distributed among the other child elements. */
  contextOptions?: ContextMenuModel[];
  /** Current row item information. */
  data?: TData;
  /** In case Checkbox component is specified, it is located in a fixed order,
   * otherwise it is located in the first position. If there is no value, the occupied space is distributed among the other child elements. */
  element?: React.ReactElement;
  /** Accepts id  */
  id?: string;
  /** If true, this state is shown as a rectangle in the checkbox */
  indeterminate?: boolean;
  /** Sets a callback function that is triggered when a row element is selected. Returns data value. */
  onSelect?: (checked: boolean, data?: TData) => void;
  /** Sets a callback function that is triggered when any element except the checkbox and context menu is clicked. */
  onRowClick: (e: React.MouseEvent) => void;
  /** Function that is invoked on clicking the icon button in the context-menu */
  onContextClick?: (value?: boolean) => void;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Displays the loader */
  inProgress?: boolean;
  /** Function that returns an object containing the elements of the context menu */
  getContextModel?: () => ContextMenuModel[];
  /** Changes the row mode */
  mode?: TMode;
  /** Removes the borders */
  withoutBorder?: boolean;
  isRoom?: boolean;
  contextTitle?: string;
  badgesComponent?: React.ReactNode;
  isArchive?: boolean;
  rowContextClose?: () => void;
}
