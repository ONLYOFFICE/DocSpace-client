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

const mocks = vi.hoisted(() => ({
  setFileOwner: vi.fn(),
  requireIdentity: vi.fn(),
  getRoomMissingFileKeys: vi.fn(),
  rewrapMissingFilesForMember: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count === undefined ? key : `${key}:${opts.count}`,
  }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { files: { setFileOwner: mocks.setFileOwner } },
}));

vi.mock("@docspace/shared/api/privacy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getRoomMissingFileKeys: mocks.getRoomMissingFileKeys,
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  rewrapMissingFilesForMember: mocks.rewrapMissingFilesForMember,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ requireIdentity: mocks.requireIdentity }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: mocks.toastError },
}));

import { usePrivateOwnerChangeFlow } from "./usePrivateOwnerChangeFlow";

const ROOM_ID = 10;
const IDENTITY = { publicKey: "pk" };
const transfer = { roomId: ROOM_ID, newOwnerId: "bob", currentUserId: "me" };

const conflict = () =>
  Object.assign(new Error("Conflict"), { response: { status: 409 } });

describe("usePrivateOwnerChangeFlow — change owner", () => {
  let root: Root | null = null;

  const renderFlow = () => {
    let flow: ReturnType<typeof usePrivateOwnerChangeFlow> | null = null;
    const Probe = () => {
      flow = usePrivateOwnerChangeFlow();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
    return () => flow!;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireIdentity.mockResolvedValue(IDENTITY);
    mocks.setFileOwner.mockResolvedValue([{ id: ROOM_ID }]);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Missing entries wrapped before the transfer", async () => {
    mocks.getRoomMissingFileKeys.mockResolvedValueOnce([
      { userId: "bob", fileIds: [1, 2] },
    ]);
    mocks.rewrapMissingFilesForMember.mockImplementationOnce(async () => {
      expect(mocks.setFileOwner).not.toHaveBeenCalled();
      return { fileResults: [], skippedMembers: [], missingFileIdsByMember: {} };
    });
    const flow = renderFlow();

    const ok = await flow().changeOwner(transfer);

    expect(ok).toBe(true);
    expect(mocks.rewrapMissingFilesForMember).toHaveBeenCalledWith(
      ROOM_ID,
      "bob",
      [1, 2],
      expect.objectContaining({ currentUserId: "me", identity: IDENTITY }),
    );
    expect(mocks.setFileOwner).toHaveBeenCalledWith("bob", [ROOM_ID]);
  });

  it("Entries still missing", async () => {
    mocks.getRoomMissingFileKeys.mockResolvedValueOnce([
      { userId: "bob", fileIds: [1, 2, 3] },
    ]);
    mocks.rewrapMissingFilesForMember.mockResolvedValueOnce({
      fileResults: [],
      skippedMembers: [],
      missingFileIdsByMember: { bob: [2, 3] },
    });
    const flow = renderFlow();

    const ok = await flow().changeOwner(transfer);

    expect(ok).toBe(false);
    expect(mocks.setFileOwner).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Common:EncryptedReencryptPartialFailure:2",
    );
  });

  it("Transfer refused by the server", async () => {
    mocks.getRoomMissingFileKeys
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ userId: "bob", fileIds: [7] }]);
    mocks.setFileOwner.mockRejectedValueOnce(conflict());
    const flow = renderFlow();

    const ok = await flow().changeOwner(transfer);

    expect(ok).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Common:EncryptedReencryptPartialFailure:1",
    );
  });

  it("Unlock declined", async () => {
    mocks.requireIdentity.mockResolvedValueOnce(null);
    const flow = renderFlow();

    const ok = await flow().changeOwner(transfer);

    expect(ok).toBe(false);
    expect(mocks.getRoomMissingFileKeys).not.toHaveBeenCalled();
    expect(mocks.setFileOwner).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Common:EncryptionUnlockRequired",
    );
  });
});
