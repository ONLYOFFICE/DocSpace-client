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

import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: {
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
  SocketCommands: {
    Subscribe: "subscribe",
    Unsubscribe: "unsubscribe",
  },
}));

vi.mock("../../helpers/utils", () => ({
  setDocumentTitle: vi.fn(),
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { FolderType } from "@docspace/shared/enums";

import SelectedFolderStore from "../SelectedFolderStore";

const createStore = () =>
  new SelectedFolderStore({} as unknown as SettingsStore);

describe("SelectedFolderStore.toDefault", () => {
  // Regression: leaving a private room (Home unmount calls
  // setSelectedFolder(null)) must not keep `private: true` around —
  // a stale flag re-triggered the passphrase prompt on unrelated
  // pages such as the user profile.
  it("resets the private flag", () => {
    const store = createStore();

    store.setSelectedFolder({
      id: 42,
      title: "Private room",
      private: true,
      isRoom: true,
    });
    expect(store.private).toBe(true);

    store.setSelectedFolder(null);

    expect(store.private).toBe(false);
    expect(store.id).toBe(0);
  });

  it("does not inherit private from a previous room when the next folder omits it", () => {
    const store = createStore();

    store.setSelectedFolder({
      id: 42,
      title: "Private room",
      private: true,
      isRoom: true,
    });

    store.setSelectedFolder({
      id: 7,
      title: "My documents",
    });

    expect(store.private).toBe(false);
  });
});

describe("SelectedFolderStore.isRoomStorageQuotaExceeded", () => {
  const openRoom = (store: SelectedFolderStore, extra: object) =>
    store.setSelectedFolder({
      id: 42,
      title: "Box",
      isRoom: true,
      rootFolderType: FolderType.Rooms,
      navigationPath: [],
      ...extra,
    });

  it("is true for a room that reached its quota", () => {
    const store = createStore();

    openRoom(store, { quotaLimit: 1024, usedSpace: 1024 });

    expect(store.isRoomStorageQuotaExceeded).toBe(true);
  });

  // Regression: third-party rooms have no quota — the backend reports
  // quotaLimit/usedSpace as 0, which read as "0 >= 0" and showed a
  // "Room storage limit exceeded (0 Bytes/0 Bytes)" warning.
  it("is false for a room connected to third-party storage", () => {
    const store = createStore();

    openRoom(store, {
      quotaLimit: 0,
      usedSpace: 0,
      providerKey: "Box",
    });

    expect(store.isRoomStorageQuotaExceeded).toBe(false);
  });

  it("is false for a folder inside a third-party room", () => {
    const store = createStore();

    store.setSelectedFolder({
      id: 43,
      title: "Subfolder",
      rootFolderType: FolderType.Rooms,
      providerItem: true,
      navigationPath: [
        {
          id: 42,
          title: "Box",
          isRoom: true,
          isRootRoom: false,
          quotaLimit: 0,
          usedSpace: 0,
        },
        { id: 1, title: "Rooms", isRoom: false, isRootRoom: true },
      ],
    });

    expect(store.isRoomStorageQuotaExceeded).toBe(false);
  });
});
