/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  filesSettingsHandler,
  PATH,
  PATH_PRIVATE_ROOM_LINKS,
  privateRoomLinksHandler,
} from "../filesSettings";

const PORT = "3201";
const URL = `${BASE_URL}:${PORT}/${API_PREFIX}/${PATH}`;

const server = setupServer(filesSettingsHandler(PORT));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const read = async () => (await (await fetch(URL)).json()).response;

describe("filesSettings mock — GET /files/settings (mirrors FilesSettingsDtoConverter.Get)", () => {
  it("Capability present: the Document Server of the stand encrypts", async () => {
    expect((await read()).docServiceEncryptionSupported).toBe(true);
  });

  it("Capability false: a spec names a Document Server without the add-on", async () => {
    server.use(
      filesSettingsHandler(PORT, { docServiceEncryptionSupported: false }),
    );
    expect((await read()).docServiceEncryptionSupported).toBe(false);
  });
});

describe("filesSettings mock — PUT /files/settings/external/private (mirrors SettingsController.PrivateRoomLinks)", () => {
  const put = (set: boolean) =>
    fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/${PATH_PRIVATE_ROOM_LINKS}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set }),
    });

  it("Portal setting read", async () => {
    expect((await read()).privateRoomLinks).toBe(true);
  });

  it("Administrator turns the links off", async () => {
    server.use(privateRoomLinksHandler(PORT));

    expect((await (await put(false)).json()).response).toBe(false);
  });

  it("Caller who is not a DocSpace admin", async () => {
    server.use(privateRoomLinksHandler(PORT, false));

    expect((await put(false)).status).toBe(403);
  });
});
