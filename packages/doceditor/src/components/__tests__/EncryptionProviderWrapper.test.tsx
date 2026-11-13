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

import type { TUser } from "@docspace/shared/api/people/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  getEncryptionKeys: vi.fn(),
  providerProps: null as Record<string, unknown> | null,
}));

vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: env.getEncryptionKeys,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  EncryptionProvider: (props: { children: React.ReactNode }) => {
    env.providerProps = props as unknown as Record<string, unknown>;
    return <>{props.children}</>;
  },
}));

vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: () => null,
  usePasskeyUnlock: () => ({}),
}));
vi.mock("@docspace/shared/dialogs/key-change-dialog", () => ({
  KeyChangeDialog: () => null,
}));
vi.mock("@docspace/shared/dialogs/key-recovery", () => ({
  useRecoverKeyFlow: () => ({}),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import EncryptionProviderWrapper, {
  useEncryptionKeysLoad,
  useEncryptionKeysReady,
  type TEncryptionKeysLoad,
} from "../EncryptionProviderWrapper";

const USER = { id: "user-1" } as TUser;
const KEY = {
  id: "key-1",
  publicKey: "pub",
  privateKeyEnc: "enc",
  date: "2026-01-01T00:00:00.000Z",
};

let seen: { ready: boolean; load: TEncryptionKeysLoad };
const Probe = () => {
  seen = { ready: useEncryptionKeysReady(), load: useEncryptionKeysLoad() };
  return null;
};

let root: Root;
let host: HTMLDivElement;

const renderWrapper = async () => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <EncryptionProviderWrapper user={USER}>
        <Probe />
      </EncryptionProviderWrapper>,
    );
  });
};

describe("Editor loads the caller's key envelopes before opening an encrypted file", () => {
  beforeEach(() => {
    env.providerProps = null;
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it("Envelopes loaded on start", async () => {
    env.getEncryptionKeys.mockResolvedValue([KEY]);

    await renderWrapper();

    expect(seen.ready).toBe(true);
    expect(seen.load.failed).toBe(false);
    expect(env.providerProps?.keysLoaded).toBe(true);
    expect(env.providerProps?.userKeys).toEqual({
      publicKey: "pub",
      privateKeyEnc: "enc",
      userId: "user-1",
    });
  });

  it("User without a key: an empty list is a known list", async () => {
    env.getEncryptionKeys.mockResolvedValue([]);

    await renderWrapper();

    expect(seen.load.failed).toBe(false);
    expect(env.providerProps?.keysLoaded).toBe(true);
    expect(env.providerProps?.userKeys).toBeNull();
  });

  it("Envelopes could not be loaded", async () => {
    env.getEncryptionKeys.mockRejectedValue(new Error("network"));

    await renderWrapper();

    expect(seen.ready).toBe(true);
    expect(seen.load.failed).toBe(true);
    expect(env.providerProps?.keysLoaded).toBe(false);
    expect(env.providerProps?.userKeys).toBeNull();
  });

  it("read again succeeds", async () => {
    env.getEncryptionKeys.mockRejectedValueOnce(new Error("network"));
    env.getEncryptionKeys.mockResolvedValueOnce([KEY]);
    await renderWrapper();
    expect(seen.load.failed).toBe(true);

    await act(async () => seen.load.reload());

    expect(env.getEncryptionKeys).toHaveBeenCalledTimes(2);
    expect(seen.ready).toBe(true);
    expect(seen.load.failed).toBe(false);
    expect(env.providerProps?.keysLoaded).toBe(true);
  });
});
