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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  folders: new Map<number, unknown>(),
  paths: new Map<number, unknown[]>(),
  actions: { roomId: 10, copyFiles: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api/files", () => ({
  copyToFolder: vi.fn(async () => []),
  moveToFolder: vi.fn(async () => []),
  duplicate: vi.fn(),
  getFoldersTree: vi.fn(async () => []),
  checkFileConflicts: vi.fn(async () => []),
  getFolder: vi.fn(async (folderId: number) => env.folders.get(folderId)),
  getFolderPath: vi.fn(async (folderId: number) => {
    const path = env.paths.get(folderId);
    if (!path) throw new Error(`no path for folder ${folderId}`);
    return path;
  }),
}));

vi.mock("@docspace/shared/api/apps", () => ({ getApps: vi.fn(async () => []) }));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({
    rootFolderType: 14,
    currentFolder: { id: 10 },
    removeItem: vi.fn(),
  }),
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({ setSelection: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_contexts/EncryptedFileActionsContext", () => ({
  useEncryptedFileActions: () => env.actions,
}));

vi.mock("./useOperationToast", () => ({
  default: () => ({ showCopyToast: vi.fn(), showMoveToast: vi.fn() }),
}));

import { moveToFolder } from "@docspace/shared/api/files";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import useFileOperations from "./useFileOperations";

const folderData = (current: object) => ({
  folders: [],
  files: [],
  total: 0,
  current,
  pathParts: [],
});

// GET folder/{id}/path answers: a folder inside a room reads private: false.
const SECTION = { id: 2, title: "Rooms" };
const OWN_ROOM = { id: 10, title: "Room", roomType: 5, private: true };
const OTHER_ROOM = { id: 20, title: "Other", roomType: 5, private: true };
const SUBFOLDER = { id: 11, title: "Drafts", private: false };

describe("useFileOperations in a private room", () => {
  let root: Root | null = null;
  let ops: ReturnType<typeof useFileOperations>;

  const Probe = () => {
    ops = useFileOperations();
    return null;
  };

  const moveTo = async (item: object, destFolderId: number) => {
    await act(async () => {
      await ops.requestMove(item as never);
    });
    await act(async () => {
      await ops.confirmOperation(destFolderId, "Destination");
    });
  };

  const moveFolderTo = (destFolderId: number) =>
    moveTo({ id: 5, isFolder: true, title: "Drafts" }, destFolderId);

  beforeEach(() => {
    vi.mocked(moveToFolder).mockClear();
    vi.mocked(toastr.error).mockClear();
    env.actions.copyFiles.mockClear();
    env.folders.clear();
    env.paths.clear();
    env.folders.set(10, folderData({ id: 10, private: true, roomType: 5 }));
    env.paths.set(11, [SECTION, OWN_ROOM, SUBFOLDER]);
    env.paths.set(20, [SECTION, OTHER_ROOM]);
    env.paths.set(30, [{ id: 30, title: "My documents" }]);
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Folder moved within a private room", async () => {
    await moveFolderTo(11);

    expect(moveToFolder).toHaveBeenCalledWith(11, [5], [], expect.anything(), false);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Folder moved to another private room", async () => {
    await moveFolderTo(20);

    expect(moveToFolder).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotMoveToAnotherPrivateRoom",
    );
  });

  it("Move into another private room", async () => {
    const file = {
      id: 7,
      isFolder: false,
      encrypted: true,
      title: "memo.txt",
      fileExst: ".txt",
    };

    await moveTo(file, 20);

    expect(env.actions.copyFiles).not.toHaveBeenCalled();
    expect(moveToFolder).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotMoveToAnotherPrivateRoom",
    );
  });

  it("File moved within the room", async () => {
    const file = {
      id: 7,
      isFolder: false,
      encrypted: true,
      title: "memo.txt",
      fileExst: ".txt",
    };

    await moveTo(file, 11);

    expect(moveToFolder).toHaveBeenCalledWith(11, [], [7], expect.anything(), false);
    expect(env.actions.copyFiles).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Move dialog", async () => {
    const file = {
      id: 7,
      isFolder: false,
      encrypted: true,
      title: "memo.txt",
      fileExst: ".txt",
    };

    await act(async () => {
      await ops.requestMove(file as never);
    });
    expect(ops.selectorPinnedRootId).toBe(10);
    expect(ops.showEncryptedTransferBanner).toBe(false);

    await act(async () => {
      await ops.requestCopy(file as never);
    });
    expect(ops.selectorPinnedRootId).toBeUndefined();
    expect(ops.showEncryptedTransferBanner).toBe(true);
  });

  it("Destination without the create right", async () => {
    const file = {
      id: 7,
      isFolder: false,
      encrypted: true,
      title: "memo.txt",
      fileExst: ".txt",
    };
    await act(async () => {
      await ops.requestCopy(file as never);
    });

    const isDisabled = (security: object) =>
      ops.getSelectorIsDisabled(
        false,
        false,
        21,
        "files",
        false,
        security as never,
        undefined,
        false,
        false,
        false,
        true,
      );

    expect(isDisabled({ Create: false, CopyTo: true })).toBe(true);
    expect(isDisabled({ Create: true, CopyTo: true })).toBe(false);
  });

  it("Folder transferred out of the room", async () => {
    await moveFolderTo(30);

    expect(moveToFolder).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotTransferFolderFromPrivateRoom",
    );
  });
});
