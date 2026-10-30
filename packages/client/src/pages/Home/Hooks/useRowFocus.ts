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

/** The item a row shows, as its element id says: `file_12` or `folder_7`. */
export type TRowKey = { id: string; isFolder: boolean };

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

// The element that holds the focus for a row as a whole. A row of tiles or of
// the row view has a box of its own; a table row is display: contents, so its
// first cell holds it, and the stylesheet rings every cell of the row. It is
// focusable from script only (tabindex -1), never a Tab stop of its own.
const HOLDER = "data-row-focus";

const rowHolder = (row: HTMLElement) => {
  const holder =
    getComputedStyle(row).display === "contents"
      ? (row.querySelector<HTMLElement>(".table-container_cell") ?? row)
      : row;
  if (!holder.hasAttribute("tabindex")) holder.setAttribute("tabindex", "-1");
  holder.setAttribute(HOLDER, "");
  return holder;
};

const isHolder = (el: Element) => el.hasAttribute(HOLDER);

const rowKey = (row: HTMLElement): TRowKey | null => {
  const owner = row.closest<HTMLElement>('[id^="file_"], [id^="folder_"]');
  const match = owner?.id.match(/^(file|folder)_(.+)$/);
  return match ? { id: match[2], isFolder: match[1] === "folder" } : null;
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
 *   follows it to the caret's row as a whole;
 * - from the row Tab goes through the row's controls and, past the last one,
 *   out of the list for what comes after it - the browser's own Tab, with the
 *   other rows' controls out of the order for that key. Shift+Tab goes back
 *   through them to the row, and from the row out of the list before it;
 * - Tab or Shift+Tab into the list from outside - the page, or the browser's
 *   toolbar - lands on the caret's row (or the row it would reach), and
 *   `onRowFocus` makes it the selection.
 *
 * Only a caret moved from the keyboard pulls the focus; the pointer's clicks
 * are left as they are.
 */
export const useRowFocus = (
  hotkeyCaret: TCaretItem,
  onRowFocus: (key: TRowKey) => void,
) => {
  const onRowFocusRef = useRef(onRowFocus);
  onRowFocusRef.current = onRowFocus;
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
      // Already in that row - Tab brought the focus there and made it the
      // caret, and may have moved on to one of its controls since: leave it.
      if (!row || row.contains(document.activeElement)) return;
      rowHolder(row).focus({ preventScroll: true });
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
        if (stops.includes(activeElement)) {
          if (activeElement !== (back ? stops[0] : stops[stops.length - 1]))
            return;
          // Back from the row's first control: to the row itself.
          if (back) {
            e.preventDefault();
            rowHolder(row).focus();
            return;
          }
        } else if (!isHolder(activeElement) && !back) return;

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

      // Coming into the list, either way: onto the caret's row as a whole
      // (or the row Tab would reach), which becomes the selection.
      const next = stopBeside(activeElement, back, () => true);
      const nextRow = rowOf(next ?? null);
      if (!nextRow) return;

      const targetRow = findRow(caretRef.current) ?? nextRow;
      e.preventDefault();
      rowHolder(targetRow).focus();
      const key = rowKey(targetRow);
      if (key) onRowFocusRef.current(key);
    };

    // Into the list without a key press the page saw - Shift+Tab back from
    // the browser's toolbar lands on the last row's last control - the focus
    // still goes to the caret's row as a whole, which becomes the selection.
    const onFocusIn = (e: FocusEvent) => {
      if (!fromKeyboardRef.current) return;
      const { target, relatedTarget } = e;
      if (!(target instanceof HTMLElement)) return;
      const row = rowOf(target);
      if (!row) return;
      if (relatedTarget instanceof Element && rowOf(relatedTarget)) return;

      const caretRow = findRow(caretRef.current) ?? row;
      if (caretRow === row && isHolder(target)) return;

      rowHolder(caretRow).focus({ preventScroll: true });
      const key = rowKey(caretRow);
      if (key) onRowFocusRef.current(key);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);
};
