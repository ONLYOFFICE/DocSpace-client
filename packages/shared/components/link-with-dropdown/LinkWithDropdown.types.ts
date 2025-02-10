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
  manualWidth?: string | undefined;
}
