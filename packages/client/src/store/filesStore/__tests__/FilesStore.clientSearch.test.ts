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
import { FileType, FolderType } from "@docspace/shared/enums";

import { createTestFilesStore, testFilenameCache } from "./testHarness";
import {
  loadAllPagesForClientSearchImpl,
  CLIENT_SEARCH_MAX_ITEMS,
} from "../clientSearch.helpers";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

const CTX_SENTINEL = ["ctx-stub"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

const encryptedFile = (id: number, uuidTitle: string): TFile =>
  ({
    id,
    parentId: 10,
    title: uuidTitle,
    fileExst: ".docx",
    fileType: FileType.Document,
    encrypted: true,
    viewUrl: `http://x/${id}`,
    security: {},
    viewAccessibility: {},
  }) as unknown as TFile;

const plainFile = (id: number, title: string): TFile =>
  ({
    id,
    parentId: 10,
    title,
    fileExst: ".docx",
    fileType: FileType.Document,
    security: {},
    viewAccessibility: {},
  }) as unknown as TFile;

const plainFolder = (id: number, title: string): TFolder =>
  ({
    id,
    parentId: 10,
    title,
    isFolder: true,
    viewAccessibility: {},
  }) as unknown as TFolder;

const setupStore = () => {
  const store = createTestFilesStore();
  store.files = [];
  store.folders = [];
  store.getFilesContextOptions = () => CTX_SENTINEL;
  return store;
};

beforeEach(() => {
  testFilenameCache.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FilesStore client search — filesList filtering", () => {
  it("matches encrypted files by their decrypted (cached) names", () => {
    const store = setupStore();
    store.files = [
      encryptedFile(1, "uuid-aaa.docx"),
      encryptedFile(2, "uuid-bbb.docx"),
    ];
    testFilenameCache.set("1", "Budget 2026.docx");
    testFilenameCache.set("2", "Meeting notes.docx");

    store.clientSearchQuery = "budget";

    expect(store.filesList.map((i) => i.id)).toEqual([1]);
    expect(store.filesList[0].title).toBe("Budget 2026.docx");
  });

  it("matches case-insensitively and matches plaintext folder titles", () => {
    const store = setupStore();
    store.files = [encryptedFile(1, "uuid-aaa.docx")];
    store.folders = [plainFolder(3, "Budget reports")];
    testFilenameCache.set("1", "Old budget.docx");

    store.clientSearchQuery = "BUDGET";

    expect(store.filesList.map((i) => i.id).sort()).toEqual([1, 3]);
  });

  it("falls back to the raw UUID title for still-undecrypted files", () => {
    const store = setupStore();
    store.files = [encryptedFile(1, "3fae21c1-locked.docx")];

    store.clientSearchQuery = "3fae21c1";
    expect(store.filesList.map((i) => i.id)).toEqual([1]);

    store.clientSearchQuery = "budget";
    expect(store.filesList).toEqual([]);
  });

  it("returns the unfiltered list when no query is set", () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx"), plainFile(2, "B.docx")];

    expect(store.filesList).toHaveLength(2);
  });

  it("re-sorts matches by resolved titles for name sort, folders first", () => {
    const store = setupStore();
    store.files = [
      encryptedFile(1, "uuid-zzz.docx"),
      encryptedFile(2, "uuid-aaa.docx"),
    ];
    store.folders = [plainFolder(3, "report archive")];
    testFilenameCache.set("1", "Report A.docx");
    testFilenameCache.set("2", "Report B.docx");

    store.filter.sortBy = "AZ";
    store.filter.sortOrder = "ascending";
    store.clientSearchQuery = "report";

    expect(store.filesList.map((i) => i.id)).toEqual([3, 1, 2]);

    store.filter.sortOrder = "descending";
    expect(store.filesList.map((i) => i.id)).toEqual([3, 2, 1]);
  });

  it("keeps the server order for non-name sorts", () => {
    const store = setupStore();
    store.files = [
      encryptedFile(1, "uuid-zzz.docx"),
      encryptedFile(2, "uuid-aaa.docx"),
    ];
    testFilenameCache.set("1", "B.docx");
    testFilenameCache.set("2", "A.docx");

    store.filter.sortBy = "DateAndTime";
    store.clientSearchQuery = ".docx";

    expect(store.filesList.map((i) => i.id)).toEqual([1, 2]);
  });
});

describe("FilesStore client search — derived flags", () => {
  it("hasMoreFiles is false while a client search is active", () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx")];
    store.filter.total = 500;

    expect(store.hasMoreFiles).toBe(true);

    store.clientSearchQuery = "a";
    expect(store.hasMoreFiles).toBe(false);
  });

  it("isFiltered is true while a client search is active", () => {
    const store = setupStore();
    expect(store.isFiltered).toBeFalsy();

    store.clientSearchQuery = "a";
    expect(store.isFiltered).toBe(true);
  });

  it("isEmptyFilesList waits for the warm-up before reporting no results", () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx")];
    store.clientSearchQuery = "zzz";

    store.clientSearchLoading = true;
    expect(store.isEmptyFilesList).toBe(false);

    store.clientSearchLoading = false;
    expect(store.isEmptyFilesList).toBe(true);

    store.clientSearchQuery = "a";
    expect(store.isEmptyFilesList).toBe(false);
  });
});

describe("FilesStore client search — query lifecycle", () => {
  it("setClientSearchQuery trims and normalizes the query", () => {
    const store = setupStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue({
      files: [],
      folders: [],
    } as never);

    store.setClientSearchQuery("  budget  ");
    expect(store.clientSearchQuery).toBe("budget");

    store.setClientSearchQuery("   ");
    expect(store.clientSearchQuery).toBeNull();
  });

  it("clearClientSearch resets state and cancels an in-flight warm-up", async () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx")];
    store.filter.total = 300;

    let release: (v: unknown) => void = () => {};
    vi.spyOn(api.files, "getFolder").mockImplementation(
      () => new Promise((resolve) => (release = resolve)) as never,
    );

    store.setClientSearchQuery("a");
    expect(store.clientSearchLoading).toBe(true);

    store.clearClientSearch();
    expect(store.clientSearchQuery).toBeNull();
    expect(store.clientSearchLoading).toBe(false);

    release({ files: [plainFile(2, "B.docx")], folders: [] });
    await Promise.resolve();
    await Promise.resolve();

    // the stale loop must not append the late page
    expect(store.files).toHaveLength(1);
  });
});

describe("loadAllPagesForClientSearchImpl", () => {
  it("loads every remaining page and dedupes by id", async () => {
    const store = setupStore();
    const page0 = Array.from({ length: 100 }, (_, i) =>
      plainFile(i, `f${i}.docx`),
    );
    store.files = page0;
    // page 1 overlaps page 0 by one id (99), so unique total is 249
    store.filter.total = 249;
    store.filter.folder = "42" as never;
    store.clientSearchQuery = "f";

    const getFolder = vi
      .spyOn(api.files, "getFolder")
      .mockImplementation((_folderId, filter) => {
        const page = (filter as { page: number }).page;
        const files =
          page === 1
            ? Array.from({ length: 100 }, (_, i) =>
                plainFile(99 + i, `f${99 + i}.docx`),
              )
            : Array.from({ length: 50 }, (_, i) =>
                plainFile(199 + i, `f${199 + i}.docx`),
              );
        return Promise.resolve({ files, folders: [] }) as never;
      });

    await loadAllPagesForClientSearchImpl(store);

    expect(getFolder).toHaveBeenCalledTimes(2);
    expect(
      (getFolder.mock.calls[0][1] as { page: number }).page,
    ).toBe(1);
    expect(
      (getFolder.mock.calls[1][1] as { page: number }).page,
    ).toBe(2);
    expect(store.files).toHaveLength(249);
    expect(store.clientSearchLoading).toBe(false);
  });

  it("stops on an empty page even when total is stale", async () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx")];
    store.filter.total = 500;
    store.clientSearchQuery = "a";

    const getFolder = vi
      .spyOn(api.files, "getFolder")
      .mockResolvedValue({ files: [], folders: [] } as never);

    await loadAllPagesForClientSearchImpl(store);

    expect(getFolder).toHaveBeenCalledTimes(1);
    expect(store.clientSearchLoading).toBe(false);
  });

  it("marks the search capped instead of loading past the item cap", async () => {
    const store = setupStore();
    store.files = Array.from({ length: CLIENT_SEARCH_MAX_ITEMS }, (_, i) =>
      plainFile(i, `f${i}.docx`),
    );
    store.filter.total = CLIENT_SEARCH_MAX_ITEMS + 100;
    store.clientSearchQuery = "f";

    const getFolder = vi.spyOn(api.files, "getFolder");

    await loadAllPagesForClientSearchImpl(store);

    expect(getFolder).not.toHaveBeenCalled();
    expect(store.clientSearchCapped).toBe(true);
    expect(store.clientSearchLoading).toBe(false);
  });

  it("does nothing when the folder is already fully loaded", async () => {
    const store = setupStore();
    store.files = [plainFile(1, "A.docx")];
    store.filter.total = 1;
    store.clientSearchQuery = "a";

    const getFolder = vi.spyOn(api.files, "getFolder");

    await loadAllPagesForClientSearchImpl(store);

    expect(getFolder).not.toHaveBeenCalled();
    expect(store.clientSearchLoading).toBe(false);
  });
});

describe("fetchFiles interaction", () => {
  const folderPayload = (id: number) => ({
    total: 0,
    folders: [],
    files: [],
    new: 0,
    pathParts: [] as unknown[],
    current: {
      id,
      parentId: 0,
      rootFolderType: FolderType.USER,
      security: {},
      private: false,
      roomType: undefined,
      inRoom: false,
      type: undefined,
    },
  });

  beforeEach(() => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      navigate: vi.fn(),
    };
  });

  it("navigating to another folder drops the client search", async () => {
    const store = setupStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      folderPayload(2) as never,
    );

    store.clientSearchQuery = "budget";

    // selectedFolderStore fake id is 1; fetching folder 2 is a navigation
    await store.fetchFiles(2);

    expect(store.clientSearchQuery).toBeNull();
  });

  it("a same-folder refetch keeps the query and re-warms the pages", async () => {
    const store = setupStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      folderPayload(1) as never,
    );

    store.clientSearchQuery = "budget";

    await store.fetchFiles(1);

    expect(store.clientSearchQuery).toBe("budget");
  });
});
