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

/**
 * Private (end-to-end encrypted) rooms are not ready to be released: the
 * editors half of the feature is still being built. The client code is kept
 * intact and fully functional, but every surface that offers the feature to a
 * user is hidden until a tester opts in from the browser console:
 *
 *   localStorage.setItem("privateRooms", "true");   // then reload the page
 *   localStorage.removeItem("privateRooms");        // back to hidden
 *
 * Any non-empty value counts as "enabled" (presence-flag pattern), so
 * `"true"`, `"1"` or `"on"` all work.
 *
 * Gated surfaces:
 *   - the "e2e-rooms" app, which stands for the Private section of the
 *     sidebar: the section and its `/private` routes, `/e2e-rooms` (a
 *     redirect into the section) and the enable flow
 *     (`SRC_DIR/helpers/disabled-apps.ts`,
 *     `AppsStore.isPrivateRoomsSectionAvailable`),
 *   - the Keys management tab and its `profile/keys-management` routes.
 *
 * Private rooms are created from the Private section only; the create-room
 * chooser never offers them (`getCreateRoomTypes` in ./rooms.tsx).
 *
 * The flag is read on demand, but the routing table and the Private section
 * are fixed once per page load, so flipping it requires a reload.
 *
 * The embeddable SDK cannot see that flag (it may run on another origin), so
 * it takes the opt-in from its host instead: the `privateRooms` property of
 * the frame configuration, carried in the frame URL under the same name, and
 * installed with `setPrivateRoomsOptInSource`.
 */
export const PRIVATE_ROOMS_FLAG_KEY = "privateRooms";

type TPrivateRoomsOptInSource = () => boolean;

const readBrowserFlag: TPrivateRoomsOptInSource = () => {
  if (typeof window === "undefined") return false;

  return Boolean(window.localStorage.getItem(PRIVATE_ROOMS_FLAG_KEY));
};

let optInSource = readBrowserFlag;

/**
 * Replaces the browser-local flag as the source of the opt-in; `null` goes
 * back to the flag.
 */
export const setPrivateRoomsOptInSource = (
  source: TPrivateRoomsOptInSource | null,
) => {
  optInSource = source ?? readBrowserFlag;
};

export const isPrivateRoomsEnabled = (): boolean => {
  try {
    return optInSource();
  } catch {
    // Storage can throw in a sandboxed iframe or with cookies disabled;
    // an unreadable flag means the feature stays hidden.
    return false;
  }
};

/** Whether a frame property or URL parameter value turns the opt-in on. */
export const isPrivateRoomsOptInValue = (value: unknown): boolean =>
  value === true || value === "true" || value === "1";
