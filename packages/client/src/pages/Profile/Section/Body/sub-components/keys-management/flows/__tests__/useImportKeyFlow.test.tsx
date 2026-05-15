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
  confirmation: null as Record<string, unknown> | null,
  passphrase: null as Record<string, unknown> | null,
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

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  importIdentityFromFile: vi.fn(),
  unlockWithPassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secretStorage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn(), lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  setEncryptionKeys: vi.fn(),
  updateEncryptionKeys: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  importIdentityFromFile,
  unlockWithPassphrase,
} from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secretStorage";
import {
  setEncryptionKeys,
  updateEncryptionKeys,
} from "@docspace/shared/api/privacy";

import {
  useImportKeyFlow,
  type ImportKeyFlow,
} from "../useImportKeyFlow";

let latest: ImportKeyFlow;
const Harness = (deps: {
  userId: string | undefined;
  hasKeys: boolean;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useImportKeyFlow(deps);
  return (
    <>
      {latest.fileInput}
      {latest.modals}
    </>
  );
};

const dummyImported = {
  publicKey: "pub-base64",
  privateKeyEnc: "enc-base64",
};

const dummyKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
};

// jsdom has no DataTransfer/FileList constructors — install a FileList-shaped
// object directly; the hook only reads `event.target.files?.[0]`.
const fireFileChosen = (file?: File) => {
  const input = document.querySelector<HTMLInputElement>("input[type=file]");
  if (!input) throw new Error("file input not in DOM");
  const fileList = file
    ? Object.assign([file], { length: 1, item: () => file })
    : Object.assign([], { length: 0, item: () => null });
  Object.defineProperty(input, "files", {
    value: fileList,
    configurable: true,
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const happyImport = () => {
  vi.mocked(importIdentityFromFile).mockResolvedValue(
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    dummyImported as any,
  );
  vi.mocked(unlockWithPassphrase).mockResolvedValue(
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    dummyKeyPair as any,
  );
  vi.mocked(setEncryptionKeys).mockResolvedValue(undefined as never);
  vi.mocked(updateEncryptionKeys).mockResolvedValue(undefined as never);
};

describe("useImportKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.confirmation = null;
    captured.passphrase = null;
  });

  describe("file selection", () => {
    it("does nothing when the user cancels the file picker (no file selected)", async () => {
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      await act(async () => {
        fireFileChosen(undefined);
      });
      expect(importIdentityFromFile).not.toHaveBeenCalled();
      expect(captured.passphrase).toBeNull();
    });

    it("toasts the raw error message when importIdentityFromFile throws", async () => {
      vi.mocked(importIdentityFromFile).mockRejectedValueOnce(
        new Error("Not a DocSpace identity file"),
      );
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json", { type: "application/json" }));
      });
      expect(toastr.error).toHaveBeenCalledWith("Not a DocSpace identity file");
      expect(captured.passphrase).toBeNull();
    });

    it("advances to passphrase step on successful import", async () => {
      happyImport();
      render(
        <Harness
          userId="42"
          hasKeys={false}
          refreshKeysFromServer={vi.fn()}
        />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      expect(captured.passphrase).not.toBeNull();
    });
  });

  describe("onPassphraseSubmit — new user (hasKeys=false)", () => {
    it("uploads via setEncryptionKeys and caches the unlocked identity", async () => {
      happyImport();
      const refresh = vi.fn().mockResolvedValue(undefined);
      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={refresh} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(unlockWithPassphrase).toHaveBeenCalledTimes(1);
      expect(setEncryptionKeys).toHaveBeenCalledWith({
        publicKey: dummyImported.publicKey,
        privateKeyEnc: dummyImported.privateKeyEnc,
      });
      expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(
        "42",
        dummyKeyPair,
      );
      expect(updateEncryptionKeys).not.toHaveBeenCalled();
      expect(SecretStorage.lock).not.toHaveBeenCalled();
    });

    it("toasts InvalidPassphrase and stays in passphrase step on unlock failure", async () => {
      vi.mocked(importIdentityFromFile).mockResolvedValue(
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        dummyImported as any,
      );
      vi.mocked(unlockWithPassphrase).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );

      render(
        <Harness userId="42" hasKeys={false} refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "wrong",
        );
      });

      expect(toastr.error).toHaveBeenCalledTimes(1);
      expect(captured.passphrase).not.toBeNull();
      expect(setEncryptionKeys).not.toHaveBeenCalled();
    });
  });

  describe("onPassphraseSubmit — existing user (hasKeys=true)", () => {
    it("opens the confirm-replace dialog (does NOT call updateEncryptionKeys yet)", async () => {
      happyImport();
      render(
        <Harness userId="42" hasKeys refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(unlockWithPassphrase).toHaveBeenCalledTimes(1);
      expect(updateEncryptionKeys).not.toHaveBeenCalled();
      expect(setEncryptionKeys).not.toHaveBeenCalled();
      expect(captured.confirmation?.visible).toBe(true);
    });
  });

  describe("onConfirmReplace — UX ordering regression guard", () => {
    it("locks SecretStorage AFTER updateEncryptionKeys succeeds", async () => {
      happyImport();
      const callOrder: string[] = [];
      vi.mocked(updateEncryptionKeys).mockImplementationOnce((async () => {
        callOrder.push("api");
      }) as never);
      vi.mocked(SecretStorage.lock).mockImplementationOnce(() => {
        callOrder.push("lock");
      });
      const refresh = vi.fn().mockImplementation(async () => {
        callOrder.push("refresh");
      });

      render(
        <Harness userId="42" hasKeys refreshKeysFromServer={refresh} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.confirmation!.onConfirm as () => Promise<void>)();
      });

      expect(callOrder).toEqual(["api", "lock", "refresh"]);
    });

    it("does NOT lock when updateEncryptionKeys fails", async () => {
      happyImport();
      vi.mocked(updateEncryptionKeys).mockRejectedValueOnce(
        new Error("network"),
      );

      render(
        <Harness userId="42" hasKeys refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });
      await act(async () => {
        await (captured.confirmation!.onConfirm as () => Promise<void>)();
      });

      expect(SecretStorage.lock).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledTimes(1);
    });
  });
});
