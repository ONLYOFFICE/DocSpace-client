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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "asc_auth_key=token" }),
  cookies: async () => ({ get: () => undefined, getAll: () => [] }),
}));

vi.mock("@docspace/shared/utils/next-ssr-helper", () => ({
  createRequest: async (paths: string[]) =>
    paths.map((path) => new Request(`http://portal.test/api/2.0${path}`)),
}));

vi.mock("@/../logger.mjs", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { getData } from "../actions";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const encryptedConfig = (canCoAuthoring: boolean) => ({
  document: { title: "a1b2c3d4e5f6.docx", key: "1_7_1" },
  documentType: "word",
  editorConfig: { mode: "edit", canCoAuthoring },
  editorType: 0,
  editorUrl: "http://portal.test/ds-vpath/web-apps/apps/api/documents/api.js",
  file: { id: 7, encrypted: true, canShare: false },
  token: "t",
  type: "desktop",
});

describe("getData", () => {
  /** What GET /files/settings answers: a capability, or a failure. */
  let filesSettings: { docServiceEncryptionSupported: boolean } | "down";
  let openedConfig: ReturnType<typeof encryptedConfig>;
  /** openedit answers 415, as for a file the editors cannot open. */
  let openEditRefused: boolean;
  /** What GET /files/file/7 says of the file. */
  let fileEncrypted: boolean;

  beforeEach(() => {
    filesSettings = { docServiceEncryptionSupported: true };
    openedConfig = encryptedConfig(true);
    openEditRefused = false;
    fileEncrypted = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request: Request) => {
        const { pathname } = new URL(request.url);
        if (pathname.endsWith("/files/file/7/openedit")) {
          return openEditRefused
            ? new Response(
                JSON.stringify({
                  error: { message: "refused", type: "System.NotSupportedException" },
                  status: 1,
                  statusCode: 415,
                }),
                { status: 415, headers: { "Content-Type": "application/json" } },
              )
            : json({ response: openedConfig });
        }
        if (pathname.endsWith("/files/file/7")) {
          return json({
            response: { id: 7, ...(fileEncrypted && { encrypted: true }) },
          });
        }
        if (pathname.endsWith("/authentication")) {
          return json({ response: true });
        }
        if (pathname.endsWith("/files/docservice")) {
          return json({ response: { docServiceUrl: "http://portal.test/ds-vpath/" } });
        }
        if (pathname.endsWith("/people/@self")) {
          return json({ response: { id: "user-1" } });
        }
        if (pathname.endsWith("/files/settings")) {
          return filesSettings === "down"
            ? new Response(null, { status: 500 })
            : json({ response: filesSettings });
        }
        if (pathname.endsWith("/settings")) {
          return json({ response: { tenantStatus: 0 } });
        }
        throw new Error(`unexpected request ${request.url}`);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Encrypted configuration received: canCoAuthoring stays as the server sent it", async () => {
    const result = await getData("7");

    expect(result.error).toBeUndefined();
    expect(result.config?.file.encrypted).toBe(true);
    expect(result.config?.editorConfig.canCoAuthoring).toBe(true);
  });

  // Spec: editor-integration, "Document Server capability check before opening"
  describe("Capability check", () => {
    it("Capability present", async () => {
      const result = await getData("7");

      expect(result.docServiceEncryptionSupported).toBe(true);
    });

    it("Capability absent", async () => {
      filesSettings = { docServiceEncryptionSupported: false };

      const result = await getData("7");

      expect(result.docServiceEncryptionSupported).toBe(false);
    });

    it("Files settings unavailable: the capability counts as absent", async () => {
      filesSettings = "down";

      const result = await getData("7");

      expect(result.error).toBeUndefined();
      expect(result.docServiceEncryptionSupported).toBe(false);
    });

    it("Editor refused by the server", async () => {
      openEditRefused = true;
      filesSettings = { docServiceEncryptionSupported: false };

      const result = await getData("7");

      expect(result.error?.status).toBe("not-supported");
      expect(result.docServiceEncryptionSupported).toBe(false);
    });

    it("keeps the format error of a plain file the editors cannot open", async () => {
      openEditRefused = true;
      fileEncrypted = false;
      filesSettings = { docServiceEncryptionSupported: false };

      const result = await getData("7");

      expect(result.error?.status).toBe("not-supported");
      expect(result.docServiceEncryptionSupported).toBeUndefined();
    });

    it("keeps the format error while the editors can encrypt", async () => {
      openEditRefused = true;

      const result = await getData("7");

      expect(result.error?.status).toBe("not-supported");
      expect(result.docServiceEncryptionSupported).toBeUndefined();
    });

    it("Plain file: the files settings are not read", async () => {
      openedConfig = {
        ...encryptedConfig(true),
        file: { id: 7, encrypted: false, canShare: false },
      };

      const result = await getData("7");

      expect(result.docServiceEncryptionSupported).toBeUndefined();
      const calls = vi.mocked(fetch).mock.calls.map((call) =>
        new URL((call[0] as Request).url).pathname,
      );
      expect(calls.some((path) => path.endsWith("/files/settings"))).toBe(
        false,
      );
    });
  });
});
