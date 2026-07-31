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
  rotation: null as Record<string, unknown> | null,
};

vi.mock("../../modals/KeyRotationDialog", () => ({
  KeyRotationDialog: (props: Record<string, unknown>) => {
    captured.rotation = props;
    useEffect(() => () => {
      captured.rotation = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/identity", () => ({
  changePassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { lock: vi.fn() },
}));
vi.mock("@docspace/shared/services/encryption/active-key-preference", () => ({
  getActiveKeyId: vi.fn(),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  updateEncryptionKeys: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import { changePassphrase } from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { getActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import {
  useRotatePassphraseFlow,
  type RotatePassphraseFlow,
} from "../useRotatePassphraseFlow";

let latest: RotatePassphraseFlow;
const Harness = (deps: {
  userId: string | undefined;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useRotatePassphraseFlow(deps);
  return <>{latest.modals}</>;
};

const dummyKey: TEncryptionKeyPair = {
  id: "k1",
  userId: "42",
  publicKey: "pub-old",
  privateKeyEnc: "enc-old",
  // biome-ignore lint/suspicious/noExplicitAny: test mock
} as any;

describe("useRotatePassphraseFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.rotation = null;
  });

  it("does NOT render the dialog before request() is called", () => {
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    expect(captured.rotation).toBeNull();
  });

  it("opens the dialog once request() is called with key data", () => {
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    expect(captured.rotation).not.toBeNull();
    expect(captured.rotation?.visible).toBe(true);
    expect(captured.rotation?.error).toBeNull();
  });

  it("shows InvalidPassphrase inline (NOT a toast) on wrong old passphrase", async () => {
    vi.mocked(changePassphrase).mockRejectedValueOnce(
      new InvalidPassphraseError(),
    );
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("wrong-old", "new-pass");
    });

    expect(captured.rotation?.error).toBe("Common:InvalidPassphrase");
    expect(toastr.error).not.toHaveBeenCalled();
    expect(captured.rotation).not.toBeNull();
  });

  it("does NOT lock SecretStorage when the rotation fails", async () => {
    vi.mocked(changePassphrase).mockRejectedValueOnce(
      new Error("wrong passphrase"),
    );
    render(<Harness userId="42" refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("wrong-old", "new-pass");
    });
    expect(SecretStorage.lock).not.toHaveBeenCalled();
  });

  it("on success (rotating the ACTIVE key): uploads, locks, refreshes, toasts, then closes the dialog", async () => {
    vi.mocked(getActiveKeyId).mockReturnValue(dummyKey.id);
    vi.mocked(changePassphrase).mockResolvedValueOnce({
      publicKey: "pub-new",
      privateKeyEnc: "enc-new",
    });

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

    render(<Harness userId="42" refreshKeysFromServer={refresh} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("old", "new");
    });

    expect(changePassphrase).toHaveBeenCalledWith(
      { publicKey: dummyKey.publicKey, privateKeyEnc: dummyKey.privateKeyEnc },
      "old",
      "new",
    );
    expect(updateEncryptionKeys).toHaveBeenCalledWith({
      id: dummyKey.id,
      publicKey: "pub-new",
      privateKeyEnc: "enc-new",
    });
    expect(callOrder).toEqual(["api", "lock", "refresh"]);
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(captured.rotation).toBeNull();
  });

  it("rotating a NON-active key does not re-lock (active selection untouched)", async () => {
    vi.mocked(getActiveKeyId).mockReturnValue("some-other-active-key");
    vi.mocked(changePassphrase).mockResolvedValueOnce({
      publicKey: "pub-new",
      privateKeyEnc: "enc-new",
    });
    const refresh = vi.fn().mockResolvedValue(undefined);

    render(<Harness userId="42" refreshKeysFromServer={refresh} />);
    act(() => latest.request(dummyKey));
    await act(async () => {
      await (
        captured.rotation!.onSubmit as (a: string, b: string) => Promise<void>
      )("old", "new");
    });

    expect(updateEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(SecretStorage.lock).not.toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledTimes(1);
  });
});
