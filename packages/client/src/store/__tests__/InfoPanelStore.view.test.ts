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

import { describe, expect, it, vi } from "vitest";

// The store pulls in the client i18n bootstrap, which loads locales over HTTP.
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, language: "en" },
}));

import { RoomsType } from "@docspace/shared/enums";
import type { UserStore } from "@docspace/shared/store/UserStore";

import InfoPanelStore from "../InfoPanelStore";
import type FilesStore from "../FilesStore";
import type SelectedFolderStore from "../SelectedFolderStore";

/** A store whose open folder is `folder`, with nothing selected in the list. */
const storeIn = (folder: Record<string, unknown>) => {
  const store = new InfoPanelStore({} as UserStore);
  store.selectedFolderStore = {
    isRootFolder: false,
    ...folder,
  } as unknown as SelectedFolderStore;
  store.filesStore = {
    selection: [],
    bufferSelection: null,
  } as unknown as FilesStore;
  store.filesSettingsStore = {
    getIcon: () => "",
  } as unknown as InfoPanelStore["filesSettingsStore"];
  return store;
};

describe("InfoPanelStore.setIsVisible - the tab the panel opens on", () => {
  it("opens a room's own panel on its members", () => {
    const store = storeIn({
      id: 10,
      roomType: RoomsType.CustomRoom,
      parentRoomType: RoomsType.CustomRoom,
    });
    store.setIsVisible(true);
    expect(store.roomsView).toBe("info_members");
  });

  // Spec: ai-agent-page, "Agent info"
  it("opens an agent's page on Details, even for those who manage its members", () => {
    const store = storeIn({
      id: 777310,
      roomType: RoomsType.AiProjectRoom,
      parentRoomType: RoomsType.AiProjectRoom,
    });
    store.setIsVisible(true);
    expect(store.roomsView).toBe("info_details");
  });
});
