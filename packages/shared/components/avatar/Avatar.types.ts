import React from "react";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

export interface AvatarProps {
  /** Size of avatar */
  size: AvatarSize;
  /** Adds a table of user roles */
  role: AvatarRole;
  /** Displays as `Picture` in case the url is specified and as `Icon` in case the path to the .svg file is specified */
  source: string;
  /** Allows to display a user name as initials when `source` is set to blank */
  userName?: string;
  /** Enables avatar editing */
  editing?: boolean;
  /** Allows to display as a default icon when `source` is set to blank */
  isDefaultSource?: boolean;
  /** Function called when the avatar change button is pressed */
  editAction?: () => void;
  /** Hides user role */
  hideRoleIcon?: boolean;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Show tooltip on hover role icon */
  withTooltip?: boolean;
  /** Tooltip content */
  tooltipContent?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Display initials for group when `source` is set to blank */
  isGroup?: boolean;
}
