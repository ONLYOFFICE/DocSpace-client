import { afterEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

import { ValidationStatus } from "@docspace/shared/enums";

import {
  AGENT_ID_HEADER,
  FILTER_HEADER,
  MEDIA_VIEWER_LINK_ERROR_HEADER,
  OAUTH_FRAME_HEADER,
} from "@/utils/constants";
import { handlePublicRoomValidation } from "@/utils/middleware/handlePublicRoomValidation";

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

describe("proxy — matcher coverage", () => {
  test("covers the uploader route so the OAuth frame header reaches the layout", () => {
    expect(config.matcher).toContain("/uploader");
  });

  test("covers the rooms sub-sections that are loaded as documents", () => {
    expect(config.matcher).toContain("/archive");
    expect(config.matcher).toContain("/archive/:path*");
    expect(config.matcher).toContain("/settings");
  });

  test("forwards the OAuth frame header for the uploader route", async () => {
    const response = await proxy(makeRequest("/uploader?id=4&auth=oauth"));

    expect(response).toBeDefined();
    expect(requestHeader(response!, OAUTH_FRAME_HEADER)).toBe("1");
  });
});

describe("proxy — /media-viewer", () => {
  test.each([
    [ValidationStatus.Invalid, "/sdk/public-room/error/invalid-link", "onNotFound"],
    [ValidationStatus.Expired, "/sdk/public-room/error/expired-link", "onNoAccess"],
  ])(
    "keeps the viewer page and names the event for a refused link (%s)",
    async (status, redirect, event) => {
      vi.mocked(handlePublicRoomValidation).mockResolvedValueOnce({
        redirect,
        status,
      });

      const response = await proxy(makeRequest("/media-viewer?folder=12&key=bad"));

      expect(response!.headers.get("x-middleware-rewrite")).toBeNull();
      expect(requestHeader(response!, MEDIA_VIEWER_LINK_ERROR_HEADER)).toBe(event);
    },
  );

  test("Link of a private item: the frame is redirected to the portal's own page", async () => {
    vi.mocked(handlePublicRoomValidation).mockResolvedValueOnce({
      portalRedirect: "/share/private?key=k",
      status: ValidationStatus.Password,
    });

    const response = await proxy(makeRequest("/public-room?key=k"));

    expect(response!.status).toBe(307);
    expect(new URL(response!.headers.get("location")!).pathname).toBe(
      "/share/private",
    );
    expect(response!.headers.get("x-middleware-rewrite")).toBeNull();
  });

  test("still sends a link with a password to the password page", async () => {
    vi.mocked(handlePublicRoomValidation).mockResolvedValueOnce({
      redirect: "/sdk/public-room/password",
      status: ValidationStatus.Password,
    });

    const response = await proxy(makeRequest("/media-viewer?folder=12&key=locked"));

    expect(response!.headers.get("x-middleware-rewrite")).toContain(
      "/sdk/public-room/password",
    );
  });

  test("drops a link error header sent by the client", async () => {
    vi.mocked(handlePublicRoomValidation).mockResolvedValueOnce(null);

    const request = new NextRequest(
      new URL("/media-viewer?folder=12", "http://portal.example.com"),
      { headers: { [MEDIA_VIEWER_LINK_ERROR_HEADER]: "onNotFound" } },
    );

    const response = await proxy(request);

    expect(requestHeader(response!, MEDIA_VIEWER_LINK_ERROR_HEADER)).toBeNull();
  });

  test("leaves the public room error pages to the public room", async () => {
    vi.mocked(handlePublicRoomValidation).mockResolvedValueOnce({
      redirect: "/sdk/public-room/error/invalid-link",
      status: ValidationStatus.Invalid,
    });

    const response = await proxy(makeRequest("/public-room?key=bad"));

    expect(response!.headers.get("x-middleware-rewrite")).toContain(
      "/sdk/public-room/error/invalid-link",
    );
  });
});

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

describe("proxy — /ai-arbiter", () => {
  test("matcher includes the arbiter route", () => {
    expect(config.matcher).toContain("/ai-arbiter");
  });

  test("forwards the query as filter and the shared theme/locale headers", async () => {
    const response = await proxy(
      makeRequest("/ai-arbiter?theme=dark&locale=fr&showMenu=false"),
    );

    expect(requestHeader(response!, "x-sdk-config-theme")).toBe("Dark");
    expect(requestHeader(response!, "x-sdk-config-locale")).toBe("fr");

    const filter = new URLSearchParams(
      requestHeader(response!, FILTER_HEADER) ?? "",
    );
    expect(filter.get("showMenu")).toBe("false");
    expect(requestHeader(response!, AGENT_ID_HEADER)).toBeNull();
  });
});

describe("proxy — /ai-agents", () => {
  test("matcher includes the agents routes", () => {
    expect(config.matcher).toContain("/ai-agents");
    expect(config.matcher).toContain("/ai-agents/:path*");
  });

  test("forwards the agent room id from the path and the query as filter", async () => {
    const response = await proxy(makeRequest("/ai-agents/42?tab=knowledge"));

    expect(requestHeader(response!, AGENT_ID_HEADER)).toBe("42");

    const filter = new URLSearchParams(
      requestHeader(response!, FILTER_HEADER) ?? "",
    );
    expect(filter.get("tab")).toBe("knowledge");
  });

  test.each(["/ai-agents", "/ai-agents/recent", "/ai-agents/settings/servers"])(
    "sets an empty agent id header on the section route %s",
    async (path) => {
      const response = await proxy(makeRequest(path));

      expect(requestHeader(response!, AGENT_ID_HEADER)).toBe("");
      expect(requestHeader(response!, FILTER_HEADER)).toBe("");
    },
  );

  test("ignores an agentId query param — the path is the source of truth", async () => {
    const response = await proxy(makeRequest("/ai-agents?agentId=42"));

    expect(requestHeader(response!, AGENT_ID_HEADER)).toBe("");
  });

  test("does not set the agent id header on the rooms route", async () => {
    const response = await proxy(makeRequest("/rooms/42"));

    expect(requestHeader(response!, AGENT_ID_HEADER)).toBeNull();
    expect(requestHeader(response!, FILTER_HEADER)).toBe("");
  });

  test("keeps the shared theme/locale headers on the agents route", async () => {
    const response = await proxy(
      makeRequest("/ai-agents/42?theme=dark&locale=fr"),
    );

    expect(requestHeader(response!, "x-sdk-config-theme")).toBe("Dark");
    expect(requestHeader(response!, "x-sdk-config-locale")).toBe("fr");
  });
});

// Spec: private-rooms/sdk-surface, "SDK private pages are framed only by the portal's own origin"
describe("proxy — private routes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const privateHeaders = async (path: string, env: string) => {
    vi.stubEnv("NODE_ENV", env);
    const response = await proxy(makeRequest(path));
    return response!.headers;
  };

  const directives = (headers: Headers) =>
    (headers.get("Content-Security-Policy") ?? "").split("; ");

  test.each(["/private", "/private/123", "/private/archive"])(
    "Private page served: %s carries the private-surface policy",
    async (path) => {
      const headers = await privateHeaders(path, "production");

      expect(directives(headers)).toEqual(
        expect.arrayContaining([
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
          "frame-ancestors 'self'",
          "object-src 'none'",
        ]),
      );
      expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    },
  );

  test("Connections in production", async () => {
    const headers = await privateHeaders("/private", "production");
    const csp = headers.get("Content-Security-Policy") ?? "";

    expect(directives(headers)).toContain("connect-src 'self' https:");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });

  test("Connections in development", async () => {
    const headers = await privateHeaders("/private", "development");

    expect(directives(headers)).toEqual(
      expect.arrayContaining([
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
        "connect-src 'self' ws: wss: http: https:",
      ]),
    );
    expect(headers.get("Strict-Transport-Security")).toBeNull();
  });

  test.each(["production", "development"])(
    "Private page framed by the portal (%s)",
    async (env) => {
      const headers = await privateHeaders("/private/123", env);

      expect(directives(headers)).toContain("frame-ancestors 'self'");
    },
  );

  test("Private page framed by another origin", async () => {
    const headers = await privateHeaders("/private/archive", "production");

    expect(
      directives(headers).filter((d) => d.startsWith("frame-ancestors")),
    ).toEqual(["frame-ancestors 'self'"]);
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
  });
});
