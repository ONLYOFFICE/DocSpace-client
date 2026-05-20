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
  dialog: null as Record<string, unknown> | null,
};

vi.mock("../../modals/ResetKeysConfirmDialog", () => ({
  ResetKeysConfirmDialog: (props: Record<string, unknown>) => {
    captured.dialog = props;
    useEffect(() => () => {
      captured.dialog = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { lock: vi.fn() },
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  deleteEncryptionKey: vi.fn(),
}));

import { toastr } from "@docspace/ui-kit/components/toast";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { useResetKeysFlow, type ResetKeysFlow } from "../useResetKeysFlow";

const keys = (ids: string[]): TEncryptionKeyPair[] =>
  ids.map(
    (id) =>
      ({
        id,
        publicKey: `pk-${id}`,
        privateKeyEnc: `enc-${id}`,
      }) as unknown as TEncryptionKeyPair,
  );

let latest: ResetKeysFlow;
const Harness = (deps: {
  userId?: string;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useResetKeysFlow(deps);
  return <>{latest.modals}</>;
};

describe("useResetKeysFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.dialog = null;
  });

  it("is unavailable when there are no keys to reset", () => {
    render(
      <Harness encryptionKeys={[]} refreshKeysFromServer={vi.fn()} />,
    );
    expect(latest.available).toBe(false);
    act(() => latest.request());
    expect(captured.dialog).toBeNull();
  });

  it("keeps the dialog hidden until request() is called", () => {
    render(
      <Harness
        encryptionKeys={keys(["k1"])}
        refreshKeysFromServer={vi.fn()}
      />,
    );
    expect(latest.available).toBe(true);
    expect(captured.dialog).toBeNull();
  });

  it("opens the dialog when request() fires", () => {
    render(
      <Harness
        encryptionKeys={keys(["k1"])}
        refreshKeysFromServer={vi.fn()}
      />,
    );
    act(() => latest.request());
    expect(captured.dialog?.visible).toBe(true);
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
  });

  it("deletes every server-side key on confirm", async () => {
    vi.mocked(deleteEncryptionKey).mockResolvedValue(undefined as never);

    render(
      <Harness
        encryptionKeys={keys(["k1", "k2", "k3"])}
        refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    act(() => latest.request());
    await act(async () => {
      await (captured.dialog!.onConfirm as () => Promise<void>)();
    });

    expect(deleteEncryptionKey).toHaveBeenCalledTimes(3);
    expect(deleteEncryptionKey).toHaveBeenCalledWith("k1");
    expect(deleteEncryptionKey).toHaveBeenCalledWith("k2");
    expect(deleteEncryptionKey).toHaveBeenCalledWith("k3");
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.warning).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("locks SecretStorage and refreshes even when a delete fails", async () => {
    vi.mocked(deleteEncryptionKey)
      .mockRejectedValueOnce(new Error("403"))
      .mockResolvedValueOnce(undefined as never);
    const refresh = vi.fn().mockResolvedValue(undefined);

    render(
      <Harness
        encryptionKeys={keys(["k1", "k2"])}
        refreshKeysFromServer={refresh}
      />,
    );
    act(() => latest.request());
    await act(async () => {
      await (captured.dialog!.onConfirm as () => Promise<void>)();
    });

    expect(SecretStorage.lock).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.success).not.toHaveBeenCalled();
  });

  it("clears isPending and closes dialog after success", async () => {
    vi.mocked(deleteEncryptionKey).mockResolvedValue(undefined as never);

    render(
      <Harness
        encryptionKeys={keys(["k1"])}
        refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    act(() => latest.request());
    await act(async () => {
      await (captured.dialog!.onConfirm as () => Promise<void>)();
    });

    expect(latest.isPending).toBe(false);
    expect(captured.dialog).toBeNull();
  });

  it("uses ORDERING: deletes → lock → refresh", async () => {
    const callOrder: string[] = [];
    vi.mocked(deleteEncryptionKey).mockImplementation((async () => {
      callOrder.push("api");
    }) as never);
    vi.mocked(SecretStorage.lock).mockImplementation(() => {
      callOrder.push("lock");
    });
    const refresh = vi.fn().mockImplementation(async () => {
      callOrder.push("refresh");
    });

    render(
      <Harness
        encryptionKeys={keys(["k1", "k2"])}
        refreshKeysFromServer={refresh}
      />,
    );
    act(() => latest.request());
    await act(async () => {
      await (captured.dialog!.onConfirm as () => Promise<void>)();
    });

    // All API calls happen first (Promise.allSettled), then lock, then refresh
    expect(callOrder.filter((s) => s === "api")).toHaveLength(2);
    expect(callOrder.indexOf("lock")).toBeGreaterThan(
      callOrder.lastIndexOf("api"),
    );
    expect(callOrder.indexOf("refresh")).toBeGreaterThan(
      callOrder.indexOf("lock"),
    );
  });

  it("does nothing when confirm fires with an empty key list", () => {
    render(
      <Harness
        encryptionKeys={[]}
        refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(captured.dialog).toBeNull();
    act(() => latest.request());
    expect(captured.dialog).toBeNull();
    expect(deleteEncryptionKey).not.toHaveBeenCalled();
    expect(SecretStorage.lock).not.toHaveBeenCalled();
  });

  it("ignores cancel attempts while a reset is in flight", async () => {
    let resolveDelete: (() => void) | undefined;
    vi.mocked(deleteEncryptionKey).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }) as never,
    );

    render(
      <Harness
        encryptionKeys={keys(["k1"])}
        refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    act(() => latest.request());
    let pendingConfirm: Promise<void> | undefined;
    act(() => {
      pendingConfirm = (captured.dialog!.onConfirm as () => Promise<void>)();
    });

    expect(latest.isPending).toBe(true);
    act(() => (captured.dialog!.onCancel as () => void)());
    // Dialog should still be open because cancel was suppressed.
    expect(captured.dialog?.visible).toBe(true);

    await act(async () => {
      resolveDelete?.();
      await pendingConfirm;
    });
    expect(latest.isPending).toBe(false);
  });
});
