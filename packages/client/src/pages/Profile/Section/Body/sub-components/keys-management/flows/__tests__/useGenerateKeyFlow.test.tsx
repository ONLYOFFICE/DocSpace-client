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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Modal mocks capture props on mount and clear them on unmount, so stale
// props from a prior render don't satisfy assertions made after reset().
const captured = {
  confirmation: null as Record<string, unknown> | null,
  passphrase: null as Record<string, unknown> | null,
  recovery: null as Record<string, unknown> | null,
};

vi.mock("../../modals/ConfirmationModal", () => ({
  ConfirmationModal: (props: Record<string, unknown>) => {
    captured.confirmation = props;
    useEffect(() => () => {
      captured.confirmation = null;
    }, []);
    return null;
  },
}));
vi.mock("../../modals/PassphraseModal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    captured.passphrase = props;
    useEffect(() => () => {
      captured.passphrase = null;
    }, []);
    return null;
  },
}));
vi.mock("../../modals/RecoveryPhraseDisplayModal", () => ({
  RecoveryPhraseDisplayModal: (props: Record<string, unknown>) => {
    captured.recovery = props;
    useEffect(() => () => {
      captured.recovery = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  generateIdentityKeyPair: vi.fn(),
  serializeIdentity: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/recovery", () => ({
  generateRecoveryMnemonic: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn(), lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  setEncryptionKeys: vi.fn(),
  updateEncryptionKeys: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import { generateRecoveryMnemonic } from "@docspace/shared/services/encryption/recovery";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  setEncryptionKeys,
  updateEncryptionKeys,
} from "@docspace/shared/api/privacy";

import {
  useGenerateKeyFlow,
  type GenerateKeyFlow,
} from "../useGenerateKeyFlow";

let latest: GenerateKeyFlow;
const Harness = (deps: {
  userId: string | undefined;
  hasKeys: boolean;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useGenerateKeyFlow(deps);
  return <>{latest.modals}</>;
};

const dummyKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
};

const happyMocks = () => {
  vi.mocked(generateIdentityKeyPair).mockResolvedValue(
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    dummyKeyPair as any,
  );
  vi.mocked(generateRecoveryMnemonic).mockResolvedValue("twelve word phrase");
  vi.mocked(serializeIdentity).mockResolvedValue({
    publicKey: "pub-base64",
    privateKeyEnc: "enc-base64",
  });
  vi.mocked(setEncryptionKeys).mockResolvedValue(undefined as never);
  vi.mocked(updateEncryptionKeys).mockResolvedValue(undefined as never);
};

describe("useGenerateKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.confirmation = null;
    captured.passphrase = null;
    captured.recovery = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("entry branch (hasKeys gate)", () => {
    it("goes straight to passphrase when the user has no existing key", () => {
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      expect(captured.passphrase).not.toBeNull();
      expect(captured.confirmation?.visible).toBe(false);
    });

    it("shows confirm-replace BEFORE passphrase when the user already has a key", () => {
      render(
        <Harness
          userId="42"
          hasKeys
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());
      expect(captured.confirmation?.visible).toBe(true);
      expect(captured.passphrase).toBeNull();
    });
  });

  describe("onPassphraseSubmit", () => {
    it("toasts an error and does NOT generate keys when userId is undefined", async () => {
      render(
        <Harness
          userId={undefined}
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());

      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(generateIdentityKeyPair).not.toHaveBeenCalled();
      expect(generateRecoveryMnemonic).not.toHaveBeenCalled();
    });

    it("advances to recovery-display on successful keypair generation", async () => {
      happyMocks();
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());

      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(generateIdentityKeyPair).toHaveBeenCalledTimes(1);
      expect(generateRecoveryMnemonic).toHaveBeenCalledTimes(1);
      expect(captured.recovery?.mnemonic).toBe("twelve word phrase");
    });

    it("toasts an error and resets state when keypair generation throws", async () => {
      vi.mocked(generateIdentityKeyPair).mockRejectedValueOnce(
        new Error("rng failure"),
      );
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      act(() => latest.request());

      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(captured.recovery).toBeNull();
    });
  });

  describe("onRecoveryConfirm — API branch (hasKeys decides endpoint)", () => {
    it("calls setEncryptionKeys for a new user (hasKeys=false)", async () => {
      happyMocks();
      const refresh = vi.fn().mockResolvedValue(undefined);
      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={refresh} />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.recovery!.onConfirm as () => Promise<void>)();
      });

      expect(setEncryptionKeys).toHaveBeenCalledTimes(1);
      expect(updateEncryptionKeys).not.toHaveBeenCalled();
      expect(setEncryptionKeys).toHaveBeenCalledWith({
        publicKey: "pub-base64",
        privateKeyEnc: "enc-base64",
      });
    });

    it("calls updateEncryptionKeys (NOT setEncryptionKeys) when replacing", async () => {
      happyMocks();
      render(
        <Harness userId="42" hasKeys refreshKeysFromServer={vi.fn()} />,
      );
      act(() => latest.request());
      act(() => {
        (captured.confirmation!.onConfirm as () => void)();
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.recovery!.onConfirm as () => Promise<void>)();
      });

      expect(updateEncryptionKeys).toHaveBeenCalledTimes(1);
      expect(setEncryptionKeys).not.toHaveBeenCalled();
    });

    it("invokes serializeIdentity with the generated recovery mnemonic", async () => {
      happyMocks();
      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={vi.fn()} />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.recovery!.onConfirm as () => Promise<void>)();
      });

      expect(serializeIdentity).toHaveBeenCalledWith(
        dummyKeyPair,
        "secret",
        { recoveryMnemonic: "twelve word phrase" },
      );
    });

    it("caches the unlocked identity AFTER the API write but BEFORE refresh", async () => {
      happyMocks();
      const callOrder: string[] = [];
      vi.mocked(setEncryptionKeys).mockImplementationOnce((async () => {
        callOrder.push("api");
      }) as never);
      vi.mocked(SecretStorage.cacheUnlocked).mockImplementationOnce(() => {
        callOrder.push("cache");
      });
      const refresh = vi.fn().mockImplementation(async () => {
        callOrder.push("refresh");
      });

      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={refresh} />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.recovery!.onConfirm as () => Promise<void>)();
      });

      expect(callOrder).toEqual(["api", "cache", "refresh"]);
    });

    it("clears state via reset() on API error so the user can retry", async () => {
      happyMocks();
      vi.mocked(setEncryptionKeys).mockRejectedValueOnce(new Error("500"));

      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={vi.fn()} />,
      );
      act(() => latest.request());
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.recovery!.onConfirm as () => Promise<void>)();
      });

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(captured.recovery).toBeNull();
    });
  });
});
