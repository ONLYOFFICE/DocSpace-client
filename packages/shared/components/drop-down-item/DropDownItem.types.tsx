export interface DropDownItemProps {
  /** Sets the dropdown item to display as a separator */
  isSeparator?: boolean;
  /** Sets the dropdown to display as a header */
  isHeader?: boolean;
  /** Enables header arrow icon */
  withHeaderArrow?: boolean;
  /** Sets an action that will be triggered when the header arrow is clicked */
  headerArrowAction?: () => void;
  /** Accepts tab-index */
  tabIndex?: number;
  /** Dropdown item text */
  label?: string;
  /** Sets the dropdown item to display as disabled */
  disabled?: boolean;
  /** Dropdown item icon */
  icon?: string;
  /** Disables default style hover effect */
  noHover?: boolean;
  /** Sets an action that will be triggered when the dropdown item is clicked */
  onClick?: (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void;
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts css text-overflow */
  textOverflow?: boolean;
  /** Indicates that component will fill selected item icon */
  fillIcon?: boolean;
  /** Enables the submenu */
  isSubMenu?: boolean;
  /**  Sets drop down item active  */
  isActive?: boolean;
  /** Disables the element icon */
  withoutIcon?: boolean;
  /** Sets the padding to the minimum value */
  isModern?: boolean;
  /** Facilitates highlighting a selected element with the keyboard */
  isActiveDescendant?: boolean;
  /** Facilitates selecting an element from the context menu */
  isSelected?: boolean;
  withToggle?: boolean;
  checked?: boolean;
  onClickSelectedItem?: () => void;
}
