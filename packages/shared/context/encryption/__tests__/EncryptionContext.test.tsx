// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
import { SecretStorage } from "../../../services/encryption/secret-storage";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "../../../services/encryption/types";
import type { KeyMismatchInfo } from "../../../services/encryption/tofu-store";

vi.mock("../../../services/encryption/identity", () => ({
  unlockWithPassphrase: vi.fn(),
}));

import { unlockWithPassphrase } from "../../../services/encryption/identity";

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
      expect(captured.passphrase?.error).toContain("auth tag mismatch");

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
    it("locks SecretStorage when document.visibilityState becomes hidden", async () => {
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

    it("unlock() surfaces the error and does NOT cache on failure", async () => {
      vi.mocked(unlockWithPassphrase).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );
      renderTree();
      let ok: boolean | undefined;
      await act(async () => {
        ok = await latest.unlock("wrong");
      });
      expect(ok).toBe(false);
      expect(latest.unlockError).toContain("auth tag mismatch");
      expect(SecretStorage.hasUnlocked("user-42")).toBe(false);
    });
  });
});
