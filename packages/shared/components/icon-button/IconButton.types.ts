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

import { IconSizeType } from "../../utils";
import { InputSize } from "../text-input";

export type IconButtonProps = {
  /** Sets component class */
  className?: string;
  /** Icon color */
  color?: "accent" | (string & {});
  /** Icon color on hover action */
  hoverColor?: "accent" | (string & {});
  /** Icon color on click action */
  clickColor?: "accent" | (string & {});
  /** Button height and width value */
  size?: number | IconSizeType | InputSize;
  /** Determines if icon fill is needed */
  isFill?: boolean;
  /** Determines if icon stroke is needed */
  isStroke?: boolean;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Sets cursor value */
  isClickable?: boolean;
  /** Icon node */
  iconNode?: React.ReactNode;
  /** Icon name */
  iconName?: string;
  /** Icon name on hover action */
  iconHoverName?: string;
  /** Icon name on click action */
  iconClickName?: string;
  /** Sets a button callback function triggered when the button is clicked */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor enters the area */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Sets a button callback function triggered when the cursor moves down */
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor moves up */
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor leaves the icon */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Sets component id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** The data-* attribute is used to store custom data private to the page or application. Required to display a tip over the hovered element */
  dataTip?: string;
  /** Data when user hover on icon */
  title?: string;
  /** Id for testing */
  dataTestId?: string;

  tooltipId?: string;
  tooltipContent?: string;
};
