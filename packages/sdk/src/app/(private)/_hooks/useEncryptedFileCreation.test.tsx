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
  identity: { publicKey: "pk" } as unknown,
  release: vi.fn(),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({
    requireIdentity: async () => env.identity,
    suspendAutoLock: () => env.release,
  }),
}));

vi.mock("@docspace/shared/services/encryption/select-user-key", () => ({
  selectUserKey: () => ({ id: "key-1" }),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-file-creation", () => ({
  createEncryptedFile: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({
    userKeys: { userId: "user-1", publicKey: "user-pk" },
    keys: [{ id: "key-1" }],
  }),
}));

import { createEncryptedFile } from "@docspace/shared/services/private-room/encrypted-file-creation";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useEncryptedFileCreation } from "./useEncryptedFileCreation";

describe("useEncryptedFileCreation", () => {
  let root: Root | null = null;
  let createFile: ReturnType<typeof useEncryptedFileCreation>["createFile"];

  const Probe = () => {
    createFile = useEncryptedFileCreation(42).createFile;
    return null;
  };

  beforeEach(() => {
    env.identity = { publicKey: "pk" };
    env.release.mockClear();
    vi.mocked(createEncryptedFile).mockReset();
    vi.mocked(toastr.error).mockClear();
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Document created", async () => {
    vi.mocked(createEncryptedFile).mockResolvedValue({
      fileId: 7,
      fileName: "Plan.docx",
    });

    expect(await createFile(15, "Plan", "docx")).toBe(true);

    expect(createEncryptedFile).toHaveBeenCalledWith({
      extension: "docx",
      title: "Plan",
      folderId: 15,
      roomId: 42,
      identity: env.identity,
      userId: "user-1",
      publicKey: "user-pk",
      publicKeyId: "key-1",
    });
    expect(env.release).toHaveBeenCalledTimes(1);
  });

  it("PDF form created", async () => {
    vi.mocked(createEncryptedFile).mockResolvedValue({
      fileId: 8,
      fileName: "Form.pdf",
    });

    expect(await createFile(15, "Form", "pdf")).toBe(true);

    expect(createEncryptedFile).toHaveBeenCalledWith(
      expect.objectContaining({ extension: "pdf", title: "Form" }),
    );
  });

  it("Unsupported extension requested", async () => {
    expect(await createFile(15, "Notes", "txt" as never)).toBe(false);

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateRoomCreateNotSupported",
    );
    expect(createEncryptedFile).not.toHaveBeenCalled();
  });

  it("creates nothing when the passphrase prompt is cancelled", async () => {
    env.identity = null;

    expect(await createFile(15, "Plan", "docx")).toBe(false);

    expect(createEncryptedFile).not.toHaveBeenCalled();
  });

  it("shows a localized error when the creation fails", async () => {
    vi.mocked(createEncryptedFile).mockRejectedValue(new Error());

    expect(await createFile(15, "Plan", "xlsx")).toBe(false);

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedOperationFailed");
    expect(env.release).toHaveBeenCalledTimes(1);
  });
});
