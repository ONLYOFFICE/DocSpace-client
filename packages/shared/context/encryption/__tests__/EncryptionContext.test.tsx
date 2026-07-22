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
import React, { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EncryptionProvider,
  useEncryption,
  type EncryptionContextValue,
  type EncryptionUserKeys,
  type KeyChangeDialogModalProps,
  type PassphraseDialogProps,
} from "../EncryptionContext";
import {
  SecretStorage,
  suspendAutoLock,
} from "../../../services/encryption/secret-storage";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "../../../services/encryption/types";
import type { KeyMismatchInfo } from "../../../services/encryption/tofu-store";

vi.mock("../../../services/encryption/identity", () => ({
  unlockWithPassphrase: vi.fn(),
}));

vi.mock("../../../services/encryption/auto-lock-preference", () => ({
  getAutoLockTimeoutSeconds: vi.fn(() => 0),
  setAutoLockTimeoutSeconds: vi.fn(),
  setAutoLockScope: vi.fn(),
  AUTO_LOCK_OPTIONS: [],
}));

import { unlockWithPassphrase } from "../../../services/encryption/identity";
import { getAutoLockTimeoutSeconds } from "../../../services/encryption/auto-lock-preference";

const dummyKeyPair: IdentityKeyPair = {
  publicKey: new Uint8Array(32).fill(1),
  privateKey: new Uint8Array(32).fill(2),
};

const userKeysFixture: EncryptionUserKeys = {
  publicKey: "pub-base64",
  privateKeyEnc: "enc-base64",
  userId: "user-42",
} as SerializedIdentity & { userId: string };

const captured = {
  passphrase: null as PassphraseDialogProps | null,
  keyChange: null as KeyChangeDialogModalProps | null,
};

const MockPassphraseDialog: React.FC<PassphraseDialogProps> = (props) => {
  captured.passphrase = props;
  useEffect(() => () => {
    captured.passphrase = null;
  }, []);
  return null;
};
const MockKeyChangeDialog: React.FC<KeyChangeDialogModalProps> = (props) => {
  captured.keyChange = props;
  useEffect(() => () => {
    captured.keyChange = null;
  }, []);
  return null;
};

let latest: EncryptionContextValue;
const Consumer: React.FC = () => {
  latest = useEncryption();
  return null;
};

type RenderOpts = {
  userKeys?: EncryptionUserKeys | null;
  withPassphraseDialog?: boolean;
  withKeyChangeDialog?: boolean;
};

const renderTree = ({
  userKeys = userKeysFixture,
  withPassphraseDialog = true,
  withKeyChangeDialog = true,
}: RenderOpts = {}) => {
  return render(
    <EncryptionProvider
      userKeys={userKeys}
      PassphraseDialog={withPassphraseDialog ? MockPassphraseDialog : undefined}
      KeyChangeDialog={withKeyChangeDialog ? MockKeyChangeDialog : undefined}
    >
      <Consumer />
    </EncryptionProvider>,
  );
};

describe("EncryptionContext / EncryptionProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.passphrase = null;
    captured.keyChange = null;
    SecretStorage.lock();
  });

  afterEach(() => {
    SecretStorage.lock();
  });

  describe("hasConfiguredKey transitions", () => {
    it("locks SecretStorage when userKeys is null (effect cleanup invariant)", () => {
      const lockSpy = vi.spyOn(SecretStorage, "lock");
      renderTree({ userKeys: null });
      expect(lockSpy).toHaveBeenCalled();
      expect(latest.hasConfiguredKey).toBe(false);
      expect(latest.isUnlocked).toBe(false);
    });

    it("treats partial userKeys (missing privateKeyEnc) as not configured", () => {
      renderTree({
        userKeys: {
          publicKey: "pub",
          privateKeyEnc: "",
          userId: "user-42",
        } as EncryptionUserKeys,
      });
      expect(latest.hasConfiguredKey).toBe(false);
    });

    it("reflects isUnlocked from SecretStorage on mount when cache is pre-populated", () => {
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);
    });

    it("exposes publicKey from the active envelope (or null when missing)", () => {
      renderTree({ userKeys: null });
      expect(latest.publicKey).toBeNull();

      renderTree({
        userKeys: {
          publicKey: "pub-base64",
          privateKeyEnc: "enc-blob",
          userId: "user-42",
        } as EncryptionUserKeys,
      });
      expect(latest.publicKey).toBe("pub-base64");
    });
  });

  describe("requireIdentity()", () => {
    it("returns null without prompting when userKeys is missing", async () => {
      renderTree({ userKeys: null });
      let result: IdentityKeyPair | null | undefined;
      await act(async () => {
        result = await latest.requireIdentity();
      });
      expect(result).toBeNull();
      expect(captured.passphrase).toBeNull();
    });

    it("returns the cached identity WITHOUT showing the dialog (fast path)", async () => {
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      let result: IdentityKeyPair | null | undefined;
      await act(async () => {
        result = await latest.requireIdentity();
      });
      expect(result).not.toBeNull();
      expect(Array.from(result!.publicKey)).toEqual(
        Array.from(dummyKeyPair.publicKey),
      );
      expect(captured.passphrase).toBeNull();
    });

    it("warns and returns null when no PassphraseDialog is registered", async () => {
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      renderTree({ withPassphraseDialog: false });
      let result: IdentityKeyPair | null | undefined;
      await act(async () => {
        result = await latest.requireIdentity();
      });
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("opens the dialog, resolves with the unlocked identity on submit", async () => {
      vi.mocked(unlockWithPassphrase).mockResolvedValue(dummyKeyPair);
      renderTree();

      let resolved = false;
      let promised!: Promise<IdentityKeyPair | null>;
      await act(async () => {
        promised = latest.requireIdentity();
        promised.then(() => {
          resolved = true;
        });
      });
      expect(captured.passphrase?.visible).toBe(true);
      expect(resolved).toBe(false);

      await act(async () => {
        await captured.passphrase!.onSubmit("secret");
      });
      const result = await promised;
      expect(result).not.toBeNull();
      expect(Array.from(result!.publicKey)).toEqual(
        Array.from(dummyKeyPair.publicKey),
      );
      expect(captured.passphrase).toBeNull();
    });

    it("resolves with null on cancel", async () => {
      renderTree();
      let promised!: Promise<IdentityKeyPair | null>;
      await act(async () => {
        promised = latest.requireIdentity();
      });
      await act(async () => {
        captured.passphrase!.onCancel();
      });
      const result = await promised;
      expect(result).toBeNull();
      expect(captured.passphrase).toBeNull();
    });

    it("surfaces unlock errors via the dialog's `error` prop (NOT thrown)", async () => {
      vi.mocked(unlockWithPassphrase).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );
      renderTree();
      let promised!: Promise<IdentityKeyPair | null>;
      await act(async () => {
        promised = latest.requireIdentity();
      });
      await act(async () => {
        await captured.passphrase!.onSubmit("wrong");
      });
      expect(captured.passphrase).not.toBeNull();
      expect(captured.passphrase?.error).toBe("Common:EncryptionError");

      // Race against a real timer (not Promise.resolve), so sentinel wins
      // only if `promised` is still pending after real time passes.
      const sentinel = Symbol("still-pending");
      const winner = await Promise.race([
        promised,
        new Promise((r) => setTimeout(() => r(sentinel), 50)),
      ]);
      expect(winner).toBe(sentinel);

      vi.mocked(unlockWithPassphrase).mockResolvedValueOnce(dummyKeyPair);
      await act(async () => {
        await captured.passphrase!.onSubmit("correct");
      });
      const result = await promised;
      expect(result).not.toBeNull();
    });
  });

  describe("auto-lock on tab hidden", () => {
    afterEach(() => {
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(0);
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });
    });

    it("locks SecretStorage when document.visibilityState becomes hidden", async () => {
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(latest.isUnlocked).toBe(false);
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });

    it("does not lock on tab hide when auto-lock is Off", async () => {
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(0);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(latest.isUnlocked).toBe(true);
      expect(SecretStorage.hasUnlocked("user-42")).toBe(true);
    });
  });

  describe("auto-lock on idle inactivity", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(0);
    });

    it("locks after configured timeout when no activity arrives", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(latest.isUnlocked).toBe(false);
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });

    it("activity resets the timer (no lock if event arrives before timeout)", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();

      act(() => {
        vi.advanceTimersByTime(45_000);
        document.dispatchEvent(new Event("keydown"));
        vi.advanceTimersByTime(45_000);
      });

      expect(latest.isUnlocked).toBe(true);

      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(latest.isUnlocked).toBe(false);
    });

    it("does not register listeners when timeoutSeconds is 0 (off)", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(0);
      const addSpy = vi.spyOn(document, "addEventListener");
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();

      const idleEvents = addSpy.mock.calls.filter(([type]) =>
        ["mousedown", "keydown", "scroll", "touchstart", "click"].includes(
          type as string,
        ),
      );
      expect(idleEvents).toHaveLength(0);
      addSpy.mockRestore();
    });

    it("does not register listeners when not unlocked", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      const addSpy = vi.spyOn(document, "addEventListener");
      renderTree({ userKeys: null });

      const idleEvents = addSpy.mock.calls.filter(([type]) =>
        ["mousedown", "keydown", "scroll", "touchstart", "click"].includes(
          type as string,
        ),
      );
      expect(idleEvents).toHaveLength(0);
      addSpy.mockRestore();
    });

    it("cleanup removes idle listeners on unmount", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const tree = renderTree();
      tree.unmount();

      const removed = removeSpy.mock.calls.filter(([type]) =>
        ["mousedown", "keydown", "scroll", "touchstart", "click"].includes(
          type as string,
        ),
      );
      expect(removed).toHaveLength(5);
      removeSpy.mockRestore();
    });
  });

  describe("auto-lock suspension via the imperative bridge", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(0);
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });
    });

    it("registers a suspender so the imperative suspendAutoLock() is wired up", () => {
      renderTree();
      let release!: () => void;
      act(() => {
        release = suspendAutoLock();
      });
      // A real suspender (not the unregistered no-op) is wired up; calling it
      // releases without throwing.
      expect(typeof release).toBe("function");
      act(() => {
        release();
      });
    });

    it("suspends tab-hidden auto-lock until the handle is released", async () => {
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);

      let release!: () => void;
      await act(async () => {
        release = suspendAutoLock();
      });

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // Still unlocked: the visibility handler is detached while suspended.
      expect(SecretStorage.hasUnlocked("user-42")).toBe(true);
      expect(latest.isUnlocked).toBe(true);

      // Release re-arms auto-lock; the next hidden event locks.
      await act(async () => {
        release();
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });

    it("suspends idle auto-lock until the handle is released", () => {
      vi.useFakeTimers();
      vi.mocked(getAutoLockTimeoutSeconds).mockReturnValue(60);
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);

      let release!: () => void;
      act(() => {
        release = suspendAutoLock();
      });

      // No idle timer runs while suspended, even well past the timeout.
      act(() => {
        vi.advanceTimersByTime(180_000);
      });
      expect(latest.isUnlocked).toBe(true);

      // After release the idle timer is re-armed and fires.
      act(() => {
        release();
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(latest.isUnlocked).toBe(false);
    });
  });

  describe("resolveKeyMismatch()", () => {
    const sampleInfo: KeyMismatchInfo = {
      userId: "peer-1",
      displayName: "Alice",
      knownKey: "pub-known",
      newKey: "pub-new",
      knownFirstSeenAt: 1000,
      knownLastSeenAt: 2000,
      // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;

    it("returns 'refuse' immediately when no KeyChangeDialog is registered", async () => {
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      renderTree({ withKeyChangeDialog: false });
      let decision: string | undefined;
      await act(async () => {
        decision = await latest.resolveKeyMismatch(sampleInfo);
      });
      expect(decision).toBe("refuse");
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("resolves with 'accept' when the user accepts the new fingerprint", async () => {
      renderTree();
      let promised!: Promise<string>;
      await act(async () => {
        promised = latest.resolveKeyMismatch(sampleInfo);
      });
      expect(captured.keyChange).not.toBeNull();
      await act(async () => {
        captured.keyChange!.onAccept();
      });
      expect(await promised).toBe("accept");
      expect(captured.keyChange).toBeNull();
    });

    it("resolves with 'refuse' when the user refuses (TOFU default-safe)", async () => {
      renderTree();
      let promised!: Promise<string>;
      await act(async () => {
        promised = latest.resolveKeyMismatch(sampleInfo);
      });
      await act(async () => {
        captured.keyChange!.onRefuse();
      });
      expect(await promised).toBe("refuse");
    });

    it("refuses the pending dialog when a NEW mismatch comes in concurrently", async () => {
      renderTree();
      let firstPromise!: Promise<string>;
      let secondPromise!: Promise<string>;
      await act(async () => {
        firstPromise = latest.resolveKeyMismatch(sampleInfo);
      });
      await act(async () => {
        secondPromise = latest.resolveKeyMismatch({
          ...sampleInfo,
          newKey: "pub-newer",
        });
      });
      expect(await firstPromise).toBe("refuse");
      await act(async () => {
        captured.keyChange!.onAccept();
      });
      expect(await secondPromise).toBe("accept");
    });
  });

  describe("useEncryption()", () => {
    it("throws when used outside an EncryptionProvider", () => {
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      expect(() => render(<Consumer />)).toThrow(
        /must be used within an EncryptionProvider/,
      );
      errorSpy.mockRestore();
    });
  });

  describe("lock() / unlock()", () => {
    it("lock() clears the cache and updates isUnlocked", async () => {
      SecretStorage.cacheUnlocked("user-42", dummyKeyPair);
      renderTree();
      expect(latest.isUnlocked).toBe(true);
      await act(async () => {
        latest.lock();
      });
      expect(latest.isUnlocked).toBe(false);
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });

    it("unlock() caches the identity on success and sets isUnlocked", async () => {
      vi.mocked(unlockWithPassphrase).mockResolvedValueOnce(dummyKeyPair);
      renderTree();
      let ok: boolean | undefined;
      await act(async () => {
        ok = await latest.unlock("secret");
      });
      expect(ok).toBe(true);
      expect(latest.isUnlocked).toBe(true);
      expect(SecretStorage.hasUnlocked("user-42")).toBe(true);
    });

    it("unlock() surfaces a translated error and does NOT cache on failure", async () => {
      vi.mocked(unlockWithPassphrase).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );
      renderTree();
      let ok: boolean | undefined;
      await act(async () => {
        ok = await latest.unlock("wrong");
      });
      expect(ok).toBe(false);
      expect(latest.unlockError).toBe("Common:EncryptionError");
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });
  });
});
