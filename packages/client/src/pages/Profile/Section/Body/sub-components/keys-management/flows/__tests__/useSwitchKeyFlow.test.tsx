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

import { act, render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = { passphrase: null as Record<string, unknown> | null };

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));
vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    captured.passphrase = props;
    return null;
  },
}));
vi.mock("@docspace/shared/services/encryption/identity", () => ({
  unlockWithPassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn() },
}));
vi.mock("../rotation-runner", async (importOriginal) => {
  const original = await importOriginal<object>();
  return { ...original, isRotationRunning: vi.fn(() => false) };
});

import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  getActiveKeyId,
  setActiveKeyId,
} from "@docspace/shared/services/encryption/active-key-preference";
import {
  setRotationState,
  getRotationState,
  type RotationState,
} from "@docspace/shared/services/encryption/rotation-state";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { isRotationRunning } from "../rotation-runner";
import { useSwitchKeyFlow } from "../useSwitchKeyFlow";

const USER = "user-1";
const OLD_KEY_ID = "old-key-id";
const NEW_KEY_ID = "new-key-id";

const keys: TEncryptionKeyPair[] = [
  { id: OLD_KEY_ID, publicKey: "old-pub", privateKeyEnc: "old-enc" },
  { id: NEW_KEY_ID, publicKey: "new-pub", privateKeyEnc: "new-enc" },
] as TEncryptionKeyPair[];

const checkpoint: RotationState = {
  oldKeyId: OLD_KEY_ID,
  newKeyId: NEW_KEY_ID,
  newPublicKeyId: NEW_KEY_ID,
  startedAt: 1000,
  roomsTotal: 2,
  roomsDone: 1,
};

const identity = (fill: number): IdentityKeyPair => ({
  publicKey: new Uint8Array(32).fill(fill),
  privateKey: new Uint8Array(32).fill(fill + 1),
});

describe("useSwitchKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    vi.mocked(isRotationRunning).mockReturnValue(false);
    setActiveKeyId(USER, OLD_KEY_ID);
  });

  const renderFlow = (
    over: Partial<Parameters<typeof useSwitchKeyFlow>[0]> = {},
  ) =>
    renderHook(() =>
      useSwitchKeyFlow({
        userId: USER,
        encryptionKeys: keys,
        requireIdentity: vi.fn().mockResolvedValue(identity(1)),
        rotateForAllRooms: vi.fn().mockResolvedValue({
          roomsTotal: 1,
          filesTotal: 1,
          filesDone: 1,
          filesFailed: 0,
          filesUnreadable: 0,
          failedRoomIds: [],
        }),
        refreshKeysFromServer: vi.fn().mockResolvedValue(undefined),
        ...over,
      }),
    );

  it("no-ops when switching to the already-active key", async () => {
    const requireIdentity = vi.fn();
    const { result } = renderFlow({ requireIdentity });
    await act(async () => {
      await result.current.switchTo(OLD_KEY_ID);
    });
    expect(requireIdentity).not.toHaveBeenCalled();
  });

  it("unlocks source + target, re-wraps, and activates the target on full success", async () => {
    const source = identity(1);
    const target = identity(5);
    const requireIdentity = vi.fn().mockResolvedValue(source);
    const rotateForAllRooms = vi.fn().mockResolvedValue({
      roomsTotal: 1,
      filesTotal: 2,
      filesDone: 2,
      filesFailed: 0,
      filesUnreadable: 0,
      failedRoomIds: [],
    });
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({ requireIdentity, rotateForAllRooms });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    expect(requireIdentity).toHaveBeenCalledTimes(1);

    render(<>{result.current.modals}</>);
    expect(captured.passphrase).not.toBeNull();
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(unlockWithPassphrase).toHaveBeenCalledWith(
      { publicKey: "new-pub", privateKeyEnc: "new-enc" },
      "target-secret",
    );
    expect(rotateForAllRooms).toHaveBeenCalledWith(
      source,
      target,
      USER,
      NEW_KEY_ID,
      OLD_KEY_ID,
    );
    expect(getActiveKeyId(USER)).toBe(NEW_KEY_ID);
    expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(USER, target);
  });

  it("keeps the source active on a GENUINE partial migration (some files moved)", async () => {
    const source = identity(1);
    const target = identity(5);
    const rotateForAllRooms = vi.fn().mockResolvedValue({
      roomsTotal: 1,
      filesTotal: 2,
      filesDone: 1,
      filesFailed: 1,
      filesUnreadable: 1,
      failedRoomIds: [10],
    });
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({
      requireIdentity: vi.fn().mockResolvedValue(source),
      rotateForAllRooms,
    });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    render(<>{result.current.modals}</>);
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(getActiveKeyId(USER)).toBe(OLD_KEY_ID);
    expect(SecretStorage.cacheUnlocked).not.toHaveBeenCalled();
  });

  it("R1: with NO active key, adopts the target directly without migrating", async () => {
    localStorage.clear();
    const target = identity(5);
    const requireIdentity = vi.fn();
    const rotateForAllRooms = vi.fn();
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({ requireIdentity, rotateForAllRooms });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    expect(requireIdentity).not.toHaveBeenCalled();

    render(<>{result.current.modals}</>);
    expect(captured.passphrase).not.toBeNull();
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(rotateForAllRooms).not.toHaveBeenCalled();
    expect(getActiveKeyId(USER)).toBe(NEW_KEY_ID);
    expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(USER, target);
  });

  it("R2: when the active source holds none of the files, activates target and clears the checkpoint", async () => {
    const source = identity(1);
    const target = identity(5);
    setRotationState(USER, checkpoint);
    const rotateForAllRooms = vi.fn().mockResolvedValue({
      roomsTotal: 1,
      filesTotal: 2,
      filesDone: 0,
      filesFailed: 2,
      filesUnreadable: 2,
      failedRoomIds: [10],
    });
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({
      requireIdentity: vi.fn().mockResolvedValue(source),
      rotateForAllRooms,
    });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    render(<>{result.current.modals}</>);
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(getActiveKeyId(USER)).toBe(NEW_KEY_ID);
    expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(USER, target);
    expect(getRotationState(USER)).toBeNull();
  });

  it("#1: null migration summary (e.g. room listing failed) does NOT adopt the target", async () => {
    const target = identity(5);
    const rotateForAllRooms = vi.fn().mockResolvedValue(null);
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({
      requireIdentity: vi.fn().mockResolvedValue(identity(1)),
      rotateForAllRooms,
    });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    render(<>{result.current.modals}</>);
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(getActiveKeyId(USER)).toBe(OLD_KEY_ID);
    expect(SecretStorage.cacheUnlocked).not.toHaveBeenCalled();
  });

  it("#2: total TRANSIENT failure (source could read, writes failed) keeps the source active", async () => {
    const target = identity(5);
    const rotateForAllRooms = vi.fn().mockResolvedValue({
      roomsTotal: 1,
      filesTotal: 2,
      filesDone: 0,
      filesFailed: 2,
      filesUnreadable: 0,
      failedRoomIds: [10],
    });
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({
      requireIdentity: vi.fn().mockResolvedValue(identity(1)),
      rotateForAllRooms,
    });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    render(<>{result.current.modals}</>);
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(getActiveKeyId(USER)).toBe(OLD_KEY_ID);
    expect(SecretStorage.cacheUnlocked).not.toHaveBeenCalled();
  });

  it("lets the user adopt the target even if the source key is not unlocked", async () => {
    const target = identity(5);
    const requireIdentity = vi.fn().mockResolvedValue(null);
    const rotateForAllRooms = vi.fn();
    vi.mocked(unlockWithPassphrase).mockResolvedValue(target);

    const { result } = renderFlow({ requireIdentity, rotateForAllRooms });
    await act(async () => {
      await result.current.switchTo(NEW_KEY_ID);
    });
    expect(requireIdentity).toHaveBeenCalledTimes(1);

    render(<>{result.current.modals}</>);
    expect(captured.passphrase).not.toBeNull();
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "target-secret",
      );
    });

    expect(rotateForAllRooms).not.toHaveBeenCalled();
    expect(getActiveKeyId(USER)).toBe(NEW_KEY_ID);
  });

  it("surfaces a resumable checkpoint whose target is still registered", () => {
    setRotationState(USER, checkpoint);
    const { result } = renderFlow();
    expect(result.current.pendingState).toMatchObject({ newKeyId: NEW_KEY_ID });
  });

  it("hides the checkpoint when its target key was deleted", () => {
    setRotationState(USER, checkpoint);
    const { result } = renderFlow({
      encryptionKeys: keys.filter((k) => k.id !== NEW_KEY_ID),
    });
    expect(result.current.pendingState).toBeNull();
  });

  it("hides the banner while a rotation is already running", () => {
    setRotationState(USER, checkpoint);
    vi.mocked(isRotationRunning).mockReturnValue(true);
    const { result } = renderFlow();
    expect(result.current.pendingState).toBeNull();
  });

  it("dismiss is session-scoped and preserves the checkpoint", () => {
    setRotationState(USER, checkpoint);
    const { result } = renderFlow();
    act(() => result.current.dismiss());
    expect(result.current.isDismissed).toBe(true);
    expect(getRotationState(USER)).not.toBeNull();
  });
});
