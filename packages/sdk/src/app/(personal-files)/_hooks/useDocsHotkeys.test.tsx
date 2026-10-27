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
 * Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  bindings: new Map<string, () => void>(),
  encryptedActions: null as object | null,
  filesList: {
    items: [],
    currentFolder: null as { security?: { Create?: boolean } } | null,
  },
  selection: { selection: [], setSelection: () => {} },
}));

// The library binds keys through hotkeys-js; the handlers are what is tested.
vi.mock("react-hotkeys-hook", () => ({
  useHotkeys: (keys: string, handler: () => void) => {
    mocks.bindings.set(keys, handler);
  },
}));

vi.mock("@docspace/shared/utils/checkDialogsOpen", () => ({
  checkDialogsOpen: () => false,
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => mocks.filesList,
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => mocks.selection,
}));

vi.mock("@/app/(docspace)/_contexts/EncryptedFileActionsContext", () => ({
  useEncryptedFileActions: () => mocks.encryptedActions,
}));

import useDocsHotkeys, { type DocsHotkeysHandlers } from "./useDocsHotkeys";

const CREATE_AND_UPLOAD_KEYS = [
  "shift+d",
  "shift+s",
  "shift+p",
  "shift+o",
  "shift+f",
  "shift+u",
];

describe("useDocsHotkeys", () => {
  let root: Root | null = null;
  let handlers: { [K in keyof DocsHotkeysHandlers]: ReturnType<typeof vi.fn> };

  const render = () => {
    const Probe = () => {
      useDocsHotkeys(handlers as unknown as DocsHotkeysHandlers);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  const press = (keys: string) => act(() => mocks.bindings.get(keys)?.());

  beforeEach(() => {
    mocks.bindings.clear();
    handlers = {
      onOpenFile: vi.fn(),
      onRenameItem: vi.fn(),
      onDeleteItems: vi.fn(),
      onCreateFile: vi.fn(),
      onUploadFiles: vi.fn(),
      onUploadFolder: vi.fn(),
    };
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Upload hotkey in an archived room: no create or upload starts without the create right", () => {
    mocks.encryptedActions = {};
    mocks.filesList.currentFolder = { security: { Create: false } };
    render();

    for (const keys of CREATE_AND_UPLOAD_KEYS) press(keys);

    expect(handlers.onUploadFiles).not.toHaveBeenCalled();
    expect(handlers.onCreateFile).not.toHaveBeenCalled();
  });

  it("Ctrl+C pressed: no copy, cut or paste hotkey is bound in a private room", () => {
    mocks.encryptedActions = {};
    mocks.filesList.currentFolder = { security: { Create: true } };
    render();

    const bound = Array.from(mocks.bindings.keys()).flatMap((keys) =>
      keys.split(",").map((key) => key.trim().toLowerCase()),
    );
    expect(bound.length).toBeGreaterThan(0);
    for (const key of bound) {
      expect(key).not.toMatch(/^(ctrl|meta|cmd|command|mod)\+[cxv]$/);
    }
  });

  it("starts creates and uploads in a private room folder that grants the create right", () => {
    mocks.encryptedActions = {};
    mocks.filesList.currentFolder = { security: { Create: true } };
    render();

    press("shift+u");
    press("shift+o");

    expect(handlers.onUploadFiles).toHaveBeenCalledTimes(1);
    expect(handlers.onCreateFile).toHaveBeenCalledWith("pdf");
  });

  it("reads the create right of the folder open when the key is pressed", () => {
    mocks.encryptedActions = {};
    mocks.filesList.currentFolder = { security: { Create: true } };
    render();

    mocks.filesList.currentFolder = { security: { Create: false } };
    press("shift+u");

    expect(handlers.onUploadFiles).not.toHaveBeenCalled();
  });

  it("leaves the hotkeys outside private rooms as they were", () => {
    mocks.encryptedActions = null;
    mocks.filesList.currentFolder = null;
    render();

    press("shift+u");
    press("shift+d");
    press("shift+i");

    expect(handlers.onUploadFiles).toHaveBeenCalledTimes(1);
    expect(handlers.onCreateFile).toHaveBeenCalledWith("docx");
    expect(handlers.onUploadFolder).toHaveBeenCalledTimes(1);
  });

  it("never uploads a folder in a private room", () => {
    mocks.encryptedActions = {};
    mocks.filesList.currentFolder = { security: { Create: true } };
    render();

    press("shift+i");

    expect(handlers.onUploadFolder).not.toHaveBeenCalled();
  });
});
