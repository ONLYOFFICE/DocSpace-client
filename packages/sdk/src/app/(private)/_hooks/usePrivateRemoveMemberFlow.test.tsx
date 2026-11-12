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
  uploads: 0,
  setRoomSecurity: vi.fn(),
  setFileEncryptionKeys: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: { setRoomSecurity: mocks.setRoomSecurity },
    files: { setFileEncryptionKeys: mocks.setFileEncryptionKeys },
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("../_store/PrivateEncryptedUploadStore", () => ({
  useActiveEncryptedUploadsForRoom: () => mocks.uploads,
}));

import { usePrivateRemoveMemberFlow } from "./usePrivateRemoveMemberFlow";

describe("usePrivateRemoveMemberFlow", () => {
  let root: Root | null = null;
  let flow: ReturnType<typeof usePrivateRemoveMemberFlow>;

  const render = () => {
    const Probe = () => {
      flow = usePrivateRemoveMemberFlow(10);
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  beforeEach(() => {
    mocks.uploads = 0;
    mocks.setRoomSecurity.mockImplementation(async () => ({}));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Uploads in flight", async () => {
    mocks.uploads = 2;
    render();

    await act(() => flow.remove({ roomId: 10, userId: "bob" }));

    expect(flow.guardReason).toBe("Common:CannotRemoveMemberWhileUploads");
    expect(mocks.toastr.warning).toHaveBeenCalledWith(
      "Common:CannotRemoveMemberWhileUploads",
    );
    expect(mocks.setRoomSecurity).not.toHaveBeenCalled();
  });

  it("Remove a member", async () => {
    render();

    let removed = false;
    await act(async () => {
      removed = await flow.remove({ roomId: 10, userId: "bob" });
    });

    expect(removed).toBe(true);

    expect(mocks.setRoomSecurity).toHaveBeenCalledWith(10, {
      invitations: [{ id: "bob", access: ShareAccessRights.None }],
      notify: false,
      message: "",
    });
    expect(mocks.setFileEncryptionKeys).not.toHaveBeenCalled();
  });

  it("Remove a group", async () => {
    render();

    await act(() => flow.remove({ roomId: 10, userId: "team" }));

    expect(mocks.setRoomSecurity).toHaveBeenCalledTimes(1);
    expect(mocks.setRoomSecurity).toHaveBeenCalledWith(10, {
      invitations: [{ id: "team", access: ShareAccessRights.None }],
      notify: false,
      message: "",
    });
    expect(mocks.setFileEncryptionKeys).not.toHaveBeenCalled();
  });

  it("shows the error when the server refuses the removal", async () => {
    mocks.setRoomSecurity.mockImplementation(async () => {
      throw new Error("403");
    });
    render();

    let removed = true;
    await act(async () => {
      removed = await flow.remove({ roomId: 10, userId: "bob" });
    });

    expect(mocks.toastr.error).toHaveBeenCalledWith("Common:EncryptionError");
    expect(removed).toBe(false);
  });

  it("Removal or role change refused", async () => {
    mocks.setRoomSecurity.mockImplementation(async () => {
      throw Object.assign(new Error("The user does not have an encryption key"), {
        response: { status: 403 },
      });
    });
    render();

    let removed = true;
    await act(async () => {
      removed = await flow.remove({ roomId: 10, userId: "bob" });
    });

    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedAccessChangeRefused",
    );
    expect(removed).toBe(false);
  });
});
