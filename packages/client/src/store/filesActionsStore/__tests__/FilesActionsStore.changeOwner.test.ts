// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  requireUnlock: vi.fn(),
}));
vi.mock(
  "@docspace/shared/services/private-room/room-member-flows",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    prepareNewOwner: vi.fn(),
  }),
);
vi.mock("@docspace/shared/api/privacy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getRoomMissingFileKeys: vi.fn(),
}));

import api from "@docspace/shared/api";
import { getRoomMissingFileKeys } from "@docspace/shared/api/privacy";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { prepareNewOwner } from "@docspace/shared/services/private-room/room-member-flows";
import { ShareAccessRights } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";
// The harness registers the toast mock the store sees; import it first.
import { createTestFilesActionsStore } from "./testHarness";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

const t = ((key: string, values?: object) =>
  values ? `${key} ${JSON.stringify(values)}` : key) as unknown as TTranslation;

const identity = { publicKey: "pk", privateKey: "sk" };
const transferred = [
  { createdBy: { id: "user-2" }, security: { Read: true }, access: 1 },
];

const roomStores = (room: { id: number; private?: boolean }) => {
  const filesStore = {
    selection: [room],
    bufferSelection: null,
    setSelected: vi.fn(),
    setFolder: vi.fn(),
  };
  const selectedFolderStore = {
    isRootFolder: false,
    id: room.id,
    setCreatedBy: vi.fn(),
    setInRoom: vi.fn(),
    setSecurity: vi.fn(),
    setAccess: vi.fn(),
  };
  const store = createTestFilesActionsStore({ filesStore, selectedFolderStore });
  return { store, filesStore, selectedFolderStore };
};

const refusal = (status: number) =>
  Object.assign(new Error(String(status)), { response: { status } });

// Spec: private-rooms/room-membership, "Ownership transfer wraps the candidate's missing files"
describe("FilesActionsStore.changeRoomOwner on a private room", () => {
  let setFileOwner: MockInstance;

  beforeEach(() => {
    vi.mocked(requireUnlock).mockResolvedValue(identity as never);
    vi.mocked(prepareNewOwner).mockResolvedValue({ missingFileIds: [] });
    vi.mocked(getRoomMissingFileKeys).mockResolvedValue([]);
    setFileOwner = vi
      .spyOn(api.files, "setFileOwner")
      .mockResolvedValue(transferred as never);
  });

  afterEach(() => {
    setFileOwner.mockRestore();
  });

  it("Missing entries wrapped before the transfer", async () => {
    const { store, filesStore, selectedFolderStore } = roomStores({
      id: 9,
      private: true,
    });

    await store.changeRoomOwner(t, "user-2");

    expect(requireUnlock).toHaveBeenCalledWith("user-1");
    expect(prepareNewOwner).toHaveBeenCalledWith({
      roomId: 9,
      candidateId: "user-2",
      currentUserId: "user-1",
      identity,
    });
    expect(setFileOwner).toHaveBeenCalledWith("user-2", [9]);
    expect(vi.mocked(prepareNewOwner).mock.invocationCallOrder[0]).toBeLessThan(
      setFileOwner.mock.invocationCallOrder[0],
    );
    expect(selectedFolderStore.setCreatedBy).toHaveBeenCalledWith(
      transferred[0].createdBy,
    );
    expect(toastr.success).toHaveBeenCalledWith("Common:AppointNewOwner");
    expect(toastr.error).not.toHaveBeenCalled();
    expect(filesStore.setSelected).toHaveBeenCalledWith("none");
  });

  it("Entries still missing", async () => {
    vi.mocked(prepareNewOwner).mockResolvedValue({ missingFileIds: [21, 22] });
    const { store, filesStore, selectedFolderStore } = roomStores({
      id: 9,
      private: true,
    });

    await store.changeRoomOwner(t, "user-2");

    expect(setFileOwner).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(
      'Common:EncryptedReencryptPartialFailure {"count":2}',
    );
    expect(toastr.success).not.toHaveBeenCalled();
    expect(selectedFolderStore.setCreatedBy).not.toHaveBeenCalled();
    expect(filesStore.setSelected).toHaveBeenCalledWith("none");
  });

  it("Transfer refused by the server", async () => {
    setFileOwner.mockRejectedValue(refusal(409));
    vi.mocked(getRoomMissingFileKeys).mockResolvedValue([
      { userId: "user-2", fileIds: [31] },
    ]);
    const { store, selectedFolderStore } = roomStores({ id: 9, private: true });

    await store.changeRoomOwner(t, "user-2");

    expect(getRoomMissingFileKeys).toHaveBeenCalledWith(9, ["user-2"]);
    expect(toastr.error).toHaveBeenCalledWith(
      'Common:EncryptedReencryptPartialFailure {"count":1}',
    );
    expect(toastr.success).not.toHaveBeenCalled();
    expect(selectedFolderStore.setCreatedBy).not.toHaveBeenCalled();
  });

  it("Other refusals keep the server's error", async () => {
    const forbidden = refusal(403);
    setFileOwner.mockRejectedValue(forbidden);
    const { store } = roomStores({ id: 9, private: true });

    await store.changeRoomOwner(t, "user-2");

    expect(getRoomMissingFileKeys).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(forbidden);
  });

  it("Unlock declined", async () => {
    vi.mocked(requireUnlock).mockResolvedValue(null);
    const { store, filesStore } = roomStores({ id: 9, private: true });

    await store.changeRoomOwner(t, "user-2");

    expect(prepareNewOwner).not.toHaveBeenCalled();
    expect(setFileOwner).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptionUnlockRequired");
    expect(filesStore.setSelected).toHaveBeenCalledWith("none");
  });

  it("Administrator leaves through the owner change", async () => {
    const updateRoomMemberRole = vi
      .spyOn(api.rooms, "updateRoomMemberRole")
      .mockResolvedValue({} as never);
    const filesStore = {
      selection: [{ id: 9, private: true }],
      bufferSelection: null,
      setSelected: vi.fn(),
      setFolder: vi.fn(),
      removeFiles: vi.fn(),
      setInRoomFolder: vi.fn(),
    };
    const store = createTestFilesActionsStore({
      filesStore,
      selectedFolderStore: { isRootFolder: true, id: 9 },
      userStore: { user: { id: "user-1", isAdmin: true }, encryptionKeys: [] },
    });

    await store.changeRoomOwner(t, "user-2", true);

    expect(setFileOwner).toHaveBeenCalledWith("user-2", [9]);
    expect(updateRoomMemberRole).toHaveBeenCalledWith(9, {
      invitations: [{ id: "user-1", access: ShareAccessRights.None }],
      force: false,
    });
    expect(filesStore.removeFiles).toHaveBeenCalledWith(null, [9]);
    expect(filesStore.setInRoomFolder).not.toHaveBeenCalled();
    updateRoomMemberRole.mockRestore();
  });

  it("Leave after an owner change refused", async () => {
    const updateRoomMemberRole = vi
      .spyOn(api.rooms, "updateRoomMemberRole")
      .mockRejectedValue(refusal(403));
    const filesStore = {
      selection: [{ id: 9, private: true }],
      bufferSelection: null,
      setSelected: vi.fn(),
      setFolder: vi.fn(),
      removeFiles: vi.fn(),
    };
    const store = createTestFilesActionsStore({
      filesStore,
      selectedFolderStore: { isRootFolder: true, id: 9 },
    });

    await store.changeRoomOwner(t, "user-2", true);

    expect(setFileOwner).toHaveBeenCalledWith("user-2", [9]);
    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedAccessChangeRefused",
    );
    expect(filesStore.removeFiles).not.toHaveBeenCalled();
    updateRoomMemberRole.mockRestore();
  });

  it("Ordinary room", async () => {
    const { store, selectedFolderStore } = roomStores({ id: 9, private: false });

    await store.changeRoomOwner(t, "user-2");

    expect(requireUnlock).not.toHaveBeenCalled();
    expect(prepareNewOwner).not.toHaveBeenCalled();
    expect(setFileOwner).toHaveBeenCalledWith("user-2", [9]);
    expect(selectedFolderStore.setCreatedBy).toHaveBeenCalledWith(
      transferred[0].createdBy,
    );
  });
});
