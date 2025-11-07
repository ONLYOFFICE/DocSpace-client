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

import { ITooltip, TooltipRefProps } from "react-tooltip";

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

export type TooltipProps = Pick<
  ITooltip,
  | "id"
  | "place"
  | "afterHide"
  | "afterShow"
  | "offset"
  | "children"
  | "isOpen"
  | "clickable"
  | "openOnClick"
  | "float"
  | "anchorSelect"
  | "noArrow"
  | "opacity"
  | "imperativeModeOnly"
  | "delayShow"
> & {
  /** Sets a callback function that generates the tip content dynamically */
  getContent?: ({
    content,
    activeAnchor,
  }: TGetTooltipContent) => React.ReactNode | string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Background color of the tooltip  */
  color?: string;
  /** Maximum width of the tooltip */
  maxWidth?: string;
  /** Whether to allow fallback to the perpendicular axis of the preferred placement */
  fallbackAxisSideDirection?: TFallbackAxisSideDirection;
  noUserSelect?: boolean;
  ref?: React.RefObject<TooltipRefProps | null>;
  dataTestId?: string;
  zIndex?: number;
  tooltipStyle?: React.CSSProperties;
};

export type MouseEventHandler = (e: React.MouseEvent) => void;

export type TooltipHandlers = {
  anchorId: string;
  handleMouseEnter: MouseEventHandler;
  handleMouseLeave: MouseEventHandler;
  handleClick: MouseEventHandler;
};

export interface WithTooltipProps {
  title?: string;
  tooltipContent?: React.ReactNode;
  tooltipPlace?: TTooltipPlace;
  tooltipFitToContent?: boolean;
}

export type OmitTooltipProps<T> = Omit<
  T,
  "title" | "tooltipContent" | "tooltipPlace" | "tooltipFitToContent"
>;

export function omitTooltipProps<T extends Record<string, unknown>>(
  props: T & Partial<WithTooltipProps>,
): OmitTooltipProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, tooltipContent, tooltipPlace, tooltipFitToContent, ...rest } =
    props;
  return rest as OmitTooltipProps<T>;
}

export type ComponentProps = OmitTooltipProps<
  React.HTMLAttributes<HTMLElement> & {
    onClick?: MouseEventHandler;
    onMouseEnter?: MouseEventHandler;
    onMouseLeave?: MouseEventHandler;
  }
>;

declare global {
  interface Window {
    __systemTooltipRef?: React.RefObject<TooltipRefProps | null>;
  }
}
