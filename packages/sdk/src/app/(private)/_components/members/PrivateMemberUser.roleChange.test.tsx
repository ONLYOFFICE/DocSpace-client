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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  updateRoomMemberRole: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  pickedAccess: 0,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      updateRoomMemberRole: mocks.updateRoomMemberRole,
      setRoomSecurity: vi.fn(),
    },
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/access-right-select", () => ({
  AccessRightSelect: ({
    onSelect,
  }: {
    onSelect: (option: { key: string; access: ShareAccessRights }) => void;
  }) => (
    <button
      type="button"
      data-testid="private_member_role_combobox"
      onClick={() => onSelect({ key: "role", access: mocks.pickedAccess })}
    />
  ),
}));

vi.mock("../../_store/PrivateEncryptedUploadStore", () => ({
  useActiveEncryptedUploadsForRoom: () => 0,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ requireIdentity: vi.fn() }),
}));

vi.mock("../../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: { userId: "me" } }),
}));

import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

import { PrivateDialogsStoreProvider } from "../../_store/PrivateDialogsStore";
import PrivateMemberUser from "./PrivateMemberUser";

const ROOM_ID = 10;

describe("SDK role change of a private-room member", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;
  const onRoleChanged = vi.fn();

  const render = (canChangeRole = true) => {
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <PrivateDialogsStoreProvider>
          <PrivateMemberUser
            roomId={ROOM_ID}
            userId="bob"
            displayName="Bob"
            access={ShareAccessRights.Editing}
            canChangeRole={canChangeRole}
            canRemove
            isOwner={false}
            onRemoved={vi.fn()}
            onRoleChanged={onRoleChanged}
          />
        </PrivateDialogsStoreProvider>,
      ),
    );
  };

  const roleControl = () =>
    container.querySelector<HTMLElement>(
      '[data-testid="private_member_role_combobox"]',
    );

  const pickRole = (access: ShareAccessRights) => {
    mocks.pickedAccess = access;
    return act(async () => roleControl()?.click());
  };

  beforeEach(() => {
    mocks.updateRoomMemberRole.mockReset();
    mocks.toastr.success.mockReset();
    mocks.toastr.error.mockReset();
    onRoleChanged.mockReset();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("updates the member to a new role", async () => {
    mocks.updateRoomMemberRole.mockResolvedValue({});
    render();

    await pickRole(ShareAccessRights.RoomManager);

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledWith(
      ROOM_ID,
      expect.objectContaining({
        invitations: [{ id: "bob", access: ShareAccessRights.RoomManager }],
      }),
    );
    expect(mocks.toastr.success).toHaveBeenCalledWith(
      "Common:AccessRightsChanged",
    );
    expect(onRoleChanged).toHaveBeenCalledTimes(1);
  });

  it("sends nothing for the same role", async () => {
    render();

    await pickRole(ShareAccessRights.Editing);

    expect(mocks.updateRoomMemberRole).not.toHaveBeenCalled();
    expect(onRoleChanged).not.toHaveBeenCalled();
  });

  it("shows another error through the encryption error message", async () => {
    const failure = new Error("network down");
    mocks.updateRoomMemberRole.mockRejectedValue(failure);
    render();

    await pickRole(ShareAccessRights.RoomManager);

    expect(mocks.toastr.error).toHaveBeenCalledWith(
      getEncryptionErrorMessage(
        ((key: string) => key) as unknown as Parameters<
          typeof getEncryptionErrorMessage
        >[0],
        failure,
      ),
    );
    expect(onRoleChanged).not.toHaveBeenCalled();
  });

  it("shows the static role label to a member without the role control", () => {
    render(false);

    expect(roleControl()).toBeNull();
    const label = container.querySelector('[title="Common:Role"]');
    expect(label?.textContent).toBeTruthy();
  });
});
