// (c) Copyright Ascensio System SIA 2009-2024
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

import { TTooltipPlace, TooltipProps } from "../tooltip/Tooltip.types";

export interface HelpButtonProps {
  /** Displays the child elements  */
  children?: React.ReactNode;
  /** Sets the tooltip content  */
  tooltipContent: string | React.ReactNode;
  /** Required to set additional properties of the tooltip */
  tooltipProps?: TooltipProps;
  /** Sets the maximum width of the tooltip  */
  tooltipMaxWidth?: string;
  /** Sets the tooltip id */
  tooltipId?: string;
  /** Global tooltip placement */
  place?: TTooltipPlace;
  /** Specifies the icon name */
  iconName?: string;
  /** Icon color */
  color?: string;
  /** The data-* attribute is used to store custom data private to the page or application. Required to display a tip over the hovered element */
  dataTip?: string;
  /** Sets a callback function that generates the tip content dynamically */
  getContent?: () => string | React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Button height and width value */
  size?: number;
  offset?: number;
  afterShow?: () => void;
  afterHide?: () => void;
  offsetTop?: number;
  offsetRight?: number;
  offsetBottom?: number;
  offsetLeft?: number;
  openOnClick?: boolean;
  isClickable?: boolean;
}
