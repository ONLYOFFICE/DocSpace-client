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
  downloadAndDecryptFile: vi.fn(),
  triggerFileDownload: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({
    requireIdentity: async () => ({ publicKey: new Uint8Array() }),
  }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@docspace/shared/api/files", () => ({
  getFileEncryptionAccess: vi.fn(async () => ({
    fileKeys: [{ userId: "me", publicKeyId: "k1", encryptedKey: "wrap" }],
  })),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-download", () => ({
  downloadAndDecryptFile: env.downloadAndDecryptFile,
  triggerFileDownload: env.triggerFileDownload,
}));

vi.mock("@docspace/shared/services/private-room/room-member-keys", () => ({
  loadRoomMemberKeysSafe: vi.fn(async () => []),
}));

vi.mock("../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: { userId: "me" } }),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useEncryptedDownload } from "./useEncryptedDownload";

describe("useEncryptedDownload", () => {
  let root: Root | null = null;
  let download: ReturnType<typeof useEncryptedDownload>;

  const Probe = () => {
    download = useEncryptedDownload();
    return null;
  };

  beforeEach(() => {
    vi.mocked(toastr.error).mockClear();
    env.triggerFileDownload.mockClear();
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Download fails", async () => {
    env.downloadAndDecryptFile.mockResolvedValueOnce({
      success: false,
      error: "Failed to download file: 500 Internal Server Error",
    });

    await act(async () => {
      await download.downloadFile({
        fileId: 7,
        roomId: 10,
        downloadUrl: "/view/7",
        originalFileName: "memo.docx",
        originalFileType: ".docx",
      });
    });

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptionDownloadFailed");
    expect(env.triggerFileDownload).not.toHaveBeenCalled();
  });
});
