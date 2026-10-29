// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const flow = () => ({ request: vi.fn(), isPending: false, modals: null });
  return {
    encryption: {
      isUnlocked: true,
      lock: vi.fn(),
      getIdentity: vi.fn(),
      requireIdentity: vi.fn(),
      publicKey: "pub",
    },
    writtenAt: null as number | null,
    passkeyAvailable: false,
    generate: flow(),
    importFlow: { ...flow(), fileInput: null },
    recover: { ...flow(), available: true },
    reset: { ...flow(), available: false },
    remove: { ...flow(), pendingId: null },
    deleteUnused: { ...flow(), unusedCount: 0 },
    exportFlow: flow(),
    rotate: flow(),
    toastSuccess: vi.fn(),
  };
});

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => mocks.encryption,
}));
vi.mock("@docspace/shared/services/encryption/device-unlock-store", () => ({
  DEVICE_UNLOCK_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,
  forgetDeviceUnlock: vi.fn(async () => {}),
  getDeviceUnlockWrittenAt: vi.fn(async () => mocks.writtenAt),
}));
vi.mock("@docspace/shared/services/encryption/passkey-unlock", () => ({
  isPasskeyUnlockAvailable: vi.fn(async () => mocks.passkeyAvailable),
  hasPasskeyUnlock: vi.fn(async () => false),
  enrollPasskeyUnlock: vi.fn(),
  removePasskeyUnlock: vi.fn(async () => {}),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: vi.fn(async () => []),
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: mocks.toastSuccess, error: vi.fn() },
}));
vi.mock("../KeysList", () => ({ KeysList: () => null }));
vi.mock("@docspace/shared/dialogs/key-generation", () => ({
  useGenerateKeyFlow: () => mocks.generate,
}));
vi.mock("@docspace/shared/dialogs/key-recovery", () => ({
  useRecoverKeyFlow: () => mocks.recover,
}));
vi.mock("../flows/useImportKeyFlow", () => ({
  useImportKeyFlow: () => mocks.importFlow,
}));
vi.mock("../flows/useDeleteKeyFlow", () => ({
  useDeleteKeyFlow: () => mocks.remove,
}));
vi.mock("../flows/useDeleteUnusedKeysFlow", () => ({
  useDeleteUnusedKeysFlow: () => mocks.deleteUnused,
}));
vi.mock("../flows/useExportKeyFlow", () => ({
  useExportKeyFlow: () => mocks.exportFlow,
}));
vi.mock("../flows/useRotatePassphraseFlow", () => ({
  useRotatePassphraseFlow: () => mocks.rotate,
}));
vi.mock("../flows/useResetKeysFlow", () => ({
  useResetKeysFlow: () => mocks.reset,
}));

import KeysManagement from "../KeysManagement";

const KEY = {
  id: "22222222-2222-2222-2222-222222222222",
  publicKey: "pub",
  privateKeyEnc: "enc",
  date: "2026-10-01T00:00:00",
};

const renderPage = (keys: (typeof KEY)[]) =>
  render(
    <Provider
      userStore={{
        encryptionKeys: keys,
        setUserEncryptionKeys: vi.fn(),
        user: { id: "user-1", email: "user@example.com" },
      }}
    >
      <KeysManagement />
    </Provider>,
  );

const action = (name: string) => screen.getByRole("button", { name });

beforeEach(() => {
  mocks.encryption.isUnlocked = true;
  mocks.writtenAt = null;
  mocks.passkeyAvailable = false;
  mocks.recover.available = true;
});

describe("KeysManagement", () => {
  it("No key yet", async () => {
    const user = userEvent.setup();
    renderPage([]);

    action("Common:GenerateNewKey").focus();
    await user.tab();
    expect(action("Common:ImportKey")).toHaveFocus();
    await user.tab();
    expect(action("Common:UseRecoveryPhrase")).toHaveFocus();
  });

  it("Text actions announced", async () => {
    mocks.writtenAt = Date.now();
    const { unmount } = renderPage([KEY]);

    expect(
      await screen.findByRole("button", { name: "Common:ForgetDeviceButton" }),
    ).toBeInTheDocument();
    expect(action("Common:LockNow")).toBeInTheDocument();
    expect(action("Common:UseRecoveryPhrase")).toBeInTheDocument();

    unmount();
    renderPage([]);

    expect(action("Common:ImportKey")).toBeInTheDocument();
  });

  it("Lock with Space", async () => {
    const user = userEvent.setup();
    renderPage([KEY]);
    let scrollKept = false;
    const listener = (e: KeyboardEvent) => {
      if (e.key === " ") scrollKept = e.defaultPrevented;
    };
    document.addEventListener("keydown", listener);

    action("Common:LockNow").focus();
    await user.keyboard(" ");
    document.removeEventListener("keydown", listener);

    expect(mocks.encryption.lock).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Common:EncryptionLocked");
    expect(scrollKept).toBe(true);
  });
});
