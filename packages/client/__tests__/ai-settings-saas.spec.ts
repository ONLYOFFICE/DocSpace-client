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

import { http } from "msw";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import {
  PAID_NOW,
  apiUrl,
  jsonResponse,
  serviceFeeHandler,
  serviceStateHandler,
  trackServiceStateChanges,
  useSaasBilling,
  walletServicesHandler,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const AI_MODELS_ROUTE = "/portal-settings/ai-settings/ai-models";
const WEB_SEARCH_ROUTE = "/portal-settings/ai-settings/web-search";
const KNOWLEDGE_ROUTE = "/portal-settings/ai-settings/knowledge";
const AI_PRICES_PATH = "portal/payment/ai-prices";
const RESTRICTIONS_PATH = "portal/payment/ai-model/restrictions";
const FIRST_RENDER = { timeout: 15000 };

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>';

const CHAT_MODEL_A = "provider-a/chat-model-a";
const CHAT_MODEL_B = "provider-b/chat-model-b";
const IMAGE_MODEL = "provider-a/image-model";

const chatModel = (
  id: string,
  alias: string,
  provider: string,
  prompt: number,
  completion: number,
) => ({
  id,
  alias,
  provider,
  image: ICON,
  link: `https://example.com/models/${id}`,
  price: { prompt, completion },
});

const AI_PRICES = {
  currency: { code: "USD", symbol: "$" },
  chat: [
    chatModel(CHAT_MODEL_A, "Chat Model A", "Provider A", 2.5, 10),
    chatModel(CHAT_MODEL_B, "Chat Model B", "Provider B", 3, 15),
  ],
  image: [chatModel(IMAGE_MODEL, "Image Model", "Provider A", 5, 40)],
  embedding: [
    {
      id: "provider-a/embedding-model",
      alias: "Embedding Model",
      provider: "Provider A",
      image: ICON,
      link: "https://example.com/models/provider-a/embedding-model",
      price: { prompt: 0.02 },
    },
  ],
  webSearch: [
    {
      id: "search/web-search",
      alias: "Search engine",
      provider: "Search provider",
      image: ICON,
      link: "https://example.com/pricing/web-search",
      price: 0.005,
    },
  ],
};

const aiPricesHandler = () =>
  http.get(apiUrl(AI_PRICES_PATH), () => jsonResponse(AI_PRICES));

const aiPricesFailingHandler = () =>
  http.get(apiUrl(AI_PRICES_PATH), () => new Response(null, { status: 500 }));

// models: ids switched off for the workspace.
const restrictionsHandler = (models: string[] = []) => [
  http.get(apiUrl(RESTRICTIONS_PATH), () => jsonResponse({ models })),
  http.put(apiUrl(RESTRICTIONS_PATH), () => jsonResponse(true)),
];

// The activate flow lands on the AI service page, which loads these on mount.
const servicePageHandlers = () => [
  http.get(apiUrl("portal/payment/customer/operations"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/customer/usage"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/topupsettings"), () =>
    jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
  ),
];

const trackRestrictionUpdates = (page: Page) => {
  const bodies: string[] = [];

  page.on("request", (request) => {
    if (
      request.method() === "PUT" &&
      new URL(request.url()).pathname.endsWith(`/${RESTRICTIONS_PATH}`)
    )
      bodies.push(request.postData() ?? "");
  });

  return bodies;
};

const ACTIVATE_TITLE = "Activate AI features to get started";
const AI_ENABLED_TITLE = "AI features enabled";
const SEARCH_ENABLED_TITLE = "AI Search enabled";

const activateButton = (page: Page) =>
  page.getByRole("button", { name: "Activate", exact: true });
const detailsButton = (page: Page) =>
  page.getByRole("button", { name: "Details", exact: true });
const modelToggle = (page: Page, id: string) =>
  page.getByTestId(`ai_model_toggle_${id}`);
const tab = (page: Page, id: string) =>
  page.getByTestId(`${id}_tab`).or(page.getByTestId(`${id}_subtab`));
const turnOffButton = (page: Page) =>
  page.getByTestId("turn-off-ai-model-button");

// Under 600px the section switches to the phone layout: rows instead of the table.
const MOBILE = { width: 390, height: 844 };

test.describe("AI settings on SaaS", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...walletServicesHandler(),
      serviceFeeHandler(),
      serviceStateHandler(),
      aiPricesHandler(),
      ...restrictionsHandler(),
      ...servicePageHandlers(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the AI models tab lists the models and asks to activate AI", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("Get access to a wide range of AI models"),
    ).toBeVisible();
    await expect(page.getByText("Models, Web search, Knowledge base")).toBeVisible();
    await expect(
      page.getByText("OpenRouter pricing, plus a 20% service fee"),
    ).toBeVisible();
    await expect(
      page.getByText("Pay-as-you-go, billed from your Wallet"),
    ).toBeVisible();
    await expect(activateButton(page)).toBeEnabled();

    await expect(
      page.getByText("Access a wide range of AI models through OpenRouter"),
    ).toBeVisible();
    for (const alias of ["Chat Model A", "Chat Model B", "Image Model"])
      await expect(page.getByText(alias, { exact: true })).toBeVisible();
    for (const id of [CHAT_MODEL_A, CHAT_MODEL_B, IMAGE_MODEL])
      await expect(modelToggle(page, id)).toHaveAttribute("aria-checked", "true");
    // Models are only switchable once the AI service itself is on.
    await expect(modelToggle(page, CHAT_MODEL_A).locator("input")).toBeDisabled();

    await expectScreenshot(page, ["desktop", "ai-settings", "ai-models.png"]);
  });

  test("a restricted model shows as switched off", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...restrictionsHandler([CHAT_MODEL_B]));

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(modelToggle(page, CHAT_MODEL_B)).toHaveAttribute(
      "aria-checked",
      "false",
      FIRST_RENDER,
    );
    await expect(modelToggle(page, CHAT_MODEL_A)).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("switching a model off asks for confirmation and saves the restriction", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));
    const updates = trackRestrictionUpdates(page);

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    const toggle = modelToggle(page, CHAT_MODEL_A);
    await expect(toggle).toHaveAttribute("aria-checked", "true", FIRST_RENDER);
    await toggle.locator("label").click();

    await expect(page.getByText("Turn off Chat Model A?")).toBeVisible();
    await expect(
      page.getByText("This model will become unavailable to users in the workspace."),
    ).toBeVisible();
    expect(updates).toHaveLength(0);

    await expectScreenshot(page, ["desktop", "ai-settings", "turn-off-model.png"]);

    await turnOffButton(page).click();

    await expect.poll(() => updates.length).toBe(1);
    expect(updates[0]).toContain(CHAT_MODEL_A);
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(turnOffButton(page)).toHaveCount(0);
  });

  test("switching a model back on needs no confirmation", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...walletServicesHandler(["aitools"]),
      ...restrictionsHandler([CHAT_MODEL_A]),
    );
    const updates = trackRestrictionUpdates(page);

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    const toggle = modelToggle(page, CHAT_MODEL_A);
    await expect(toggle).toHaveAttribute("aria-checked", "false", FIRST_RENDER);
    await toggle.locator("label").click();

    await expect.poll(() => updates.length).toBe(1);
    expect(updates[0]).not.toContain(CHAT_MODEL_A);
    await expect(turnOffButton(page)).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  test("with AI on, the banner reports the service and leads to it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText(AI_ENABLED_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("service management are available in Billing > Services > AI features."),
    ).toBeVisible();
    await expect(
      page.getByText("OpenRouter pricing, plus a 20% service fee"),
    ).toBeVisible();
    await expect(activateButton(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "ai-settings",
      "ai-models-enabled.png",
    ]);

    await detailsButton(page).click();

    await page.waitForURL("**/billing/addons/ai-services");
  });

  test("Activate leads to the AI service page and switches it on", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(activateButton(page)).toBeVisible(FIRST_RENDER);
    await activateButton(page).click();

    await page.waitForURL("**/billing/addons/ai-services?activate=ai-tools");
    await expect(
      page.getByText("AI tools service successfully enabled."),
    ).toBeVisible(FIRST_RENDER);
    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[0]).toContain('"enabled":true');
  });

  test("without a card Activate leads to the add-ons list", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { payer: "none", plan: "startup" });

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(activateButton(page)).toBeVisible(FIRST_RENDER);
    await activateButton(page).click();

    await page.waitForURL(/\/billing\/addons$/);
  });

  test("the web search tab explains Exa and its price", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${WEB_SEARCH_ROUTE}`);

    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("Enable web search to bring real-time information from the internet into AI chats."),
    ).toBeVisible();
    await expect(
      page.getByText("Web search and crawling are powered by Exa"),
    ).toBeVisible();
    await expect(page.getByText("Exa pricing, plus a 20% service fee")).toBeVisible();

    await expect(
      page.getByText("Use a Web search engine to enhance AI chats with real-time information from the internet"),
    ).toBeVisible();
    await expect(
      page.getByText("Web search and web crawling are powered by Exa."),
    ).toBeVisible();
    await expect(page.getByText("Search engine", { exact: true })).toBeVisible();
    await expect(page.getByText("/ request, Search provider")).toBeVisible();

    await expectScreenshot(page, ["desktop", "ai-settings", "web-search.png"]);
  });

  test("with AI search on, the web search banner reports it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools", "aisearch"]));

    await page.goto(`${baseUrl}${WEB_SEARCH_ROUTE}`);

    await expect(page.getByText(SEARCH_ENABLED_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("service management are available in Billing > Services > AI Search."),
    ).toBeVisible();
    await expect(page.getByText("Exa pricing, plus a 20% service fee")).toBeVisible();
    await expect(activateButton(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "ai-settings",
      "web-search-enabled.png",
    ]);

    await detailsButton(page).click();

    await page.waitForURL("**/billing/addons/ai-search");
  });

  test("switching tabs swaps the banner between the two services", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText(AI_ENABLED_TITLE)).toBeVisible(FIRST_RENDER);

    await tab(page, "web-search").click();

    await page.waitForURL("**/ai-settings/web-search");
    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible();
    await expect(
      page.getByText("Enable web search to bring real-time information from the internet into AI chats."),
    ).toBeVisible();
    await expect(page.getByText(AI_ENABLED_TITLE)).toHaveCount(0);

    await tab(page, "ai-models").click();

    await page.waitForURL("**/ai-settings/ai-models");
    await expect(page.getByText(AI_ENABLED_TITLE)).toBeVisible();
    await expect(page.getByText(ACTIVATE_TITLE)).toHaveCount(0);

    await tab(page, "web-search").click();
    await activateButton(page).click();

    await page.waitForURL("**/billing/addons/ai-search?activate=ai-search");
  });

  test("the knowledge base tab prices the vectorization", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${KNOWLEDGE_ROUTE}`);

    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("Get access to a wide range of AI models"),
    ).toBeVisible();
    await expect(
      page.getByText("Give AI agents access to a knowledge base."),
    ).toBeVisible();
    await expect(page.getByText("Vectorization", { exact: true })).toBeVisible();
    await expect(page.getByText("/ 1M, Provider A")).toBeVisible();

    await expectScreenshot(page, ["desktop", "ai-settings", "knowledge-base.png"]);
  });

  test("a failed price request shows the reload screen", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiPricesFailingHandler());

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText("Something went wrong.")).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Reload page", { exact: true })).toBeVisible();
    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "ai-settings",
      "ai-models-error.png",
    ]);
  });
});

test.describe("AI settings on a phone", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...walletServicesHandler(),
      serviceFeeHandler(),
      aiPricesHandler(),
      ...restrictionsHandler(),
    );
    await page.setViewportSize(MOBILE);
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the models are listed as rows and the banner folds its details", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(activateButton(page)).toBeEnabled();
    await expect(page.getByText("Models, Web search, Knowledge base")).toBeHidden();
    for (const alias of ["Chat Model A", "Chat Model B", "Image Model"])
      await expect(page.getByText(alias, { exact: true })).toBeVisible();
    await expect(modelToggle(page, CHAT_MODEL_A)).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await expectScreenshot(page, ["mobile", "ai-settings", "ai-models.png"]);

    await page.locator("svg[data-tooltip-id]").first().click();

    await expect(page.getByText("Models, Web search, Knowledge base")).toBeVisible();
    await expect(
      page.getByText("OpenRouter pricing, plus a 20% service fee"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "mobile",
      "ai-settings",
      "ai-models-banner-details.png",
    ]);
  });

  test("with AI on, the banner reports the service", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));

    await page.goto(`${baseUrl}${AI_MODELS_ROUTE}`);

    await expect(page.getByText(AI_ENABLED_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(detailsButton(page)).toBeEnabled();
    await expect(modelToggle(page, CHAT_MODEL_A).locator("input")).toBeEnabled();

    await expectScreenshot(page, [
      "mobile",
      "ai-settings",
      "ai-models-enabled.png",
    ]);
  });

  test("the web search tab folds the banner the same way", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${WEB_SEARCH_ROUTE}`);

    await expect(page.getByText(ACTIVATE_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("Enable web search to bring real-time information from the internet into AI chats."),
    ).toBeVisible();
    await expect(activateButton(page)).toBeEnabled();
    await expect(
      page.getByText("Web search and crawling are powered by Exa"),
    ).toBeHidden();
    await expect(page.getByText("Search engine", { exact: true })).toBeVisible();
    await expect(page.getByText("/ request, Search provider")).toBeVisible();

    await expectScreenshot(page, ["mobile", "ai-settings", "web-search.png"]);

    await page.locator("svg[data-tooltip-id]").first().click();

    await expect(
      page.getByText("Web search and crawling are powered by Exa"),
    ).toBeVisible();
    await expect(page.getByText("Exa pricing, plus a 20% service fee")).toBeVisible();

    await expectScreenshot(page, [
      "mobile",
      "ai-settings",
      "web-search-banner-details.png",
    ]);
  });

  test("with AI search on, the web search banner reports it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools", "aisearch"]));

    await page.goto(`${baseUrl}${WEB_SEARCH_ROUTE}`);

    await expect(page.getByText(SEARCH_ENABLED_TITLE)).toBeVisible(FIRST_RENDER);
    await expect(detailsButton(page)).toBeEnabled();
    await expect(activateButton(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "mobile",
      "ai-settings",
      "web-search-enabled.png",
    ]);
  });
});
