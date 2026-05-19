/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isDesktop, isMobile } from "@docspace/ui-kit/utils/device";

function getTileWidth(
  min: number,
  max: number,
  preferredPercent: number = 0.134,
) {
  const preferred = window.innerWidth * preferredPercent; // vw
  return Math.max(min, Math.min(preferred, max));
}

// Used to update the number of tiles in a row after the window is resized.
export const getCountTilesInRow = (
  isRooms?: boolean,
  isTemplates?: boolean,
  isTemplateGallery?: boolean,
  isShowOneTile?: boolean,
) => {
  if (isTemplateGallery) {
    if (isShowOneTile) return 1;

    if (window.innerWidth > 600 && window.innerWidth <= 839) return 3;

    if (window.innerWidth >= 840 && window.innerWidth <= 1199) return 4;

    if (window.innerWidth >= 1200 && window.innerWidth <= 1439) return 5;

    if (window.innerWidth >= 1440) return 6;

    return 2;
  }

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
    minTileWidth = getTileWidth(275, 350) + tileGap;
  } else if (isTemplateGallery) {
    minTileWidth = 216 + tileGap;
  } else {
    minTileWidth = getTileWidth(216, 360) + tileGap;
  }

  return Math.floor(containerWidth / minTileWidth);
};
