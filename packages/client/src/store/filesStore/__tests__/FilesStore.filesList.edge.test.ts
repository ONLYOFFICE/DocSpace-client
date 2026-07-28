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

import { describe, it, expect, beforeEach } from "vitest";
import { FileType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

// Tier 1: edge cases of getFilesListItems the happy-path suite skips —
// recycle-bin (href suppressed), archive files (href = webUrl), third-party
// folders (isThirdPartyFolder), locked/encrypted passthrough, and plugin
// option injection. getFilesContextOptions is stubbed to isolate the mapping.
const CTX = ["ctx"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

const baseFile = (over: Partial<TItem> = {}): TItem =>
  ({
    id: 1,
    parentId: 10,
    title: "Report.docx",
    fileExst: ".docx",
    fileType: FileType.Document,
    rootFolderId: 5,
    viewAccessibility: {},
    ...over,
  }) as unknown as TItem;

describe("getFilesListItems — edge cases", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    store.files = [];
    store.folders = [];
    store.getFilesContextOptions = () => CTX;
  });

  it("recycle bin: href is null (no navigation target)", () => {
    store = createTestFilesStore({
      treeFoldersStore: { isRecycleBinFolder: true },
    });
    store.folders = [];
    store.getFilesContextOptions = () => CTX;

    const [item] = store.getFilesListItems([baseFile()]);
    expect(item.href).toBeNull();
  });

  it("archive file: href falls back to webUrl", () => {
    const [item] = store.getFilesListItems([
      baseFile({
        fileExst: ".zip",
        fileType: FileType.Archive,
        webUrl: "http://example/archive.zip",
      } as Partial<TItem>),
    ]);
    expect(item.href).toBe("http://example/archive.zip");
  });

  it("third-party folder: isThirdPartyFolder when providerKey and id===rootFolderId", () => {
    const [item] = store.getFilesListItems([
      baseFile({ id: 5, rootFolderId: 5, providerKey: "GoogleDrive" } as Partial<TItem>),
    ]);
    // `providerKey && id === rootFolderId` evaluates to the boolean `true`.
    expect(item.isThirdPartyFolder).toBe(true);
    expect(item.thirdPartyIcon).toBe("third-party-icon.svg");
  });

  it("locked / encrypted flags pass through", () => {
    const [item] = store.getFilesListItems([
      baseFile({ locked: true, encrypted: true } as Partial<TItem>),
    ]);
    expect(item.locked).toBe(true);
    expect(item.encrypted).toBe(true);
  });

  it("injects plugin options when a plugin matches the extension", () => {
    store = createTestFilesStore({
      settingsStore: { enablePlugins: true },
      pluginStore: {
        fileItemsList: [
          {
            value: {
              extension: ".docx",
              fileTypeName: "Custom Doc",
              fileIconTile: "custom-tile.svg",
            },
          },
        ],
      },
    });
    store.folders = [];
    store.getFilesContextOptions = () => CTX;

    const [item] = store.getFilesListItems([baseFile()]);
    const enriched = item as unknown as {
      fileTypeName?: string;
      isPlugin?: boolean;
      fileTileIcon?: string;
    };
    expect(enriched.isPlugin).toBe(true);
    expect(enriched.fileTypeName).toBe("Custom Doc");
    expect(enriched.fileTileIcon).toBe("custom-tile.svg");
  });
});
