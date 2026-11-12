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

import { act, render } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const encryption = vi.hoisted(() => ({
  hasConfiguredKey: false,
  keysLoaded: false,
  isUnlocked: false,
  requireIdentity: (() => Promise.resolve(null)) as () => Promise<unknown>,
  providerProps: null as Record<string, unknown> | null,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => encryption,
  EncryptionProvider: (props: Record<string, unknown>) => {
    encryption.providerProps = props;
    return null;
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { info: vi.fn(), warning: vi.fn(), error: vi.fn(), clear: vi.fn() },
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
vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: vi.fn(),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { roomUnlockRequest } from "SRC_DIR/helpers/roomUnlockRequest";

const wrapperModule = await import("../EncryptionProviderWrapper");
const EncryptionProviderWrapper =
  wrapperModule.default as unknown as React.ComponentType<{
    children?: React.ReactNode;
  }>;
const DeviceSetupHintEffect =
  wrapperModule.DeviceSetupHintEffect as unknown as React.ComponentType;
const RoomUnlockEffect =
  wrapperModule.RoomUnlockEffect as unknown as React.ComponentType;

const KEY = { id: "key-1", publicKey: "pub", privateKeyEnc: "enc" };

const PRIVATE_FOLDER = { private: true };

const hint = (
  <Provider selectedFolderStore={PRIVATE_FOLDER}>
    <DeviceSetupHintEffect />
  </Provider>
);

const renderHint = () => render(hint);

const renderWrapper = (encryptionKeys: unknown) =>
  render(
    <Provider userStore={{ encryptionKeys, user: { id: "me" } }}>
      <EncryptionProviderWrapper />
    </Provider>,
  );

describe("Device setup hint on entering a private room without keys", () => {
  beforeEach(() => {
    sessionStorage.clear();
    encryption.hasConfiguredKey = false;
    encryption.keysLoaded = true;
  });

  it("First private room this session", () => {
    renderHint();

    expect(toastr.info).toHaveBeenCalledTimes(1);
  });

  it("Second room same session", () => {
    renderHint().unmount();
    renderHint();

    expect(toastr.info).toHaveBeenCalledTimes(1);
  });

  it("Key list not known", () => {
    encryption.keysLoaded = false;
    renderHint().unmount();

    expect(toastr.info).not.toHaveBeenCalled();

    // The list arrived empty: the hint was not spent while it was unknown.
    encryption.keysLoaded = true;
    renderHint();

    expect(toastr.info).toHaveBeenCalledTimes(1);
  });

  it("shows no hint to a user who holds a key", () => {
    encryption.hasConfiguredKey = true;
    renderHint();

    expect(toastr.info).not.toHaveBeenCalled();
  });
});

describe("A locked key is shown in a private room: the entry request", () => {
  const ROOM = 9100;

  const renderEffect = (isPrivate = true) => {
    const sync = vi.fn();
    render(
      <Provider
        selectedFolderStore={{ private: isPrivate, id: ROOM }}
        filesStore={{ syncEncryptedRoom: sync }}
      >
        <RoomUnlockEffect />
      </Provider>,
    );
    return sync;
  };

  beforeEach(() => {
    roomUnlockRequest.reset();
    encryption.hasConfiguredKey = true;
    encryption.keysLoaded = true;
    encryption.isUnlocked = false;
  });

  it("pending while the entry request is open", async () => {
    let answer!: (identity: unknown) => void;
    encryption.requireIdentity = vi.fn(
      () => new Promise((resolve) => (answer = resolve)),
    );

    renderEffect();

    expect(encryption.requireIdentity).toHaveBeenCalledTimes(1);
    expect(roomUnlockRequest.settledFolderId).toBeNull();

    await act(async () => answer(null));

    expect(roomUnlockRequest.settledFolderId).toBe(ROOM);
  });

  it("settled after a cancel, without the room sync", async () => {
    encryption.requireIdentity = vi.fn(async () => null);

    const sync = renderEffect();
    await act(async () => {});

    expect(roomUnlockRequest.settledFolderId).toBe(ROOM);
    expect(sync).not.toHaveBeenCalled();
  });

  it("settled at once, without a prompt, when the key is unlocked", () => {
    encryption.isUnlocked = true;
    encryption.requireIdentity = vi.fn(async () => null);

    renderEffect();

    expect(encryption.requireIdentity).not.toHaveBeenCalled();
    expect(roomUnlockRequest.settledFolderId).toBe(ROOM);
  });

  it("asks nothing of a user without a key", () => {
    encryption.hasConfiguredKey = false;
    encryption.requireIdentity = vi.fn(async () => null);

    renderEffect();

    expect(encryption.requireIdentity).not.toHaveBeenCalled();
    expect(roomUnlockRequest.settledFolderId).toBeNull();
  });

  it("forgets the answer outside private rooms", () => {
    roomUnlockRequest.settle(ROOM);

    renderEffect(false);

    expect(roomUnlockRequest.settledFolderId).toBeNull();
  });
});

describe("EncryptionProviderWrapper tells the provider whether the key list is known", () => {
  it.each([
    ["not read or failed", null, false],
    ["known empty", [], true],
    ["known with a key", [KEY], true],
  ])("%s", (_name, keys, keysLoaded) => {
    renderWrapper(keys);

    expect(encryption.providerProps?.keysLoaded).toBe(keysLoaded);
  });
});
