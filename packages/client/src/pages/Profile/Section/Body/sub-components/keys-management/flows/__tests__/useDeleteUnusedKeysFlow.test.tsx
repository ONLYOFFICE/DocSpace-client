// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = {
  confirmation: null as Record<string, unknown> | null,
  passphrase: null as Record<string, unknown> | null,
};

vi.mock("@docspace/shared/dialogs/confirmation-modal", () => ({
  ConfirmationModal: (props: Record<string, unknown>) => {
    captured.confirmation = props;
    useEffect(() => () => {
      captured.confirmation = null;
    }, []);
    return null;
  },
}));

vi.mock("@docspace/shared/dialogs/passphrase-modal", () => ({
  PassphraseModal: (props: Record<string, unknown>) => {
    captured.passphrase = props;
    useEffect(() => () => {
      captured.passphrase = null;
    }, []);
    return null;
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

const forgetKey = vi.fn();
vi.mock("@docspace/shared/services/encryption/tofu-store", () => ({
  getTofuStore: () => ({ forgetKey }),
}));
vi.mock("@docspace/shared/services/encryption/identity", () => ({
  unlockWithPassphrase: vi.fn(),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  deleteEncryptionKey: vi.fn(),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";

import {
  useDeleteUnusedKeysFlow,
  type DeleteUnusedKeysFlow,
} from "../useDeleteUnusedKeysFlow";

const key = (id: string, date: string) =>
  ({ id, publicKey: `pub-${id}`, privateKeyEnc: `enc-${id}`, date }) as never;

const selected = key("current", "2026-10-01T00:00:00");
const leftovers = [
  key("old-1", "2026-01-01T00:00:00"),
  key("old-2", "2026-02-01T00:00:00"),
];

let latest: DeleteUnusedKeysFlow;
const Harness = (deps: {
  encryptionKeys: never[];
  refreshKeysFromServer: () => Promise<void>;
}) => {
  latest = useDeleteUnusedKeysFlow({ userId: "42", ...deps });
  return <>{latest.modals}</>;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured.confirmation = null;
  captured.passphrase = null;
});

describe("useDeleteUnusedKeysFlow", () => {
  it("Single key: nothing to delete and the action does not open", () => {
    render(<Harness encryptionKeys={[selected]} refreshKeysFromServer={vi.fn()} />);
    expect(latest.unusedCount).toBe(0);
    act(() => latest.request());
    expect(captured.confirmation).toBeNull();
  });

  it("Leftover keys: deletes the two unused keys after the selected key's passphrase and keeps it", async () => {
    vi.mocked(unlockWithPassphrase).mockResolvedValue({} as never);
    vi.mocked(deleteEncryptionKey).mockResolvedValue(undefined as never);
    const refresh = vi.fn().mockResolvedValue(undefined);
    render(
      <Harness
        encryptionKeys={[leftovers[0], selected, leftovers[1]]}
        refreshKeysFromServer={refresh}
      />,
    );
    expect(latest.unusedCount).toBe(2);

    act(() => latest.request());
    act(() => (captured.confirmation!.onConfirm as () => void)());
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });

    expect(unlockWithPassphrase).toHaveBeenCalledWith(
      { publicKey: "pub-current", privateKeyEnc: "enc-current" },
      "secret",
    );
    expect(vi.mocked(deleteEncryptionKey).mock.calls.map((c) => c[0]).sort()).toEqual([
      "old-1",
      "old-2",
    ]);
    expect(forgetKey).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledWith("Common:UnusedEncryptionKeysDeleted");
  });

  it("reports the keys that could not be deleted", async () => {
    vi.mocked(unlockWithPassphrase).mockResolvedValue({} as never);
    vi.mocked(deleteEncryptionKey)
      .mockResolvedValueOnce(undefined as never)
      .mockRejectedValueOnce(new Error("500"));
    render(
      <Harness
        encryptionKeys={[selected, ...leftovers]}
        refreshKeysFromServer={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    act(() => latest.request());
    act(() => (captured.confirmation!.onConfirm as () => void)());
    await act(async () => {
      await (captured.passphrase!.onSubmit as (p: string) => Promise<void>)(
        "secret",
      );
    });

    expect(forgetKey).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:UnusedEncryptionKeysPartialFailure",
    );
  });
});
