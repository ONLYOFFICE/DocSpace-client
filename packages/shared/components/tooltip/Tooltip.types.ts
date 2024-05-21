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

export type TTooltipPlace =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export type TFallbackAxisSideDirection = "none" | "start" | "end";

export type TGetTooltipContent = {
  content: string | null;
  activeAnchor: HTMLElement | null;
};

export interface TooltipProps {
  /** Used as HTML id property  */
  id?: string;
  /** Global tooltip placement */
  place?: TTooltipPlace;
  /** Whether to allow fallback to the perpendicular axis of the preferred placement, and if so, which side direction along the axis to prefer. */
  fallbackAxisSideDirection?: TFallbackAxisSideDirection;
  /** Sets a callback function that generates the tip content dynamically */
  getContent?: ({
    content,
    activeAnchor,
  }: TGetTooltipContent) => React.ReactNode | string;
  /** A function to be called after the tooltip is hidden */
  afterHide?: () => void;
  /** A function to be called after the tooltip is shown */
  afterShow?: () => void;
  /** Space between the tooltip element and anchor element (arrow not included in calculation) */
  offset?: number;
  /** Child elements */
  children?: React.ReactNode | string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Background color of the tooltip  */
  color?: string;
  /** Maximum width of the tooltip */
  maxWidth?: string;
  /** The tooltip can be controlled or uncontrolled, this attribute cannot be used to handle show and hide tooltip outside tooltip */
  isOpen?: boolean;
  /** Allow interaction with elements inside the tooltip */
  clickable?: boolean;
  /** Controls whether the tooltip should open when clicking (true) or hovering (false) the anchor element */
  openOnClick?: boolean;
  /** Tooltip will follow the mouse position when it moves inside the anchor element */
  float?: boolean;
  /** The selector for the anchor elements */
  anchorSelect?: string;
  /** Tooltip arrow will not be shown */
  noArrow?: boolean;
  offsetTop?: number;
  offsetLeft?: number;
  reference?: React.RefObject<HTMLDivElement>;
  /** Change the opacity of the tooltip */
  opacity?: number;
  /** When enabled, default tooltip behavior is disabled. */
  imperativeModeOnly?: boolean;
}
