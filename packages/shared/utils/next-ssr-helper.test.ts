import { beforeEach, describe, expect, test, vi } from "vitest";

const headersMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
  cookies: () => cookiesMock(),
}));

import {
  createRequest,
  REQUEST_TOKEN_HEADER,
  SDK_SHARE_KEY_HEADER,
} from "./next-ssr-helper";

type TCookie = { name: string; value: string };

const setup = (incoming: Record<string, string>, cookieList: TCookie[] = []) => {
  headersMock.mockResolvedValue(
    new Headers({
      "x-forwarded-host": "portal.test",
      "x-forwarded-proto": "https",
      ...incoming,
    }),
  );
  cookiesMock.mockResolvedValue({
    get: (name: string) => cookieList.find((c) => c.name === name),
    getAll: () => cookieList,
  });
};

describe("createRequest share key forwarding", () => {
  beforeEach(() => {
    delete process.env.API_HOST;
  });

  test("uses the header name the SDK proxy sets", () => {
    expect(SDK_SHARE_KEY_HEADER).toBe("x-sdk-config-share-key");
  });

  test("sends the share key as Request-Token when the SDK proxy forwarded one", async () => {
    setup({ [SDK_SHARE_KEY_HEADER]: "share-key" });

    const [req] = await createRequest(["/files/settings"], [["", ""]], "GET");

    expect(req.url).toBe("https://portal.test/api/2.0/files/settings");
    expect(req.headers.get(REQUEST_TOKEN_HEADER)).toBe("share-key");
  });

  test("keeps an explicit Request-Token over the forwarded share key", async () => {
    setup({ [SDK_SHARE_KEY_HEADER]: "share-key" });

    const [req] = await createRequest(
      ["/files/1"],
      [[REQUEST_TOKEN_HEADER, "explicit-key"]],
      "GET",
    );

    expect(req.headers.get(REQUEST_TOKEN_HEADER)).toBe("explicit-key");
  });

  test("does not send Request-Token when the forwarded share key is empty", async () => {
    setup({ [SDK_SHARE_KEY_HEADER]: "" });

    const [req] = await createRequest(["/files/settings"], [["", ""]], "GET");

    expect(req.headers.get(REQUEST_TOKEN_HEADER)).toBeNull();
  });

  test("authenticates with the session cookie when there is no share key", async () => {
    setup({}, [{ name: "asc_auth_key", value: "auth-token" }]);

    const [req] = await createRequest(["/files/settings"], [["", ""]], "GET");

    expect(req.headers.get("Authorization")).toBe("auth-token");
    expect(req.headers.get(REQUEST_TOKEN_HEADER)).toBeNull();
  });
});
