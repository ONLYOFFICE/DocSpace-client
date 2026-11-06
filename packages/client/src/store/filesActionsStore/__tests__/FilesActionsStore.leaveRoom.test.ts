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

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  setFileEncryptionKeys: vi.fn(),
}));

import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { ShareAccessRights } from "@docspace/shared/enums";
import { setFileEncryptionKeys } from "@docspace/shared/api/files";
import type { TTranslation } from "@docspace/shared/types";

import { createTestFilesActionsStore } from "./testHarness";
// After the harness on purpose: the harness re-mocks the toast module, and
// this import must resolve to the instance the store under test uses.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

const t = ((key: string) => key) as TTranslation;

const makeStore = (room: Record<string, unknown>) =>
  createTestFilesActionsStore({
    filesStore: { selection: [room], removeFiles: vi.fn() },
    selectedFolderStore: { isRootFolder: true },
  });

describe("FilesActionsStore — onLeaveRoom of a private room", () => {
  beforeEach(() => {
    vi.mocked(updateRoomMemberRole).mockResolvedValue(
      {} as Awaited<ReturnType<typeof updateRoomMemberRole>>,
    );
  });

  it("leaves a non-private room through the role update", async () => {
    const store = makeStore({ id: 42, title: "Room", private: false });

    await store.onLeaveRoom(t);

    expect(updateRoomMemberRole).toHaveBeenCalledWith(42, {
      invitations: [{ id: "user-1", access: ShareAccessRights.None }],
      force: false,
    });
    expect(toastr.success).toHaveBeenCalled();
  });

  it("Leave succeeds", async () => {
    const store = makeStore({ id: 42, title: "Room", private: true });

    await store.onLeaveRoom(t);

    expect(updateRoomMemberRole).toHaveBeenCalledWith(42, {
      invitations: [{ id: "user-1", access: ShareAccessRights.None }],
      force: false,
    });
    expect(setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalled();
  });

  it("Cleanup fails", async () => {
    vi.mocked(updateRoomMemberRole).mockRejectedValue(new Error("refused"));
    const removeFiles = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [{ id: 42, title: "Room", private: true }],
        removeFiles,
      },
      selectedFolderStore: { isRootFolder: true },
    });

    await expect(store.onLeaveRoom(t)).rejects.toThrow("refused");

    expect(setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(removeFiles).not.toHaveBeenCalled();
    expect(toastr.success).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore — onLeaveRoom from inside the room", () => {
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(updateRoomMemberRole).mockResolvedValue(
      {} as Awaited<ReturnType<typeof updateRoomMemberRole>>,
    );
    navigate = vi.fn();
  });

  it.each([
    ["/private/42/filter", true, "/private/filter?"],
    ["/rooms/shared/42/filter", false, "rooms/shared/filter?"],
  ])(
    "Leave a private room: leaving %s opens the list of its section",
    async (pathname, isPrivate, list) => {
      (window as unknown as { DocSpace: unknown }).DocSpace = {
        navigate,
        location: { pathname, search: "?folder=42" },
      };
      const store = createTestFilesActionsStore({
        filesStore: { selection: [], bufferSelection: null, removeFiles: vi.fn() },
        selectedFolderStore: { id: 42, private: isPrivate, isRootFolder: false },
      });

      await store.onLeaveRoom(t);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate.mock.calls[0][0].startsWith(list)).toBe(true);
    },
  );
});

