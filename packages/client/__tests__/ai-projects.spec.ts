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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiSectionsHandlers,
  aiHubRoomsHandler,
  aiAgentDeleteHandler,
  aiAgentLeaveHandler,
  aiAgentSkillsRefusedHandler,
  aiAgentPinHandlers,
  aiHubRootProjectRooms,
  aiProjectMock,
  AiProjectMockAccess,
  AI_HUB_ROOMS,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  AI_PROJECT_WITHOUT_SOURCES,
  rootHandler,
  filesSettingsHandler,
  roomMembersHandlers,
  roomTagsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The AI Chat section, drawn by Home with the Rooms machinery on the
 * `/ai-rooms/*` paths: its Agents list, with the Skill sets and Knowledge
 * bases behind their own sidebar entries; each list creates what it holds
 * (the agent form on Agents, the entry's room type locked in the room
 * dialog on the others). An agent is a card with its sources, opens on its
 * chat with no sources column beside it, and has an Info panel of its own
 * (Details and Context, then Content on its page and Members for those who
 * manage it) and an actions menu that leaves or deletes it from its page.
 *
 * The lists are Files tables; the agent views open the first stock agent,
 * which links two skill sets and a knowledge base, and the last, which
 * links none.
 */

const AI_ROOMS_URL = "/ai-rooms/filter";

/** The Agents list narrowed to the agents' room type, as its sidebar entry opens it. */
const AGENTS_URL = "/ai-rooms/filter?type=12&searchArea=AiHub";

const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const emptyView = (page: Page) =>
  page.getByTestId("empty-view").filter({ visible: true });

const table = (page: Page) => page.getByTestId("table-body");

const sidebar = (page: Page) => page.locator("#article-container");

/** The entry of an agent listed under Agents in the sidebar. */
const sidebarAgent = (page: Page, id: number) =>
  sidebar(page).locator(`[data-item-id="ai-nested-project-${id}"]`);

const rowOf = (page: Page, title: string) =>
  table(page).locator("[data-testid^=table-row-]").filter({ hasText: title });

/** A card of the tile view: FilesTileContainer numbers them `tile_<index>`. */
const tileOf = (page: Page, title: string) =>
  page.locator("[data-testid^=tile_]").filter({ hasText: title });

/** The tabs of the Info panel, in the order they are drawn. */
const infoPanelTabs = (page: Page) =>
  page
    .locator('[data-testid^="info_"][data-testid$="_tab"]')
    .evaluateAll((tabs) =>
      tabs
        .filter((tab) => (tab as HTMLElement).offsetParent !== null)
        .map((tab) => tab.getAttribute("data-testid")),
    );

/** Opens the Info panel with the header toggle, unless a tab of it already shows. */
const openInfoPanel = async (page: Page) => {
  const toggle = page.locator("#info-panel-toggle--open");
  const details = page.getByTestId("info_details_tab");
  // The toggle comes with the header, after the page's first reads.
  await expect(toggle.or(details).first()).toBeVisible();
  if (await toggle.isVisible()) await toggle.click();
  await expect(details).toBeVisible();
};

/** Selects a row of the list through its menu, as a card's "Select" does. */
const selectRow = async (page: Page, title: string) => {
  await rowOf(page, title).getByTestId("context-menu-button").first().click();
  await page.locator("#option_select").click();
};

/** The ids of the actions menu's items, in their order. */
const menuItems = (page: Page) =>
  page
    .locator('[id^="option_"]')
    .evaluateAll((items) =>
      items
        .filter((item) => (item as HTMLElement).offsetParent !== null)
        .map((item) => item.id),
    );

const openPageMenu = async (page: Page) => {
  await page.locator("#header_optional-button").click();
  await expect(page.locator("#option_room-info")).toBeVisible();
};

/** A fresh copy of the stock agents: the create, leave and delete handlers change their list. */
const stockProjects = () => [...AI_PROJECTS];

/** The ids the self handler gives each user type. */
const ROOM_ADMIN_ID = "roomadmin-user-id";

/** An agent the caller manages (Agent manager). */
const MANAGED_AGENT = aiProjectMock({
  id: 777310,
  title: "Legal Reviewer",
  color: "8570FF",
  access: AiProjectMockAccess.ProjectManager,
  instructionsRooms: AI_PROJECT_WITH_SOURCES.aiProject.instructionsRooms,
  knowledgeRooms: AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms,
});

/** An agent shared with the caller as a Member: one skill set and two knowledge bases. */
const MEMBER_AGENT = aiProjectMock({
  id: 777311,
  title: "Data Analyst",
  color: "5CC5D4",
  access: AiProjectMockAccess.Member,
  instructionsRooms: AI_PROJECT_WITH_SOURCES.aiProject.instructionsRooms.slice(0, 1),
  knowledgeRooms: [
    ...AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms,
    {
      ...AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms[0],
      id: 779002,
      title: "HR policies",
    },
  ],
});

/** An agent of the portal the caller is not a member of. */
const OUTSIDE_AGENT = aiProjectMock({
  id: 777312,
  title: "Finance Desk",
  color: "FF6680",
  access: AiProjectMockAccess.None,
});

const [SKILL_SET] = MEMBER_AGENT.aiProject.instructionsRooms;

test.describe("AI Chat section", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
    );
    // The Agents list opens as tiles until another view is picked there,
    // and keeps the pick apart from the rest of Files. The cases below read
    // it as the table a user switched to; "agent cards" goes back to tiles.
    await page.addInitScript(() =>
      window.localStorage.setItem("viewAs_aiAgents", "table"),
    );
  });

  test.describe("the Agents list", () => {
    // Spec: ai-agents-list, "Agents list"
    test("lists the agents, with the skill sets and knowledge bases behind their own sidebar entries", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);

      // The list holds the agents; the skill sets and knowledge bases sit
      // behind the section's own entries.
      await expect(table(page)).toBeVisible();
      for (const agent of AI_PROJECTS) {
        await expect(table(page)).toContainText(agent.title);
      }
      for (const room of AI_HUB_ROOMS) {
        await expect(table(page)).not.toContainText(room.title);
      }

      // One AI section in the sidebar, AI Chat, with Agents, Skill sets and
      // Knowledge bases; no "AI rooms" or "AI projects" of their own.
      await expect(sidebar(page)).toContainText("AI Chat");
      for (const entry of ["Agents", "Skill sets", "Knowledge bases"]) {
        await expect(
          sidebar(page).getByText(entry, { exact: true }),
        ).toBeVisible();
      }
      await expect(sidebar(page)).not.toContainText("AI Projects");
      await expect(sidebar(page)).not.toContainText("AI rooms");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-table.png",
      ]);
    });

    test("offers no archive in a knowledge base's menu", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();
      await sidebar(page).getByText("Knowledge bases", { exact: true }).click();
      await expect(table(page)).toContainText("Contracts archive");

      await rowOf(page, "Contracts archive")
        .getByTestId("context-menu-button")
        .first()
        .click();

      // The menu keeps Delete (outright, as the server deletes an AI room)
      // and has no "Move to Archive".
      await expect(page.locator("#option_delete")).toBeVisible();
      await expect(page.locator("#option_archive-room")).toHaveCount(0);
    });

    // Spec: ai-agent-naming, "An AI project is called an agent"
    test("creates an agent from the Agents list with the agent form", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();

      // The list creates what it holds: on Agents, an agent, so New agent
      // opens the agent form with no room type to choose.
      await page.getByText("New agent", { exact: true }).first().click();
      await expect(page.getByTestId("room-type-list-item")).toHaveCount(0);
      // The modal root is a zero-size wrapper; the aside's fields are what shows.
      await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
      await expect(page.getByTestId("ai-project-title")).toBeVisible();
      await expect(page.getByTestId("ai-project-profile-combobox")).toBeVisible();
      await expect(page.getByText("Create agent").first()).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-projects-create-dialog.png",
      ]);
    });

    test("creates a knowledge base from the Knowledge bases list", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        // The room dialog reads the portal's tags for its tag input.
        roomTagsHandler(TEST_PORT),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();
      await sidebar(page).getByText("Knowledge bases", { exact: true }).click();
      await expect(table(page)).toContainText("Contracts archive");

      // The entry's room type is set and locked: no chooser, no agent form.
      await page.getByText("New", { exact: true }).first().click();
      await expect(page.getByTestId("create_room_dialog_save")).toBeVisible();
      await expect(page.getByTestId("room-type-list-item")).toHaveCount(0);
      await expect(page.getByTestId("ai-project-dialog")).toHaveCount(0);
    });

    test("offers an admin to create an agent when the section is empty", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, [], []),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);

      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText("New agent");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-empty-admin.png",
      ]);
    });

    test("tells a user that no agent was shared with them", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "regular"),
        ...aiSectionsHandlers(TEST_PORT, [], []),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);

      await expect(emptyView(page)).toBeVisible();
      await expect(emptyView(page)).toContainText("shared with you");
      await expect(emptyView(page)).not.toContainText("New agent");

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-rooms-empty-user.png",
      ]);
    });

    test("creates an agent with an uploaded picture and opens its page", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, [], []),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      // The empty list creates an agent: New agent opens the agent form.
      await emptyView(page).getByText("New agent", { exact: true }).click();
      await page.getByTestId("ai-project-title").fill("Sales");

      // A picture goes through the icon's hidden file input into the crop
      // dialog, as a room's does; Save keeps the crop as the logo preview.
      const dialog = page.getByTestId("ai-project-dialog");
      await dialog.locator("input[type=file]").setInputFiles({
        name: "logo.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64",
        ),
      });
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(dialog.getByTestId("room-icon-image")).toBeVisible();

      await page.getByTestId("ai-project-submit").click();

      // The new agent's page opens, with the picture as its logo.
      await expect(page).toHaveURL(/\/ai-rooms\/777100\/filter/);
      const intro = page.getByTestId("ai-project-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText("Sales");
      await expect(intro.getByTestId("room-icon-image")).toBeVisible();
    });
  });

  test.describe("the agents of the sidebar", () => {
    const [PINNED_AGENT, UNPINNED_AGENT] = AI_PROJECTS;
    const sidebarAgents = (page: Page) =>
      sidebar(page).locator('[data-item-id^="ai-nested-project-"]');

    test("lists the agents under Agents, the pinned one first, and opens one on its page", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const projects = stockProjects();
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        rootHandler(TEST_PORT, {
          aiHubRootProjects: () => aiHubRootProjectRooms(projects),
        }),
        ...aiSectionsHandlers(TEST_PORT, projects),
      );

      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toBeVisible();

      // Every agent of the list, as it holds fewer than five: the pinned
      // one first, then the others.
      await expect(sidebarAgents(page)).toHaveCount(projects.length);
      await expect(sidebarAgents(page).first()).toContainText(
        PINNED_AGENT.title,
      );
      await expect(sidebarAgent(page, UNPINNED_AGENT.id)).toContainText(
        UNPINNED_AGENT.title,
      );

      await sidebarAgent(page, PINNED_AGENT.id).click();

      await expect(page).toHaveURL(
        new RegExp(`/ai-rooms/${PINNED_AGENT.id}/filter`),
      );
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });

    test("lists no agent while the section has none", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );

      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toBeVisible();
      await expect(
        sidebar(page).getByText("Agents", { exact: true }),
      ).toBeVisible();

      await expect(sidebarAgents(page)).toHaveCount(0);
    });

    test("moves an agent pinned from its menu up, and one that is unpinned down", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const projects = stockProjects();
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        rootHandler(TEST_PORT, {
          aiHubRootProjects: () => aiHubRootProjectRooms(projects),
        }),
        ...aiSectionsHandlers(TEST_PORT, projects),
        ...aiAgentPinHandlers(TEST_PORT, projects),
      );

      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toBeVisible();
      await expect(sidebarAgents(page)).toHaveCount(projects.length);
      await expect(sidebarAgents(page).first()).toContainText(
        PINNED_AGENT.title,
      );

      await rowOf(page, UNPINNED_AGENT.title)
        .getByTestId("context-menu-button")
        .first()
        .click();
      await page.locator("#option_pin-room").click();

      // Both are pinned now, in the order of the list.
      await expect(sidebarAgents(page).nth(1)).toContainText(
        UNPINNED_AGENT.title,
      );
      await expect(sidebarAgents(page).first()).toContainText(
        PINNED_AGENT.title,
      );

      await rowOf(page, PINNED_AGENT.title)
        .getByTestId("context-menu-button")
        .first()
        .click();
      await page.locator("#option_unpin-room").click();

      // The one still pinned leads; the unpinned one stays listed.
      await expect(sidebarAgents(page).first()).toContainText(
        UNPINNED_AGENT.title,
      );
      await expect(sidebarAgent(page, PINNED_AGENT.id)).toBeVisible();
      await expect(sidebarAgents(page)).toHaveCount(projects.length);
    });
  });

  test.describe("agent cards", () => {
    test.beforeEach(async ({ page, mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS, OUTSIDE_AGENT]),
      );
      await page.addInitScript(() =>
        window.localStorage.setItem("viewAs_aiAgents", "tile"),
      );
    });

    // Spec: ai-agents-list, "Agent card"; "Skill sets and knowledge bases on a card"
    test("shows each agent as a card with its category, model, skill sets, knowledge bases and owner", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${AGENTS_URL}`);

      const card = tileOf(page, AI_PROJECT_WITH_SOURCES.title);
      await expect(card).toBeVisible();

      const summary = card.getByTestId("ai-project-tile-summary");
      await expect(summary.getByTestId("ai-project-tile-category")).toHaveText(
        AI_PROJECT_WITH_SOURCES.tags[0],
      );
      await expect(summary.getByTestId("ai-project-tile-model")).toHaveText(
        AI_PROJECT_WITH_SOURCES.aiProject.profile!.name,
      );
      const skills = summary.getByTestId("ai-project-tile-skills-item");
      await expect(skills).toHaveCount(2);
      for (const room of AI_PROJECT_WITH_SOURCES.aiProject.instructionsRooms) {
        await expect(summary.getByTestId("ai-project-tile-skills")).toContainText(
          room.title,
        );
      }
      await expect(summary.getByTestId("ai-project-tile-knowledge")).toContainText(
        AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms[0].title,
      );
      await expect(summary.getByTestId("ai-project-tile-owner")).toHaveText(
        AI_PROJECT_WITH_SOURCES.createdBy.displayName,
      );
      await expect(card.getByTestId("ai-project-tile-open-chat")).toBeVisible();

      // An agent without linked rooms or tags: dashes, and no Category row.
      const bare = tileOf(page, AI_PROJECT_WITHOUT_SOURCES.title);
      await expect(bare.getByTestId("ai-project-tile-skills")).toHaveText("—");
      await expect(bare.getByTestId("ai-project-tile-knowledge")).toHaveText("—");
      await expect(bare.getByTestId("ai-project-tile-category")).toHaveCount(0);

      // Every agent is owned by a portal user: no Verified badge on a card.
      await expect(page.getByTestId("ai-template-verified")).toHaveCount(0);
    });

    // Spec: ai-agents-list, "Agent card" (every card of the list is as high)
    test("draws the agent cards in rows that do not overlap", async ({
      page,
      baseUrl,
    }) => {
      // ui-kit's tile Grid sizes the rows and the client the cards: a row
      // lower than a card makes the next row cover the Owner line above it.
      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(tileOf(page, OUTSIDE_AGENT.title)).toBeVisible();

      const boxes = await page
        .locator("[data-testid^=tile_]")
        .evaluateAll((tiles) =>
          tiles.map((tile) => {
            const { top, bottom } = tile.getBoundingClientRect();
            return { top: Math.round(top), bottom: Math.round(bottom) };
          }),
        );
      const rowTops = [...new Set(boxes.map((box) => box.top))].sort(
        (a, b) => a - b,
      );
      expect(rowTops.length).toBeGreaterThan(1);
      rowTops.slice(1).forEach((top, index) => {
        const lowestAbove = Math.max(
          ...boxes
            .filter((box) => box.top === rowTops[index])
            .map((box) => box.bottom),
        );
        expect(top).toBeGreaterThanOrEqual(lowestAbove);
      });
    });

    // Spec: ai-agents-list, "Open chat from a card"
    test("opens an agent's page from Open chat, which only a member's card has", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${AGENTS_URL}`);

      // A DocSpace admin outside the agent sees its card without Open chat.
      await expect(tileOf(page, OUTSIDE_AGENT.title)).toBeVisible();
      await expect(
        tileOf(page, OUTSIDE_AGENT.title).getByTestId("ai-project-tile-open-chat"),
      ).toHaveCount(0);

      await tileOf(page, AI_PROJECT_WITH_SOURCES.title)
        .getByTestId("ai-project-tile-open-chat")
        .click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(`/ai-rooms/${AI_PROJECT_WITH_SOURCES.id}/filter`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });

    // Spec: ai-agents-list, "Category row"; "Choosing a category"
    // Skipped while the Templates tab is hidden (AI_TEMPLATES_ENABLED in helpers/aiWorkspace.ts).
    test.skip("narrows the agents to a category from the row under the filter", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${AGENTS_URL}`);

      // "All" first and selected, then each tag the listed agents carry once.
      const row = page.getByTestId("ai-agent-categories");
      await expect(row).toBeVisible();
      const categories = row.getByTestId("ai-agent-category");
      await expect(categories.first()).toHaveText("All");
      for (const tag of ["sales", "internal", "legal"]) {
        await expect(row.getByText(tag, { exact: true })).toBeVisible();
      }

      await row.getByText("legal", { exact: true }).click();

      // Only the agent tagged "legal", and the choice is kept in the address.
      await expect(tileOf(page, "Contract reviewer")).toBeVisible();
      await expect(tileOf(page, AI_PROJECT_WITH_SOURCES.title)).toHaveCount(0);
      await expect(page).toHaveURL(/tags=/);

      await page.reload();
      await expect(tileOf(page, "Contract reviewer")).toBeVisible();
      await expect(tileOf(page, AI_PROJECT_WITH_SOURCES.title)).toHaveCount(0);
    });
  });

  test.describe("an agent's page", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSectionsHandlers(TEST_PORT, stockProjects()),
      );
    });

    test("opens from the Agents list", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();

      await table(page)
        .getByText(AI_PROJECT_WITH_SOURCES.title, { exact: true })
        .click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(`/ai-rooms/${AI_PROJECT_WITH_SOURCES.id}/filter`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });

    // Spec: ai-agent-page, "No sources column on the page"
    test("shows the chat with the agent's skill sets and knowledge bases in its intro, with no sources column", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(AI_PROJECT_WITH_SOURCES.id)}`);

      const intro = page.getByTestId("ai-project-intro");
      await expect(intro).toBeVisible();
      await expect(intro).toContainText(AI_PROJECT_WITH_SOURCES.title);

      const skillSets = page.getByTestId("ai-project-intro-instructions");
      for (const room of AI_PROJECT_WITH_SOURCES.aiProject.instructionsRooms) {
        await expect(skillSets).toContainText(room.title);
      }

      const knowledgeBases = page.getByTestId("ai-project-intro-knowledge");
      for (const room of AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms) {
        await expect(knowledgeBases).toContainText(room.title);
      }

      // Nothing beside the chat: the column's cards and their expanders are gone.
      await expect(page.getByTestId("ai-project-instructions")).toHaveCount(0);
      await expect(page.getByTestId("ai-project-knowledge")).toHaveCount(0);
      await expect(page.getByTestId(/^ai-project-room-expander-/)).toHaveCount(0);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-project-with-sources.png",
      ]);

      // On a tablet the chat fills the section body the same way.
      await page.setViewportSize({ width: 900, height: 1024 });
      await expect(intro).toBeVisible();
      await expectScreenshot(page, [
        "tablet",
        "ai-projects",
        "ai-project-with-sources.png",
      ]);
    });

    test("leaves the sources out of the intro of an agent without skill sets or knowledge bases", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(AI_PROJECT_WITHOUT_SOURCES.id)}`);

      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
      await expect(page.getByTestId("ai-project-intro-instructions")).toHaveCount(0);
      await expect(page.getByTestId("ai-project-intro-knowledge")).toHaveCount(0);

      await expectScreenshot(page, [
        "desktop",
        "ai-projects",
        "ai-project-without-sources.png",
      ]);
    });

    // Spec: ai-agent-page, "Actions menu of an agent"
    test("offers the Agent owner Share, Agent info, copy link, change owner and Delete agent, and neither Edit agent nor Leave agent", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(AI_PROJECT_WITH_SOURCES.id)}`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();

      await openPageMenu(page);
      await expect
        .poll(() => menuItems(page))
        .toEqual([
          "option_invite-users-to-room",
          "option_room-info",
          "option_link-for-room-members",
          "option_change-room-owner",
          "option_delete",
        ]);
      await expect(page.locator("#option_invite-users-to-room")).toHaveText(
        "Share agent",
      );
      await expect(page.locator("#option_room-info")).toHaveText("Agent info");
      await expect(page.locator("#option_delete")).toHaveText("Delete agent");
    });

    // Spec: ai-agent-page, "Agent info"
    test("opens the Info panel on Details from Agent info", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(AI_PROJECT_WITH_SOURCES.id)}`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();

      await openPageMenu(page);
      await page.locator("#option_room-info").click();

      const details = page.getByTestId("info_details_tab");
      await expect(details).toBeVisible();
      await expect(details).toHaveAttribute("aria-selected", "true");
      // Beside the chat, not in place of it.
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    });

    // Spec: ai-agent-page, "Delete agent from its page"; ai-agent-naming, "Agent dialogs use the agent texts"
    test("deletes the agent from its page after a confirmation and returns to the Agents list", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const projects = stockProjects();
      mockRequest.use(
        ...aiSectionsHandlers(TEST_PORT, projects),
        aiAgentDeleteHandler(TEST_PORT, projects),
      );

      await page.goto(`${baseUrl}${agentUrl(AI_PROJECT_WITH_SOURCES.id)}`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();

      await openPageMenu(page);
      await page.locator("#option_delete").click();

      const dialog = page.getByTestId("delete-dialog");
      await expect(dialog).toContainText("Delete this agent?");
      await expect(dialog).toContainText(AI_PROJECT_WITH_SOURCES.title);
      // Nothing is deleted before the warning is acknowledged.
      await expect(page.getByTestId("delete_dialog_modal_submit")).toBeDisabled();
      await page.getByTestId("delete_warning_checkbox").click();
      await page.getByTestId("delete_dialog_modal_submit").click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(AI_ROOMS_URL);
      await expect(table(page)).toContainText(AI_PROJECT_WITHOUT_SOURCES.title);
      await expect(table(page)).not.toContainText(AI_PROJECT_WITH_SOURCES.title);
    });
  });

  /**
   * The header of an agent's page for each role: a member reads the agent's
   * name, Chat history, New chat, the actions menu, "Share agent" when they
   * may share it, and the Info panel toggle; someone outside the agent reads
   * its name, the menu and the toggle. The name opens no agents menu.
   */
  test.describe("the header of an agent's page", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        ...aiSectionsHandlers(TEST_PORT, [
          ...AI_PROJECTS,
          MANAGED_AGENT,
          MEMBER_AGENT,
          OUTSIDE_AGENT,
        ]),
      );
    });

    /** Where a header control starts: the controls are read left to right. */
    const xOf = async (control: ReturnType<Page["locator"]>) => {
      const box = await control.boundingBox();
      return box?.x ?? Number.NaN;
    };

    // Spec: ai-agent-page, "Header of an agent's page"; "Share agent"
    test("shows an Agent manager the name, Chat history, New chat, the menu, Share agent and the Info panel toggle, in that order", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "roomAdmin"));

      await page.goto(`${baseUrl}${agentUrl(MANAGED_AGENT.id)}`);

      const title = page.getByTestId("agent-page-title");
      const toolbar = page.locator("#chat-toolbar");
      const history = toolbar.getByRole("button", { name: "Chat history" });
      const newChat = toolbar.getByRole("button", { name: "New chat" });
      const menu = page.locator("#header_optional-button");
      const share = page.getByTestId("navigation_button");
      const toggle = page.locator("#info-panel-toggle--open");

      await expect(title).toHaveText(MANAGED_AGENT.title);
      await expect(page.getByTestId("ai-chat-agent-picker")).toHaveCount(0);
      await expect(history).toBeVisible();
      await expect(newChat).toBeVisible();
      await expect(menu).toBeVisible();
      await expect(share).toHaveText("Share agent");
      await expect(toggle).toBeVisible();

      const order = [title, history, newChat, menu, share, toggle];
      const xs: number[] = [];
      for (const control of order) xs.push(await xOf(control));
      expect(xs).toEqual([...xs].sort((a, b) => a - b));

      // "Share agent" opens the agent's invite panel.
      await share.click();
      await expect(
        page.locator("#invite_panel_modal").getByTestId("modal-dialog"),
      ).toBeVisible();
    });

    // Spec: ai-agent-page, "Header of an agent's page"; "Actions menu of an agent"
    test("shows a Member the same header without Share agent, and a menu of Agent info, copy link and Leave agent", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "roomAdmin"));

      await page.goto(`${baseUrl}${agentUrl(MEMBER_AGENT.id)}`);

      await expect(page.getByTestId("agent-page-title")).toHaveText(
        MEMBER_AGENT.title,
      );
      await expect(
        page.locator("#chat-toolbar").getByRole("button", { name: "Chat history" }),
      ).toBeVisible();
      await expect(page.locator("#info-panel-toggle--open")).toBeVisible();
      await expect(page.getByTestId("navigation_button")).toHaveCount(0);

      await openPageMenu(page);
      await expect
        .poll(() => menuItems(page))
        .toEqual([
          "option_room-info",
          "option_link-for-room-members",
          "option_leave-room",
        ]);
      await expect(page.locator("#option_leave-room")).toHaveText("Leave agent");
    });

    // Spec: ai-agent-page, "Actions menu of an agent"
    test("offers an Agent manager Share, Agent info, copy link and Leave agent, without Edit agent, change owner or Delete agent", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "roomAdmin"));

      await page.goto(`${baseUrl}${agentUrl(MANAGED_AGENT.id)}`);
      await expect(page.getByTestId("agent-page-title")).toBeVisible();

      await openPageMenu(page);
      await expect
        .poll(() => menuItems(page))
        .toEqual([
          "option_invite-users-to-room",
          "option_room-info",
          "option_link-for-room-members",
          "option_leave-room",
        ]);
    });

    // Spec: ai-agent-page, "Header for a non-member"
    test("shows a DocSpace admin outside the agent its name, the menu and the Info panel toggle only", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

      await page.goto(`${baseUrl}${agentUrl(OUTSIDE_AGENT.id)}`);

      await expect(page.getByTestId("agent-page-title")).toHaveText(
        OUTSIDE_AGENT.title,
      );
      await expect(page.locator("#header_optional-button")).toBeVisible();
      await expect(page.locator("#info-panel-toggle--open")).toBeVisible();
      await expect(page.getByTestId("ai-chat-agent-picker")).toHaveCount(0);
      await expect(page.locator("#chat-toolbar")).toHaveCount(0);
      await expect(page.getByTestId("navigation_button")).toHaveCount(0);
    });

    // Spec: ai-agent-page, "Leave agent from its page"; ai-agent-naming, "Agent dialogs use the agent texts"
    test("lets a Member leave the agent from its page after the conversations warning", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const projects = [...AI_PROJECTS, MEMBER_AGENT];
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "roomAdmin"),
        ...aiSectionsHandlers(TEST_PORT, projects),
        aiAgentLeaveHandler(TEST_PORT, projects, ROOM_ADMIN_ID),
      );

      await page.goto(`${baseUrl}${agentUrl(MEMBER_AGENT.id)}`);
      await expect(page.getByTestId("ai-project-intro")).toBeVisible();

      await openPageMenu(page);
      await page.locator("#option_leave-room").click();

      // The dialog has no accessible name: it is found by its title.
      const dialog = page.getByRole("dialog").filter({ hasText: "Leave agent" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(
        "Your conversations with it, including the files in them, will be permanently deleted.",
      );
      await page.getByTestId("leave_room_modal_submit").click();

      await expect(page.getByTestId("toast-content")).toContainText(
        "You have left the agent",
      );
      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(AI_ROOMS_URL);
      await expect(table(page)).toContainText(AI_PROJECT_WITH_SOURCES.title);
      await expect(table(page)).not.toContainText(MEMBER_AGENT.title);
    });
  });

  /**
   * The Info panel of an agent: Details and Context for everyone, Content
   * on the agent's own page, Members last for those who manage it, and no
   * Contacts, History or plugin tab. Context lists the skill sets (each
   * unfolding to its skills) and the knowledge bases, with a "Manage ..."
   * row under each for those who may edit the agent.
   */
  test.describe("the Info panel of an agent", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "roomAdmin"),
        ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS, MANAGED_AGENT, MEMBER_AGENT]),
        ...roomMembersHandlers(TEST_PORT, MANAGED_AGENT.id),
      );
    });

    // Spec: ai-agent-info-panel, "Tabs of an agent"; "Content tab on an agent's page"
    test("gives a Member's selected card Details and Context only, with Details shown", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toContainText(MEMBER_AGENT.title);

      await selectRow(page, MEMBER_AGENT.title);
      await openInfoPanel(page);

      await expect
        .poll(() => infoPanelTabs(page))
        .toEqual(["info_details_tab", "info_context_tab"]);
      await expect(page.getByTestId("info_details_tab")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByTestId("info_details_tab")).toHaveText("Details");
      await expect(page.getByTestId("info_context_tab")).toHaveText("Context");
    });

    // Spec: ai-agent-info-panel, "Tabs of an agent" ("Contacts was remembered")
    test("falls back to Details for an agent after Contacts of a room was last open", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const [knowledgeBase] = AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms;
      mockRequest.use(...roomMembersHandlers(TEST_PORT, knowledgeBase.id));

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toBeVisible();
      await sidebar(page).getByText("Knowledge bases", { exact: true }).click();
      await expect(table(page)).toContainText(knowledgeBase.title);

      // A room's Contacts tab is what the panel remembers.
      await selectRow(page, knowledgeBase.title);
      await openInfoPanel(page);
      await page.getByTestId("info_members_tab").click();
      await expect(page.getByTestId("info_members_tab")).toHaveAttribute(
        "aria-selected",
        "true",
      );

      await sidebar(page).getByText("Agents", { exact: true }).click();
      await expect(table(page)).toContainText(MEMBER_AGENT.title);
      await selectRow(page, MEMBER_AGENT.title);

      await expect(page.getByTestId("info_details_tab")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByTestId("info_members_tab")).toHaveCount(0);
      await expect(page.getByTestId("info_history_tab")).toHaveCount(0);
    });

    // Spec: ai-agent-info-panel, "Members of an agent"; "Content tab on an agent's page"
    test("gives an Agent manager Details, Context, Content and Members on the agent's page, and no Content on its card", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(MANAGED_AGENT.id)}`);
      await openInfoPanel(page);

      await expect
        .poll(() => infoPanelTabs(page))
        .toEqual([
          "info_details_tab",
          "info_context_tab",
          "info_content_tab",
          "info_members_tab",
        ]);

      // Selected in the list, the same agent has no Content tab.
      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toContainText(MANAGED_AGENT.title);
      await selectRow(page, MANAGED_AGENT.title);
      await openInfoPanel(page);

      await expect
        .poll(() => infoPanelTabs(page))
        .toEqual(["info_details_tab", "info_context_tab", "info_members_tab"]);
    });

    // Spec: ai-agent-info-panel, "Content tab on an agent's page" ("Agent's page")
    test("gives a Member Details, Context and Content on the agent's page", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(MEMBER_AGENT.id)}`);
      await openInfoPanel(page);

      await expect
        .poll(() => infoPanelTabs(page))
        .toEqual(["info_details_tab", "info_context_tab", "info_content_tab"]);
    });

    // Spec: ai-agent-info-panel, "Context tab"; "Skills of a skill set"; "Managing sources from Context"
    test("lists a Member the agent's skill sets and knowledge bases on Context, a skill set unfolded to its skills until folded, with no Manage rows", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toContainText(MEMBER_AGENT.title);
      await selectRow(page, MEMBER_AGENT.title);
      await openInfoPanel(page);
      await page.getByTestId("info_context_tab").click();

      const skillSets = page.getByTestId("ai-agent-context-skills");
      const knowledgeBases = page.getByTestId("ai-agent-context-knowledge");
      await expect(skillSets).toContainText("Skill sets");
      await expect(knowledgeBases).toContainText("Knowledge bases");

      await expect(skillSets.getByTestId(/^ai-project-room-\d+$/)).toHaveCount(1);
      await expect(skillSets).toContainText(SKILL_SET.title);
      await expect(knowledgeBases.getByTestId(/^ai-project-room-\d+$/)).toHaveCount(2);
      for (const room of MEMBER_AGENT.aiProject.knowledgeRooms) {
        await expect(knowledgeBases).toContainText(room.title);
      }

      // The skill set is unfolded to the names of its skills until folded.
      await expect(skillSets).toContainText("Pitch builder");
      await expect(skillSets).toContainText("Follow-up writer");
      await page.getByTestId(`ai-project-room-expander-${SKILL_SET.id}`).click();
      await expect(skillSets).not.toContainText("Pitch builder");

      // A Member may not edit the agent: no bin on a row.
      await expect(
        page.getByTestId(/^ai-agent-context-remove-/),
      ).toHaveCount(0);

      // A Member may not edit the agent: no "Manage ..." row.
      await expect(page.getByTestId("ai-agent-context-manage-skills")).toHaveCount(0);
      await expect(page.getByTestId("ai-agent-context-manage-knowledge")).toHaveCount(0);
    });

    // Spec: ai-agent-info-panel, "Skills of a skill set" ("Skills unavailable")
    test("lists the skill sets without an unfold control when their skills cannot be read", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(aiAgentSkillsRefusedHandler(TEST_PORT));

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toContainText(MEMBER_AGENT.title);
      await selectRow(page, MEMBER_AGENT.title);
      await openInfoPanel(page);
      await page.getByTestId("info_context_tab").click();

      const skillSets = page.getByTestId("ai-agent-context-skills");
      await expect(skillSets).toContainText(SKILL_SET.title);
      await expect(skillSets.getByTestId(/^ai-project-room-expander-/)).toHaveCount(0);
    });

    // Spec: ai-agent-info-panel, "Managing sources from Context" ("Agent manager")
    test("lets an Agent manager open the picker of the agent's knowledge bases from Manage knowledge bases on Context, and shows a row's bin under the pointer", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${agentUrl(MANAGED_AGENT.id)}`);
      await openInfoPanel(page);
      await page.getByTestId("info_context_tab").click();

      const manageSkills = page.getByTestId("ai-agent-context-manage-skills");
      const manageKnowledge = page.getByTestId("ai-agent-context-manage-knowledge");
      await expect(manageSkills).toHaveText("Manage skill sets...");
      await expect(manageKnowledge).toHaveText("Manage knowledge bases...");
      // Each closes its own section.
      await expect(
        page.getByTestId("ai-agent-context-skills").getByTestId("ai-agent-context-manage-skills"),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("ai-agent-context-knowledge")
          .getByTestId("ai-agent-context-manage-knowledge"),
      ).toBeVisible();

      // The bin of a row shows while the pointer is on the row.
      const source = page
        .getByTestId("ai-agent-context-knowledge")
        .getByTestId("ai-agent-context-source")
        .first();
      const bin = source.getByTestId("ai-agent-context-remove-knowledge");
      await manageKnowledge.hover();
      await expect(bin).toHaveCSS("opacity", "0");
      await source.hover();
      await expect(bin).toHaveCSS("opacity", "1");

      await manageKnowledge.click();
      await expect(
        page.getByTestId("aside").filter({ hasText: "Knowledge bases" }).first(),
      ).toBeVisible();
      await expect(page.getByTestId("ai-project-dialog")).toHaveCount(0);
    });

    // Spec: ai-agent-info-panel, "Context that cannot be read"
    test("says that something went wrong on Context of an agent deleted meanwhile", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      // The list still lists the agent; the agent itself is gone.
      const deleted = aiProjectMock({
        id: 777313,
        title: "Gone agent",
        color: "8570FF",
        access: AiProjectMockAccess.Member,
      });
      mockRequest.use(
        aiHubRoomsHandler(TEST_PORT, AI_HUB_ROOMS, [...AI_PROJECTS, deleted]),
      );

      await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
      await expect(table(page)).toContainText(deleted.title);
      await selectRow(page, deleted.title);
      await openInfoPanel(page);
      await page.getByTestId("info_context_tab").click();

      await expect(page.getByTestId("ai-agent-context-error")).toHaveText(
        "Something went wrong.",
      );
      await expect(page.getByTestId("ai-agent-context-skills")).toHaveCount(0);
    });
  });
});
