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
 * Gated surfaces (all of them behave exactly as before once the flag is set):
 *   - the Private room card in the create-room type chooser
 *     (`getCreateRoomTypes` in ./rooms.tsx),
 *   - the "e2e-rooms" app: sidebar item, `/e2e-rooms` route and the enable
 *     flow (`SRC_DIR/helpers/disabled-apps.ts`, `AppsStore.isEnabled`),
 *   - the Keys management tab and its `profile/keys-management` routes.
 *
 * The flag is read on demand, but the routing table is built once per page
 * load, so flipping it requires a reload.
 */
export const PRIVATE_ROOMS_FLAG_KEY = "privateRooms";

export const isPrivateRoomsEnabled = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    return Boolean(window.localStorage.getItem(PRIVATE_ROOMS_FLAG_KEY));
  } catch {
    // Storage can throw in a sandboxed iframe or with cookies disabled;
    // an unreadable flag means the feature stays hidden.
    return false;
  }
};
