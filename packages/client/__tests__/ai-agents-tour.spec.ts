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

import type { Page } from "@playwright/test";

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiAgentsHandler,
  aiConfigHandler,
  roomMembersHandlers,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// packages/client/src/store/AiAgentsTourStore.ts
const TOUR_KEY = "ai_agents_tour_pending";
const AI_AGENTS_URL = "/ai-agents/filter";

// The single agent of the mock list (aiAgentsHandler, withListCreate) — the one
// the access step opens the info panel on.
const AGENT_ID = 251365;
// Admin user id from the settings/self mocks, used as that agent's owner.
const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

// The first stand-in agent (SRC_DIR/api/tourDemo, titles from
// public/locales/en/AiAgentsTour.json) — proof that the section the tour is
// walking through is the borrowed one, not the user's empty list.
const DEMO_AGENT_TITLE = "Support desk assistant";
// The empty screen's action list, which is what the closing step points into.
const EMPTY_SCREEN = '[data-testid="empty-view-body"]';

// Step titles, from public/locales/en/AiAgentsTour.json. Steps are addressed by
// title rather than by index: which ones survive depends on the audience and on
// what the portal has switched on, so an index would quietly point at a
// different step as those flags move.
const CREATE_STEP = "Give it a job";
const CREATE_FIRST_STEP = "Now build your own";
const SWITCH_ON_STEP = "Switch it on and see for real";
// The closing step of anyone with no button on the empty screen to be sent at —
// the stand-in is dropped the same way, but what is left under the spotlight is
// the bare screen rather than an action.
const EMPTY_LIST_STEP = "Your list is empty for now";

const agentOwnerMembers = () =>
  roomMembersHandlers(TEST_PORT, AGENT_ID, {
    initial: [{ id: ADMIN_ID, displayName: "Administrator", access: 0 }],
  });

/** Arms the tour and lands on the section that starts it by itself. */
const startTour = async (page: Page, baseUrl: string) => {
  // The first visit sets an origin so localStorage is reachable.
  await page.goto(`${baseUrl}${AI_AGENTS_URL}`);
  await armTour(page, TOUR_KEY);
  await page.goto(`${baseUrl}${AI_AGENTS_URL}`);

  await expect(tourTooltip(page)).toBeVisible();
};

/** Walks forward with the keyboard until the step titled `title` is up. */
const goToStep = async (page: Page, title: string, maxSteps = 10) => {
  const tooltip = tourTooltip(page);

  for (let i = 0; i < maxSteps; i += 1) {
    if (await tooltip.getByText(title, { exact: true }).isVisible()) return;
    await page.keyboard.press("ArrowRight");
    await expect(tooltip).toBeVisible();
  }

  throw new Error(`step "${title}" never came up`);
};

test.describe("AI Agents tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiAgentsHandler(TEST_PORT, { withListCreate: true }),
    );
  });

  test("admin (agent owner) sees the full walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "admin"),
      ...agentOwnerMembers(),
    );

    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);
    await armTour(page, TOUR_KEY);
    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);

    await walkTour(page, ["desktop", "ai-agents-tour", "admin"]);
  });

  test("user sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      // The list has to come back the way the server would answer it for
      // somebody who cannot manage agents, or the section puts up a "New agent"
      // button this walkthrough is specifically about not having.
      aiAgentsHandler(TEST_PORT, { withListCreate: true, canCreate: false }),
      ...agentOwnerMembers(),
    );

    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);
    await armTour(page, TOUR_KEY);
    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);

    await walkTour(page, ["desktop", "ai-agents-tour", "user"]);
  });

  test("guest sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // A guest only ever uses the agents they were let into — nothing that
    // creates one, and an info panel that lists who else uses it rather than
    // managing access. The list has to agree with that; see the user run above.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      aiAgentsHandler(TEST_PORT, { withListCreate: true, canCreate: false }),
      ...agentOwnerMembers(),
    );

    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);
    await armTour(page, TOUR_KEY);
    await page.goto(`${baseUrl}${AI_AGENTS_URL}`);

    await walkTour(page, ["desktop", "ai-agents-tour", "guest"]);
  });

  test("the list the user owns is left alone", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // A portal with agents of its own never sees one it does not have: the
    // stand-in list is only ever put up in place of an empty answer.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "admin"),
      ...agentOwnerMembers(),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toHaveCount(0);
  });
});

test.describe("AI Agents tour on an empty portal", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // No agents at all — the case the stand-in section exists for.
      aiAgentsHandler(TEST_PORT),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  test("admin walks a stood-in section instead of an empty one", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl);

    // Nothing about creating an agent, nothing about what a row does and
    // nothing about members would be reachable on the real (empty) page.
    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toBeVisible();

    await walkTour(page, ["desktop", "ai-agents-tour", "empty"]);
  });

  test("hands the section back before the closing step", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl);
    await goToStep(page, CREATE_FIRST_STEP);

    // The step drops the stand-in agents itself and points at the real button
    // on the empty screen the reload brings up, rather than letting the section
    // change behind the user's back once the tour is over.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toHaveCount(0);
  });

  test("user gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The regression this guards: the stand-in was once admins-only, which left
    // everybody else with the sidebar step and nothing else — nothing about
    // what an agent row does, and nothing about who else works with it.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      aiAgentsHandler(TEST_PORT, { canCreate: false }),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toBeVisible();

    await walkTour(page, ["desktop", "ai-agents-tour", "user-empty"]);
  });

  test("guest gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      aiAgentsHandler(TEST_PORT, { canCreate: false }),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toBeVisible();

    await walkTour(page, ["desktop", "ai-agents-tour", "guest-empty"]);
  });

  test("closes on the empty list rather than a create button they do not have", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      aiAgentsHandler(TEST_PORT, { canCreate: false }),
    );

    await startTour(page, baseUrl);
    await goToStep(page, EMPTY_LIST_STEP);

    // Handed back the same way an admin's is — the stand-in agents are gone and
    // the user is looking at their own empty portal — but the step names what
    // the empty list means instead of sending them at an action that is not
    // theirs, so "Now build your own" never comes up for them.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toHaveCount(0);
    await expect(
      tourTooltip(page).getByText(CREATE_FIRST_STEP, { exact: true }),
    ).toHaveCount(0);
  });
});

test.describe("AI Agents tour with AI switched off", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // Not switched on, so the section renders neither the creation banner nor
      // the filter bar — and without a stand-in the tour would be two steps.
      aiConfigHandler(TEST_PORT, true),
      aiAgentsHandler(TEST_PORT),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  test("still shows what the section is for", async ({ page, baseUrl }) => {
    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toBeVisible();
    // The banner is behind `aiReady`, so this step existing at all is the proof
    // that the stand-in reaches the AI config and not only the list.
    await goToStep(page, CREATE_STEP);
  });

  test("closes on switching AI on rather than on creating an agent", async ({
    page,
    baseUrl,
  }) => {
    await startTour(page, baseUrl);
    await goToStep(page, SWITCH_ON_STEP);

    // Everything the tour claimed is gone by now — the agents, and the AI
    // config that made them possible — so what is left under the spotlight is
    // the portal's own activation button.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText(DEMO_AGENT_TITLE),
    ).toHaveCount(0);
    await expect(
      tourTooltip(page).getByText(CREATE_FIRST_STEP, { exact: true }),
    ).toHaveCount(0);
  });
});
