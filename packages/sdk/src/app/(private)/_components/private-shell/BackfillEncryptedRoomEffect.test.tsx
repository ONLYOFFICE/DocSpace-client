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

const IDENTITY = { publicKey: new Uint8Array(32), privateKey: new Uint8Array(32) };

const env = vi.hoisted(() => ({
  isUnlocked: true,
  getIdentity: vi.fn(),
  filesStore: null as null | {
    roomId?: number;
    canEditRoom: boolean;
    maybeBackfillEncryptedRoom: ReturnType<typeof vi.fn>;
  },
  userKeys: null as null | { userId: string },
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({
    isUnlocked: env.isUnlocked,
    getIdentity: env.getIdentity,
  }),
}));

vi.mock("../../_store/PrivateRoomFilesStore", () => ({
  usePrivateRoomFilesStoreOptional: () => env.filesStore,
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: env.userKeys }),
}));

import BackfillEncryptedRoomEffect from "./BackfillEncryptedRoomEffect";

describe("Manager enters a room", () => {
  let root: Root | null = null;
  const backfill = vi.fn();

  const render = () =>
    act(() => root?.render(<BackfillEncryptedRoomEffect />));

  beforeEach(() => {
    backfill.mockReset();
    env.isUnlocked = true;
    env.getIdentity.mockReset().mockReturnValue(IDENTITY);
    env.filesStore = {
      roomId: 7,
      canEditRoom: true,
      maybeBackfillEncryptedRoom: backfill,
    };
    env.userKeys = { userId: "user-1" };
    root = createRoot(document.createElement("div"));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("backfills the room for an unlocked manager", () => {
    render();

    expect(backfill).toHaveBeenCalledTimes(1);
    expect(backfill).toHaveBeenCalledWith("user-1", IDENTITY);
  });

  it("backfills again when the room changes", () => {
    render();
    // The same store, as the open room changes.
    env.filesStore!.roomId = 8;
    render();

    expect(backfill).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["the key is locked", () => {
      env.isUnlocked = false;
    }],
    ["there is no room", () => {
      env.filesStore = { ...env.filesStore!, roomId: undefined };
    }],
    ["the user may not edit the room", () => {
      env.filesStore = { ...env.filesStore!, canEditRoom: false };
    }],
    ["there is no user", () => {
      env.userKeys = null;
    }],
    ["no identity is given", () => {
      env.getIdentity.mockReturnValue(null);
    }],
  ])("does not backfill when %s", (_, arrange) => {
    arrange();

    render();

    expect(backfill).not.toHaveBeenCalled();
  });
});
