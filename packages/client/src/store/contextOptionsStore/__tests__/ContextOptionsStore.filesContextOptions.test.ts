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

import { describe, it, expect } from "vitest";

import {
  createTestContextOptionsStore,
  menuShape,
  t,
} from "./testHarness";

// getFilesContextOptions turns an option-id list (item.contextOptions) into the
// rendered ContextMenuModel[]. Passing item.contextOptions bypasses the
// filesStore lookup, so we can pin the id-list -> menu-model mapping directly.
// Snapshots capture { key, label } (labels are i18n keys under the test mock);
// onClick handlers are intentionally excluded.
const fileItem = (contextOptions: string[]) => ({
  id: 1,
  parentId: 10,
  title: "Report.docx",
  fileExst: ".docx",
  rootFolderId: 5,
  security: {},
  viewAccessibility: {},
  contextOptions,
});

describe("ContextOptionsStore.getFilesContextOptions — characterization", () => {
  it("constructs and returns a menu model for a small option set", () => {
    const store = createTestContextOptionsStore();
    const model = store.getFilesContextOptions(
      fileItem(["show-info", "download", "delete"]) as never,
      t,
    );
    // Not every option id becomes a rendered item — the builder drops ones
    // whose conditions are not met (e.g. "download" here). "delete"/"show-info"
    // do render for this item.
    expect(Array.isArray(model)).toBe(true);
    expect(menuShape(model).map((m) => m.key)).toContain("delete");
  });

  it("maps a typical document option set to a stable menu shape", () => {
    const store = createTestContextOptionsStore();
    const model = store.getFilesContextOptions(
      fileItem([
        "select",
        "download",
        "download-as",
        "move-to",
        "copy-to",
        "rename",
        "separator0",
        "delete",
      ]) as never,
      t,
    );
    expect(menuShape(model)).toMatchSnapshot();
  });

  it("maps a folder option set", () => {
    const store = createTestContextOptionsStore();
    const folder = {
      id: 3,
      parentId: 10,
      title: "Docs",
      isFolder: true,
      rootFolderId: 5,
      security: {},
      viewAccessibility: {},
      contextOptions: ["open", "download", "move-to", "rename", "delete"],
    };
    expect(menuShape(store.getFilesContextOptions(folder as never, t))).toMatchSnapshot();
  });

  it("drops 'select' in header mode", () => {
    const store = createTestContextOptionsStore();
    const keys = menuShape(
      store.getFilesContextOptions(
        fileItem(["select", "download", "delete"]) as never,
        t,
        false,
        true, // isHeader
      ),
    ).map((m) => m.key);
    expect(keys).not.toContain("select");
  });

  it("drops select/open/info in info-panel mode", () => {
    const store = createTestContextOptionsStore();
    const keys = menuShape(
      store.getFilesContextOptions(
        fileItem(["select", "open", "show-info", "download", "delete"]) as never,
        t,
        true, // isInfoPanel
      ),
    ).map((m) => m.key);
    expect(keys).not.toContain("select");
    expect(keys).not.toContain("show-info");
  });
});
