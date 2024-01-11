import { ContextMenuModel } from "../context-menu";
import { TDirectionY } from "../../types";

export type TDropdownType = "alwaysDashed" | "appearDashedAfterHover";

export interface SimpleLinkWithDropdownProps {
  isBold?: boolean;
  fontSize?: string;
  fontWeight?: number;
  isTextOverflow?: boolean;
  isHovered?: boolean;
  isSemitransparent?: boolean;
  color?: string;
  title?: string;
  isDisabled?: boolean;
  dropdownType?: TDropdownType;
  data?: ContextMenuModel[];
  children?: React.ReactNode;
}

export interface LinkWithDropDownProps {
  /** Link color in all states - hover, active, visited */
  color?: string;
  /** Array of objects, each can contain `<DropDownItem />` props */
  data?: ContextMenuModel[];
  /** Dropdown type 'alwaysDashed' always displays a dotted style and an arrow icon,
   * appearDashedAfterHover displays a dotted style and icon arrow only  on hover */
  dropdownType?: TDropdownType;
  /** Displays the expander */
  withExpander?: boolean;
  /** Link font size */
  fontSize?: string;
  /** Link font weight */
  fontWeight?: number;
  /** Sets font weight */
  isBold?: boolean;
  /** Sets css-property 'opacity' to 0.5. Usually applied for the users with "pending" status */
  isSemitransparent?: boolean;
  /** Activates or deactivates _text-overflow_ CSS property with ellipsis (' … ') value */
  isTextOverflow?: boolean;
  /** Link title */
  title?: string;
  /** Sets open prop */
  isOpen?: boolean;
  /** Children element */
  children?: React.ReactNode;
  /** Accepts css class */
  className?: string;
  /** Sets the classNaame of the drop down */
  dropDownClassName?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets disabled view */
  isDisabled?: boolean;
  /** Sets the opening direction relative to the parent */
  directionY?: TDirectionY;
  /** Displays the scrollbar */
  hasScroll?: boolean;
  isHovered?: boolean;
}
