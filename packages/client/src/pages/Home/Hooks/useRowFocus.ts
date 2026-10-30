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

import { useEffect, useRef } from "react";

import { getTabStops } from "@onlyoffice/apps-ui-kit/hooks/useFocusTrap";

type TCaretItem = {
  id?: number | string;
  fileExst?: string;
} | null;

// Every row of the files list in each view: table, rows and tiles.
const ROW = ".files-item";
// The section's own list, not the info panel's scroller that shares the class.
const LIST = ".section-scroll:not(.info-panel-scroll)";

// The outermost files-item: a table row's context-menu cell carries the
// class too, and must count as part of its row, not as a row of its own.
const rowOf = (el: Element | null) => {
  let row = el?.closest<HTMLElement>(ROW) ?? null;
  for (
    let outer = row?.parentElement?.closest<HTMLElement>(ROW);
    outer;
    outer = outer.parentElement?.closest<HTMLElement>(ROW)
  )
    row = outer;
  return row;
};

// A row carries its item as a class, the way HotkeyStore finds it to scroll.
const findRow = (item: TCaretItem) => {
  if (!item || item.id === undefined || item.id === null) return null;
  const name = item.fileExst ? `${item.id}_${item.fileExst}` : `${item.id}`;
  return rowOf(
    document.querySelector<HTMLElement>(`${ROW}.${CSS.escape(name)}`),
  );
};

// The control the keyboard lands on in a row: its name, a link, which names
// the item to a screen reader; the row's first stop where there is none (a
// selected row shows its checkbox before the name).
const primaryStop = (row: HTMLElement) => {
  const stops = getTabStops(row);
  return stops.find((stop) => stop.matches("a[href]")) ?? stops[0];
};

// The first Tab stop after `from` (or, going back, before it) that matches.
const stopBeside = (
  from: HTMLElement,
  back: boolean,
  matches: (stop: HTMLElement) => boolean,
) => {
  const stops = getTabStops(document.body);
  const side = back
    ? Node.DOCUMENT_POSITION_PRECEDING
    : Node.DOCUMENT_POSITION_FOLLOWING;
  const beside = (stop: HTMLElement) =>
    stop !== from &&
    !!(from.compareDocumentPosition(stop) & side) &&
    !stop.contains(from) &&
    matches(stop);
  return back ? stops.findLast(beside) : stops.find(beside);
};

/**
 * Moves the real focus with the files list's keyboard caret, and makes the
 * list one stop on the way through the page:
 *
 * - the arrows move the caret (and the selection) as before, and the focus
 *   follows it to the caret row's name;
 * - Tab and Shift+Tab move through that row's controls, and past its last or
 *   first one leave the list for what comes after or before it - the browser's
 *   own Tab, with the other rows' controls out of the order for that key -
 *   rather than walking every other row's controls;
 * - Tab into the list from outside lands on the caret's row.
 *
 * Only a caret moved from the keyboard pulls the focus; the pointer's clicks
 * are left as they are.
 */
export const useRowFocus = (hotkeyCaret: TCaretItem) => {
  const caretRef = useRef(hotkeyCaret);
  caretRef.current = hotkeyCaret;
  const fromKeyboardRef = useRef(false);

  useEffect(() => {
    const onKeyDown = () => {
      fromKeyboardRef.current = true;
    };
    const onPointerDown = () => {
      fromKeyboardRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  // The caret moved from the keyboard while the focus is in the list (on
  // the list itself, where the arrows put it, or on a row): the focus goes to
  // the new row, once it is rendered and scrolled to.
  useEffect(() => {
    if (!hotkeyCaret || !fromKeyboardRef.current) return;
    const { activeElement } = document;
    if (
      activeElement !== document.body &&
      !activeElement?.closest(LIST)
    )
      return;

    const frame = requestAnimationFrame(() => {
      const row = findRow(hotkeyCaret);
      if (row) primaryStop(row)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hotkeyCaret]);

  useEffect(() => {
    // On window, after the document's listeners: an open dialog's focus
    // trap handles Tab first and claims it.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const { activeElement } = document;
      if (!(activeElement instanceof HTMLElement)) return;
      const back = e.shiftKey;
      const row = rowOf(activeElement);

      if (row) {
        // Within the row the browser's own order is right; only the edges
        // need handling, where it would go on into the neighbouring row.
        const stops = getTabStops(row);
        const edge = back ? stops[0] : stops[stops.length - 1];
        if (stops.includes(activeElement) && activeElement !== edge) return;

        // Out of the list as if it were one stop: the other rows' controls
        // leave the order for this one key, and the browser's own Tab goes
        // on to whatever follows - the browser's toolbar, when nothing does.
        const others = getTabStops(document.body).filter((stop) => {
          const stopRow = rowOf(stop);
          return !!stopRow && stopRow !== row;
        });
        const saved = others.map((stop) => stop.getAttribute("tabindex"));
        others.forEach((stop) => stop.setAttribute("tabindex", "-1"));
        setTimeout(() =>
          others.forEach((stop, index) => {
            const value = saved[index];
            if (value === null) stop.removeAttribute("tabindex");
            else stop.setAttribute("tabindex", value);
          }),
        );
        return;
      }

      // Coming into the list: to the caret's row rather than the first row
      // (or, going back, the last).
      const next = stopBeside(activeElement, back, () => true);
      const nextRow = rowOf(next ?? null);
      if (!nextRow) return;

      const targetRow = findRow(caretRef.current) ?? nextRow;
      const stops = getTabStops(targetRow);
      const target = back ? stops[stops.length - 1] : primaryStop(targetRow);
      if (!target) return;
      e.preventDefault();
      target.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
