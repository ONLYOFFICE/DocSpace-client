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

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { IdentityKeyPair } from "../../../services/encryption/types";

const mocks = vi.hoisted(() => ({
  useEncryption: vi.fn(),
  isPasskeyUnlockAvailable: vi.fn(),
  hasPasskeyUnlock: vi.fn(),
  unlockWithPasskey: vi.fn(),
}));

vi.mock("../../../context/encryption", () => ({
  useEncryption: mocks.useEncryption,
}));

vi.mock("../../../services/encryption/passkey-unlock", () => ({
  isPasskeyUnlockAvailable: mocks.isPasskeyUnlockAvailable,
  hasPasskeyUnlock: mocks.hasPasskeyUnlock,
  unlockWithPasskey: mocks.unlockWithPasskey,
}));

import { usePasskeyUnlock } from "../usePasskeyUnlock";

const USER = "user-1";
const PUBLIC_KEY = "public-key";
const KEY_PAIR = { publicKey: new Uint8Array(32) } as unknown as IdentityKeyPair;

const setup = ({
  platform = true,
  enrolled = true,
}: { platform?: boolean; enrolled?: boolean } = {}) => {
  mocks.useEncryption.mockReturnValue({ publicKey: PUBLIC_KEY });
  mocks.isPasskeyUnlockAvailable.mockResolvedValue(platform);
  mocks.hasPasskeyUnlock.mockResolvedValue(enrolled);
  const onUnlocked = vi.fn();
  const hook = renderHook(() => usePasskeyUnlock(USER, onUnlocked));
  return { ...hook, onUnlocked };
};

// An unlock whose answer the test releases.
const pendingUnlock = () => {
  let answer: (value: unknown) => void = () => {};
  let signal: AbortSignal | undefined;
  mocks.unlockWithPasskey.mockImplementationOnce(
    (_user: string, _key: string, s: AbortSignal) => {
      signal = s;
      return new Promise((resolve) => {
        answer = resolve;
      });
    },
  );
  return {
    answer: (value: unknown) => answer(value),
    signal: () => signal,
  };
};

describe("usePasskeyUnlock", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("is available when the platform supports passkeys and one is enrolled", async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.available).toBe(true));
    expect(mocks.hasPasskeyUnlock).toHaveBeenCalledWith(USER, PUBLIC_KEY);
  });

  it.each([
    ["the platform has no passkeys", { platform: false }],
    ["no passkey is enrolled", { enrolled: false }],
  ])("is not available when %s", async (_, options) => {
    const { result } = setup(options);

    await waitFor(() => expect(mocks.hasPasskeyUnlock).toHaveBeenCalled());
    await act(async () => {});
    expect(result.current.available).toBe(false);
  });

  it("hands the key pair over after an ok unlock", async () => {
    const { result, onUnlocked } = setup();
    mocks.unlockWithPasskey.mockResolvedValueOnce({
      status: "ok",
      kp: KEY_PAIR,
    });

    await act(() => result.current.unlock());

    expect(onUnlocked).toHaveBeenCalledWith(KEY_PAIR);
    expect(result.current.isUnlocking).toBe(false);
  });

  it("reads the enrolment again after a failed attempt", async () => {
    const { result, onUnlocked } = setup();
    await waitFor(() => expect(result.current.available).toBe(true));
    mocks.hasPasskeyUnlock.mockResolvedValueOnce(false);
    mocks.unlockWithPasskey.mockResolvedValueOnce({ status: "failed" });

    await act(() => result.current.unlock());

    expect(mocks.hasPasskeyUnlock).toHaveBeenCalledTimes(2);
    expect(result.current.available).toBe(false);
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it("hands nothing over when aborted before the answer", async () => {
    const { result, onUnlocked } = setup();
    const unlock = pendingUnlock();

    let running: Promise<void> = Promise.resolve();
    act(() => {
      running = result.current.unlock();
    });
    await waitFor(() => expect(result.current.isUnlocking).toBe(true));
    act(() => result.current.abort());
    unlock.answer({ status: "ok", kp: KEY_PAIR });
    await act(() => running);

    expect(unlock.signal()?.aborted).toBe(true);
    expect(onUnlocked).not.toHaveBeenCalled();
    expect(result.current.isUnlocking).toBe(false);
  });

  it("aborts a running attempt on unmount", async () => {
    const { result, unmount } = setup();
    const unlock = pendingUnlock();

    act(() => {
      void result.current.unlock();
    });
    await waitFor(() => expect(unlock.signal()).toBeDefined());
    unmount();

    expect(unlock.signal()?.aborted).toBe(true);
  });
});
