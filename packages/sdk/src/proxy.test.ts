import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

import { AGENT_ID_HEADER, FILTER_HEADER } from "@/utils/constants";

import { proxy, config } from "./proxy";

vi.mock("@/utils/middleware/handlePublicRoomValidation", () => ({
  handlePublicRoomValidation: vi.fn(),
}));

vi.mock("@docspace/shared/utils/customStyles", () => ({
  sanitizeStylesUrl: (url: string) => url,
}));

const makeRequest = (url: string) =>
  new NextRequest(new URL(url, "http://portal.example.com"), {
    headers: {
      "x-forwarded-host": "portal.example.com",
      "x-forwarded-proto": "http",
    },
  });

const requestHeader = (response: Response, name: string) =>
  response.headers.get(`x-middleware-request-${name}`);

describe("proxy — /chat", () => {
  test("matcher includes the chat route", () => {
    expect(config.matcher).toContain("/chat");
  });

  test("forwards agentId and the full query as request headers", async () => {
    const response = await proxy(
      makeRequest("/chat?agentId=42&entityId=7&fileId=99&threadId=t-1"),
    );

    expect(response).toBeDefined();
    expect(requestHeader(response!, AGENT_ID_HEADER)).toBe("42");

    const filter = new URLSearchParams(
      requestHeader(response!, FILTER_HEADER) ?? "",
    );
    expect(filter.get("agentId")).toBe("42");
    expect(filter.get("entityId")).toBe("7");
    expect(filter.get("fileId")).toBe("99");
    expect(filter.get("threadId")).toBe("t-1");
  });

  test("sets an empty agentId header when the param is omitted", async () => {
    const response = await proxy(makeRequest("/chat"));

    expect(requestHeader(response!, AGENT_ID_HEADER)).toBe("");
  });

  test("does not set the agentId header for other routes", async () => {
    const response = await proxy(makeRequest("/personal-files?agentId=42"));

    expect(requestHeader(response!, AGENT_ID_HEADER)).toBeNull();
  });

  test("keeps the shared theme/locale headers on the chat route", async () => {
    const response = await proxy(makeRequest("/chat?theme=dark&locale=fr"));

    expect(requestHeader(response!, "x-sdk-config-theme")).toBe("Dark");
    expect(requestHeader(response!, "x-sdk-config-locale")).toBe("fr");
  });
});
