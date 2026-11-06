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
import { observable, runInAction } from "mobx";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const identity = { publicKey: new Uint8Array() };

const mocks = vi.hoisted(() => ({
  filesList: null as { items: unknown[] } | null,
  recoverEncryptedFilenames: vi.fn(async () => {}),
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => {
  const actual = (await io()) as { SecretStorage: Record<string, unknown> };
  return {
    ...actual,
    SecretStorage: { ...actual.SecretStorage, getCached: () => identity },
  };
});

vi.mock(
  "@docspace/shared/services/private-room/encrypted-filename-recovery",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    recoverEncryptedFilenames: mocks.recoverEncryptedFilenames,
  }),
);

vi.mock("@docspace/shared/context/encryption/EncryptionContext", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useEncryptionOptional: () => ({ isUnlocked: true }),
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => mocks.filesList,
}));

vi.mock("../../_store/PrivateRoomFilesStore", () => ({
  usePrivateRoomFilesStoreOptional: () => ({ roomId: 10 }),
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: { userId: "me" } }),
}));

import FilenameRecoveryEffect from "./FilenameRecoveryEffect";

const encryptedFile = (id: number) => ({
  id,
  title: `opaque-${id}.docx`,
  encrypted: true,
  viewUrl: `/view/${id}`,
});

describe("FilenameRecoveryEffect", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("File added by a list update", async () => {
    mocks.filesList = observable({ items: [encryptedFile(1)] });
    root = createRoot(document.createElement("div"));
    await act(async () => root?.render(<FilenameRecoveryEffect />));

    expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
      [{ id: 1, viewUrl: "/view/1" }],
      "me",
      identity,
      10,
    );

    await act(async () => {
      runInAction(() => {
        mocks.filesList!.items.push(encryptedFile(2));
      });
    });

    expect(mocks.recoverEncryptedFilenames).toHaveBeenLastCalledWith(
      [{ id: 2, viewUrl: "/view/2" }],
      "me",
      identity,
      10,
    );
  });
});
