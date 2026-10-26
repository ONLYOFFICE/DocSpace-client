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

// Controls that act on Enter and Space themselves. Only the focused element
// is tested, never its ancestors: the section and every file row are
// react-dropzone roots with role="button", and Enter on them opens the item.
const ACTIVATING_CONTROL = [
  "button",
  "a[href]",
  "select",
  "summary",
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="combobox"]',
  '[aria-haspopup]:not([aria-haspopup="false"])',
].join(", ");

// Widgets whose arrow keys move within them. The file list's own grid is
// deliberately absent: its arrows are the hotkeys.
const NAVIGATING_WIDGET = [
  "select",
  '[role="tablist"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="listbox"]',
  '[role="combobox"]',
  '[role="radiogroup"]',
  '[role="slider"]',
  '[role="tree"]',
].join(", ");

const NAVIGATION_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

const SELECTION_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/**
 * Hands the focus to the list once its hotkeys have taken an arrow key from
 * another element. A closed menu gives the focus back to its "..." button; if
 * it stayed there while the arrows moved the selection to another item, the
 * next Enter would reopen that menu instead of opening the selected item.
 */
export const focusListOnSelectionKey = (e: KeyboardEvent) => {
  if (!SELECTION_KEYS.includes(e.key)) return;

  const list =
    document.getElementsByClassName("section-scroll")[0]?.firstElementChild;

  if (list instanceof HTMLElement && document.activeElement !== list)
    list.focus({ preventScroll: true });
};

/**
 * Whether a context menu is on screen. While it is, every key is the menu's:
 * Escape closes it rather than clearing the selection it was opened for.
 */
export const isContextMenuOpen = () =>
  document.getElementsByClassName("p-contextmenu").length > 0;

/**
 * Whether the focused control handles this key itself, so the section's
 * hotkeys must leave it alone: neither act on it, nor cancel it, nor move the
 * focus away while it is being pressed.
 */
export const isKeyOwnedByFocus = (e: KeyboardEvent) => {
  if (e.key === "Tab") return true;

  const target = e.target;
  if (!(target instanceof Element)) return false;

  const isNavigationKey = NAVIGATION_KEYS.includes(e.key);
  const isActivationKey = e.key === "Enter" || e.key === " ";

  // An open menu or list takes its trigger's keys while it is showing.
  if (
    target.getAttribute("aria-expanded") === "true" &&
    (isNavigationKey || isActivationKey)
  )
    return true;

  if (isActivationKey) return target.matches(ACTIVATING_CONTROL);

  if (isNavigationKey) return target.closest(NAVIGATING_WIDGET) !== null;

  return false;
};
