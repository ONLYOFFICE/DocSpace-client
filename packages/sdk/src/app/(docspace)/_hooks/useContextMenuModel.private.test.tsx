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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({ selection: [] as unknown[] }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({
    selection: env.selection,
    isCheckedItem: () => false,
    addSelection: vi.fn(),
  }),
}));

vi.mock("./useFolderActions", () => ({ default: () => ({}) }));
vi.mock("./useFilesActions", () => ({ default: () => ({}) }));
vi.mock("./useDownloadActions", () => ({
  default: () => ({
    downloadAction: vi.fn(),
    downloadAsAction: vi.fn(),
    downloadEncryptedAction: vi.fn(),
  }),
}));
vi.mock("./useFavoritesActions", () => ({ default: () => ({}) }));
vi.mock("./useSdkCustomContextActions", () => ({
  default: () => ({
    getItemCustomActions: () => [],
    getGroupCustomActions: () => [],
  }),
}));

import { AVAILABLE_CONTEXT_ITEMS as C } from "../_enums/context-items";
import useContextMenuModel from "./useContextMenuModel";

const encryptedFile = (contextOptions: string[]) => ({
  id: 7,
  title: "5f0c9a52.docx",
  fileExst: ".docx",
  encrypted: true,
  isFavorite: false,
  security: { Download: true, Copy: false, Move: true, Delete: true },
  contextOptions,
});

describe("useContextMenuModel in a private room", () => {
  let root: Root | null = null;

  const headerKeys = (contextOptions: string[]) => {
    env.selection = [encryptedFile(contextOptions)];
    let model: ReturnType<
      ReturnType<typeof useContextMenuModel>["getHeaderContextMenuModel"]
    > = [];
    const Probe = () => {
      model = useContextMenuModel({
        onCopySelectedClick: vi.fn(),
        onMoveSelectedClick: vi.fn(),
        onDeleteSelectedClick: vi.fn(),
      }).getHeaderContextMenuModel();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
    return model.map((item) => String(item.key));
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Header menu of an encrypted file: no favorites or download-as, and download without decryption is offered", () => {
    const keys = headerKeys([C.download, C.downloadEncrypted, C.delete]);

    expect(keys).toContain("download");
    expect(keys).toContain("download-encrypted");
    expect(keys).not.toContain("mark-as-favorite");
    expect(keys).not.toContain("remove-from-favorites");
    expect(keys).not.toContain("download-as");
    expect(keys).not.toContain("rename");
  });

  it("a user without keys gets only the download without decryption", () => {
    const keys = headerKeys([C.downloadEncrypted, C.delete]);

    expect(keys).not.toContain("download");
    expect(keys).toContain("download-encrypted");
  });
});
