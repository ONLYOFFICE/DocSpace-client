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

import { useEffect } from "react";
import { useLocation } from "react-router";

import { useStores } from "SRC_DIR/store/useStore";
import { isPrivateRoomsListRoot } from "SRC_DIR/helpers/privateRoomsSection";
import {
  hasPrivateRoomCreateRequest,
  takePrivateRoomCreateRequest,
} from "SRC_DIR/helpers/privateRoomCreateRequest";
import { DASHBOARD_ANALYTICS_CONTEXT } from "SRC_DIR/pages/Dashboard/utils";

/**
 * Starts the creation of a private room when the Private list was opened by
 * the dashboard card for that. The list uses its own create entry point, so a
 * user without a key gets key setup as from the create button.
 * Spec: private-rooms/sidebar-section, "Dashboard card of private rooms creates or opens"
 */
export const usePrivateRoomCreateRequest = () => {
  const {
    authStore,
    clientLoadingStore,
    contextOptionsStore,
    treeFoldersStore,
  } = useStores();
  const location = useLocation();

  const canCreateRooms = authStore.isAdmin || authStore.isRoomAdmin;
  const isListShown =
    !clientLoadingStore.firstLoad &&
    isPrivateRoomsListRoot(location, treeFoldersStore.isRoomsFolder);

  useEffect(() => {
    if (!isListShown || !hasPrivateRoomCreateRequest()) return;
    if (!takePrivateRoomCreateRequest() || !canCreateRooms) return;

    contextOptionsStore.onCreateRoom(null, false, DASHBOARD_ANALYTICS_CONTEXT);
  }, [isListShown, canCreateRooms, contextOptionsStore]);
};
