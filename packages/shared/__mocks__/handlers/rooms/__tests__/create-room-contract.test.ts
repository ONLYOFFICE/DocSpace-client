/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  createPrivateRoomHandlers,
  type CreateRoomHandlerHandle,
} from "../createRoom";

const PORT = "3203";
const ROOMS_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms`;
const handle: { current: CreateRoomHandlerHandle | null } = { current: null };

const server = setupServer(...createPrivateRoomHandlers(PORT, { handle }));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => handle.current?.reset());
afterAll(() => server.close());

const send = async (
  method: "POST" | "PUT",
  url: string,
  body: Record<string, unknown>,
) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};
const create = (body: Record<string, unknown>) =>
  send("POST", ROOMS_URL, { title: "Secret", roomType: 5, ...body });
const update = (id: number, body: Record<string, unknown>) =>
  send("PUT", `${ROOMS_URL}/${id}`, body);

/** RoomDataLifetimeDto; without `enabled` when it is left out. */
const lifetime = (enabled?: boolean) => ({
  deletePermanently: false,
  period: 0,
  value: 30,
  ...(enabled === undefined ? {} : { enabled }),
});
/** WatermarkRequestDto; without `enabled` when it is left out. */
const watermark = (enabled?: boolean) => ({
  additions: 1,
  text: "Confidential",
  ...(enabled === undefined ? {} : { enabled }),
});

describe("createRoom mock — POST /files/rooms (mirrors FileStorageService.InternalCreateFolderAsync)", () => {
  it("Private room created without the settings", async () => {
    const { status, body } = await create({ private: true });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({ private: true, indexing: false });
  });

  it.each([
    ["indexing", { indexing: true }],
    ["an enabled lifetime", { lifetime: lifetime(true) }],
    ["an enabled watermark", { watermark: watermark(true) }],
    ["a lifetime without the flag", { lifetime: lifetime() }],
    ["a watermark without the flag", { watermark: watermark() }],
  ])("Private room refused with %s", async (_, settings) => {
    const { status, body } = await create({ private: true, ...settings });

    expect(status).toBe(400);
    expect(body.error.message).toBe("Bad request.");
    expect(handle.current!.getRooms()).toEqual([]);
  });

  it("Settings turned off at creation", async () => {
    const { status } = await create({
      private: true,
      indexing: false,
      lifetime: lifetime(false),
      watermark: watermark(false),
    });

    expect(status).toBe(200);
  });

  it("Ordinary room with the settings", async () => {
    const { status, body } = await create({
      private: false,
      indexing: true,
      lifetime: lifetime(true),
      watermark: watermark(true),
    });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({ private: false, indexing: true });
  });

  it.each([
    ["an Instructions room", 10],
    ["a Knowledge room", 11],
    ["an AI project room", 12],
  ])("AI hub room created as private: %s", async (_, roomType) => {
    const { status, body } = await create({ private: true, roomType });

    expect(status).toBe(400);
    expect(body.error.message).toBe("Bad request.");
    expect(handle.current!.getRooms()).toEqual([]);
  });

  it("AI hub room without the flag", async () => {
    const { status } = await create({ private: false, roomType: 11 });

    expect(status).toBe(200);
  });
});

describe("createRoom mock — a caller without keys (mirrors EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync since cc60512acd)", () => {
  const keyless: { current: CreateRoomHandlerHandle | null } = { current: null };
  const keylessServer = setupServer(
    ...createPrivateRoomHandlers(PORT, { handle: keyless, callerHasKeys: false }),
  );

  beforeAll(() => {
    server.close();
    keylessServer.listen({ onUnhandledRequest: "error" });
  });
  afterEach(() => keyless.current?.reset());
  afterAll(() => {
    keylessServer.close();
    server.listen({ onUnhandledRequest: "error" });
  });

  it("Caller who deleted all keys", async () => {
    const { status, body } = await create({ private: true });

    expect(status).toBe(403);
    expect(body.error.message).toBe("The user does not have an encryption key");
    expect(body.error.type).toBe("System.InvalidOperationException");
    expect(keyless.current!.getRooms()).toEqual([]);
  });

  it("Ordinary room needs no key", async () => {
    const { status } = await create({ private: false });

    expect(status).toBe(200);
  });
});

describe("createRoom mock — POST /files/rooms/thirdparty/{id} (mirrors FileStorageService.CreateThirdPartyRoomAsync since b562fc3fb1)", () => {
  const createThirdParty = (body: Record<string, unknown>) =>
    send("POST", `${ROOMS_URL}/thirdparty/sbox-7`, {
      title: "On the storage",
      roomType: 5,
      ...body,
    });

  it("Third-party room created as private", async () => {
    const { status, body } = await createThirdParty({ private: true });

    expect(status).toBe(400);
    expect(body.error.message).toBe(
      "A private room cannot be created on a third-party storage",
    );
    expect(handle.current!.getRooms()).toEqual([]);
  });

  it("Third-party room without the flag", async () => {
    const { status, body } = await createThirdParty({ private: false });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({ private: false, parentId: "sbox-7" });
    expect(String(body.response.id).startsWith("sbox-7-")).toBe(true);
  });
});

describe("createRoom mock — PUT /files/rooms/{id} (mirrors FileStorageService.UpdateRoomAsync)", () => {
  const privateRoom = async () =>
    (await create({ private: true })).body.response.id as number;

  it.each([
    ["indexing turned on", { indexing: true }],
    ["a lifetime set", { lifetime: lifetime(true) }],
    ["a watermark set", { watermark: watermark(true) }],
  ])("Private room refused with %s", async (_, settings) => {
    const id = await privateRoom();

    const { status, body } = await update(id, settings);

    expect(status).toBe(400);
    expect(body.error.message).toBe("Bad request.");
    expect(handle.current!.getRooms()[0]).not.toMatchObject(settings);
  });

  it("Settings turned off on update", async () => {
    const id = await privateRoom();

    const { status, body } = await update(id, {
      indexing: false,
      lifetime: lifetime(false),
      watermark: watermark(false),
    });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({ id, indexing: false });
  });

  it("Rename", async () => {
    const id = await privateRoom();

    const { status, body } = await update(id, { title: "Renamed" });

    expect(status).toBe(200);
    expect(body.response).toMatchObject({ id, title: "Renamed" });
  });
});

describe("createRoom mock — a Document Server without encryption (mirrors InternalCreateFolderAsync since b562fc3fb1)", () => {
  const refusing: { current: CreateRoomHandlerHandle | null } = {
    current: null,
  };

  beforeEach(() => {
    server.use(
      ...createPrivateRoomHandlers(PORT, {
        docServiceEncryptionSupported: false,
        handle: refusing,
      }),
    );
  });
  afterEach(() => server.resetHandlers());

  it("Room created without the library", async () => {
    const { status, body } = await create({
      private: true,
      indexing: true,
    });

    expect(status).toBe(403);
    expect(body.error).toEqual({
      message:
        "The document server connected to this portal cannot work with encrypted files",
      type: "System.InvalidOperationException",
    });
    expect(refusing.current!.getRooms()).toEqual([]);
  });

  it("creates an ordinary room as before", async () => {
    const { status } = await create({});

    expect(status).toBe(200);
    expect(refusing.current!.getRooms()).toHaveLength(1);
  });
});
