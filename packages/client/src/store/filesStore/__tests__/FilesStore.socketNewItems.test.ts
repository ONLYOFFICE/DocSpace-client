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

import { afterEach, describe, expect, it, vi } from "vitest";

// The harness mocks the socket module, so it is imported first.
import { createTestFilesStore } from "./testHarness";

import SocketHelper, {
  SocketEvents,
} from "@onlyoffice/apps-ui-kit/utils/socket";

const socket = SocketHelper!;

const PRIVATE_ROOT_ID = 42;
const OTHER_FOLDER_ID = 77;

const setup = () => {
  const fetchTreeFolders = vi.fn();
  const store = createTestFilesStore({
    treeFoldersStore: {
      treeFolders: [{ id: PRIVATE_ROOT_ID }],
      fetchTreeFolders,
    },
  });
  const [, onMarkAsNewFolder] = vi
    .mocked(socket.on)
    .mock.calls.find(([event]) => event === SocketEvents.MarkAsNewFolder)!;

  return {
    store,
    fetchTreeFolders,
    emit: onMarkAsNewFolder as (data: {
      folderId: number;
      count: number;
    }) => void,
  };
};

describe("FilesStore - new-items event of a folder", () => {
  afterEach(() => socket.socketSubscribers.clear());

  it("Marks of a private room cleared", () => {
    const { emit, fetchTreeFolders } = setup();
    socket.socketSubscribers.add(`DIR-${PRIVATE_ROOT_ID}`);

    emit({ folderId: PRIVATE_ROOT_ID, count: 0 });

    expect(fetchTreeFolders).toHaveBeenCalledTimes(1);
  });

  it("does nothing for a folder outside the tree and the open list", () => {
    const { emit, fetchTreeFolders, store } = setup();
    socket.socketSubscribers.add(`DIR-${OTHER_FOLDER_ID}`);
    const before = JSON.stringify(store.folders);

    emit({ folderId: OTHER_FOLDER_ID, count: 3 });

    expect(fetchTreeFolders).not.toHaveBeenCalled();
    expect(JSON.stringify(store.folders)).toBe(before);
  });

  it("does nothing for a folder the page is not subscribed to", () => {
    const { emit, fetchTreeFolders } = setup();

    emit({ folderId: PRIVATE_ROOT_ID, count: 0 });

    expect(fetchTreeFolders).not.toHaveBeenCalled();
  });
});
