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

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { lock: vi.fn() },
}));
vi.mock("@docspace/shared/services/encryption/identity", () => ({
  unlockWithPassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  deleteEncryptionKey: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";

import {
  useDeleteKeyFlow,
  type DeleteKeyFlow,
} from "../useDeleteKeyFlow";

let latest: DeleteKeyFlow;
const Harness = (deps: {
  userId?: string;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useDeleteKeyFlow(deps);
  return <>{latest.modals}</>;
};

const sampleKey = {
  id: "key-7",
  publicKey: "pub-7",
  privateKeyEnc: "enc-7",
} as never;

describe("useDeleteKeyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.confirmation = null;
    captured.passphrase = null;
  });

  it("keeps both dialogs hidden until request() is called", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    expect(captured.confirmation).toBeNull();
    expect(captured.passphrase).toBeNull();
  });

  it("shows the confirmation dialog when request(keyData) fires", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(sampleKey));
    expect(captured.confirmation?.visible).toBe(true);
    expect(captured.passphrase).toBeNull();
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
  });

  it("transitions to passphrase modal after confirmation", () => {
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());
    expect(captured.confirmation).toBeNull();
    expect(captured.passphrase?.visible).toBe(true);
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
  });

  it("deletes the key after successful passphrase verification", async () => {
    vi.mocked(unlockWithPassphrase).mockResolvedValueOnce(undefined as never);
    vi.mocked(deleteEncryptionKey).mockResolvedValueOnce(undefined as never);
    render(<Harness refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)} />);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());

    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });

    expect(unlockWithPassphrase).toHaveBeenCalledWith(
      { publicKey: "pub-7", privateKeyEnc: "enc-7" },
      "secret",
    );
    expect(deleteEncryptionKey).toHaveBeenCalledWith("key-7");
    expect(latest.pendingId).toBeNull();
  });

  it("surfaces InvalidPassphraseError via externalError without deleting", async () => {
    vi.mocked(unlockWithPassphrase).mockRejectedValueOnce(
      new InvalidPassphraseError(),
    );
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());

    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "wrong",
      );
    });

    expect(deleteEncryptionKey).not.toHaveBeenCalled();
    expect(captured.passphrase?.externalError).toBeTruthy();
    expect(captured.passphrase?.visible).toBe(true);
  });

  it("locks SecretStorage only on a successful delete", async () => {
    vi.mocked(unlockWithPassphrase).mockResolvedValueOnce(undefined as never);
    vi.mocked(deleteEncryptionKey).mockRejectedValueOnce(new Error("403"));
    render(<Harness refreshKeysFromServer={vi.fn()} />);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });
    expect(SecretStorage.lock).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledTimes(1);

    vi.mocked(unlockWithPassphrase).mockResolvedValueOnce(undefined as never);
    vi.mocked(deleteEncryptionKey).mockResolvedValueOnce(undefined as never);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });
    expect(SecretStorage.lock).toHaveBeenCalledTimes(1);
  });

  it("uses ORDERING: unlock → api → lock → refresh on success", async () => {
    const callOrder: string[] = [];
    vi.mocked(unlockWithPassphrase).mockImplementationOnce((async () => {
      callOrder.push("unlock");
    }) as never);
    vi.mocked(deleteEncryptionKey).mockImplementationOnce((async () => {
      callOrder.push("api");
    }) as never);
    vi.mocked(SecretStorage.lock).mockImplementationOnce(() => {
      callOrder.push("lock");
    });
    const refresh = vi.fn().mockImplementation(async () => {
      callOrder.push("refresh");
    });

    render(<Harness refreshKeysFromServer={refresh} />);
    act(() => latest.request(sampleKey));
    act(() => (captured.confirmation!.onConfirm as () => void)());
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });

    expect(callOrder).toEqual(["unlock", "api", "lock", "refresh"]);
  });
});
