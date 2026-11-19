// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only

import { act, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The page under the real encryption provider. The key flows are stubbed:
// each keeps the deps the page hands it, and the test runs them as the
// flow does once the server has accepted the change.
const mocks = vi.hoisted(() => {
  const flow = () => ({ request: vi.fn(), isPending: false, modals: null });
  return {
    deps: {} as Record<string, Record<string, unknown>>,
    generate: flow(),
    importFlow: { ...flow(), fileInput: null },
    recover: { ...flow(), available: true },
    reset: { ...flow(), available: true },
    remove: { ...flow(), pendingId: null },
    deleteUnused: { ...flow(), unusedCount: 0 },
    exportFlow: flow(),
    rotate: flow(),
    getEncryptionKeys: vi.fn(),
  };
});

vi.mock("@docspace/shared/api/privacy", () => ({
  getEncryptionKeys: mocks.getEncryptionKeys,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
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
  useRotatePassphraseFlow: (deps: Record<string, unknown>) => {
    mocks.deps.rotate = deps;
    return mocks.rotate;
  },
}));
vi.mock("../flows/useResetKeysFlow", () => ({
  useResetKeysFlow: (deps: Record<string, unknown>) => {
    mocks.deps.reset = deps;
    return mocks.reset;
  },
}));

import { EncryptionProvider } from "@docspace/shared/context/encryption";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";

import KeysManagement from "../KeysManagement";

const USER_ID = "user-1";
const KEY = {
  id: "22222222-2222-2222-2222-222222222222",
  publicKey: "pub",
  privateKeyEnc: "enc",
  date: "2026-10-01T00:00:00",
};

const renderUnlockedPage = () => {
  SecretStorage.cacheUnlocked(USER_ID, {
    publicKey: new Uint8Array(32).fill(1),
    privateKey: new Uint8Array(32).fill(2),
  });
  render(
    <Provider
      userStore={{
        encryptionKeys: [KEY],
        setUserEncryptionKeys: vi.fn(),
        user: { id: USER_ID, email: "user@example.com" },
      }}
    >
      <EncryptionProvider
        userKeys={{ userId: USER_ID, publicKey: "pub", privateKeyEnc: "enc" }}
      >
        <KeysManagement />
      </EncryptionProvider>
    </Provider>,
  );
  expect(screen.getByTestId("keys_list")).toHaveAttribute(
    "data-key-state",
    "unlocked",
  );
};

const expectLockedPage = () => {
  expect(screen.getByTestId("keys_list")).toHaveAttribute(
    "data-key-state",
    "locked",
  );
  expect(screen.getByTestId("keys_unlock_button")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Common:LockNow" }),
  ).not.toBeInTheDocument();
};

describe("The shown key state follows the key in memory", () => {
  beforeEach(() => {
    mocks.deps = {};
  });

  afterEach(() => {
    SecretStorage.lock();
  });

  it("Passphrase change with a failed list refresh", async () => {
    renderUnlockedPage();
    mocks.getEncryptionKeys.mockRejectedValueOnce(new Error("500"));
    const deps = mocks.deps.rotate as {
      lockAfterReseal: () => void;
      refreshKeysFromServer: () => Promise<void>;
    };

    await act(async () => {
      deps.lockAfterReseal();
      await deps.refreshKeysFromServer();
    });

    expectLockedPage();
  });

  it("Partial reset", async () => {
    renderUnlockedPage();
    // The key whose deletion failed is still listed.
    mocks.getEncryptionKeys.mockResolvedValueOnce([KEY]);
    const deps = mocks.deps.reset as {
      lockAfterKeyRemoval: (publicKey?: string) => Promise<void>;
      refreshKeysFromServer: () => Promise<void>;
    };

    await act(async () => {
      await deps.lockAfterKeyRemoval();
      await deps.refreshKeysFromServer();
    });

    expectLockedPage();
  });
});
