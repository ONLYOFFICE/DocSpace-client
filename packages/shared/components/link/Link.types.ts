import { MouseEvent } from "react";
import { LinkTarget, LinkType } from "./Link.enums";

export interface LinkProps {
  children?: React.ReactNode | string;
  /** Accepts class */
  className?: string;
  /** Link color */
  color?: string;
  /** Link font size */
  fontSize?: string;
  /** Link font weight  */
  fontWeight?: number | string;
  /** Line height of the link */
  lineHeight?: string;
  /** Used as HTML `href` property */
  href?: string;
  /** Accepts id */
  id?: string;
  /** Sets font weight */
  isBold?: boolean;
  /** Sets hovered state and link effects */
  isHovered?: boolean;
  /** Sets the 'opacity' css-property to 0.5. Usually applied for the users with "pending" status */
  isSemitransparent?: boolean;
  /** Activates or deactivates _text-overflow_ CSS property with ellipsis (' … ') value */
  isTextOverflow?: boolean;
  /** Disables hover styles */
  noHover?: boolean;
  /** Sets a callback function that is triggered when the link is clicked. Only for \'action\' type of link */
  onClick?: (e: MouseEvent) => void;
  /** Used as HTML `rel` property */
  rel?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** Specifies where the linked document will open once the link is clicked. */
  target?: LinkTarget;
  /** Used as HTML `title` property */
  title?: string;
  /** Link type */
  type?: LinkType;
  /** Label */
  label?: string;
  /** Allows enabling UserSelect */
  enableUserSelect?: boolean;
}
