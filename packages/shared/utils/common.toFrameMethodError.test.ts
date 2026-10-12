// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";

import { toFrameMethodError } from "./common";

describe("toFrameMethodError", () => {
  it("keeps status, message, name and code of an AxiosError and drops the request config", () => {
    const config = {
      url: "/api/2.0/authentication",
      data: '{"passwordHash":"secret-hash"}',
      headers: new AxiosHeaders(),
    };
    const error = new AxiosError(
      "Request failed with status code 401",
      "ERR_BAD_REQUEST",
      config,
      {},
      { status: 401, statusText: "Unauthorized", data: {}, headers: {}, config },
    );

    const result = toFrameMethodError(error);

    expect(result).toEqual({
      isError: true,
      status: 401,
      message: "Request failed with status code 401",
      name: "AxiosError",
      code: "ERR_BAD_REQUEST",
    });
    expect(JSON.stringify(result)).not.toContain("secret-hash");
  });

  it("falls back to the error name when the message is empty", () => {
    expect(toFrameMethodError(new Error())).toEqual({
      isError: true,
      message: "Error",
      name: "Error",
    });
  });

  it("wraps a non-object value as its string form", () => {
    expect(toFrameMethodError("boom")).toEqual({ isError: true, message: "boom" });
  });
});
