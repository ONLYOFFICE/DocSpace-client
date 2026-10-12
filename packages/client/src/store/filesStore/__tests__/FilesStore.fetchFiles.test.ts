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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "@docspace/shared/api";
import { FolderType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";

// Minimal getFolder payload for a plain personal folder (empty pathParts skips
// the per-crumb getFolderInfo calls; USER root skips the room/AI branches).
const folderPayload = () => ({
  total: 0,
  folders: [],
  files: [],
  new: 0,
  pathParts: [] as unknown[],
  current: {
    id: 1,
    parentId: 0,
    rootFolderType: FolderType.USER,
    security: {},
    private: false,
    roomType: undefined,
    inRoom: false,
    type: undefined,
  },
});

describe("FilesStore.fetchFiles — characterization", () => {
  beforeEach(() => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      navigate: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the folder and populates files/folders from the response", async () => {
    const store = createTestFilesStore();
    const getFolder = vi
      .spyOn(api.files, "getFolder")
      .mockResolvedValue(folderPayload() as never);

    await store.fetchFiles(1);

    expect(getFolder).toHaveBeenCalledTimes(1);
    expect(getFolder.mock.calls[0][0]).toBe(1); // folderId
    expect(store.files).toEqual([]);
    expect(store.folders).toEqual([]);
  });

  it("aborts the previous request and installs a fresh AbortController", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(folderPayload() as never);

    const prev = { abort: vi.fn() } as unknown as AbortController;
    store.filesController = prev;

    await store.fetchFiles(1);

    expect(prev.abort).toHaveBeenCalledTimes(1);
    expect(store.filesController).not.toBe(prev);
  });

  it("redirects a visitor without a personal folder away from @my (no fetch)", async () => {
    const store = createTestFilesStore({
      userStore: {
        user: { id: "u1", isVisitor: true, hasPersonalFolder: false },
      },
    });
    const getFolder = vi.spyOn(api.files, "getFolder");

    await store.fetchFiles("@my");

    expect(
      (window as unknown as { DocSpace: { navigate: ReturnType<typeof vi.fn> } })
        .DocSpace.navigate,
    ).toHaveBeenCalledTimes(1);
    expect(getFolder).not.toHaveBeenCalled();
  });
});
