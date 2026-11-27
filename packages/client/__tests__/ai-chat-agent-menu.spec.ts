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
import type { HttpHandler } from "msw";

import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  usersByType,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiHubRoomAsReader,
  aiHubRoomGetByIdHandler,
  aiProjectDeleteHandlers,
  aiProjectMock,
  AiProjectMockAccess,
  aiSectionsHandlers,
  AI_HUB_ROOMS,
  AI_PROJECT_WITH_SOURCES,
  rootHandler,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import type {
  AiProjectMock,
  UserType,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The chat panel opened outside an agent's page: the agent menu in its
 * title, the title naming the picked agent, "Save as new agent" (from a
 * plain chat and from a picked agent, with a notice per room the user may
 * not link), and the "Agent actions" menu built from the user's rights in
 * the picked agent, with what Edit, Agent info and Delete open.
 *
 * The agents are AI projects the user is a member of (`ai/projects` through
 * `files/rooms?searchArea=AiHub&type=12`), each given its own access so the
 * rights the server answers (`security`) differ by test.
 */

const ROOMS_URL = "/rooms/shared/";
// The rooms list writes its filter into the URL once it loads.
const ROOMS_LIST_PATH = /^\/rooms\/shared\/(filter)?$/;
const DESKTOP = { width: 1440, height: 1024 };

const SOURCES = AI_PROJECT_WITH_SOURCES.aiProject;

/**
 * An agent with the stock skill sets and knowledge base linked; the lists
 * are copies, as the sources handlers write into them.
 */
const agent = (
  id: number,
  title: string,
  access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
  created: string,
  color = "FF6680",
) =>
  aiProjectMock({
    id,
    title,
    color,
    access,
    created,
    instructionsRooms: [...SOURCES.instructionsRooms],
    knowledgeRooms: [...SOURCES.knowledgeRooms],
  });

const LEGAL = "Legal Reviewer";
const MARKETING = "Marketing writer";

/** Two agents, "Legal Reviewer" the most recently active. */
const twoAgents = (
  access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
) => [
  agent(777401, LEGAL, access, "2026-11-12T10:00:00.0000000+00:00"),
  agent(777402, MARKETING, access, "2026-11-10T10:00:00.0000000+00:00", "5CC5D4"),
];

/** The id `aiProjectCreateHandler` gives a new agent. */
const CREATED_ID = 777100;

/** The header's chat button; `data-open` tells whether the chat panel is open. */
const slot = (page: Page) => page.getByTestId("ai-chat-slot");
/** The chat panel's toolbar: Chat history and New chat. */
const toolbar = (page: Page) => page.locator("#chat-toolbar");
/**
 * The left half of the panel header, the title and the toolbar. ui-kit's
 * header has no test id of its own, so it is found as the toolbar's parent.
 */
const panelTitleRow = (page: Page) => page.locator("div:has(> #chat-toolbar)");
const picker = (page: Page) => page.getByTestId("ai-chat-agent-picker");
const pickerMenu = (page: Page) => page.getByTestId("ai-chat-agent-picker-menu");
const defaultRow = (page: Page) =>
  page.getByTestId("ai-chat-agent-picker-default");
const agentRow = (page: Page, id: number) =>
  page.getByTestId(`ai-chat-agent-picker-agent-${id}`);
const agentRows = (page: Page) =>
  pickerMenu(page).getByTestId(/^ai-chat-agent-picker-agent-/);
const saveRow = (page: Page) => page.getByTestId("ai-chat-agent-picker-save");
const agentActions = (page: Page) => page.getByTestId("ai-chat-agent-actions");
const agentAction = (page: Page, id: string) =>
  page.getByTestId(`ai-chat-agent-action-${id}`);
const toast = (page: Page) => page.getByTestId("toast-content");
const infoPanel = (page: Page) => page.locator("#InfoPanelWrapper");
const infoPanelToggle = (page: Page) =>
  page.locator("#info-panel-toggle--open");

/**
 * A chat without a remembered model raises the "Model updated" notice over
 * the picker; it has nothing to do with the agent menu, so it is marked as
 * already dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page, userType: UserType) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${usersByType[userType].id}`);

/** Signs in as `userType`, a member of `projects`, and opens the chat panel in Rooms. */
const openChat = async (
  page: Page,
  baseUrl: string,
  mockRequest: WorkerFixture,
  userType: UserType,
  projects: AiProjectMock[],
  extra: HttpHandler[] = [],
) => {
  mockRequest.use(
    selfByTypeHandler(TEST_PORT, userType, "en-US"),
    ...aiSectionsHandlers(TEST_PORT, projects),
    ...extra,
  );
  await dismissModelUpdatedNotice(page, userType);
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await page.getByTestId("ai-chat-button").click();
  await expect(slot(page)).toHaveAttribute("data-open", "true");
};

const openMenu = async (page: Page) => {
  await picker(page).click();
  await expect(pickerMenu(page)).toBeVisible();
};

const pick = async (page: Page, project: AiProjectMock) => {
  await openMenu(page);
  await agentRow(page, project.id).click();
  await expect(picker(page)).toContainText(project.title);
};

const openAgentActions = async (page: Page) => {
  await expect(agentActions(page)).toBeVisible();
  await agentActions(page).click();
  await expect(agentAction(page, "info")).toBeVisible();
};

/** "Save as new agent" in the title menu, named `name` in the dialog it opens. */
const saveAsNewAgent = async (page: Page, name: string) => {
  await openMenu(page);
  await saveRow(page).click();
  await expect(pickerMenu(page)).toBeHidden();
  const input = page.getByTestId("save_ai_preset_text_input");
  await expect(input).toHaveValue("New agent");
  await input.fill(name);
  await page.getByTestId("save_ai_preset_save_button").click();
};

const roomIds = (rooms: { id: number }[]) => rooms.map((room) => room.id);

test.describe("AI chat: the agent menu", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      // Before the AI handlers: the agents list is a `files/rooms` query too.
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    );
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-chat-agent-menu, "Agent menu in the panel title"
  test("a member of two agents gets the default agent ticked and both agents with their logos, the most recent first", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
    // An agent the admin reads but is not a member of is not offered.
    const notMember = agent(
      777403,
      "Finance digest",
      AiProjectMockAccess.None,
      "2026-11-14T10:00:00.0000000+00:00",
    );
    await openChat(page, baseUrl, mockRequest, "admin", [
      notMember,
      legal,
      marketing,
    ]);

    await expect(picker(page)).toContainText("AI Chat");
    await openMenu(page);

    await expect(defaultRow(page)).toContainText("Default AI agent");
    await expect(defaultRow(page)).toHaveAttribute("aria-selected", "true");
    await expect(pickerMenu(page).getByText("Agents", { exact: true })).toBeVisible();

    await expect(agentRows(page)).toHaveCount(2);
    await expect(agentRows(page).nth(0)).toContainText(LEGAL);
    await expect(agentRows(page).nth(1)).toContainText(MARKETING);
    for (const project of [legal, marketing]) {
      await expect(
        agentRow(page, project.id).getByTestId("ai-project-logo"),
      ).toBeVisible();
      await expect(agentRow(page, project.id)).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
    await expect(pickerMenu(page)).not.toContainText(notMember.title);
  });

  // Spec: ai-chat-agent-menu, "Agent list is kept current"
  test("an agent the user was invited to meanwhile is listed once the menu opens", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
    const projects = [marketing];
    await page.clock.install();
    await openChat(page, baseUrl, mockRequest, "roomAdmin", projects);

    await openMenu(page);
    await expect(agentRows(page)).toHaveCount(1);
    await picker(page).click();
    await expect(pickerMenu(page)).toBeHidden();

    // Invited to "Legal Reviewer" while the menu was closed. A list read a
    // moment ago counts as current (PRESETS_FRESH_MS, 10 seconds), so the
    // clock is moved past it.
    projects.unshift(legal);
    await page.clock.fastForward(11_000);

    await openMenu(page);
    await expect(agentRow(page, legal.id)).toBeVisible();
    await expect(agentRows(page)).toHaveCount(2);
  });

  // Spec: ai-chat-agent-menu, "Title of the panel"
  test("the title names the picked agent after its logo", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
    await openChat(page, baseUrl, mockRequest, "roomAdmin", [legal, marketing]);

    await expect(picker(page)).toContainText("AI Chat");
    await expect(page.getByTestId("ai-chat-agent-picker-logo")).toHaveCount(0);

    await pick(page, legal);

    await expect(picker(page)).not.toContainText("AI Chat");
    await expect(
      page.getByTestId("ai-chat-agent-picker-logo").getByTestId("ai-project-logo"),
    ).toBeVisible();

    // The menu ticks the agent the chat now runs on.
    await openMenu(page);
    await expect(agentRow(page, legal.id)).toHaveAttribute("aria-selected", "true");
    await expect(defaultRow(page)).not.toHaveAttribute("aria-selected", "true");
  });

  // Spec: ai-chat-agent-menu, "Save as new agent"
  test("a room admin saves the chat as a new agent on its model, and a notice names it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const projects = twoAgents(AiProjectMockAccess.Member);
    await openChat(page, baseUrl, mockRequest, "roomAdmin", projects);

    await openMenu(page);
    await expect(saveRow(page)).toContainText("Save as new agent");
    await picker(page).click();

    await saveAsNewAgent(page, "Research");

    await expect(toast(page)).toContainText('Agent "Research" saved');
    const created = projects.find((project) => project.id === CREATED_ID);
    expect(created?.title).toBe("Research");
    // The chat's model went with it.
    expect(created?.aiProject.profile).not.toBeNull();
    // The new agent opens on its own page.
    await expect(page).toHaveURL(new RegExp(`/ai-rooms/${CREATED_ID}/filter`));

    // The new agent joins the menu.
    await openMenu(page);
    await expect(agentRow(page, CREATED_ID)).toContainText("Research");
  });

  // Spec: ai-chat-agent-menu, "Save as new agent"
  test("a User gets the default agent and the agents, with no Save as new agent", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
    await openChat(page, baseUrl, mockRequest, "regular", [legal, marketing]);

    await openMenu(page);
    await expect(defaultRow(page)).toBeVisible();
    await expect(agentRow(page, legal.id)).toBeVisible();
    await expect(agentRow(page, marketing.id)).toBeVisible();
    await expect(saveRow(page)).toHaveCount(0);
  });

  // Spec: ai-chat-agent-menu, "Menu of a user with no agents"
  test("a room admin without agents gets the default agent and Save as new agent, with no Agents caption", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openChat(page, baseUrl, mockRequest, "roomAdmin", []);

    await openMenu(page);
    await expect(defaultRow(page)).toBeVisible();
    await expect(saveRow(page)).toBeVisible();
    await expect(agentRows(page)).toHaveCount(0);
    await expect(pickerMenu(page).getByText("Agents", { exact: true })).toBeHidden();
  });

  // Spec: ai-chat-agent-menu, "Menu of a user with no agents"
  test("a User without agents gets a plain AI Chat title", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openChat(page, baseUrl, mockRequest, "regular", []);

    await expect(panelTitleRow(page)).toContainText("AI Chat");
    await expect(picker(page)).toHaveCount(0);
  });

  test.describe("Agent actions", () => {
    // Spec: ai-chat-agent-menu, "Agent actions in the panel"
    test("the agent owner gets Edit, Share, Agent info and Delete agent, and neither Expand nor Save as new agent", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const [legal, marketing] = twoAgents(AiProjectMockAccess.Owner);
      await openChat(page, baseUrl, mockRequest, "roomAdmin", [legal, marketing]);

      // Nothing to act on while the chat runs on the default agent.
      await expect(agentActions(page)).toHaveCount(0);

      await pick(page, legal);
      await openAgentActions(page);

      for (const id of ["edit", "share", "info", "delete"]) {
        await expect(agentAction(page, id)).toBeVisible();
      }
      await expect(agentAction(page, "edit")).toContainText("Edit agent");
      await expect(agentAction(page, "share")).toContainText("Share agent");
      await expect(agentAction(page, "info")).toContainText("Agent info");
      await expect(agentAction(page, "delete")).toContainText("Delete agent");
      await expect(page.getByTestId(/^ai-chat-agent-action-/)).toHaveCount(4);
      await expect(
        page.getByRole("menuitem", { name: "Save as new agent" }),
      ).toHaveCount(0);
      // Expand keeps its own button in the header.
      await expect(page.getByTestId("ai-chat-panel-fullscreen")).toBeVisible();
    });

    // Spec: ai-chat-agent-menu, "Agent actions in the panel"
    test("an Agent manager gets Edit, Share and Agent info, and no Delete agent", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const [legal, marketing] = twoAgents(AiProjectMockAccess.ProjectManager);
      await openChat(page, baseUrl, mockRequest, "roomAdmin", [legal, marketing]);

      await pick(page, legal);
      await openAgentActions(page);

      for (const id of ["edit", "share", "info"]) {
        await expect(agentAction(page, id)).toBeVisible();
      }
      await expect(agentAction(page, "delete")).toHaveCount(0);
    });

    // Spec: ai-chat-agent-menu, "Agent actions in the panel"
    test("a Member who is a User gets only Agent info", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
      await openChat(page, baseUrl, mockRequest, "regular", [legal, marketing]);

      await pick(page, legal);
      await openAgentActions(page);

      await expect(page.getByTestId(/^ai-chat-agent-action-/)).toHaveCount(1);
      await expect(agentAction(page, "info")).toContainText("Agent info");
    });

    // Spec: ai-chat-agent-menu, "What the panel's agent actions open"
    test("Edit agent opens the agent's edit form over the room", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const [legal, marketing] = twoAgents(AiProjectMockAccess.ProjectManager);
      await openChat(page, baseUrl, mockRequest, "roomAdmin", [legal, marketing]);

      await pick(page, legal);
      await openAgentActions(page);
      await agentAction(page, "edit").click();

      // The modal wrapper has no box of its own; its dialog does.
      await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
      await expect(
        page.getByRole("dialog").filter({ hasText: "Edit agent" }),
      ).toBeVisible();
      await expect(page.getByTestId("ai-project-title")).toHaveValue(LEGAL);
      expect(new URL(page.url()).pathname).toMatch(ROOMS_LIST_PATH);
    });

    // Spec: ai-chat-agent-menu, "What the panel's agent actions open"
    test("the agent owner deletes the agent from the panel, and the chat goes back to the default agent", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const projects = twoAgents(AiProjectMockAccess.Owner);
      const [legal] = projects;
      await openChat(page, baseUrl, mockRequest, "roomAdmin", projects, [
        ...aiProjectDeleteHandlers(TEST_PORT, projects),
      ]);

      await pick(page, legal);
      await openAgentActions(page);
      await agentAction(page, "delete").click();

      await expect(page.getByText("Delete this agent?")).toBeVisible();
      await page.getByTestId("delete_ai_agent_confirm").click();

      await expect(picker(page)).toContainText("AI Chat");
      await expect(agentActions(page)).toHaveCount(0);
      expect(projects.some((project) => project.id === legal.id)).toBe(false);

      await openMenu(page);
      await expect(agentRow(page, legal.id)).toHaveCount(0);
      await expect(defaultRow(page)).toHaveAttribute("aria-selected", "true");
    });

    // Spec: ai-chat-agent-menu, "Agent info from the panel"
    test("Agent info opens the Info panel on the agent's Details in place of the chat, and closing it brings the chat back on the agent", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const [legal, marketing] = twoAgents(AiProjectMockAccess.Member);
      await openChat(page, baseUrl, mockRequest, "roomAdmin", [legal, marketing]);

      await pick(page, legal);
      await openAgentActions(page);
      await agentAction(page, "info").click();

      // The user stays in the room list; the chat gives way to the Info panel.
      await expect(infoPanel(page)).toBeVisible();
      await expect(infoPanel(page)).toContainText(LEGAL);
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
      await expect(slot(page)).toHaveAttribute("data-open", "false");
      expect(new URL(page.url()).pathname).toMatch(ROOMS_LIST_PATH);

      // Closing that Info panel brings the chat back, still on the agent.
      await infoPanelToggle(page).click();
      await expect(infoPanel(page)).toBeHidden();
      await expect(slot(page)).toHaveAttribute("data-open", "true");
      await expect(picker(page)).toContainText(LEGAL);
    });
  });

  test.describe("Save as new agent from a picked agent", () => {
    // Spec: ai-chat-agent-menu, "Saving a picked agent as a new one"
    test("a room admin who manages the agent's rooms saves a copy with its model and rooms, and the agent stays as it was", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const projects = twoAgents(AiProjectMockAccess.Member);
      const [legal] = projects;
      const instructions = roomIds(legal.aiProject.instructionsRooms);
      const knowledge = roomIds(legal.aiProject.knowledgeRooms);
      await openChat(page, baseUrl, mockRequest, "roomAdmin", projects, [
        // The room admin manages every room the agent links.
        aiHubRoomGetByIdHandler(TEST_PORT, AI_HUB_ROOMS),
      ]);

      await pick(page, legal);
      await saveAsNewAgent(page, "Legal Reviewer (EU)");

      await expect(toast(page)).toContainText('Agent "Legal Reviewer (EU)" saved');
      const created = projects.find((project) => project.id === CREATED_ID);
      expect(created?.title).toBe("Legal Reviewer (EU)");
      expect(created?.access).toBe(AiProjectMockAccess.Owner);
      expect(created?.aiProject.profile?.id).toBe(SOURCES.profile?.id);
      expect(roomIds(created?.aiProject.instructionsRooms ?? []).sort()).toEqual(
        [...instructions].sort(),
      );
      expect(roomIds(created?.aiProject.knowledgeRooms ?? []).sort()).toEqual(
        [...knowledge].sort(),
      );
      await expect(toast(page).filter({ hasText: "was saved without" })).toHaveCount(0);

      // "Legal Reviewer" is as it was, and the chat still runs on it.
      expect(legal.title).toBe(LEGAL);
      expect(roomIds(legal.aiProject.instructionsRooms)).toEqual(instructions);
      expect(roomIds(legal.aiProject.knowledgeRooms)).toEqual(knowledge);
      await expect(picker(page)).toContainText(LEGAL);
    });

    // Spec: ai-chat-agent-menu, "Rooms the user may not link"
    test("a member who only reads the agent's rooms saves it without them, and a notice names each room left out", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const projects = twoAgents(AiProjectMockAccess.Member);
      const [legal] = projects;
      const linked = [
        ...legal.aiProject.instructionsRooms,
        ...legal.aiProject.knowledgeRooms,
      ];
      await openChat(page, baseUrl, mockRequest, "roomAdmin", projects, [
        // The rooms reach the member only through the agent: read, not managed.
        aiHubRoomGetByIdHandler(TEST_PORT, AI_HUB_ROOMS.map(aiHubRoomAsReader)),
      ]);

      await pick(page, legal);
      await saveAsNewAgent(page, "My legal copy");

      await expect(toast(page).filter({ hasText: 'Agent "My legal copy" saved' })).toBeVisible();
      for (const room of linked) {
        await expect(
          toast(page).filter({
            hasText: `The agent was saved without "${room.title}"`,
          }),
        ).toBeVisible();
      }

      const created = projects.find((project) => project.id === CREATED_ID);
      expect(created?.title).toBe("My legal copy");
      expect(created?.aiProject.profile?.id).toBe(SOURCES.profile?.id);
      expect(created?.aiProject.instructionsRooms).toEqual([]);
      expect(created?.aiProject.knowledgeRooms).toEqual([]);
    });
  });

  // Spec: ai-chat-agent-menu, "Panel header by agent"
  test("on the default agent the header has the title, Chat history, New chat, Expand and Close", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openChat(page, baseUrl, mockRequest, "roomAdmin", twoAgents(AiProjectMockAccess.Member));

    await expect(panelTitleRow(page).getByTestId("ai-chat-agent-picker")).toContainText("AI Chat");
    await expect(toolbar(page).getByRole("button", { name: "Chat history" })).toBeVisible();
    await expect(toolbar(page).getByRole("button", { name: "New chat" })).toBeVisible();
    await expect(page.getByTestId("ai-chat-panel-fullscreen")).toBeVisible();
    await expect(page.getByTestId("ai-chat-panel-close")).toBeVisible();
    await expect(agentActions(page)).toHaveCount(0);
  });
});
