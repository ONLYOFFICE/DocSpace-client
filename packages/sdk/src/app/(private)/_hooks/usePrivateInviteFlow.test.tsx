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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type TRewrapArgs = {
  newMembers: { id: string; displayName?: string }[];
  currentUserId: string;
  onProgress: (progress: { percent: number; completed?: boolean }) => void;
  onOutcome: (outcome: unknown) => void;
};

const BOB_GRANTED = {
  granted: [{ id: "bob", displayName: "Bob" }],
  pending: [],
  skipped: [],
};

const identity = { publicKey: new Uint8Array() };

const mocks = vi.hoisted(() => ({
  requireIdentity: vi.fn(),
  userKeys: { userId: "me" } as { userId: string } | null,
  rewrapForInvitedMembers: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ requireIdentity: mocks.requireIdentity }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@docspace/shared/services/private-room/room-member-flows", () => ({
  rewrapForInvitedMembers: mocks.rewrapForInvitedMembers,
}));

vi.mock("../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({
    get userKeys() {
      return mocks.userKeys;
    },
  }),
}));

import {
  PrivateDialogsStoreProvider,
  usePrivateDialogsStore,
} from "../_store/PrivateDialogsStore";
import { abortAllCryptoOperations } from "../_utils/abort-registry";
import { usePrivateInviteFlow } from "./usePrivateInviteFlow";

describe("usePrivateInviteFlow", () => {
  let root: Root | null = null;
  let flow: ReturnType<typeof usePrivateInviteFlow>;
  let dialogs: ReturnType<typeof usePrivateDialogsStore>;

  const render = () => {
    const Probe = () => {
      flow = usePrivateInviteFlow();
      dialogs = usePrivateDialogsStore();
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() =>
      root?.render(
        <PrivateDialogsStoreProvider>
          <Probe />
        </PrivateDialogsStoreProvider>,
      ),
    );
  };

  const invite = () =>
    flow.onInviteSubmitted({
      roomId: 10,
      memberIds: ["bob"],
      displayNames: { bob: "Bob" },
    });

  beforeEach(() => {
    mocks.userKeys = { userId: "me" };
    mocks.requireIdentity.mockImplementation(async () => identity);
    render();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Order of operations: the re-encryption progress is shown until the file keys are wrapped", async () => {
    let finish: (notices: unknown[]) => void = () => {};
    mocks.rewrapForInvitedMembers.mockImplementation(
      ({ onProgress, onOutcome }: TRewrapArgs) => {
        onProgress({ percent: 40 });
        return new Promise((resolve) => {
          finish = (notices) => {
            onOutcome(BOB_GRANTED);
            resolve(notices);
          };
        });
      },
    );

    let pending: ReturnType<typeof invite> = Promise.resolve(null);
    await act(async () => {
      pending = invite();
    });

    expect(dialogs.reencryptPercent).toBe(40);
    expect(mocks.rewrapForInvitedMembers).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: 10,
        newMembers: [{ id: "bob", displayName: "Bob" }],
        currentUserId: "me",
        identity,
      }),
    );

    await act(async () => {
      finish([{ level: "success", text: "Common:UsersInvited" }]);
      await expect(pending).resolves.toEqual(BOB_GRANTED);
    });

    expect(dialogs.reencryptPercent).toBeNull();
    expect(mocks.toastr.success).toHaveBeenCalledWith("Common:UsersInvited");
  });

  it("Mixed invitation: resolves with the skipped invitees the shared flow reports", async () => {
    const outcome = {
      granted: [{ id: "bob", displayName: "Bob" }],
      pending: [],
      skipped: [{ id: "dan", displayName: "Dan", reason: "no-key" }],
    };
    mocks.rewrapForInvitedMembers.mockImplementation(
      async ({ onOutcome }: TRewrapArgs) => {
        onOutcome(outcome);
        return [{ level: "warning", text: "Common:EncryptedSkippedNoKeys" }];
      },
    );

    await act(async () => {
      await expect(invite()).resolves.toEqual(outcome);
    });
  });

  it("reports the skipped members the shared flow names", async () => {
    mocks.rewrapForInvitedMembers.mockImplementation(async () => [
      { level: "warning", text: "Common:EncryptedSkippedNoKeys" },
    ]);

    await act(() => invite());

    expect(mocks.toastr.warning).toHaveBeenCalledWith(
      "Common:EncryptedSkippedNoKeys",
    );
    expect(mocks.toastr.success).not.toHaveBeenCalled();
  });

  it("reports nothing once a lock or a navigation aborted the re-encryption", async () => {
    mocks.rewrapForInvitedMembers.mockImplementation(
      async ({ onOutcome }: TRewrapArgs) => {
        abortAllCryptoOperations("lock");
        onOutcome(BOB_GRANTED);
        return [{ level: "error", text: "Common:EncryptedReencryptFailed" }];
      },
    );

    await act(async () => {
      await expect(invite()).resolves.toBeNull();
    });

    expect(mocks.toastr.error).not.toHaveBeenCalled();
    expect(dialogs.reencryptPercent).toBeNull();
  });

  it("re-wraps nothing for a user without keys", async () => {
    mocks.userKeys = null;

    await expect(invite()).rejects.toThrow(
      "Common:EncryptionKeysNotConfigured",
    );
    expect(mocks.rewrapForInvitedMembers).not.toHaveBeenCalled();
  });

  it("refuses the security update when the unlock is declined", async () => {
    mocks.requireIdentity.mockImplementation(async () => null);

    let canProceed = true;
    await act(async () => {
      canProceed = await flow.onBeforeSubmit();
    });

    expect(canProceed).toBe(false);
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionLockedAddMembers",
    );
  });
});
