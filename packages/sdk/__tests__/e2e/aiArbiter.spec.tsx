import { describe } from "node:test";

import {
  aiArbiterPanelHandler,
  aiChatProfilesListHandler,
  aiChatStoreHandlers,
  selfHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test } from "./fixtures/base";

const path = "/sdk/ai-arbiter";

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

// The arbiter server layout reads `asc_auth_key` to tell a signed-in session
// from an anonymous embed (same pattern as chat.spec.tsx).
const seedAuthCookie = (
  page: import("@playwright/test").Page,
  baseUrl: string,
) =>
  page
    .context()
    .addCookies([{ name: "asc_auth_key", value: "e2e-test-token", url: baseUrl }]);

describe("SDK AI Arbiter mode", () => {
  test("renders a provisioned panel and emits the frame events", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(aiArbiterPanelHandler(port));
    clientRequestInterceptor.use(
      ...aiChatStoreHandlers(port),
      aiArbiterPanelHandler(port),
    );
    await seedAuthCookie(page, baseUrl);
    await page.addInitScript(collectFrameMessages);

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(page.getByText("AI Arbiter", { exact: true })).toBeVisible();
    await expect(page.getByText("Tax lawyer")).toBeVisible();
    await expect(page.getByText("Accountant")).toBeVisible();
    await expect(
      page.getByText("Enter a question above and click Run."),
    ).toBeVisible();

    const run = page.getByRole("button", { name: "Run", exact: true });
    await expect(run).toBeDisabled();
    await page
      .getByPlaceholder("Ask a question... (Ctrl+Enter to run)")
      .fill("Is this deductible?");
    await expect(run).toBeEnabled();

    await expect
      .poll(() => readFrameMessages(page))
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining('"event":"onAppReady"'),
          expect.stringContaining('"commandName":"setIsLoaded"'),
        ]),
      );
  });

  test("opens the setup wizard when no panel is provisioned", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(
      aiChatProfilesListHandler(port, { profiles: [] }),
      ...aiChatStoreHandlers(port),
    );
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(page.getByText("Set up AI Arbiter")).toBeVisible();
    await expect(
      page.getByText("No AI provider is configured for this workspace."),
    ).toBeVisible();
  });

  test("tells an anonymous embed that the user is unknown", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(selfHandler(port, 404));
    clientRequestInterceptor.use(selfHandler(port, 404));

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(
      page.getByText("Unable to identify current user."),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
    );
  });
});
