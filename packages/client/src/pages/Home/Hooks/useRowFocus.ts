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

import { getFilesItemClassName } from "SRC_DIR/helpers/filesItemClassName";

type TCaretItem = {
  id?: number | string;
  fileExst?: string;
} | null;

/** The item a row shows, as its element id says: `file_12` or `folder_7`. */
export type TRowKey = { id: string; isFolder: boolean };

/**
 * How the row came to take the focus. `standIn` is set when the row is only
 * the nearest one on screen, standing in for a caret row the list has not
 * rendered (scrolled away) or for no caret at all: no choice of the user's,
 * so it must not undo a selection of several the user made.
 */
export type TRowFocusOptions = { standIn?: boolean };

type TRowHeld = Map<HTMLElement, () => void>;

// Every row of the files list in each view: table, rows and tiles.
const ROW = ".files-item";
// The section's own scroller, by the id of its scrollbar: the info panel's
// carries the class too, and so does the floating create button's menu on a
// touch device, rendered before the list even while closed. The mobile layout
// scrolls the page instead and renders none.
const SCROLLER = "#sectionScroll .section-scroll";
// The section's own list: its scroller, which the arrows focus, or - where
// there is none - the wrapper the section body puts round the list's view.
// The scroller comes first in the page, so it is the one found where both are.
const LIST = `${SCROLLER}, [data-files-list]`;
// The section's sticky header - the search box, the filter, the group menu -
// scrolls with the list but is no part of it.
const STICKY_HEADER = ".section-sticky-container";
// A layer over the page: a modal dialog or the media viewer, or a side panel
// (ui-kit's Aside, which keeps the focus inside as a modal does).
const LAYER = '[aria-modal="true"], aside';
// How many frames the focus waits for the caret's row to be rendered.
const CARET_ROW_FRAMES = 10;

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
  const name = getFilesItemClassName(item);
  return rowOf(
    document.querySelector<HTMLElement>(`${ROW}.${CSS.escape(name)}`),
  );
};

// The element that holds the focus for a row as a whole. A tile, or a row of
// the row view, is the item's own element (the card, the row) inside a
// drag-and-drop wrapper: that element holds it, as it is the one that handles
// the item's context menu - Shift+F10 and the Menu key fire on the focused
// element - and draws the caret's border the ring goes round. A table row is
// display: contents, so its first cell holds it, the row's context menu
// handler above it, and the stylesheet rings every cell of the row. It is
// focusable from script only (tabindex -1), never a Tab stop of its own.
const HOLDER = "data-row-focus";

const isHolder = (el: Element) => el.hasAttribute(HOLDER);

// `held` maps each row holder to its release, for the list that holds them to
// end them all when it goes away: no listener outlives it. A holder removed
// with the focus in it (Enter opening a folder, a row scrolled out of a
// virtualized list) gets no blur to end it: it is ended with the next row held.
const rowHolder = (row: HTMLElement, held: TRowHeld) => {
  for (const [el, release] of held) if (!el.isConnected) release();

  const item = row.firstElementChild;
  const holder =
    getComputedStyle(row).display === "contents"
      ? (row.querySelector<HTMLElement>(".table-container_cell") ?? row)
      : item instanceof HTMLElement
        ? item
        : row;
  if (isHolder(holder)) return holder;

  // Set while the row is the keyboard's: left on, a click on that cell or
  // tile would focus it, where nothing took the focus before. The focus moving
  // on within the list ends that at once. Leaving the list - for a dialog or a
  // menu the row opened, or another window - it stays, so the focus can be
  // given back to the row; the next press of the pointer on another row, or
  // outside the list, ends it - a table row is several cells, and a press on
  // any of them is still on the row.
  const addedTabIndex = !holder.hasAttribute("tabindex");
  if (addedTabIndex) holder.setAttribute("tabindex", "-1");
  holder.setAttribute(HOLDER, "");

  const release = () => {
    if (addedTabIndex) holder.removeAttribute("tabindex");
    holder.removeAttribute(HOLDER);
    holder.removeEventListener("blur", onBlur);
    window.removeEventListener("pointerdown", onPointerDown, true);
    held.delete(holder);
  };
  const onBlur = (e: FocusEvent) => {
    if (e.relatedTarget instanceof Element && e.relatedTarget.closest(LIST))
      release();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (!(e.target instanceof Element)) return release();
    // A press inside a dialog or a panel over the page - one the row opened,
    // which gives the focus back to it as it closes - is no press elsewhere.
    if (rowOf(e.target) === row || e.target.closest(LAYER)) return;
    release();
  };
  holder.addEventListener("blur", onBlur);
  window.addEventListener("pointerdown", onPointerDown, true);
  held.set(holder, release);
  return holder;
};

// The first row inside the list's visible area: a virtualized list renders
// rows above and below it too, which Tab must not select.
const firstRowOnScreen = () => {
  const list = document.querySelector(LIST);
  if (!list) return null;
  // Without a scroller of its own the list scrolls with the page, and its
  // wrapper has no box (display: contents): the window is the visible area.
  const view =
    document.querySelector(SCROLLER)?.getBoundingClientRect() ??
    new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  for (const item of list.querySelectorAll<HTMLElement>(ROW)) {
    const row = rowOf(item);
    if (!row || row !== item) continue;
    const box = (rowHolderBox(row) ?? row).getBoundingClientRect();
    if (box.bottom > view.top && box.top < view.bottom) return row;
  }
  return null;
};

// A table row has no box of its own (display: contents): its first cell's.
const rowHolderBox = (row: HTMLElement) =>
  getComputedStyle(row).display === "contents"
    ? row.querySelector<HTMLElement>(".table-container_cell")
    : null;

const rowKey = (row: HTMLElement): TRowKey | null => {
  const owner = row.closest<HTMLElement>('[id^="file_"], [id^="folder_"]');
  const match = owner?.id.match(/^(file|folder)_(.+)$/);
  return match ? { id: match[2], isFolder: match[1] === "folder" } : null;
};

// A control the user types into: a caret moved while it has the focus was not
// moved by those keys, which the list's hotkeys leave to the control.
const isEditable = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el.matches("input, textarea, select"));

// The first Tab stop after `from` (or, going back, before it).
const stopBeside = (from: HTMLElement, back: boolean) => {
  const stops = getTabStops(document.body);
  const side = back
    ? Node.DOCUMENT_POSITION_PRECEDING
    : Node.DOCUMENT_POSITION_FOLLOWING;
  const beside = (stop: HTMLElement) =>
    stop !== from &&
    !!(from.compareDocumentPosition(stop) & side) &&
    !stop.contains(from);
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
  onRowFocus: (key: TRowKey, options?: TRowFocusOptions) => void,
) => {
  const onRowFocusRef = useRef(onRowFocus);
  onRowFocusRef.current = onRowFocus;
  const caretRef = useRef(hotkeyCaret);
  caretRef.current = hotkeyCaret;
  const fromKeyboardRef = useRef(false);
  // Whether the last key was a plain Tab: what leaves the page for the
  // browser's toolbar, unlike Alt+Tab or a click on another window.
  const lastKeyTabRef = useRef(false);
  // The rows this list holds for the focus to come back to.
  const heldRowsRef = useRef<TRowHeld>(new Map());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      fromKeyboardRef.current = true;
      lastKeyTabRef.current =
        e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey;
    };
    const onPointerDown = () => {
      fromKeyboardRef.current = false;
      lastKeyTabRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  // The caret moved from the keyboard while the focus is in the list (on
  // the list itself, where the arrows put it, or on a row) or round it (the
  // page, or the section's body where there is no scroller to put it in):
  // the focus goes to the new row, once it is rendered and scrolled to. The
  // section's scroller holds its sticky header too - the search box, the
  // filter - and a caret moved while the user is there (a delete ending)
  // leaves them be, as does one moved while a field in a row has it (a rename):
  // what the user types there is no move of the caret.
  useEffect(() => {
    if (!hotkeyCaret || !fromKeyboardRef.current) return;
    const { activeElement } = document;
    if (isEditable(activeElement)) return;
    const list = document.querySelector(LIST);
    const inList =
      activeElement === document.body ||
      (!!list && !!activeElement?.contains(list)) ||
      (!!activeElement?.closest(LIST) && !activeElement.closest(STICKY_HEADER));
    if (!inList) return;

    // A long jump (End, Ctrl+Down) scrolls a virtualized list to a row it has
    // yet to render: look for it again on the next frames before giving up.
    let frame = 0;
    let attempts = 0;
    const focusCaretRow = () => {
      const row = findRow(hotkeyCaret);
      if (!row) {
        attempts += 1;
        if (attempts < CARET_ROW_FRAMES)
          frame = requestAnimationFrame(focusCaretRow);
        return;
      }
      // Already in that row - Tab brought the focus there and made it the
      // caret, and may have moved on to one of its controls since: leave it.
      if (row.contains(document.activeElement)) return;
      rowHolder(row, heldRowsRef.current).focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(focusCaretRow);
    return () => cancelAnimationFrame(frame);
  }, [hotkeyCaret]);

  useEffect(() => {
    // The other rows' tab stops, taken out of the order for one Tab press and
    // put back right after it.
    let pendingRestore: (() => void) | null = null;
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    const restorePending = () => {
      clearTimeout(restoreTimer);
      pendingRestore?.();
      pendingRestore = null;
    };

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
            rowHolder(row, heldRowsRef.current).focus();
            return;
          }
        } else if (!isHolder(activeElement) && !back) return;

        // Out of the list as if it were one stop: the other rows' controls
        // leave the order for this one key, and the browser's own Tab goes
        // on to whatever follows - the browser's toolbar, when nothing does.
        // A restore still waiting from a fast earlier Tab runs first: the
        // stops it took out must be found, and saved with their own values.
        restorePending();
        // Rows live in the list: their stops are looked for there, not in
        // the whole page.
        const others = getTabStops(
          document.querySelector<HTMLElement>(LIST) ?? document.body,
        ).filter((stop) => {
          const stopRow = rowOf(stop);
          return !!stopRow && stopRow !== row;
        });
        const saved = others.map((stop) => stop.getAttribute("tabindex"));
        others.forEach((stop) => stop.setAttribute("tabindex", "-1"));
        pendingRestore = () =>
          others.forEach((stop, index) => {
            // A row the list re-rendered since is gone: nothing to put back.
            if (!stop.isConnected) return;
            const value = saved[index];
            if (value === null) stop.removeAttribute("tabindex");
            else stop.setAttribute("tabindex", value);
          });
        restoreTimer = setTimeout(restorePending);
        return;
      }

      // Coming into the list, either way: onto the caret's row as a whole
      // (or the row Tab would reach), which becomes the selection. Tab from
      // past the list, or Shift+Tab from before it, cannot reach it: no need
      // to read the page's stops for those.
      const list = document.querySelector(LIST);
      if (!list) return;
      if (!list.contains(activeElement)) {
        const side = activeElement.compareDocumentPosition(list);
        const listAhead = !!(side & Node.DOCUMENT_POSITION_FOLLOWING);
        if (back === listAhead) return;
      }
      const next = stopBeside(activeElement, back);
      const nextRow = rowOf(next ?? null);
      if (!nextRow) return;

      const caretRow = findRow(caretRef.current);
      const targetRow = caretRow ?? firstRowOnScreen() ?? nextRow;
      e.preventDefault();
      rowHolder(targetRow, heldRowsRef.current).focus();
      const key = rowKey(targetRow);
      if (key)
        onRowFocusRef.current(key, { standIn: !caretRow });
    };

    // Into the list without a key press the page saw - Shift+Tab back from
    // the browser's toolbar lands on the last row's last control - the focus
    // still goes to the caret's row as a whole, which becomes the selection.
    // Only focus that comes back from the toolbar a Tab left the page for: a
    // dialog giving the focus back to the row control that opened it is left
    // alone, and so is the window coming back after Alt+Tab or a click on
    // another window, with whatever element it restores.
    let cameBackFromOutside = false;
    let focusedBeforeLeaving: Element | null = null;
    const onWindowBlur = (e: FocusEvent) => {
      // The window itself lost the focus, not an element in it.
      if (e.target !== e.currentTarget) return;
      cameBackFromOutside = lastKeyTabRef.current;
      focusedBeforeLeaving = document.activeElement;
    };

    const onFocusIn = (e: FocusEvent) => {
      const fromOutside = cameBackFromOutside;
      cameBackFromOutside = false;
      if (!fromOutside || !fromKeyboardRef.current) return;
      const { target, relatedTarget } = e;
      if (!(target instanceof HTMLElement)) return;
      if (target === focusedBeforeLeaving) return;
      const row = rowOf(target);
      if (!row) return;
      if (relatedTarget instanceof Element && rowOf(relatedTarget)) return;

      const renderedCaretRow = findRow(caretRef.current);
      const caretRow = renderedCaretRow ?? row;
      if (caretRow === row && isHolder(target)) return;

      rowHolder(caretRow, heldRowsRef.current).focus({ preventScroll: true });
      const key = rowKey(caretRow);
      if (key)
        onRowFocusRef.current(key, { standIn: !renderedCaretRow });
    };

    const heldRows = heldRowsRef.current;
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      restorePending();
      heldRows.forEach((release) => release());
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);
};
