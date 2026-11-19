// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only

import { render, screen, waitFor, within } from "@testing-library/react";
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
    getEncryptionKeys: vi.fn(),
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
vi.mock("@docspace/shared/services/encryption/lock-broadcast", () => ({
  broadcastLock: vi.fn(),
}));
vi.mock("@docspace/shared/services/encryption/passkey-unlock", () => ({
  isPasskeyUnlockAvailable: vi.fn(async () => mocks.passkeyAvailable),
  hasPasskeyUnlock: vi.fn(async () => false),
  enrollPasskeyUnlock: vi.fn(),
  removePasskeyUnlock: vi.fn(async () => {}),
}));
vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: mocks.getEncryptionKeys,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: mocks.toastSuccess, error: vi.fn() },
}));
vi.mock("../KeysList", () => ({
  KeysList: ({ keyState }: { keyState?: string }) => (
    <div data-testid="keys_list" data-key-state={keyState ?? "none"} />
  ),
}));
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

import { forgetDeviceUnlock } from "@docspace/shared/services/encryption/device-unlock-store";
import { broadcastLock } from "@docspace/shared/services/encryption/lock-broadcast";

import KeysManagement from "../KeysManagement";

const KEY = {
  id: "22222222-2222-2222-2222-222222222222",
  publicKey: "pub",
  privateKeyEnc: "enc",
  date: "2026-10-01T00:00:00",
};

const renderPage = (
  keys: (typeof KEY)[] | null,
  setUserEncryptionKeys = vi.fn(),
) =>
  render(
    <Provider
      userStore={{
        encryptionKeys: keys,
        setUserEncryptionKeys,
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
  mocks.getEncryptionKeys.mockResolvedValue([]);
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
      await screen.findByText("Common:DeviceUnlockRememberedUntil"),
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

  it("Passkey toggle", async () => {
    mocks.passkeyAvailable = true;
    renderPage([KEY]);

    const toggle = await screen.findByRole("checkbox", {
      name: "Common:PasskeyUnlockLabel",
    });

    expect(toggle).not.toBeChecked();
  });

  it("Device section", async () => {
    const user = userEvent.setup();
    mocks.passkeyAvailable = true;
    mocks.writtenAt = Date.now();
    renderPage([KEY]);
    const toggle = await screen.findByRole("checkbox", {
      name: "Common:PasskeyUnlockLabel",
    });
    await screen.findByText("Common:DeviceUnlockRememberedUntil");

    within(screen.getByRole("group", { name: "Common:AutoLockLabel" }))
      .getByRole("button")
      .focus();
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.tab();
    expect(action("Common:LockNow")).toHaveFocus();
  });

  it("Device section while locked", async () => {
    const user = userEvent.setup();
    mocks.encryption.isUnlocked = false;
    mocks.writtenAt = Date.now();
    renderPage([KEY]);
    const forget = await screen.findByRole("button", {
      name: "Common:ForgetDeviceButton",
    });

    within(screen.getByRole("group", { name: "Common:AutoLockLabel" }))
      .getByRole("button")
      .focus();
    await user.tab();
    expect(forget).toHaveFocus();
  });

  it("Remembered device, identity unlocked", async () => {
    mocks.writtenAt = Date.now();
    renderPage([KEY]);

    expect(
      await screen.findByText("Common:DeviceUnlockRememberedUntil"),
    ).toBeInTheDocument();
    expect(action("Common:LockNow")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Common:ForgetDeviceButton" }),
    ).not.toBeInTheDocument();
  });

  it("Remembered device, identity locked", async () => {
    mocks.encryption.isUnlocked = false;
    mocks.writtenAt = Date.now();
    renderPage([KEY]);

    expect(
      await screen.findByText("Common:DeviceUnlockRememberedUntil"),
    ).toBeInTheDocument();
    expect(action("Common:ForgetDeviceButton")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Common:LockNow" }),
    ).not.toBeInTheDocument();
  });

  it("Forget device in another tab", async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    vi.mocked(forgetDeviceUnlock).mockImplementationOnce(async () => {
      order.push("forget");
    });
    vi.mocked(broadcastLock).mockImplementationOnce(() => {
      order.push("lock");
    });
    mocks.encryption.isUnlocked = false;
    mocks.writtenAt = Date.now();
    renderPage([KEY]);

    await user.click(
      await screen.findByRole("button", { name: "Common:ForgetDeviceButton" }),
    );

    await waitFor(() => expect(broadcastLock).toHaveBeenCalledWith("user-1"));
    expect(order).toEqual(["forget", "lock"]);
  });
});

describe("Keys management opens with an introduction", () => {
  it("User with a key", () => {
    renderPage([KEY]);

    expect(screen.getByTestId("keys_management_intro")).toHaveTextContent(
      "Common:KeysManagementIntro",
    );
  });

  it("User without a key", () => {
    renderPage([]);

    expect(screen.getByTestId("keys_management_intro")).toHaveTextContent(
      "Common:KeysManagementIntro",
    );
  });
});

describe("Keys management shows whether the key is locked", () => {
  const keyState = () =>
    screen.getByTestId("keys_list").getAttribute("data-key-state");

  it("Locked key", () => {
    mocks.encryption.isUnlocked = false;
    renderPage([KEY]);

    expect(keyState()).toBe("locked");
  });

  it("Key locks while the page is open", () => {
    const userStore = {
      encryptionKeys: [KEY],
      setUserEncryptionKeys: vi.fn(),
      user: { id: "user-1", email: "user@example.com" },
    };
    // The mocked context is not reactive: a changed prop stands in for the
    // update the encryption provider sends when the key locks.
    const page = (tick: number) => (
      <Provider userStore={userStore}>
        <KeysManagement {...({ tick } as object)} />
      </Provider>
    );
    const view = render(page(0));
    expect(keyState()).toBe("unlocked");

    mocks.encryption.isUnlocked = false;
    view.rerender(page(1));

    expect(keyState()).toBe("locked");
  });

  it("User without a key", () => {
    mocks.encryption.isUnlocked = false;
    renderPage([]);

    expect(keyState()).toBe("none");
  });
});

describe("Keys management offers to unlock a locked key", () => {
  const unlock = () => screen.queryByTestId("keys_unlock_button");

  it("Unlock from the page", async () => {
    const user = userEvent.setup();
    mocks.encryption.isUnlocked = false;
    mocks.encryption.requireIdentity.mockResolvedValue({ userId: "user-1" });
    renderPage([KEY]);

    await user.click(action("Common:UnlockKey"));

    expect(mocks.encryption.requireIdentity).toHaveBeenCalledTimes(1);
  });

  it("Unlock cancelled", async () => {
    const user = userEvent.setup();
    mocks.encryption.isUnlocked = false;
    mocks.encryption.requireIdentity.mockResolvedValue(null);
    renderPage([KEY]);

    await user.click(action("Common:UnlockKey"));

    expect(unlock()).toBeInTheDocument();
  });

  it("Unlocked key", () => {
    renderPage([KEY]);

    expect(unlock()).toBeNull();
  });

  it("offers nothing to unlock to a user without a key", () => {
    mocks.encryption.isUnlocked = false;
    renderPage([]);

    expect(unlock()).toBeNull();
  });
});

describe("Recovery phrase has a block of its own in Keys management", () => {
  it("User with a key", () => {
    renderPage([KEY]);

    const block = screen.getByTestId("recovery_section");
    expect(block).toHaveTextContent("Common:RecoveryPhraseTitle");
    expect(block).toHaveTextContent("Common:RecoveryPhraseSectionText");
    expect(block).toContainElement(action("Common:UseRecoveryPhrase"));
  });

  it("shows no block where recovery is not offered", () => {
    mocks.recover.available = false;
    renderPage([KEY]);

    expect(screen.queryByTestId("recovery_section")).toBeNull();
  });
});

describe("KeysManagement before the key list is known", () => {
  it("Key list could not be loaded", async () => {
    mocks.getEncryptionKeys.mockRejectedValue(new Error("Network Error"));
    renderPage(null);

    expect(
      await screen.findByText("Common:EncryptionKeysLoadFailed"),
    ).toBeInTheDocument();
    expect(action("Common:TryAgain")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Common:GenerateNewKey" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Common:ImportKey" })).toBeNull();
  });

  it("reloads the list from Try again", async () => {
    const user = userEvent.setup();
    const setUserEncryptionKeys = vi.fn();
    mocks.getEncryptionKeys.mockRejectedValueOnce(new Error("Network Error"));
    mocks.getEncryptionKeys.mockResolvedValueOnce([KEY]);
    renderPage(null, setUserEncryptionKeys);

    await user.click(await screen.findByRole("button", { name: "Common:TryAgain" }));

    await waitFor(() =>
      expect(setUserEncryptionKeys).toHaveBeenCalledWith([KEY]),
    );
  });

  it("Key list not known", () => {
    mocks.getEncryptionKeys.mockReturnValue(new Promise(() => {}));
    renderPage(null);

    expect(
      screen.queryByRole("button", { name: "Common:GenerateNewKey" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Common:ImportKey" })).toBeNull();
    expect(screen.queryByText("Common:EncryptionKeysLoadFailed")).toBeNull();
  });
});
