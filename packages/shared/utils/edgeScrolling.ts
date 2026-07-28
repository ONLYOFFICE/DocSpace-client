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

const edgeSize = 200;
const maxStep = 50;

let timer: null | ReturnType<typeof setTimeout> = null;

export const clearEdgeScrollingTimer = () => {
  if (timer) clearTimeout(timer);
};

export const onEdgeScrolling = (e: MouseEvent) => {
  const bodyScroll = document.querySelector(".section-scroll");

  if (bodyScroll) {
    const viewportY = e.clientY;
    const viewportHeight = document.documentElement.clientHeight;
    const edgeTop = edgeSize;
    const edgeBottom = viewportHeight - edgeSize;
    const isInTopEdge = viewportY < edgeTop;
    const isInBottomEdge = viewportY > edgeBottom;

    if (!(isInTopEdge || isInBottomEdge)) {
      clearEdgeScrollingTimer();
      return;
    }

    const maxScrollY = bodyScroll.scrollHeight - viewportHeight;

    const adjustWindowScroll = () => {
      const currentScrollY = bodyScroll.scrollTop;

      const canScrollUp = currentScrollY > 0;
      const canScrollDown = currentScrollY < maxScrollY;
      let nextScrollY = currentScrollY;

      if (isInTopEdge && canScrollUp) {
        const intensity = (edgeTop - viewportY) / edgeSize;
        nextScrollY -= maxStep * intensity;
      } else if (isInBottomEdge && canScrollDown) {
        const intensity = (viewportY - edgeBottom) / edgeSize;

        nextScrollY += maxStep * intensity;
      }

      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

      if (nextScrollY !== currentScrollY) {
        bodyScroll.scrollTo(0, nextScrollY);
        return true;
      }
      return false;
    };

    const checkForWindowScroll = () => {
      clearEdgeScrollingTimer();
      if (adjustWindowScroll()) {
        timer = setTimeout(checkForWindowScroll, 30);
      }
    };

    checkForWindowScroll();
  }
};
