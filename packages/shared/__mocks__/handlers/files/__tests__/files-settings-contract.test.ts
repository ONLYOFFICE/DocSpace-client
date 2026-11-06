/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import { filesSettingsHandler, PATH } from "../filesSettings";

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
