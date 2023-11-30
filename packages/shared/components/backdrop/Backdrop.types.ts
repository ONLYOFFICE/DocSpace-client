import React from "react";

export interface BackdropProps {
  /** Sets visible or hidden */
  visible: boolean;
  /** CSS z-index */
  zIndex?: number;
  /** Accepts class */
  className?: string | string[];
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Displays the background. *The background is not displayed if the viewport width is more than 1024 */
  withBackground?: boolean;
  /** Must be true if used with Aside component */
  isAside?: boolean;
  /** Must be true if used with Context menu */
  withoutBlur?: boolean;
  withoutBackground?: boolean;
  isModalDialog?: boolean;
}
