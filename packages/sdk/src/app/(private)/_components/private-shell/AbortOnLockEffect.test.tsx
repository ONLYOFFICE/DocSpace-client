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
  abortAll: vi.fn(),
  timeoutSeconds: 0,
}));

vi.mock("../../_utils/abort-registry", () => ({
  abortAllCryptoOperations: env.abortAll,
}));

vi.mock("@docspace/shared/services/encryption/auto-lock-preference", () => ({
  getAutoLockTimeoutSeconds: () => env.timeoutSeconds,
  locksWhenTabHidden: () => false,
  setAutoLockScope: () => {},
  subscribeAutoLockChange: () => () => {},
}));

vi.mock("@docspace/shared/services/encryption/device-unlock-store", () => ({
  persistDeviceUnlock: async () => true,
  restoreDeviceUnlock: async () => null,
  forgetDeviceUnlock: async () => undefined,
}));

vi.mock("@docspace/shared/api/people", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import {
  EncryptionProvider,
  useEncryption,
} from "@docspace/shared/context/encryption";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { getLockBroadcastChannelName } from "@docspace/shared/services/encryption/lock-broadcast";

import AbortOnLockEffect from "./AbortOnLockEffect";

/** The BroadcastChannel of one browser, shared by every page of the test. */
class FakeBroadcastChannel {
  static open = new Set<FakeBroadcastChannel>();

  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public name: string) {
    FakeBroadcastChannel.open.add(this);
  }

  postMessage(data: unknown) {
    for (const channel of FakeBroadcastChannel.open) {
      if (channel !== this && channel.name === this.name) {
        channel.onmessage?.({ data } as MessageEvent);
      }
    }
  }

  close() {
    FakeBroadcastChannel.open.delete(this);
  }
}

const USER_ID = "user-1";
const IDENTITY = {
  publicKey: new Uint8Array(32).fill(1),
  privateKey: new Uint8Array(32).fill(2),
};

let isUnlocked = false;
const Probe = () => {
  isUnlocked = useEncryption().isUnlocked;
  return null;
};

describe("Shell side effects", () => {
  let root: Root | null = null;

  const renderPrivatePage = () => {
    SecretStorage.cacheUnlocked(USER_ID, IDENTITY);
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <EncryptionProvider
          userKeys={{ userId: USER_ID, publicKey: "pub", privateKeyEnc: "enc" }}
        >
          <AbortOnLockEffect />
          <Probe />
        </EncryptionProvider>,
      ),
    );
    expect(isUnlocked).toBe(true);
  };

  /** A raw page of another tab on the user's channel. */
  const anotherTab = () =>
    new FakeBroadcastChannel(getLockBroadcastChannelName(USER_ID));

  beforeEach(() => {
    FakeBroadcastChannel.open.clear();
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    env.abortAll.mockClear();
    env.timeoutSeconds = 0;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    SecretStorage.lock();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("Lock in another tab", () => {
    renderPrivatePage();

    act(() =>
      anotherTab().postMessage({ type: "lock", sessionId: "another-tab" }),
    );

    expect(isUnlocked).toBe(false);
    expect(SecretStorage.hasUnlocked(USER_ID)).toBe(false);
    expect(env.abortAll).toHaveBeenCalledWith("lock");
  });

  it("Idle lock in another tab", () => {
    vi.useFakeTimers();
    env.timeoutSeconds = 60;
    const heard = vi.fn();
    const thisPage = anotherTab();
    thisPage.onmessage = heard;
    renderPrivatePage();

    // The page under render locks after its idle time.
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(isUnlocked).toBe(false);
    expect(heard).not.toHaveBeenCalled();
  });
});

describe("Shell side effects: abort on lock", () => {
  let root: Root | null = null;

  const render = (privateKeyEnc: string) =>
    act(() =>
      root?.render(
        <EncryptionProvider
          userKeys={{ userId: USER_ID, publicKey: "pub", privateKeyEnc }}
        >
          <AbortOnLockEffect />
          <Probe />
        </EncryptionProvider>,
      ),
    );

  const lockFromAnotherTab = () =>
    act(() =>
      new FakeBroadcastChannel(getLockBroadcastChannelName(USER_ID)).postMessage(
        { type: "lock", sessionId: "another-tab" },
      ),
    );

  beforeEach(() => {
    FakeBroadcastChannel.open.clear();
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    env.abortAll.mockClear();
    root = createRoot(document.createElement("div"));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    SecretStorage.lock();
    vi.unstubAllGlobals();
  });

  it("does not abort on a first render while locked", () => {
    render("enc");

    expect(isUnlocked).toBe(false);
    expect(env.abortAll).not.toHaveBeenCalled();
  });

  it("aborts again on a second lock after an unlock", () => {
    SecretStorage.cacheUnlocked(USER_ID, IDENTITY);
    render("enc");
    lockFromAnotherTab();
    expect(env.abortAll).toHaveBeenCalledTimes(1);

    // A new envelope makes the provider read the cached key again.
    SecretStorage.cacheUnlocked(USER_ID, IDENTITY);
    render("enc-2");
    expect(isUnlocked).toBe(true);
    lockFromAnotherTab();

    expect(isUnlocked).toBe(false);
    expect(env.abortAll).toHaveBeenCalledTimes(2);
  });
});
