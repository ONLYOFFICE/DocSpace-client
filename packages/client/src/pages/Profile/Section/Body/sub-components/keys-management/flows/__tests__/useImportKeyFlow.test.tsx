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
  passphrase: null as Record<string, unknown> | null,
};

vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
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
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { cacheUnlocked: vi.fn(), lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  setEncryptionKeys: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  importIdentityFromFile,
  unlockWithPassphrase,
} from "@docspace/shared/services/encryption/identity";
import {
  InvalidFormatError,
  WebCryptoUnavailableError,
} from "@docspace/shared/services/encryption/errors";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";

import {
  useImportKeyFlow,
  type ImportKeyFlow,
} from "../useImportKeyFlow";

let latest: ImportKeyFlow;
const Harness = (deps: {
  userId: string | undefined;
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
};

describe("useImportKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.passphrase = null;
  });

  describe("file selection", () => {
    it("does nothing when the user cancels the file picker (no file selected)", async () => {
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(undefined);
      });
      expect(importIdentityFromFile).not.toHaveBeenCalled();
      expect(captured.passphrase).toBeNull();
    });

    it("toasts the invalid-key-file message when importIdentityFromFile throws InvalidFormatError", async () => {
      vi.mocked(importIdentityFromFile).mockRejectedValueOnce(
        new InvalidFormatError("not a v2 DocSpace identity file"),
      );
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json", { type: "application/json" }));
      });
      expect(toastr.error).toHaveBeenCalledWith(
        "Common:EncryptionInvalidKeyFile",
      );
      expect(captured.passphrase).toBeNull();
    });

    it("toasts the HTTPS-required message when importIdentityFromFile throws WebCryptoUnavailableError", async () => {
      vi.mocked(importIdentityFromFile).mockRejectedValueOnce(
        new WebCryptoUnavailableError(),
      );
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json", { type: "application/json" }));
      });
      expect(toastr.error).toHaveBeenCalledWith(
        "Common:EncryptionRequiresHttps",
      );
      expect(captured.passphrase).toBeNull();
    });

    it("advances to passphrase step on successful import", async () => {
      happyImport();
      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      expect(captured.passphrase).not.toBeNull();
    });
  });

  describe("onPassphraseSubmit", () => {
    it("uploads via setEncryptionKeys with a fresh UUID and caches the unlocked identity", async () => {
      happyImport();
      const refresh = vi.fn().mockResolvedValue(undefined);
      render(
        <Harness userId="42" refreshKeysFromServer={refresh} />,
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
      expect(setEncryptionKeys).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: dummyImported.publicKey,
          privateKeyEnc: dummyImported.privateKeyEnc,
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        }),
      );
      expect(SecretStorage.cacheUnlocked).toHaveBeenCalledWith(
        "42",
        dummyKeyPair,
      );
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
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
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

    it("does NOT cache identity when setEncryptionKeys fails", async () => {
      happyImport();
      vi.mocked(setEncryptionKeys).mockRejectedValueOnce(new Error("network"));

      render(
        <Harness userId="42" refreshKeysFromServer={vi.fn()} />,
      );
      await act(async () => {
        fireFileChosen(new File(["{}"], "key.json"));
      });
      await act(async () => {
        await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
          "secret",
        );
      });

      expect(SecretStorage.cacheUnlocked).not.toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledTimes(1);
    });
  });
});
