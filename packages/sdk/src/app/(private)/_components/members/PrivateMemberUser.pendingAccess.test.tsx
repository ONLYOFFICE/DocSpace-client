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

import { ShareAccessRights } from "@docspace/shared/enums";
import { pendingAccessStore } from "@docspace/shared/services/private-room/pending-access";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const identity = { publicKey: new Uint8Array(32) };

const mocks = vi.hoisted(() => ({
  requireIdentity: vi.fn(),
  rewrapMissingFilesForMember: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("../../_store/PrivateEncryptedUploadStore", () => ({
  useActiveEncryptedUploadsForRoom: () => 0,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ requireIdentity: mocks.requireIdentity }),
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: { userId: "me" } }),
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  rewrapMissingFilesForMember: mocks.rewrapMissingFilesForMember,
}));

import {
  PrivateDialogsStoreProvider,
  usePrivateDialogsStore,
} from "../../_store/PrivateDialogsStore";
import PrivateMemberUser from "./PrivateMemberUser";

describe("PrivateMemberUser pending access", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;
  let dialogs: ReturnType<typeof usePrivateDialogsStore>;

  const DialogsProbe = () => {
    dialogs = usePrivateDialogsStore();
    return null;
  };

  const render = (props: { canInvite?: boolean; isGroup?: boolean } = {}) => {
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <PrivateDialogsStoreProvider>
          <DialogsProbe />
          <PrivateMemberUser
            roomId={10}
            userId="bob"
            displayName="Bob"
            access={ShareAccessRights.Editing}
            canChangeRole={false}
            canRemove={false}
            isOwner={false}
            canInvite
            {...props}
          />
        </PrivateDialogsStoreProvider>,
      ),
    );
  };

  const find = (testId: string) =>
    container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

  beforeEach(() => {
    mocks.requireIdentity.mockImplementation(async () => identity);
    pendingAccessStore.addMissingFiles(10, "bob", [7]);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    pendingAccessStore.clear(10, "bob");
  });

  it("Retry from the SDK members list", async () => {
    mocks.rewrapMissingFilesForMember.mockImplementation(async () => ({
      fileResults: [{ fileId: 7, success: true }],
      skippedMembers: [],
      missingFileIdsByMember: {},
    }));
    render();

    expect(find("private_member_access_pending")?.textContent).toContain(
      "Common:EncryptedAccessPending",
    );

    await act(async () => {
      find("private_member_retry_access")?.click();
    });

    await vi.waitFor(() =>
      expect(find("private_member_access_pending")).toBeNull(),
    );
    expect(mocks.rewrapMissingFilesForMember).toHaveBeenCalledWith(
      10,
      "bob",
      [7],
      expect.objectContaining({ currentUserId: "me", identity }),
    );
    expect(mocks.toastr.success).toHaveBeenCalledWith(
      "Common:EncryptedAccessRestored",
    );
    expect(dialogs.reencryptPercent).toBeNull();
  });

  it("keeps the marker and reports the files still missing when the retry fails again", async () => {
    mocks.rewrapMissingFilesForMember.mockImplementation(async () => ({
      fileResults: [{ fileId: 7, success: false }],
      skippedMembers: [],
      missingFileIdsByMember: { bob: [7] },
    }));
    render();

    await act(async () => {
      find("private_member_retry_access")?.click();
    });

    await vi.waitFor(() =>
      expect(mocks.toastr.warning).toHaveBeenCalledWith(
        "Common:EncryptedReencryptPartialFailure",
      ),
    );
    expect(find("private_member_access_pending")).not.toBeNull();
  });

  it("offers the retry only to a user who may invite into the room", () => {
    render({ canInvite: false });

    expect(find("private_member_access_pending")).not.toBeNull();
    expect(find("private_member_retry_access")).toBeNull();
  });

  it("shows no marker on a group row", () => {
    render({ isGroup: true });

    expect(find("private_member_access_pending")).toBeNull();
  });
});
