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

import { LinkTarget, LinkType } from "./Link.enums";
import { TextProps } from "../text/Text.types";

export type LinkProps = TextProps & {
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
  /** Activates or deactivates _text-overflow_ CSS property with ellipsis (' ... ') value */
  isTextOverflow?: boolean;
  /** Disables hover effect */
  noHover?: boolean;
  /** Enables user selection */
  enableUserSelect?: boolean;
  /** Sets the link type */
  type?: LinkType;
  /** Sets the target attribute */
  target?: LinkTarget;
  /** Label */
  label?: string;
  /** Sets the text decoration style */
  textDecoration?:
    | "none"
    | "underline"
    | "line-through"
    | "overline"
    | "underline dotted"
    | "underline dashed";
  /** Accessibility label for the link */
  ariaLabel?: string;
  /** Data attribute for testing */
  dataTestId?: string;
  /** Sets a callback function that is triggered when the link is clicked. Only for 'action' type of link */
  onClick?: (e: React.MouseEvent<Element>) => void;
  /** Used as HTML `rel` property */
  rel?: string;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** Used as HTML `title` property */
  title?: string;
  /** CSS color or accent theme color */
  color?: "accent" | (string & {});
};
