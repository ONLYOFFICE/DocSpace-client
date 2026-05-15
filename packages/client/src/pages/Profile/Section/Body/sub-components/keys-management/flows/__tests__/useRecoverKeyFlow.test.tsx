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
    it("shows the i18n InvalidRecoveryPhrase key on InvalidRecoveryPhraseError", async () => {
      vi.mocked(unlockWithRecoveryPhrase).mockRejectedValueOnce(
        new InvalidRecoveryPhraseError(),
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
          "wrong phrase here",
        );
      });
      expect(captured.phrase?.error).toBe("Common:InvalidRecoveryPhrase");
    });

    it("shows the generic EncryptionError key for other failures", async () => {
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
    it("uses encryptionKeys[0] only — multi-key users get the first envelope", async () => {
      const keys = makeKeys(3);
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

      expect(unlockWithRecoveryPhrase).toHaveBeenCalledWith(
        {
          publicKey: keys[0].publicKey,
          privateKeyEnc: keys[0].privateKeyEnc,
        },
        "twelve words",
      );
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
