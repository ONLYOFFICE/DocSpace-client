/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  encryptedFilesHandlers,
  type EncryptedFilesHandlerHandle,
} from "../../files/encryptedFiles";
import {
  roomMembersHandlers,
  type RoomMembersHandlerHandle,
} from "../roomMembers";

const PORT = "3204";
const ROOM_ID = 9700;
const FOLDER_ID = 9701;
const OWNER_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";

const files: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};
const members: { current: RoomMembersHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...roomMembersHandlers(PORT, ROOM_ID, { handle: members, files }),
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: OWNER_ID,
    currentUserId: OWNER_ID,
    folders: [{ id: FOLDER_ID, title: "Drafts" }],
    handle: files,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

const keyOf = (userId: string) => ({
  userId,
  publicKeyId: `pk-${userId}`,
  privateKeyEnc: `wrap-${userId}`,
});

beforeEach(() => {
  files.current!.reset();
  members.current!.setMembers([
    { id: OWNER_ID, access: 1 },
    { id: BOB_ID, access: 11 },
    { id: CAROL_ID, access: 11 },
  ]);
  const fileKeys = [OWNER_ID, BOB_ID, CAROL_ID].map(keyOf);
  files.current!.setFiles([
    { id: 1, title: "a.docx", encrypted: true, fileKeys },
    { id: 2, title: "b.docx", encrypted: true, fileKeys, folderId: FOLDER_ID },
  ]);
});

/** FileShare.None. */
const NONE = 0;

const setShare = (userId: string, access: number) =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms/${ROOM_ID}/share`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitations: [{ id: userId, access }] }),
  });

const keyHolders = () =>
  files.current!
    .getFiles()
    .map((f) => f.fileKeys.map((k) => k.userId).sort());

describe("roomMembers mock — PUT /files/rooms/{id}/share in a private room (mirrors FileSharingAceHelper.SetAceObjectAsync)", () => {
  it("Member removed", async () => {
    const res = await setShare(BOB_ID, NONE);

    expect(res.status).toBe(200);
    expect(keyHolders()).toEqual([
      [OWNER_ID, CAROL_ID],
      [OWNER_ID, CAROL_ID],
    ]);
  });

  it("Member leaves", async () => {
    files.current!.setCurrentUserId(CAROL_ID);

    const res = await setShare(CAROL_ID, NONE);

    expect(res.status).toBe(200);
    expect(keyHolders()).toEqual([
      [OWNER_ID, BOB_ID],
      [OWNER_ID, BOB_ID],
    ]);
  });

  it("Owner keeps the keys", async () => {
    const res = await setShare(OWNER_ID, NONE);

    expect(res.status).toBe(200);
    expect(keyHolders()).toEqual([
      [OWNER_ID, BOB_ID, CAROL_ID],
      [OWNER_ID, BOB_ID, CAROL_ID],
    ]);
  });

  it("keeps every key when a role changes", async () => {
    await setShare(BOB_ID, 2);

    expect(keyHolders()).toEqual([
      [OWNER_ID, BOB_ID, CAROL_ID],
      [OWNER_ID, BOB_ID, CAROL_ID],
    ]);
  });
});

/**
 * Mirrors VirtualRoomsController.GetRoomSecurityInfo:
 * SecurityDao.GetPureSharesQuery keeps SubjectType.User records only for
 * ShareFilterType.User (16), and a guest is such a record.
 */
describe("roomMembers mock — GET /files/rooms/{id}/share by filter type", () => {
  const GROUP_ID = "44444444-4444-4444-4444-444444444444";

  const getMembers = async (filterType: number) => {
    const res = await fetch(
      `${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms/${ROOM_ID}/share?filterType=${filterType}`,
    );
    const { response } = (await res.json()) as {
      response: {
        total: number;
        items: Array<{
          subjectType: number;
          sharedTo: { id: string; isVisitor?: boolean };
        }>;
      };
    };
    return response;
  };

  beforeEach(() => {
    members.current!.setMembers([
      { id: OWNER_ID, access: 1 },
      { id: BOB_ID, access: 11, isVisitor: true },
      { id: GROUP_ID, access: 11, isGroup: true, displayName: "Marketing" },
    ]);
  });

  it("Users only", async () => {
    const { items, total } = await getMembers(16);

    expect(items.map((m) => [m.sharedTo.id, m.subjectType])).toEqual([
      [OWNER_ID, 0],
      [BOB_ID, 0],
    ]);
    expect(items[1].sharedTo.isVisitor).toBe(true);
    expect(total).toBe(2);
  });

  it("answers users and groups without a filter", async () => {
    const { items, total } = await getMembers(0);

    expect(items.map((m) => [m.sharedTo.id, m.subjectType])).toEqual([
      [OWNER_ID, 0],
      [BOB_ID, 0],
      [GROUP_ID, 2],
    ]);
    expect(total).toBe(3);
  });
});
