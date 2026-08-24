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

import { describe, it, expect, vi, beforeEach } from "vitest";

import { request } from "@docspace/shared/api/client";
import { isPluginApiError } from "@onlyoffice/docspace-plugin-sdk/react";

import { createPluginApi } from "SRC_DIR/helpers/plugins/react/api";

vi.mock("@docspace/shared/api/client", () => ({
  request: vi.fn(),
}));

const requestMock = vi.mocked(request);

const api = createPluginApi();

const sentRequest = () => requestMock.mock.calls[0][0];

describe("plugin api client", () => {
  beforeEach(() => {
    requestMock.mockResolvedValue(undefined as never);
  });

  describe("sending", () => {
    it("sends a GET with the query parameters it was given", async () => {
      requestMock.mockResolvedValue({ files: [] } as never);

      const result = await api.get("/files/@my", { count: 20 });

      expect(result).toEqual({ files: [] });
      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "/files/@my",
          params: { count: 20 },
          skipForbidden: true,
        }),
        true,
      );
    });

    it.each([
      ["post", "POST"],
      ["put", "PUT"],
      ["patch", "PATCH"],
      ["delete", "DELETE"],
    ] as const)("sends %s as %s", async (helper, method) => {
      await api[helper]("/files/file/11", { title: "Report" });

      expect(sentRequest()).toMatchObject({
        method,
        url: "/files/file/11",
        data: { title: "Report" },
        skipForbidden: true,
      });
      expect(requestMock).toHaveBeenCalledTimes(1);
    });

    it("carries a body on DELETE, as the portal requires for some endpoints", async () => {
      await api.delete("/files/file/11", { deleteAfter: false });

      expect(sentRequest()).toMatchObject({
        method: "DELETE",
        url: "/files/file/11",
        data: { deleteAfter: false },
      });
    });

    it("lets the positional parameters win over the ones in the options", async () => {
      await api.get(
        "/files/@my",
        { count: 20 },
        { params: { count: 5, page: 2 } },
      );

      expect(sentRequest().params).toEqual({ count: 20, page: 2 });
    });

    it("passes the abort signal and the headers through", async () => {
      const controller = new AbortController();

      await api.put(
        "/files/fileops/delete",
        { fileIds: [1] },
        { headers: { "X-Sample": "1" }, signal: controller.signal },
      );

      expect(sentRequest()).toMatchObject({
        method: "PUT",
        headers: { "X-Sample": "1" },
        signal: controller.signal,
      });
    });

    it("sends nothing a caller did not ask for", async () => {
      await api.post("/files/@my/file");

      expect(sentRequest()).toMatchObject({
        method: "POST",
        url: "/files/@my/file",
      });
      expect(sentRequest().data).toBeUndefined();
      expect(sentRequest().headers).toBeUndefined();
      expect(sentRequest().signal).toBeUndefined();
    });

    it("sends a request described in full", async () => {
      await api.request({
        method: "PATCH",
        path: "/files/file/11",
        data: { title: "Report" },
        params: { force: true },
      });

      expect(sentRequest()).toMatchObject({
        method: "PATCH",
        url: "/files/file/11",
        data: { title: "Report" },
        params: { force: true },
      });
    });

    it("defaults to GET when the request names no method", async () => {
      await api.request({ path: "/files/rooms" });

      expect(sentRequest().method).toBe("GET");
    });

    // On 401 the portal logs the session out and resolves with nothing rather
    // than rejecting; a plugin must not see that as a failure of its own.
    it("resolves with nothing when the portal handled the failure itself", async () => {
      await expect(api.get("/files/rooms")).resolves.toBeUndefined();
    });
  });

  describe("path validation", () => {
    it.each([
      ["https://example.com/collect", "an absolute URL"],
      ["//example.com/collect", "a protocol-relative URL"],
      ["/http://example.com/collect", "a protocol behind a slash"],
      ["/files/../../secret", "a traversal"],
      ["files/@my", "a path without a leading slash"],
      ["", "an empty path"],
    ])("refuses %s (%s) before sending anything", async (path) => {
      await expect(api.get(path)).rejects.toMatchObject({
        name: "PluginApiError",
        code: "INVALID_PATH",
        status: 0,
        request: `GET ${path}`,
      });

      expect(requestMock).not.toHaveBeenCalled();
    });

    it.each([
      "/files/@my",
      "/files/file/11/history",
      "/people/@self",
      "/settings/security/password",
    ])("accepts %s", async (path) => {
      await api.get(path);

      expect(sentRequest().url).toBe(path);
    });

    // A plugin may write its own query string; nothing here rewrites it.
    it("keeps a query string the caller wrote into the path", async () => {
      await api.get("/files/@my?count=20&filterValue=report");

      expect(sentRequest().url).toBe("/files/@my?count=20&filterValue=report");
    });

    it("judges the route, not the query string", async () => {
      await api.get("/files/@my?filterValue=..");

      expect(sentRequest().url).toBe("/files/@my?filterValue=..");
    });

    it("still refuses a traversal in the route of a path that has a query", async () => {
      await expect(api.get("/files/../../secret?count=20")).rejects.toMatchObject(
        { code: "INVALID_PATH" },
      );

      expect(requestMock).not.toHaveBeenCalled();
    });
  });

  describe("error normalization", () => {
    it("reports the portal's own message and status", async () => {
      requestMock.mockRejectedValue({
        message: "Request failed with status code 403",
        response: {
          status: 403,
          data: { error: { message: "You do not have enough permissions" } },
        },
      });

      await expect(
        api.put("/files/fileops/delete", { fileIds: [1] }),
      ).rejects.toMatchObject({
        name: "PluginApiError",
        status: 403,
        message: "You do not have enough permissions",
        request: "PUT /files/fileops/delete",
        details: { error: { message: "You do not have enough permissions" } },
      });
    });

    it("reads the message the portal put next to the payload", async () => {
      requestMock.mockRejectedValue({
        response: { status: 400, data: { message: "The title is required" } },
      });

      await expect(api.post("/files/@my/file")).rejects.toMatchObject({
        status: 400,
        message: "The title is required",
      });
    });

    it("reads a body that is the message itself", async () => {
      requestMock.mockRejectedValue({
        response: { status: 409, data: "The room already exists" },
      });

      await expect(api.post("/files/rooms")).rejects.toMatchObject({
        status: 409,
        message: "The room already exists",
      });
    });

    // Some endpoints answer `{ error: { message: 401 } }` — not worth showing.
    it("ignores a message that is not text", async () => {
      requestMock.mockRejectedValue({
        message: "Request failed with status code 401",
        response: { status: 401, data: { error: { message: 401 } } },
      });

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        status: 401,
        message: "Request failed with status code 401",
      });
    });

    it("falls back to the status text, then to the status itself", async () => {
      requestMock.mockRejectedValue({
        response: { status: 502, statusText: "Bad Gateway" },
      });

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        status: 502,
        message: "Bad Gateway",
      });

      requestMock.mockRejectedValue({ response: { status: 500 } });

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        status: 500,
        message: "Request failed with status 500",
      });
    });

    it("reports a failure with no status as one", async () => {
      requestMock.mockRejectedValue({ response: {} });

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        status: 0,
        message: "Request failed with status 0",
      });
    });

    it.each([
      ["by code", { code: "ERR_CANCELED", message: "canceled" }],
      ["by name", { name: "CanceledError", message: "canceled" }],
    ])("marks a request the caller aborted (%s)", async (_, cause) => {
      requestMock.mockRejectedValue(cause);

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        name: "PluginApiError",
        code: "ABORTED",
        status: 0,
        message: "Request aborted",
      });
    });

    it("marks a request that never reached the portal", async () => {
      requestMock.mockRejectedValue({ message: "Network Error" });

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        name: "PluginApiError",
        code: "NETWORK",
        status: 0,
        message: "Network Error",
      });
    });

    // An error body served with 200 arrives as a bare `Error`, with no response.
    it("keeps the message of a failure that carries no response", async () => {
      requestMock.mockRejectedValue(new Error("The file is locked"));

      await expect(api.get("/files/file/11")).rejects.toMatchObject({
        code: "NETWORK",
        status: 0,
        message: "The file is locked",
      });
    });

    it("survives a rejection that is not an object", async () => {
      requestMock.mockRejectedValue(null);

      await expect(api.get("/files/rooms")).rejects.toMatchObject({
        name: "PluginApiError",
        code: "NETWORK",
        status: 0,
        message: "Request failed",
      });
    });

    // The shape is a contract: `isPluginApiError` reads the fields built here.
    it("throws something a plugin can treat as an error", async () => {
      requestMock.mockRejectedValue({
        response: { status: 404, data: { error: { message: "Not found" } } },
      });

      const error: unknown = await api
        .get("/files/file/11")
        .catch((cause) => cause);

      expect(error).toBeInstanceOf(Error);
      expect(isPluginApiError(error)).toBe(true);

      if (!isPluginApiError(error)) return;

      expect(error.stack).toBeTruthy();
      // `code` names a failure with no status, so an answered request has none.
      expect(error.code).toBeUndefined();
      expect(error.details).toEqual({ error: { message: "Not found" } });
      expect(error.request).toBe("GET /files/file/11");
    });
  });
});
