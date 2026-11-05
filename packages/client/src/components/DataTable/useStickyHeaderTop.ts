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

import type React from "react";
import { useLayoutEffect } from "react";

/**
 * Where the DataTable's sticky header stops: where the old table's
 * `position: fixed` header stood, which is where the table rests with the list
 * at the top. The Section pins its header and filter at the top of the same
 * scroller (`.section-sticky-container`), so a header sticking at 0 would slide
 * under them. Measured again whenever they change height.
 *
 * In the Section's `stickyTableHeader` mode, with the quick-actions banner, the
 * Section places the header itself and this value is not used.
 *
 * `belowPinned` is for a table further down a page, such as one under a
 * settings page's description: its resting place is far below the pinned
 * header, so the header stops right under the pinned one instead.
 */
export const useStickyHeaderTop = (
  tableRef: React.RefObject<HTMLDivElement | null>,
  { belowPinned = false }: { belowPinned?: boolean } = {},
) => {
  useLayoutEffect(() => {
    const table = tableRef.current;
    const scroller = table?.closest<HTMLElement>(".section-scroll");
    const pinned = scroller?.querySelector(".section-sticky-container");
    if (!table || !scroller || !pinned) return undefined;

    // The table's offset in the scrolled content, the same at any scroll; or
    // the pinned header's bottom in the scroller, the same while it is pinned.
    const update = () => {
      const scrollerTop = scroller.getBoundingClientRect().top;
      const top = belowPinned
        ? pinned.getBoundingClientRect().bottom - scrollerTop
        : table.getBoundingClientRect().top - scrollerTop + scroller.scrollTop;
      table.style.setProperty(
        "--data-table-header-top",
        `${Math.max(0, Math.round(top))}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(pinned);
    return () => observer.disconnect();
  }, [tableRef, belowPinned]);
};
