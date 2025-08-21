/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { isDesktop, isMobile } from "./device";

// Used to update the number of tiles in a row after the window is resized.
export const getCountTilesInRow = (
  isRooms?: boolean,
  isTemplates?: boolean,
) => {
  const isDesktopView = isDesktop();
  const isMobileView = isMobile();
  const tileGap = 16;

  const elem = document.getElementsByClassName("section-wrapper-content")[0];
  let containerWidth = 0;
  if (elem) {
    const elemPadding = window
      .getComputedStyle(elem)
      ?.getPropertyValue("padding");

    if (elemPadding) {
      const paddingValues = elemPadding.split("px");
      if (paddingValues.length >= 4) {
        containerWidth =
          (elem.clientWidth || 0) -
          (parseInt(paddingValues[1], 10) || 0) -
          (parseInt(paddingValues[3], 10) || 0);
      }
    }
  }

  containerWidth += tileGap;
  if (!isMobileView) containerWidth -= 1;
  if (!isDesktopView) containerWidth += 3; // tablet tile margin -3px (TileContainer.js)

  let minTileWidth;
  if (isRooms || isTemplates) {
    minTileWidth = 275 + tileGap;
  } else {
    minTileWidth = 216 + tileGap;
  }

  return Math.floor(containerWidth / minTileWidth);
};
