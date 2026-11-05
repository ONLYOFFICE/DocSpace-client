/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import { roomLinkSetHandler } from "../roomLinks";

const PORT = "3202";
const PRIVATE_ROOM_ID = 9700;
const ORDINARY_ROOM_ID = 9701;

const server = setupServer(
  roomLinkSetHandler(PORT, PRIVATE_ROOM_ID, { isPrivate: true }),
  roomLinkSetHandler(PORT, ORDINARY_ROOM_ID),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

const setLink = async (roomId: number, body: Record<string, unknown>) => {
  const res = await fetch(
    `${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms/${roomId}/links`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return { status: res.status, body: await res.json() };
};

describe("roomLinks mock — PUT /files/rooms/{id}/links (mirrors VirtualRoomsController.SetRoomLink)", () => {
  it("External link requested", async () => {
    const { status, body } = await setLink(PRIVATE_ROOM_ID, {
      linkId: "00000000-0000-0000-0000-000000000000",
      title: "Shared link",
      access: 2,
      linkType: 1,
      internal: false,
    });

    expect(status).toBe(403);
    expect(body.error.message).toBe(
      "You don't have enough permission to perform the operation",
    );
  });

  it("Invitation link requested", async () => {
    const { status } = await setLink(PRIVATE_ROOM_ID, {
      linkId: "00000000-0000-0000-0000-000000000000",
      title: "Invitation",
      access: 2,
      linkType: 2,
    });

    expect(status).toBe(403);
  });

  it("Link revoked", async () => {
    const { status, body } = await setLink(PRIVATE_ROOM_ID, {
      linkId: "room-link-id",
      access: 0,
      linkType: 1,
    });

    expect(status).toBe(200);
    expect(body.response).toBeNull();
  });

  it("Ordinary room", async () => {
    const { status, body } = await setLink(ORDINARY_ROOM_ID, {
      linkId: "00000000-0000-0000-0000-000000000000",
      title: "Shared link",
      access: 2,
      linkType: 1,
      internal: true,
    });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({
      access: 2,
      sharedTo: { internal: true, linkType: 1 },
    });
  });
});
