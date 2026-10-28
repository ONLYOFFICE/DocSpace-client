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

const env = vi.hoisted(() => ({ selection: [] as unknown[] }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/utils/common", () => ({ openUrl: vi.fn() }));

vi.mock("@docspace/shared/api/files", () => ({ downloadFiles: vi.fn() }));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: {} }),
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({
    selection: env.selection,
    bufferSelection: null,
    getSortedFilesFromSelection: vi.fn(),
  }),
}));

vi.mock("@/app/(docspace)/_store/DialogsStore", () => ({
  useDialogsStore: () => ({ openDialog: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_store/DownloadDialogStore", () => ({
  useDownloadDialogStore: () => ({ setSortedFiles: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_store/SettingsStore", () => ({
  useSettingsStore: () => ({ shareKey: undefined }),
}));

vi.mock("@/app/(docspace)/_store/ActiveItemsStore", () => ({
  useActiveItemsStore: () => ({
    addActiveItems: vi.fn(),
    removeActiveItems: vi.fn(),
  }),
}));

vi.mock("./useFileType", () => ({ default: () => ({}) }));

import { downloadFiles as downloadFilesApi } from "@docspace/shared/api/files";
import { UrlActionType } from "@docspace/shared/enums";
import { openUrl } from "@docspace/shared/utils/common";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import {
  EncryptedFileActionsContext,
  type EncryptedFileActions,
} from "../_contexts/EncryptedFileActionsContext";
import useDownloadActions from "./useDownloadActions";

const encryptedFile = {
  id: 7,
  isFolder: false,
  encrypted: true,
  title: "memo.docx",
  fileExst: ".docx",
  viewUrl: "/view/7",
};
const plainFile = {
  id: 8,
  isFolder: false,
  title: "notes.txt",
  fileExst: ".txt",
  viewUrl: "/view/8",
};
const folder = { id: 5, isFolder: true, title: "Drafts" };

describe("useDownloadActions in a private room", () => {
  let root: Root | null = null;
  let actions: ReturnType<typeof useDownloadActions>;
  const encryptedActions = {
    roomId: 10,
    downloadFile: vi.fn(async () => {}),
    downloadZip: vi.fn(async () => {}),
    duplicateFile: vi.fn(async () => {}),
    copyFiles: vi.fn(async () => {}),
  } satisfies EncryptedFileActions;

  const Probe = () => {
    actions = useDownloadActions();
    return null;
  };

  const render = (selection: unknown[] = []) => {
    env.selection = selection;
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <EncryptedFileActionsContext.Provider value={encryptedActions}>
          <Probe />
        </EncryptedFileActionsContext.Provider>,
      ),
    );
  };

  beforeEach(() => {
    vi.mocked(downloadFilesApi).mockReset();
    vi.mocked(openUrl).mockClear();
    vi.mocked(toastr.error).mockClear();
    encryptedActions.downloadFile.mockClear();
    encryptedActions.downloadZip.mockClear();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Folder in a private room: refused from its menu and the header menu", async () => {
    render();

    await act(async () => {
      await actions.downloadAction(folder as never);
    });

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomFolderDownloadNotSupported",
    );
    expect(downloadFilesApi).not.toHaveBeenCalled();
  });

  it("Folder in a private room: refused for a selection of folders", async () => {
    render([folder]);

    await act(async () => {
      await actions.downloadAction();
    });

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomFolderDownloadNotSupported",
    );
    expect(downloadFilesApi).not.toHaveBeenCalled();
  });

  it("Folder in a private room: refused for a selection of encrypted files and a folder", async () => {
    render([encryptedFile, folder]);

    await act(async () => {
      await actions.downloadAction();
    });

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomFolderDownloadNotSupported",
    );
    expect(encryptedActions.downloadZip).not.toHaveBeenCalled();
    expect(downloadFilesApi).not.toHaveBeenCalled();
  });

  it("Mixed selection: encrypted and plain files are refused before any request", async () => {
    render([encryptedFile, plainFile]);

    await act(async () => {
      await actions.downloadAction();
    });

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomMixedDownloadNotSupported",
    );
    expect(encryptedActions.downloadZip).not.toHaveBeenCalled();
    expect(downloadFilesApi).not.toHaveBeenCalled();
    expect(openUrl).not.toHaveBeenCalled();
  });

  it("Ciphertext download: an encrypted file is saved as stored, without the decrypting path", async () => {
    render();

    await act(async () => {
      await actions.downloadEncryptedAction(encryptedFile as never);
    });

    expect(openUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/view/7",
        action: UrlActionType.Download,
      }),
    );
    expect(encryptedActions.downloadFile).not.toHaveBeenCalled();
    expect(encryptedActions.downloadZip).not.toHaveBeenCalled();
    expect(downloadFilesApi).not.toHaveBeenCalled();
  });

  it("Folder downloaded without decryption", async () => {
    vi.mocked(downloadFilesApi).mockResolvedValue([
      { id: "op-1", finished: true, url: "/archive.zip" },
    ] as never);
    render();

    await act(async () => {
      await actions.downloadEncryptedAction(folder as never);
    });

    expect(downloadFilesApi).toHaveBeenCalledWith([], [5], undefined);
    expect(openUrl).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/archive.zip" }),
    );
    expect(encryptedActions.downloadFile).not.toHaveBeenCalled();
    expect(encryptedActions.downloadZip).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Download fails: the ciphertext archive of a folder shows no raw error text", async () => {
    vi.mocked(downloadFilesApi).mockRejectedValue(new Error("Network Error"));
    render();

    await act(async () => {
      await actions.downloadEncryptedAction(folder as never);
    });

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedOperationFailed",
      undefined,
      0,
      true,
    );
    expect(toastr.error).not.toHaveBeenCalledWith(
      "Network Error",
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it("Download fails: a failed encrypted file download shows no raw error text", async () => {
    encryptedActions.downloadFile.mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    render();

    await act(async () => {
      await actions.downloadAction(encryptedFile as never);
    });

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedOperationFailed");
  });

  it("Download fails: a failed decrypted archive of a selection shows no raw error text", async () => {
    encryptedActions.downloadZip.mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    render([encryptedFile]);

    await act(async () => {
      await actions.downloadAction();
    });

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedOperationFailed");
  });
});
