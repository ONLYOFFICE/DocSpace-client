// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./oauthToken", () => ({
  isOAuthFrame: vi.fn(() => true),
  requestAuthToken: vi.fn(),
  onAuthTokenPush: vi.fn(() => () => {}),
}));

vi.mock("./common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  frameCallEvent: vi.fn(),
}));

import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import AxiosClient from "./axiosClient";
import { frameCallEvent } from "./common";
import { requestAuthToken } from "./oauthToken";

const requestAuthTokenMock = vi.mocked(requestAuthToken);
const frameCallEventMock = vi.mocked(frameCallEvent);

const createClient = (statuses: number[]) => {
  const client = new AxiosClient();
  const headers: (string | undefined)[] = [];
  const queue = [...statuses];

  client.client!.defaults.adapter = (config: InternalAxiosRequestConfig) => {
    headers.push(config.headers.Authorization as string | undefined);
    const status = queue.shift() ?? 200;
    if (status >= 400) return Promise.reject({ response: { status } });
    const response: AxiosResponse = {
      data: { response: { ok: true } },
      status,
      statusText: "OK",
      headers: {},
      config,
    };
    return Promise.resolve(response);
  };

  return { client, headers };
};

describe("AxiosClient in an OAuth frame", () => {
  beforeEach(() => {
    requestAuthTokenMock.mockReset();
    frameCallEventMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("refreshes the token and retries a 401 even when the request skips unauthorized handling", async () => {
    requestAuthTokenMock
      .mockResolvedValueOnce("stale-token")
      .mockResolvedValueOnce("fresh-token");
    const { client, headers } = createClient([401, 200]);

    const result = await client.request({
      method: "get",
      url: "/people/@self",
      skipUnauthorized: true,
    });

    expect(result).toEqual({ ok: true });
    expect(headers).toEqual(["Bearer stale-token", "Bearer fresh-token"]);
    expect(requestAuthTokenMock).toHaveBeenCalledTimes(2);
    expect(frameCallEventMock).not.toHaveBeenCalled();
  });

  it("reports UNAUTHORIZED once when the fresh token is rejected too, then honors skipUnauthorized", async () => {
    requestAuthTokenMock
      .mockResolvedValueOnce("stale-token")
      .mockResolvedValueOnce("fresh-token");
    const { client, headers } = createClient([401, 401]);

    const result = await client.request({
      method: "get",
      url: "/people/@self",
      skipUnauthorized: true,
    });

    expect(result).toBeUndefined();
    expect(headers).toHaveLength(2);
    expect(frameCallEventMock).toHaveBeenCalledTimes(1);
    expect(frameCallEventMock).toHaveBeenCalledWith({
      event: "onAuthError",
      data: { code: "UNAUTHORIZED", message: "unauthorized" },
    });
  });

  it("rejects a request without skipUnauthorized when the fresh token is rejected", async () => {
    requestAuthTokenMock
      .mockResolvedValueOnce("stale-token")
      .mockResolvedValueOnce("fresh-token");
    const { client } = createClient([401, 401]);

    await expect(
      client.request({ method: "get", url: "/files/@my" }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(frameCallEventMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry when no fresh token arrives", async () => {
    requestAuthTokenMock
      .mockResolvedValueOnce("stale-token")
      .mockResolvedValueOnce(null);
    const { client, headers } = createClient([401, 200]);

    const result = await client.request({
      method: "get",
      url: "/people/@self",
      skipUnauthorized: true,
    });

    expect(result).toBeUndefined();
    expect(headers).toHaveLength(1);
  });
  it("stops requesting tokens after the OAuth sign-out", async () => {
    requestAuthTokenMock.mockResolvedValue("token");
    const { client, headers } = createClient([200, 401]);

    client.signOutOAuth();
    client.setAuthToken("pushed-token");

    await client.request({ method: "get", url: "/settings" });
    await client.request({
      method: "get",
      url: "/people/@self",
      skipUnauthorized: true,
    });

    expect(headers).toEqual([undefined, undefined]);
    expect(requestAuthTokenMock).not.toHaveBeenCalled();
  });
});
