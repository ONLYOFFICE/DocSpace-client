/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

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
