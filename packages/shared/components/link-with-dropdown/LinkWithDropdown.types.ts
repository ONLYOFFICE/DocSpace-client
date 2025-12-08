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

import { ContextMenuModel } from "../context-menu";
import { type TDirectionX, TDirectionY } from "../../types";

export type TDropdownType = "alwaysDashed" | "appearDashedAfterHover";

export type SimpleLinkWithDropdownProps = {
  /** Sets font weight to bold */
  isBold?: boolean;
  /** Link font size */
  fontSize?: string;
  /** Link font weight */
  fontWeight?: number;
  /** Activates text-overflow with ellipsis */
  isTextOverflow?: boolean;
  /** Indicates if the link is in hover state */
  isHovered?: boolean;
  /** Sets opacity to 0.5 for pending status */
  isSemitransparent?: boolean;
  /** Link color */
  color?: string;
  /** Link title attribute */
  title?: string;
  /** Disables the link */
  isDisabled?: boolean;
  /** Dropdown display type */
  dropdownType?: TDropdownType;
  /** Dropdown menu items */
  data?: ContextMenuModel[];
  /** Link content */
  children?: React.ReactNode;
};

export type LinkWithDropDownProps = SimpleLinkWithDropdownProps & {
  /** Displays the expander icon */
  withExpander?: boolean;
  /** Controls dropdown visibility */
  isOpen?: boolean;
  /** Additional CSS class for the link */
  className?: string;
  /** Additional CSS class for the dropdown */
  dropDownClassName?: string;
  /** HTML id attribute */
  id?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Sets the dropdown opening horizontal direction */
  directionX?: TDirectionX;
  /** Sets the dropdown opening vertical direction */
  directionY?: TDirectionY;
  /** Enables scrollbar in dropdown */
  hasScroll?: boolean;
  /** Manual width for the dropdown */
  manualWidth?: string;
  /** Is aside */
  isAside?: boolean;
  /** Without blur background */
  withoutBackground?: boolean;
  /** Fix dropdown direction regardless of available space */
  fixedDirection?: boolean;
  /** Use default mode for dropdown positioning */
  isDefaultMode?: boolean;
};
