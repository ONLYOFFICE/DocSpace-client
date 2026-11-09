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
import { useLayoutEffect, useState } from "react";

// The bars stuck above the table in its scroller: the Section's pinned header
// and any sticky sibling on the way up from the table, such as the tabs a
// settings page pins under that header.
const barsAbove = (
  table: HTMLElement,
  scroller: HTMLElement,
  pinned: HTMLElement,
) => {
  const bars = [pinned];
  for (let el: Element | null = table; el && el !== scroller;) {
    for (
      let sibling = el.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      if (
        sibling !== pinned &&
        sibling instanceof HTMLElement &&
        getComputedStyle(sibling).position === "sticky"
      )
        bars.push(sibling);
    }
    el = el.parentElement;
  }
  return bars;
};

// Where a stuck bar ends, from the top of the scroller.
const stuckBottom = (bar: HTMLElement) =>
  (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight;

/**
 * Where the DataTable's sticky header stops: where the old table's
 * `position: fixed` header stood, which is where the table rests with the list
 * at the top. The Section pins its header and filter at the top of the same
 * scroller (`.section-sticky-container`), so a header sticking at 0 would slide
 * under them. Measured again whenever they change height.
 *
 * In the Section's `stickyTableHeader` mode, with the quick-actions banner, the
 * Section places the header itself, under `--section-filter-bottom`, and this
 * value is not used. That variable assumes a filter of fixed height, so the
 * real bottom of the sticky filter - taller with the room groups under it -
 * is set on the table in its place.
 *
 * `belowPinned` is for a table further down a page, such as one under a
 * settings page's description: its resting place is far below the pinned
 * header, so the header stops right under the pinned one instead - or under
 * the lowest bar the page pins below it, such as a settings page's tabs.
 *
 * The table may come later than the component that calls this - one that
 * renders nothing until its list has loaded - so the element behind `tableRef`
 * is read on every render and measured whenever it changes.
 */
export const useStickyHeaderTop = (
  tableRef: React.RefObject<HTMLDivElement | null>,
  { belowPinned = false }: { belowPinned?: boolean } = {},
) => {
  const [table, setTable] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (tableRef.current !== table) setTable(tableRef.current);
  });

  useLayoutEffect(() => {
    const scroller = table?.closest<HTMLElement>(".section-scroll");
    const pinned = scroller?.querySelector<HTMLElement>(
      ".section-sticky-container",
    );
    if (!table || !scroller || !pinned) return undefined;

    const bars = belowPinned ? barsAbove(table, scroller, pinned) : [pinned];

    // In the Section's `stickyTableHeader` mode the filter sticks inside the
    // scroller and the Section stops the header at `--section-filter-bottom`,
    // which the page works out from a fixed filter height. The filter grows
    // with the room groups under it, so its real bottom is set on the table.
    const filter = scroller.querySelector<HTMLElement>(
      ".section-body_sticky-filter",
    );
    const stickyFilter =
      filter && getComputedStyle(filter).position === "sticky" ? filter : null;

    // The table's offset in the scrolled content, the same at any scroll; or
    // the bottom of the lowest bar above it, the same while they are stuck.
    const update = () => {
      const top = belowPinned
        ? Math.max(...bars.map(stuckBottom))
        : table.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
      table.style.setProperty(
        "--data-table-header-top",
        `${Math.max(0, Math.round(top))}px`,
      );
      if (stickyFilter) {
        table.style.setProperty(
          "--section-filter-bottom",
          `${Math.round(stuckBottom(stickyFilter))}px`,
        );
      }
    };

    update();
    const observer = new ResizeObserver(update);
    bars.forEach((bar) => observer.observe(bar));
    if (stickyFilter) observer.observe(stickyFilter);
    return () => {
      observer.disconnect();
      table.style.removeProperty("--section-filter-bottom");
    };
  }, [table, belowPinned]);
};
