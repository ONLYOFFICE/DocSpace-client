// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@docspace/shared/api/rooms", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  updateRoomMemberRole: vi.fn(),
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  revokeMemberFromEncryptedRoom: vi.fn(),
}));

import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { ShareAccessRights } from "@docspace/shared/enums";
import { revokeMemberFromEncryptedRoom } from "@docspace/shared/services/private-room/room-encryption";
import type { TTranslation } from "@docspace/shared/types";

import { createTestFilesActionsStore } from "./testHarness";
// After the harness on purpose: the harness re-mocks the toast module, and
// this import must resolve to the instance the store under test uses.
import { toastr } from "@docspace/ui-kit/components/toast";

declare function allowConsoleError(matcher: RegExp | string): void;

const t = ((key: string) => key) as TTranslation;

const makeStore = (room: Record<string, unknown>) =>
  createTestFilesActionsStore({
    filesStore: { selection: [room], removeFiles: vi.fn() },
    selectedFolderStore: { isRootFolder: true },
  });

describe("FilesActionsStore — onLeaveRoom private-room key cleanup", () => {
  beforeEach(() => {
    vi.mocked(updateRoomMemberRole).mockResolvedValue(
      {} as Awaited<ReturnType<typeof updateRoomMemberRole>>,
    );
    vi.mocked(revokeMemberFromEncryptedRoom).mockResolvedValue([]);
  });

  it("leaves a non-private room without touching encryption keys", async () => {
    const store = makeStore({ id: 42, title: "Room", private: false });

    await store.onLeaveRoom(t);

    expect(updateRoomMemberRole).toHaveBeenCalledWith(42, {
      invitations: [{ id: "user-1", access: ShareAccessRights.None }],
      force: false,
    });
    expect(revokeMemberFromEncryptedRoom).not.toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalled();
  });

  it("revokes the leaver's own key entries before leaving a private room", async () => {
    const store = makeStore({ id: 42, title: "Room", private: true });

    await store.onLeaveRoom(t);

    expect(revokeMemberFromEncryptedRoom).toHaveBeenCalledWith(
      42,
      "user-1",
      {},
    );
    expect(updateRoomMemberRole).toHaveBeenCalledTimes(1);
    // The revoke needs file access, which the role change drops.
    expect(
      vi.mocked(revokeMemberFromEncryptedRoom).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(updateRoomMemberRole).mock.invocationCallOrder[0]);
    expect(toastr.success).toHaveBeenCalled();
  });

  it("still leaves when the key cleanup fails entirely", async () => {
    allowConsoleError("[ENCRYPTION] revoke own access on leave failed");
    vi.mocked(revokeMemberFromEncryptedRoom).mockRejectedValue(
      new Error("boom"),
    );
    const store = makeStore({ id: 42, title: "Room", private: true });

    await store.onLeaveRoom(t);

    expect(updateRoomMemberRole).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalled();
  });

  it("still leaves when some files could not be re-keyed", async () => {
    allowConsoleError(/\[ENCRYPTION\] 1 file\(s\) kept the leaver's/);
    vi.mocked(revokeMemberFromEncryptedRoom).mockResolvedValue([
      { fileId: 1, success: true },
      { fileId: 2, success: false, error: "x" },
    ]);
    const store = makeStore({ id: 42, title: "Room", private: true });

    await store.onLeaveRoom(t);

    expect(updateRoomMemberRole).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalled();
  });
});
