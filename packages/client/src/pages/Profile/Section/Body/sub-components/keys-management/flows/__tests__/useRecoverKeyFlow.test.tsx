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
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = {
  phrase: null as Record<string, unknown> | null,
  passphrase: null as Record<string, unknown> | null,
};

vi.mock("../../modals/PassphraseModal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    captured.passphrase = props;
    useEffect(() => () => {
      captured.passphrase = null;
    }, []);
    return null;
  },
}));
vi.mock("../../modals/RecoveryPhraseInputModal", () => ({
  RecoveryPhraseInputModal: (props: Record<string, unknown>) => {
    captured.phrase = props;
    useEffect(() => () => {
      captured.phrase = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  serializeIdentity: vi.fn(),
  unlockWithRecoveryPhrase: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn(), lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  updateEncryptionKeys: vi.fn(),
}));

import {
  serializeIdentity,
  unlockWithRecoveryPhrase,
} from "@docspace/shared/services/encryption/identity";
import { InvalidRecoveryPhraseError } from "@docspace/shared/services/encryption/errors";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import {
  useRecoverKeyFlow,
  type RecoverKeyFlow,
} from "../useRecoverKeyFlow";

let latest: RecoverKeyFlow;
const Harness = (deps: {
  userId: string | undefined;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useRecoverKeyFlow(deps);
  return <>{latest.modals}</>;
};

const dummyKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
};

const makeKeys = (count: number): TEncryptionKeyPair[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    userId: "42",
    publicKey: `pub-${i}`,
    privateKeyEnc: `enc-${i}`,
    // biome-ignore lint/suspicious/noExplicitAny: test mock
  })) as any;

describe("useRecoverKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.phrase = null;
    captured.passphrase = null;
  });

  describe("availability gate", () => {
    it("reports available=false when there are no keys", () => {
      render(
        <Harness
          userId="42"
          encryptionKeys={[]}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      expect(latest.available).toBe(false);
    });

    it("reports available=true when at least one key exists", () => {
      render(
        <Harness
          userId="42"
          encryptionKeys={makeKeys(1)}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      expect(latest.available).toBe(true);
    });
  });

  describe("error message routing", () => {
    it("shows InvalidRecoveryPhrase when the phrase matches NO key", async () => {
      vi.mocked(unlockWithRecoveryPhrase).mockRejectedValue(
        new InvalidRecoveryPhraseError(),
      );
      render(
        <Harness
          userId="42"
          encryptionKeys={makeKeys(3)}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "wrong phrase here",
        );
      });
      expect(captured.phrase?.error).toBe("Common:InvalidRecoveryPhrase");
      // Every key was tried before declaring the phrase invalid.
      expect(unlockWithRecoveryPhrase).toHaveBeenCalledTimes(3);
    });

    it("shows the generic EncryptionError on non-recoverable failures (network/crypto throw)", async () => {
      vi.mocked(unlockWithRecoveryPhrase).mockRejectedValueOnce(
        new Error("network timeout"),
      );
      render(
        <Harness
          userId="42"
          encryptionKeys={makeKeys(1)}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });
      expect(captured.phrase?.error).toBe("Common:EncryptionError");
    });
  });

  describe("phrase unlock and re-encrypt", () => {
    it("tries each key in turn until one matches the recovery phrase", async () => {
      const keys = makeKeys(3);
      // First two reject as InvalidRecoveryPhraseError, third succeeds.
      vi.mocked(unlockWithRecoveryPhrase)
        .mockRejectedValueOnce(new InvalidRecoveryPhraseError())
        .mockRejectedValueOnce(new InvalidRecoveryPhraseError())
        .mockResolvedValueOnce(
          // biome-ignore lint/suspicious/noExplicitAny: test mock
          dummyKeyPair as any,
        );
      render(
        <Harness
          userId="42"
          encryptionKeys={keys}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });

      expect(unlockWithRecoveryPhrase).toHaveBeenCalledTimes(3);
      // Advanced to next step → the matched key won.
      expect(captured.passphrase).not.toBeNull();
    });

    it("stops trying once a key matches (does NOT keep iterating after success)", async () => {
      const keys = makeKeys(5);
      vi.mocked(unlockWithRecoveryPhrase).mockResolvedValueOnce(
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        dummyKeyPair as any,
      );
      render(
        <Harness
          userId="42"
          encryptionKeys={keys}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });

      expect(unlockWithRecoveryPhrase).toHaveBeenCalledTimes(1);
    });

    it("re-encrypts the MATCHED key (not always keys[0])", async () => {
      const keys = makeKeys(3);
      vi.mocked(unlockWithRecoveryPhrase)
        .mockRejectedValueOnce(new InvalidRecoveryPhraseError())
        .mockResolvedValueOnce(
          // biome-ignore lint/suspicious/noExplicitAny: test mock
          dummyKeyPair as any,
        );
      vi.mocked(serializeIdentity).mockResolvedValue({
        publicKey: "pub-rotated",
        privateKeyEnc: "enc-rotated",
      });
      vi.mocked(updateEncryptionKeys).mockResolvedValue(undefined as never);

      render(
        <Harness
          userId="42"
          encryptionKeys={keys}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "new-secret",
        );
      });

      // The matched key was the 2nd one (keys[1], id="2"), so PUT must target it.
      expect(updateEncryptionKeys).toHaveBeenCalledWith({
        id: "2",
        publicKey: "pub-rotated",
        privateKeyEnc: "enc-rotated",
      });
    });

    it("advances to new-passphrase step after a successful unlock", async () => {
      vi.mocked(unlockWithRecoveryPhrase).mockResolvedValueOnce(
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        dummyKeyPair as any,
      );
      render(
        <Harness
          userId="42"
          encryptionKeys={makeKeys(1)}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });
      expect(captured.passphrase).not.toBeNull();
    });

    it("re-serializes the keypair WITH the recovery mnemonic preserved", async () => {
      vi.mocked(unlockWithRecoveryPhrase).mockResolvedValueOnce(
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        dummyKeyPair as any,
      );
      vi.mocked(serializeIdentity).mockResolvedValue({
        publicKey: "pub-new",
        privateKeyEnc: "enc-new",
      });
      vi.mocked(updateEncryptionKeys).mockResolvedValue(undefined as never);

      render(
        <Harness
          userId="42"
          encryptionKeys={makeKeys(1)}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.phrase!.onSubmit as (p: string) => Promise<void>)(
          "twelve words",
        );
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "new-secret",
        );
      });

      expect(serializeIdentity).toHaveBeenCalledWith(
        dummyKeyPair,
        "new-secret",
        { recoveryMnemonic: "twelve words" },
      );
      expect(updateEncryptionKeys).toHaveBeenCalledWith({
        id: "1",
        publicKey: "pub-new",
        privateKeyEnc: "enc-new",
      });
      expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(
        "42",
        dummyKeyPair,
      );
    });
  });
});
