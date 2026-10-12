import { describe } from "node:test";

import {
  aiChatReadMessagesHandler,
  aiChatStoreHandlers,
  aiChatThreadGetByIdHandler,
  selfHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test } from "./fixtures/base";

const path = "/sdk/chat";

type FrameMessagesWindow = Window & { __frameMessages?: string[] };

const collectFrameMessages = `
  window.__frameMessages = [];
  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") window.__frameMessages.push(e.data);
  });
`;

const readFrameMessages = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => (window as FrameMessagesWindow).__frameMessages ?? [],
  );

// The chat server components read `asc_auth_key` to tell a signed-in session
// from an anonymous embed (same pattern as private/fixtures.ts).
const seedAuthCookie = (
  page: import("@playwright/test").Page,
  baseUrl: string,
) =>
  page
    .context()
    .addCookies([{ name: "asc_auth_key", value: "e2e-test-token", url: baseUrl }]);

describe("SDK chat mode", () => {
  test("renders the user-bound chat and emits the frame events", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...aiChatStoreHandlers(port));
    await seedAuthCookie(page, baseUrl);
    await page.addInitScript(collectFrameMessages);

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(page.locator("#chat-toolbar")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Chat history" }),
    ).toBeVisible();

    await expect
      .poll(() => readFrameMessages(page))
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining('"event":"onAppReady"'),
          expect.stringContaining('"commandName":"setIsLoaded"'),
        ]),
      );
  });

  test("renders the agent-bound chat", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...aiChatStoreHandlers(port));
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}?theme=Base&agentId=42`);

    await expect(page.locator("#chat-toolbar")).toBeVisible();
    await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
  });

  test("resumes an existing thread from the threadId param", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(
      ...aiChatStoreHandlers(port),
      aiChatThreadGetByIdHandler(port, { threadId: "t-1", title: "Resumed" }),
      aiChatReadMessagesHandler(port),
    );
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}?theme=Base&threadId=t-1`);

    await expect(page.getByRole("button", { name: "New chat" })).toBeEnabled();
  });

  test("falls back to a fresh chat when the thread is not found", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(
      ...aiChatStoreHandlers(port),
      aiChatThreadGetByIdHandler(port, null),
    );
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}?theme=Base&threadId=missing`);

    await expect(page.locator("#chat-toolbar")).toBeVisible();
    await expect(page.getByRole("button", { name: "New chat" })).toBeDisabled();
  });

  test("shows the no-access screen for an anonymous embed", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(selfHandler(port, 404));
    clientRequestInterceptor.use(selfHandler(port, 404));

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(page.locator("#chat-toolbar")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
    );
  });
});
