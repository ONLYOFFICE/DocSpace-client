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

import type { TUser } from "@docspace/shared/api/people/types";
import { EDITOR_CONTRACT_VERSION } from "@docspace/shared/services/encryption/types";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";

import type { IInitialConfig } from "@/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const { USER_ID, FILE_ID, DEK, encryptionContext, keysLoad } = vi.hoisted(() => {
  const userId = "11111111-1111-1111-1111-111111111111";
  return {
    USER_ID: userId,
    FILE_ID: 7,
    DEK: new Uint8Array(32).fill(7),
    // One object for the whole run: the hook re-runs its effect whenever
    // requireIdentity changes identity.
    encryptionContext: {
      hasConfiguredKey: true,
      requireIdentity: (async () => ({ userId })) as () => Promise<unknown>,
    },
    keysLoad: { ready: true, failed: false, reload: () => {} },
  };
});

vi.mock("@docspace/shared/api/files", () => ({
  getFileEncryptionAccess: vi.fn(async () => ({
    fileKeys: [{ userId: USER_ID, publicKeyId: "pk-1", privateKeyEnc: "x" }],
  })),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryptionOptional: () => encryptionContext,
}));

vi.mock("@docspace/shared/services/encryption/room-file-access", () => ({
  unwrapDekForCurrentUser: vi.fn(async () => Uint8Array.from(DEK)),
}));

vi.mock("@docspace/shared/services/encryption/file-keys", () => ({
  wipeDek: vi.fn(),
}));

vi.mock("@docspace/shared/services/private-room/room-member-keys", () => ({
  loadFileSenderKeysSafe: vi.fn(async () => []),
}));

vi.mock("@/components/EncryptionProviderWrapper", () => ({
  useEncryptionKeysReady: () => keysLoad.ready,
  useEncryptionKeysLoad: () => ({
    failed: keysLoad.failed,
    reload: keysLoad.reload,
  }),
}));

import { getFileEncryptionAccess } from "@docspace/shared/api/files";
import { unwrapDekForCurrentUser } from "@docspace/shared/services/encryption/room-file-access";

import useFileEncryptionKeys, {
  type TUseFileEncryptionKeys,
} from "../useFileEncryptionKeys";

const config = (serverKeyPairs: { userId: string; cryptoEngineId?: string }[]) =>
  ({
    file: { id: FILE_ID, encrypted: true },
    document: { referenceData: { roomId: "10" } },
    editorConfig: { encryptionKeys: serverKeyPairs },
  }) as unknown as IInitialConfig;

const user = { id: USER_ID } as TUser;

describe("useFileEncryptionKeys", () => {
  let root: Root | null = null;
  let state: TUseFileEncryptionKeys | undefined;

  const render = (initialConfig: IInitialConfig) => {
    const Probe = () => {
      state = useFileEncryptionKeys(initialConfig, user);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  const settled = async () => {
    for (let i = 0; i < 20 && state?.status !== "ready"; i += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    return state;
  };

  const settledAt = async (status: TUseFileEncryptionKeys["status"]) => {
    for (let i = 0; i < 20 && state?.status !== status; i += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    return state?.status;
  };

  const requireIdentityOk = encryptionContext.requireIdentity;
  const OWN_ENTRIES = {
    fileKeys: [{ userId: USER_ID, publicKeyId: "pk-1", privateKeyEnc: "x" }],
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    state = undefined;
    encryptionContext.hasConfiguredKey = true;
    encryptionContext.requireIdentity = requireIdentityOk;
    keysLoad.ready = true;
    keysLoad.failed = false;
    keysLoad.reload = () => {};
    vi.mocked(getFileEncryptionAccess).mockImplementation(
      async () => OWN_ENTRIES as never,
    );
    vi.mocked(unwrapDekForCurrentUser).mockImplementation(async () =>
      Uint8Array.from(DEK),
    );
  });

  it("User cancels unlock", async () => {
    encryptionContext.requireIdentity = vi.fn(async () => null);
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("unlock-cancelled")).toBe("unlock-cancelled");
    expect(state?.encryptionKeys).toBeUndefined();
  });

  it("User cancels unlock: stays unlocking while the key list is loading", async () => {
    keysLoad.ready = false;
    encryptionContext.hasConfiguredKey = false;
    encryptionContext.requireIdentity = vi.fn(async () => null);
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("unlocking")).toBe("unlocking");
  });

  it("Unlock requested again", async () => {
    const requireIdentity = vi.fn(async () => null as unknown);
    encryptionContext.requireIdentity = requireIdentity;
    render(config([{ userId: USER_ID }]));
    await settledAt("unlock-cancelled");

    requireIdentity.mockResolvedValue({ userId: USER_ID });
    act(() => state?.retry());

    expect(await settledAt("ready")).toBe("ready");
    expect(requireIdentity).toHaveBeenCalledTimes(2);
  });

  it("Caller has no entry", async () => {
    vi.mocked(getFileEncryptionAccess).mockImplementation(
      async () => ({ fileKeys: [{ userId: "someone-else" }] }) as never,
    );
    const requireIdentity = vi.fn(async () => ({ userId: USER_ID }));
    encryptionContext.requireIdentity = requireIdentity;
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("no-access")).toBe("no-access");
    expect(requireIdentity).not.toHaveBeenCalled();
  });

  it("Access entries could not be fetched, then Retry after a failed request", async () => {
    vi.mocked(getFileEncryptionAccess).mockImplementationOnce(async () => {
      throw new Error("network");
    });
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("load-failed")).toBe("load-failed");

    act(() => state?.retry());

    expect(await settledAt("ready")).toBe("ready");
    expect(getFileEncryptionAccess).toHaveBeenCalledTimes(2);
  });

  it("Envelopes could not be loaded", async () => {
    keysLoad.failed = true;
    encryptionContext.hasConfiguredKey = false;
    keysLoad.reload = vi.fn();
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("load-failed")).toBe("load-failed");
    expect(getFileEncryptionAccess).not.toHaveBeenCalled();

    act(() => state?.retry());

    expect(keysLoad.reload).toHaveBeenCalledTimes(1);
  });

  it("User without a key", async () => {
    encryptionContext.hasConfiguredKey = false;
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("no-key")).toBe("no-key");
    expect(getFileEncryptionAccess).not.toHaveBeenCalled();
  });

  it("Key flow error: a file key that does not unwrap", async () => {
    vi.mocked(unwrapDekForCurrentUser).mockImplementation(async () => {
      throw new Error("unwrap");
    });
    render(config([{ userId: USER_ID }]));

    expect(await settledAt("error")).toBe("error");
  });

  it("Configuration extended: the ready entry carries the DEK, the engine id and the contract version", async () => {
    render(config([{ userId: USER_ID, cryptoEngineId: "engine-from-server" }]));

    const ready = await settled();

    expect(ready?.status).toBe("ready");
    expect(ready?.encryptionKeys).toEqual({
      dek: arrayBufferToBase64(DEK),
      cryptoEngineId: "engine-from-server",
      contractVersion: EDITOR_CONTRACT_VERSION,
    });
  });

  it("Engine id taken from the server: without a server engine id the entry has none", async () => {
    render(config([{ userId: USER_ID }]));

    const ready = await settled();

    expect(ready?.status).toBe("ready");
    expect(ready?.encryptionKeys).toEqual({
      dek: arrayBufferToBase64(DEK),
      contractVersion: EDITOR_CONTRACT_VERSION,
    });
  });
});
