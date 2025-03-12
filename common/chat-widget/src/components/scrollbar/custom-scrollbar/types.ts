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

import * as React from "react";

export enum AxisDirection {
  X = "x",
  Y = "y",
}

export enum TrackClickBehavior {
  JUMP = "jump",
  STEP = "step",
}

export type ElementRef<T = HTMLDivElement> = (element: T | null) => void;

export type ElementPropsWithElementRef<T = HTMLDivElement> =
  React.HTMLProps<T> & {
    elementRef?: ElementRef<T>;
  };

export type ElementRenderer<T = HTMLDivElement> = React.FC<
  React.PropsWithChildren<ElementPropsWithElementRef<T>>
>;

export type ElementPropsWithElementRefAndRenderer<T = HTMLDivElement> =
  React.HTMLProps<T> & {
    elementRef?: ElementRef<T>;
    renderer?: ElementRenderer<T>;
  };

/**
 * @description Contains all scroll-related values
 */
export type ScrollState = {
  /**
   * @description Scroller's native clientHeight parameter
   */
  clientHeight: number;
  /**
   * @description Scroller's native clientWidth parameter
   */
  clientWidth: number;

  /**
   * @description Content's scroll height
   */
  contentScrollHeight: number;
  /**
   * @description Content's scroll width
   */
  contentScrollWidth: number;

  /**
   * @description Scroller's native scrollHeight parameter
   */
  scrollHeight: number;
  /**
   * @description Scroller's native scrollWidth parameter
   */
  scrollWidth: number;

  /**
   * @description Scroller's native scrollTop parameter
   */
  scrollTop: number;
  /**
   * @description Scroller's native scrollLeft parameter
   */
  scrollLeft: number;

  /**
   * @description Indicates whether vertical scroll blocked via properties
   */
  scrollYBlocked: boolean;
  /**
   * @description Indicates whether horizontal scroll blocked via properties
   */
  scrollXBlocked: boolean;

  /**
   * @description Indicates whether the content overflows vertically and scrolling not blocked
   */
  scrollYPossible: boolean;
  /**
   * @description Indicates whether the content overflows horizontally and scrolling not blocked
   */
  scrollXPossible: boolean;

  /**
   * @description Indicates whether vertical track is visible
   */
  trackYVisible: boolean;
  /**
   * @description Indicates whether horizontal track is visible
   */
  trackXVisible: boolean;

  /**
   * @description Indicates whether display direction is right-to-left
   */
  isRTL?: boolean;

  /**
   * @description Pages zoom level - it affects scrollbars
   */
  zoomLevel: number;
};
