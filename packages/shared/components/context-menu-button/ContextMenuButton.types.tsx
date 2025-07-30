// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { TDirectionX, TDirectionY } from "../../types";
import { ContextMenuModel } from "../context-menu";
import { ContextMenuButtonDisplayType } from "./ContextMenuButton.enums";

export interface ContextMenuButtonProps {
  /** Sets the button to present an opened state */
  opened?: boolean;
  /** Array of options for display */
  data?: ContextMenuModel[];
  /** Function for converting to inner data */
  getData?: () => ContextMenuModel[];
  /** Specifies the icon title */
  title?: string;
  /** Specifies the icon name */
  iconName?: string;
  /** Specifies the icon size */
  size?: number;
  /** Specifies the icon color */
  color?: string;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Specifies the icon hover color */
  hoverColor?: string;
  /** Specifies the icon click color */
  clickColor?: string;
  /** Specifies the icon hover name */
  iconHoverName?: string;
  /** Specifies the icon click name */
  iconClickName?: string;
  /** Specifies the icon open name */
  iconOpenName?: string;
  /** Triggers a callback function when the mouse enters the button borders */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse leaves the button borders */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse moves over the button borders */
  onMouseOver?: (e: React.MouseEvent) => void;
  /** Triggers a callback function when the mouse moves out of the button borders */
  onMouseOut?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  /** Direction X */
  directionX?: TDirectionX;
  /** Direction Y */
  directionY?: TDirectionY;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets the number of columns */
  columnCount?: number;
  /** Sets the display type */
  displayType?: ContextMenuButtonDisplayType;
  /** Closing event */
  onClose?: () => void;
  /** Sets the drop down open with the portal */
  usePortal?: boolean;
  /** Sets the class of the drop down element */
  dropDownClassName?: string;
  /** Sets the class of the icon button */
  iconClassName?: string;
  /** Enables displaying the icon borders  */
  displayIconBorder?: boolean;
  isFill?: boolean;
  zIndex?: number;
  asideHeader?: React.ReactNode;
  testId?: string;
}
