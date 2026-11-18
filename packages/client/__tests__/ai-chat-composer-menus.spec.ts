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

import type { Locator, Page } from "@playwright/test";

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  usersByType,
  aiConfigHandler,
  aiChatDraftSourcesStorage,
  aiChatRequestLog,
  aiChatRoomSkillsHandlers,
  aiChatStoreHandlers,
  aiChatThreadsHandlers,
  aiProjectMock,
  AiProjectMockAccess,
  aiSectionsHandlers,
  AI_PROJECT_WITH_SOURCES,
  rootHandler,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import type {
  AiChatRequestLog,
  AiChatRoomSkillMock,
  AiChatThreadSourceMock,
} from "@docspace/shared/__mocks__/handlers";
import {
  API_PREFIX,
  BASE_URL,
  expectElementScreenshot,
} from "@docspace/shared/__mocks__/e2e";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { http, HttpResponse } from "msw";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The composer's menus for the sources of a chat (`ai-chat-source-menus`):
 * the "+" menu's Skill sets, Knowledge bases and Data sources, and the slash
 * menu, which lists the skills and, under them, the knowledge bases and the
 * data sources.
 *
 * A chat on the default agent (the Rooms list's chat panel) starts with the
 * sources its draft keeps in the browser (`aiChatDraftSourcesStorage`); a
 * chat on an agent (the agent's page) lists the agent's linked rooms. The
 * skills of a set come from ASC.AI.Chat (`aiChatRoomSkillsHandlers`).
 */

const ROOMS_URL = "/rooms/shared/";
const DESKTOP = { width: 1440, height: 1024 };

const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const OWNER_ID = usersByType.owner.id;
const ROOM_ADMIN_ID = usersByType.roomAdmin.id;

const skill = (
  name: string,
  description: string,
  id = `skill-${name}`,
): AiChatRoomSkillMock => ({ id, name, description });

const DOCUMENT_ASSISTANT = { id: 778101, name: "Document assistant" };
const SALES_ASSISTANT = { id: 778102, name: "Sales assistant" };
const EMPTY_SET = { id: 778103, name: "Empty set" };

/** The skills of the default agent's sets, as the lists read them. */
const SKILLS: Record<string, AiChatRoomSkillMock[]> = {
  [DOCUMENT_ASSISTANT.id]: [
    skill("document-summary", "Condenses a document into a few paragraphs."),
    skill("draft-proposal", "Drafts a commercial proposal from a brief."),
    skill("contract-review", "Points out the clauses that need a lawyer."),
  ],
  [SALES_ASSISTANT.id]: [
    skill("ticket-reply", "Writes the reply to a support ticket."),
    skill("sales-summary", "Lists the deals of the week."),
  ],
  [EMPTY_SET.id]: [],
};

const SKILL_LABELS = [
  "Document summary",
  "Draft proposal",
  "Contract review",
  "Ticket reply",
  "Sales summary",
];

const COMPANY_POLICIES = { id: 779201, name: "Company policies" };
const DESIGN_FOR_MARKETING: AiChatThreadSourceMock = {
  id: 5101,
  name: "Design for Marketing",
  kind: "room",
};
const CONTRACTS_2026: AiChatThreadSourceMock = {
  id: 5102,
  name: "Contracts 2026",
  kind: "folder",
};

type Sources = Parameters<typeof aiChatDraftSourcesStorage>[1];

/** The two sets, a knowledge base, a room and a folder. */
const ALL_SOURCES: Sources = {
  skillSets: [DOCUMENT_ASSISTANT, SALES_ASSISTANT],
  knowledgeBases: [COMPANY_POLICIES],
  dataSources: [DESIGN_FOR_MARKETING, CONTRACTS_2026],
};

/** Writes the sources a new chat starts with before the page loads. */
const connectSources = (page: Page, userId: string, sources: Sources) =>
  page.addInitScript((entries: Record<string, string>) => {
    for (const key of Object.keys(entries)) {
      window.localStorage.setItem(key, entries[key]);
    }
  }, aiChatDraftSourcesStorage(userId, sources));

/**
 * A chat without a remembered model raises the "Model updated" notice over
 * the picker; it has nothing to do with the menus, so it is marked as
 * already dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page, userId: string) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${userId}`);

const input = (page: Page) => page.getByTestId("composer-input");

/** The chat panel of the Rooms list: the default agent. */
const openDefaultChat = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await page.getByTestId("ai-chat-button").click();
  await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute(
    "data-open",
    "true",
  );
  await expect(input(page)).toBeVisible();
};

// ---- the "+" menu ----

const plusMenu = (page: Page) => page.getByTestId("attachment-menu");

const openPlusMenu = async (page: Page) => {
  await page.getByTestId("attachment-button").click();
  await expect(plusMenu(page)).toBeVisible();
};

/** Opens a source entry's list beside the "+" menu (desktop: on hover). */
const openPlusList = async (
  page: Page,
  section: "skills" | "knowledge" | "data-sources",
) => {
  if (!(await plusMenu(page).isVisible())) await openPlusMenu(page);
  // The chat panel sits at the window's right edge, so the list opens to
  // the left and covers most of the menu: the entry is pointed at by its
  // chevron, the part the list leaves free.
  const entry = page.getByTestId(`attachment-menu-${section}`);
  const box = await entry.boundingBox();
  await entry.hover({
    position: { x: (box?.width ?? 16) - 8, y: (box?.height ?? 16) / 2 },
  });
  const list = page.getByTestId(`attachment-menu-${section}-submenu`);
  await expect(list).toBeVisible();
  return list;
};

/**
 * Closes the "+" menu and its list. The pointer is moved off the menu
 * first: left on an entry, it would open that entry's list again.
 */
const closePlusMenu = async (page: Page) => {
  await page.mouse.move(1, 1);
  for (let i = 0; i < 3 && (await plusMenu(page).isVisible()); i += 1) {
    await page.keyboard.press("Escape");
  }
  await expect(plusMenu(page)).toBeHidden();
};

// ---- the skill list, shared by "+" > Skill sets and the slash menu ----

const slashMenu = (page: Page) => page.getByTestId("composer-skills-menu");

const openSlashMenu = async (page: Page, query = "") => {
  await input(page).click();
  // A click lands in the middle of a draft; a call starts after its text.
  await page.keyboard.press("ControlOrMeta+End");
  const draft = await input(page).inputValue();
  const separator = draft === "" || /\s$/.test(draft) ? "" : " ";
  await page.keyboard.type(`${separator}/${query}`);
  await expect(slashMenu(page)).toBeVisible();
  return slashMenu(page);
};

const sets = (list: Locator) => list.getByTestId("composer-skills-menu-set");
const skills = (list: Locator) => list.getByTestId("composer-skills-menu-item");
const skillRow = (list: Locator, label: string) =>
  skills(list).filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) });
const setRow = (list: Locator, name: string) =>
  sets(list).filter({ hasText: name });
const setGroup = (list: Locator, name: string) =>
  list.getByRole("group", { name });

const setNames = (list: Locator) => sets(list).allInnerTexts();
const skillLabels = (list: Locator) =>
  list.getByTestId("composer-skills-menu-item-name").allInnerTexts();

const trimmed = (texts: string[]) => texts.map((text) => text.trim());

/** The slash menu's section of the knowledge bases or of the data sources. */
const slashSection = (page: Page, kind: "knowledge" | "data-sources") =>
  slashMenu(page).getByTestId(`composer-skills-menu-${kind}`);

const send = async (page: Page, text: string) => {
  await input(page).fill(text);
  await page.getByTestId("send-button").click();
};

/**
 * The mocks of a chat on the default agent. Each `mockRequest.use` call puts
 * its handlers in front of the earlier ones, while within one call the first
 * matching handler wins; so the portal comes first, then `extra` (which
 * overrides it), and last the skills and threads, which must win over the
 * `files/rooms*` of the rooms list and the empty thread list of the chat
 * stores.
 */
const useDefaultChat = (
  mockRequest: WorkerFixture,
  skillsByRoom: Record<string, AiChatRoomSkillMock[]> = SKILLS,
  log?: AiChatRequestLog,
  extra: Parameters<WorkerFixture["use"]> = [],
) => {
  mockRequest.use(
    rootHandler(TEST_PORT),
    filesSettingsHandler(TEST_PORT),
    settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
    selfActivationStatusHandler(TEST_PORT, null, false, true),
    selfByTypeHandler(TEST_PORT, "owner", "en-US"),
    aiConfigHandler(TEST_PORT),
    roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
    ...aiChatStoreHandlers(TEST_PORT),
  );
  if (extra.length > 0) mockRequest.use(...extra);
  mockRequest.use(
    ...aiChatRoomSkillsHandlers(TEST_PORT, skillsByRoom),
    ...aiChatThreadsHandlers(TEST_PORT, {
      reply: { text: "Done.", title: "Done" },
      log,
    }),
  );
};

test.describe("AI chat composer: the default agent", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await dismissModelUpdatedNotice(page, OWNER_ID);
  });

  // Spec: ai-chat-source-menus, "Composer toolbar"
  test("Two skill sets connected: the toolbar shows +, the model picker and Send, with no badge and no other button", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    // The sets are connected: their skills are listed.
    await openSlashMenu(page);
    await expect(skills(slashMenu(page))).toHaveCount(SKILL_LABELS.length);
    await page.keyboard.press("Escape");
    await input(page).fill("");

    const composer = page.getByTestId("composer");
    await expect(composer.getByTestId("attachment-button")).toBeVisible();
    await expect(composer.getByTestId("model-selector")).toBeVisible();
    await expect(composer.getByTestId("send-button")).toBeVisible();
    await expect(
      composer.getByRole("button", {
        name: /skill sets|knowledge bases|commands/i,
      }),
    ).toHaveCount(0);

    await expectElementScreenshot(composer, [
      "desktop",
      "ai-chat-composer-menus",
      "composer-toolbar.png",
    ]);
  });

  // Spec: ai-chat-source-menus, "Sources in the \"+\" menu"
  test("Desktop: the + menu lists the sources after its file entries, and Data sources opens its list beside the menu", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    await openPlusMenu(page);

    // Skill sets and Knowledge bases in one group, Data sources in the
    // next, then the web search switch.
    const order = [
      "attachment-menu-skills",
      "attachment-menu-knowledge",
      "attachment-menu-data-sources",
      "attachment-menu-web-search",
    ];
    const tops: number[] = [];
    for (const id of order) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box, `${id} is in the menu`).not.toBeNull();
      tops.push(box!.y);
    }
    expect(tops).toEqual([...tops].sort((a, b) => a - b));

    // Beside the menu, not in its place: the menu stays open, and the list
    // reaches past its side. The panel at the window's right edge leaves no
    // room on either side, so the list opens to the left over the menu.
    const list = await openPlusList(page, "data-sources");
    await expect(plusMenu(page)).toBeVisible();
    const menuBox = await plusMenu(page).boundingBox();
    const listBox = await list.boundingBox();
    expect(listBox!.x).toBeLessThan(menuBox!.x);
  });

  // Spec: ai-chat-source-menus, "Skill sets list"
  test("Two sets: + > Skill sets lists both under the caption and the hint, each with its skills", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "skills");

    await expect(list.getByTestId("composer-skills-menu-title")).toHaveText(
      "Skill sets",
    );
    await expect(list.getByTestId("composer-skills-menu-hint")).toBeVisible();
    await expect.poll(async () => trimmed(await setNames(list))).toEqual([
      DOCUMENT_ASSISTANT.name,
      SALES_ASSISTANT.name,
    ]);
    await expect
      .poll(async () =>
        trimmed(
          await setGroup(list, DOCUMENT_ASSISTANT.name)
            .getByTestId("composer-skills-menu-item-name")
            .allInnerTexts(),
        ),
      )
      .toEqual(["Document summary", "Draft proposal", "Contract review"]);
    await expect
      .poll(async () =>
        trimmed(
          await setGroup(list, SALES_ASSISTANT.name)
            .getByTestId("composer-skills-menu-item-name")
            .allInnerTexts(),
        ),
      )
      .toEqual(["Ticket reply", "Sales summary"]);
  });

  // Spec: ai-chat-source-menus, "Skill sets list"
  test("Set without skills: a connected set that holds no skill is listed as a group with no rows", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, {
      skillSets: [DOCUMENT_ASSISTANT, EMPTY_SET],
    });

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "skills");

    await expect(setRow(list, EMPTY_SET.name)).toBeVisible();
    await expect(skills(list)).toHaveCount(3);
    await expect(
      setGroup(list, EMPTY_SET.name).getByTestId("composer-skills-menu-item"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Calling a skill from a list"
  test("Pick from the + menu: the call is added to the draft and ticked in both lists, and a second pick takes it out", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    await input(page).fill("Check this");
    const list = await openPlusList(page, "skills");

    const review = skillRow(list, "Contract review");
    await review.click();
    await expect(input(page)).toHaveValue("Check this /contract-review ");
    // The list stays open on the tick; no "Added" label.
    await expect(
      review.getByTestId("composer-skills-menu-item-check"),
    ).toBeVisible();
    await expect(list).not.toContainText("Added");

    // The slash menu ticks it too.
    await closePlusMenu(page);
    await openSlashMenu(page);
    await expect(
      skillRow(slashMenu(page), "Contract review").getByTestId(
        "composer-skills-menu-item-check",
      ),
    ).toBeVisible();
    await expect(
      slashMenu(page).getByTestId("composer-skills-menu-item-check"),
    ).toHaveCount(1);
    await page.keyboard.press("Backspace");

    // Pick a called skill: its call leaves the draft and the tick goes.
    const again = await openPlusList(page, "skills");
    await skillRow(again, "Contract review").click();
    await expect(input(page)).not.toHaveValue(/\/contract-review/);
    await expect(
      again.getByTestId("composer-skills-menu-item-check"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Slash menu"
  test("Open the menu: the sets with their skills, then the knowledge base, then the folder, each section ending with its Manage row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, {
      skillSets: [DOCUMENT_ASSISTANT, SALES_ASSISTANT],
      knowledgeBases: [COMPANY_POLICIES],
      dataSources: [CONTRACTS_2026],
    });

    await openDefaultChat(page, baseUrl);
    const menu = await openSlashMenu(page);

    await expect(menu.getByTestId("composer-skills-menu-title")).toHaveText(
      "Skill sets",
    );
    await expect(menu.getByTestId("composer-skills-menu-hint")).toBeVisible();
    await expect.poll(async () => trimmed(await setNames(menu))).toEqual([
      DOCUMENT_ASSISTANT.name,
      SALES_ASSISTANT.name,
    ]);
    await expect.poll(async () => trimmed(await skillLabels(menu))).toEqual(
      SKILL_LABELS,
    );
    await expect(menu.getByTestId("composer-skills-menu-manage")).toHaveText(
      "Manage skill sets...",
    );

    const knowledge = slashSection(page, "knowledge");
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-item"),
    ).toHaveText([COMPANY_POLICIES.name]);
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-manage"),
    ).toHaveText("Manage knowledge bases...");

    const dataSources = slashSection(page, "data-sources");
    await expect(
      dataSources.getByTestId("composer-skills-menu-data-sources-item"),
    ).toHaveText([CONTRACTS_2026.name]);
    await expect(
      dataSources.getByTestId("composer-skills-menu-data-sources-manage"),
    ).toHaveText("Manage sources...");

    // The skills, then the knowledge bases, then the data sources.
    const manageSkills = await menu
      .getByTestId("composer-skills-menu-manage")
      .boundingBox();
    const knowledgeBox = await knowledge.boundingBox();
    const dataSourcesBox = await dataSources.boundingBox();
    expect(knowledgeBox!.y).toBeGreaterThan(manageSkills!.y);
    expect(dataSourcesBox!.y).toBeGreaterThan(knowledgeBox!.y);
  });

  // Spec: ai-chat-source-menus, "Filtering the slash menu"
  test("Filter: /sum lists only the matching skills under their sets, and neither the Knowledge bases nor the Data sources section", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const menu = await openSlashMenu(page, "sum");

    await expect.poll(async () => trimmed(await skillLabels(menu))).toEqual([
      "Document summary",
      "Sales summary",
    ]);
    await expect.poll(async () => trimmed(await setNames(menu))).toEqual([
      DOCUMENT_ASSISTANT.name,
      SALES_ASSISTANT.name,
    ]);
    await expect(slashSection(page, "knowledge")).toHaveCount(0);
    await expect(slashSection(page, "data-sources")).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Keyboard in the slash menu"
  test("Arrow past the skills: down from the last skill goes back to the first, not to a knowledge base", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const menu = await openSlashMenu(page);
    const rows = skills(menu);
    await expect(rows).toHaveCount(SKILL_LABELS.length);
    const last = rows.nth(SKILL_LABELS.length - 1);

    // Up from the first lands on the last, down from there on the first.
    await expect(rows.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(last).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(rows.first()).toHaveAttribute("aria-selected", "true");
    await expect(menu.locator('[aria-selected="true"]')).toHaveCount(1);

    // The rows of the knowledge bases and data sources are no options.
    await expect(slashSection(page, "knowledge").getByRole("option")).toHaveCount(
      0,
    );
    await expect(
      slashSection(page, "data-sources").getByRole("option"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Knowledge bases and data sources in the slash menu"
  test("Disconnect a folder from the slash menu: the folder leaves, the menu stays open, and the next round does not read it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const log = aiChatRequestLog();
    useDefaultChat(mockRequest, SKILLS, log);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    await openSlashMenu(page);
    const knowledgeBin = slashSection(page, "knowledge").getByRole("button", {
      name: `Disconnect knowledge base: ${COMPANY_POLICIES.name}`,
    });
    await expect(knowledgeBin).toBeVisible();

    await slashSection(page, "data-sources")
      .getByRole("button", { name: `Disconnect folder: ${CONTRACTS_2026.name}` })
      .click();

    await expect(
      slashSection(page, "data-sources").getByTestId(
        "composer-skills-menu-data-sources-item",
      ),
    ).toHaveText([DESIGN_FOR_MARKETING.name]);
    await expect(slashMenu(page)).toBeVisible();
    await expect(input(page)).toBeFocused();

    await send(page, "Which contracts expire this year?");
    await expect.poll(() => log.send.length).toBe(1);
    const folders = (log.send[0].actionArgs?.folderContexts ?? []) as {
      id: string;
    }[];
    expect(folders.map((folder) => folder.id)).toEqual([
      String(DESIGN_FOR_MARKETING.id),
    ]);
  });

  // Spec: ai-chat-source-menus, "Skill calls in the draft"
  test("Two calls: both are coloured inside the text and no chip row appears above the input", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    await openSlashMenu(page, "document-s");
    await page.keyboard.press("Enter");
    await openSlashMenu(page, "draft");
    await page.keyboard.press("Enter");
    await expect(input(page)).toHaveValue("/document-summary /draft-proposal ");

    const highlights = page.getByTestId("composer-input-highlights");
    // The highlight layer marks a call with the class of a sent message's
    // call, without its test id.
    await expect(highlights.locator(".aui-skill-ref")).toHaveText([
      "/document-summary",
      "/draft-proposal",
    ]);
    await expect(
      page.getByTestId("composer").getByTestId("file-item"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Removing a skill set"
  test("Remove from the slash menu: the set and its skills leave the list, the list stays open, and the next round runs without them", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const log = aiChatRequestLog();
    useDefaultChat(mockRequest, SKILLS, log);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const menu = await openSlashMenu(page);
    // The bin is there without pointing at the row.
    const bin = setRow(menu, SALES_ASSISTANT.name).getByTestId(
      "composer-skills-menu-set-remove",
    );
    await expect(bin).toBeVisible();
    await expect(bin).toHaveAttribute("aria-label", "Disconnect room");
    await bin.click();

    await expect.poll(async () => trimmed(await setNames(menu))).toEqual([
      DOCUMENT_ASSISTANT.name,
    ]);
    await expect.poll(async () => trimmed(await skillLabels(menu))).toEqual([
      "Document summary",
      "Draft proposal",
      "Contract review",
    ]);
    await expect(menu).toBeVisible();
    await expect(input(page)).toBeFocused();

    await send(page, "Summarize the open tickets");
    await expect.poll(() => log.send.length).toBe(1);
    const rooms = (log.send[0].actionArgs?.contextRooms ?? []) as {
      id: string;
    }[];
    expect(rooms.map((room) => room.id)).toEqual([
      String(DOCUMENT_ASSISTANT.id),
    ]);
  });

  // Spec: ai-chat-source-menus, "Removing a skill set"
  test("A called skill of the removed set: its call leaves the draft", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    await openSlashMenu(page, "ticket");
    await page.keyboard.press("Enter");
    await page.keyboard.type("hi /");
    await expect(input(page)).toHaveValue("/ticket-reply hi /");
    await expect(slashMenu(page)).toBeVisible();

    await setRow(slashMenu(page), SALES_ASSISTANT.name)
      .getByTestId("composer-skills-menu-set-remove")
      .click();
    await expect(input(page)).toHaveValue("hi /");
  });

  // Spec: ai-chat-source-menus, "Removing a skill set"
  test("A call shared with another set: removing one of two sets that each hold a ticked summary takes one call out and keeps the other", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest, {
      [DOCUMENT_ASSISTANT.id]: [
        skill("summary", "Summarizes a document.", "skill-doc-summary"),
      ],
      [SALES_ASSISTANT.id]: [
        skill("summary", "Summarizes the deals.", "skill-sales-summary"),
      ],
    });
    await connectSources(page, OWNER_ID, {
      skillSets: [DOCUMENT_ASSISTANT, SALES_ASSISTANT],
    });

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "skills");
    await setGroup(list, DOCUMENT_ASSISTANT.name)
      .getByTestId("composer-skills-menu-item")
      .click();
    await setGroup(list, SALES_ASSISTANT.name)
      .getByTestId("composer-skills-menu-item")
      .click();
    await expect(input(page)).toHaveValue("/summary /summary ");
    await expect(list.getByTestId("composer-skills-menu-item-check")).toHaveCount(
      2,
    );

    await setRow(list, DOCUMENT_ASSISTANT.name)
      .getByTestId("composer-skills-menu-set-remove")
      .click();
    await expect(input(page)).toHaveValue(/^\s*\/summary\s*$/);
    await expect(list.getByTestId("composer-skills-menu-item-check")).toHaveCount(
      1,
    );
  });

  // Spec: ai-chat-source-menus, "Knowledge bases list"
  test("Remove a base: the row goes, the list stays open, and the next round does not search that base", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const log = aiChatRequestLog();
    useDefaultChat(mockRequest, SKILLS, log);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "knowledge");
    const rows = list.getByTestId("attachment-menu-knowledge-item");
    await expect(rows.filter({ hasText: COMPANY_POLICIES.name })).toHaveCount(1);

    await list
      .getByRole("button", { name: `Remove ${COMPANY_POLICIES.name}` })
      .click();
    await expect(rows.filter({ hasText: COMPANY_POLICIES.name })).toHaveCount(0);
    await expect(list).toBeVisible();
    await expect(list).toContainText("Manage knowledge bases...");

    await closePlusMenu(page);
    await send(page, "What is the leave policy?");
    await expect.poll(() => log.send.length).toBe(1);
    expect(log.send[0].actionArgs?.knowledgeRooms).toBeUndefined();
  });

  // Spec: ai-chat-source-menus, "Knowledge bases with vectorization off"
  test("One base connected earlier: with vectorization off both menus show it with its remove control and no Manage knowledge bases row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest, SKILLS, undefined, [
      aiConfigHandler(TEST_PORT, false, false, true),
    ]);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "knowledge");
    await expect(
      list.getByTestId("attachment-menu-knowledge-item").filter({
        hasText: COMPANY_POLICIES.name,
      }),
    ).toHaveCount(1);
    await expect(
      list.getByRole("button", { name: `Remove ${COMPANY_POLICIES.name}` }),
    ).toBeVisible();
    await expect(list).not.toContainText("Manage knowledge bases...");

    await closePlusMenu(page);
    await openSlashMenu(page);
    const knowledge = slashSection(page, "knowledge");
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-item"),
    ).toHaveText([COMPANY_POLICIES.name]);
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-remove"),
    ).toBeVisible();
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-manage"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Data sources list"
  test("A room and a folder: two flat rows, the room first and the folder second, each with its remove control", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, ALL_SOURCES);

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "data-sources");
    // The Manage sources... row under them shares the rows' test id.
    const rows = list
      .getByTestId("attachment-menu-data-sources-item")
      .filter({ hasNotText: "Manage sources..." });
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(DESIGN_FOR_MARKETING.name);
    await expect(rows.nth(1)).toContainText(CONTRACTS_2026.name);
    for (const source of [DESIGN_FOR_MARKETING, CONTRACTS_2026]) {
      await expect(
        list.getByRole("button", { name: `Remove ${source.name}` }),
      ).toBeVisible();
    }
    // No further level under a row.
    await expect(
      list.getByTestId("attachment-menu-data-sources-item-submenu-button"),
    ).toHaveCount(0);

    // The room icon on the room, the folder icon on the folder.
    await expectElementScreenshot(list, [
      "desktop",
      "ai-chat-composer-menus",
      "data-sources-list.png",
    ]);
  });

  // Spec: ai-chat-source-menus, "Data sources limit"
  test("Twenty connected: both menus show them with their remove controls and no Manage sources row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const twenty = Array.from({ length: 20 }, (_, index) => ({
      id: 5200 + index,
      name: `Folder ${index + 1}`,
      kind: "folder" as const,
    }));
    useDefaultChat(mockRequest);
    await connectSources(page, OWNER_ID, {
      skillSets: [DOCUMENT_ASSISTANT],
      dataSources: twenty,
    });

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "data-sources");
    await expect(list.getByTestId("attachment-menu-data-sources-item")).toHaveCount(
      20,
    );
    await expect(
      list.getByTestId("attachment-menu-data-sources-item-action"),
    ).toHaveCount(20);
    await expect(list).not.toContainText("Manage sources...");

    await closePlusMenu(page);
    await openSlashMenu(page);
    const dataSources = slashSection(page, "data-sources");
    await expect(
      dataSources.getByTestId("composer-skills-menu-data-sources-item"),
    ).toHaveCount(20);
    await expect(
      dataSources.getByTestId("composer-skills-menu-data-sources-remove"),
    ).toHaveCount(20);
    await expect(
      dataSources.getByTestId("composer-skills-menu-data-sources-manage"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Manage rows"
  test("Manage knowledge bases: the Knowledge room picker opens with the connected bases ticked", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const [connected] = AI_PROJECT_WITH_SOURCES.aiProject.knowledgeRooms;
    useDefaultChat(mockRequest, SKILLS, undefined, aiSectionsHandlers(TEST_PORT));
    await connectSources(page, OWNER_ID, {
      skillSets: [DOCUMENT_ASSISTANT],
      knowledgeBases: [{ id: connected.id, name: connected.title }],
    });

    await openDefaultChat(page, baseUrl);
    const list = await openPlusList(page, "knowledge");
    await list.getByText("Manage knowledge bases...").click();

    const picker = page
      .getByTestId("aside")
      .filter({ hasText: "Knowledge bases" })
      .first();
    await expect(picker).toBeVisible();
    const item = picker
      .locator('[data-testid^="selector-item-"]')
      .filter({ hasText: connected.title })
      .first();
    await expect(item).toBeVisible();
    await expect(item.locator('input[type="checkbox"]')).toBeChecked();
  });
});

/**
 * A chat that runs on an agent: its skill sets and knowledge bases are the
 * agent's linked rooms (`Sales playbook` and `Legal tone`, `Contracts
 * archive`). The agent is built fresh for every test, as the source handlers
 * change the project they are given.
 */
test.describe("AI chat composer: a chat on an agent", () => {
  const LINKED = AI_PROJECT_WITH_SOURCES.aiProject;
  const [SALES_PLAYBOOK, LEGAL_TONE] = LINKED.instructionsRooms;
  const [CONTRACTS_ARCHIVE] = LINKED.knowledgeRooms;

  const AGENT_SKILLS: Record<string, AiChatRoomSkillMock[]> = {
    [SALES_PLAYBOOK.id]: [
      skill("pitch-builder", "Builds a pitch from the product sheet."),
      skill("follow-up-writer", "Writes the follow-up after a call."),
    ],
    [LEGAL_TONE.id]: [skill("legal-tone", "Keeps the house legal style.")],
  };

  const agentWith = (
    access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
  ) =>
    aiProjectMock({
      id: 777430,
      title: "Legal Reviewer",
      color: "FF6680",
      access,
      instructionsRooms: LINKED.instructionsRooms.slice(),
      knowledgeRooms: LINKED.knowledgeRooms.slice(),
    });

  /**
   * The agent's page, signed in as its owner or, for an Agent manager and a
   * Member, as a room admin; `overrides` go on top of the agent's handlers.
   */
  const openAgentChat = async (
    page: Page,
    baseUrl: string,
    mockRequest: WorkerFixture,
    access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
    overrides: Parameters<WorkerFixture["use"]> = [],
  ) => {
    const owner = access === AiProjectMockAccess.Owner;
    const agent = agentWith(access);
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, owner ? "owner" : "roomAdmin", "en-US"),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT, [agent]),
    );
    // A later use() goes first: the skills and threads win over the
    // section's room reads and the stores' empty thread list.
    mockRequest.use(
      ...aiChatRoomSkillsHandlers(TEST_PORT, AGENT_SKILLS),
      ...aiChatThreadsHandlers(TEST_PORT),
    );
    if (overrides.length > 0) mockRequest.use(...overrides);
    await dismissModelUpdatedNotice(page, owner ? OWNER_ID : ROOM_ADMIN_ID);
    await page.goto(`${baseUrl}${agentUrl(agent.id)}`);
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    await expect(input(page)).toBeVisible();
    return agent;
  };

  const AGENT_SET_NAMES = [SALES_PLAYBOOK.title, LEGAL_TONE.title];
  const AGENT_SKILL_LABELS = ["Pitch builder", "Follow up writer", "Legal tone"];

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-chat-source-menus, "Lists of a chat on an agent"
  test("Agent manager in the + menu: Manage skill sets opens the agent's edit form, not the room picker", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openAgentChat(
      page,
      baseUrl,
      mockRequest,
      AiProjectMockAccess.ProjectManager,
    );

    const list = await openPlusList(page, "skills");
    await expect.poll(async () => trimmed(await setNames(list))).toEqual(
      AGENT_SET_NAMES,
    );
    await list.getByTestId("composer-skills-menu-manage").click();

    // The modal wrapper has no box of its own; its dialog does.
    await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
    await expect(
      page.getByRole("dialog").filter({ hasText: "Edit agent" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("aside").filter({ hasText: "Skill sets" }),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Lists of a chat on an agent"
  test("Member: the agent's skill sets and skills are listed with no remove control and no Manage skill sets row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openAgentChat(page, baseUrl, mockRequest, AiProjectMockAccess.Member);

    const list = await openPlusList(page, "skills");
    await expect.poll(async () => trimmed(await setNames(list))).toEqual(
      AGENT_SET_NAMES,
    );
    await expect.poll(async () => trimmed(await skillLabels(list))).toEqual(
      AGENT_SKILL_LABELS,
    );
    await expect(list.getByTestId("composer-skills-menu-set-remove")).toHaveCount(
      0,
    );
    await expect(list.getByTestId("composer-skills-menu-manage")).toHaveCount(0);

    await closePlusMenu(page);
    const menu = await openSlashMenu(page);
    await expect.poll(async () => trimmed(await skillLabels(menu))).toEqual(
      AGENT_SKILL_LABELS,
    );
    await expect(menu.getByTestId("composer-skills-menu-set-remove")).toHaveCount(
      0,
    );
    await expect(menu.getByTestId("composer-skills-menu-manage")).toHaveCount(0);
    // No one may drop a knowledge base from an agent's chat, and a Member
    // may not open the agent's form.
    await expect(
      slashSection(page, "knowledge").getByTestId(
        "composer-skills-menu-knowledge-item",
      ),
    ).toHaveText([CONTRACTS_ARCHIVE.title]);
    await expect(
      menu.getByTestId("composer-skills-menu-knowledge-remove"),
    ).toHaveCount(0);
    await expect(
      menu.getByTestId("composer-skills-menu-knowledge-manage"),
    ).toHaveCount(0);
  });

  // Spec: ai-chat-source-menus, "Lists of a chat on an agent"
  test("Agent manager and the knowledge bases of the slash menu: listed with no bin, and Manage knowledge bases opens the agent's edit form", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openAgentChat(
      page,
      baseUrl,
      mockRequest,
      AiProjectMockAccess.ProjectManager,
    );

    await openSlashMenu(page);
    const knowledge = slashSection(page, "knowledge");
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-item"),
    ).toHaveText([CONTRACTS_ARCHIVE.title]);
    await expect(
      knowledge.getByTestId("composer-skills-menu-knowledge-remove"),
    ).toHaveCount(0);

    await knowledge.getByTestId("composer-skills-menu-knowledge-manage").click();
    // The modal wrapper has no box of its own; its dialog does.
    await expect(page.getByTestId("ai-project-dialog")).toBeAttached();
    await expect(
      page.getByRole("dialog").filter({ hasText: "Edit agent" }),
    ).toBeVisible();
  });

  // Spec: ai-chat-source-menus, "Slash menu of a chat on an agent"
  test("Agent manager in the slash menu: Manage skill sets opens the Instructions room picker with the agent's sets ticked, the menu staying open under it", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openAgentChat(
      page,
      baseUrl,
      mockRequest,
      AiProjectMockAccess.ProjectManager,
    );

    const menu = await openSlashMenu(page);
    // Each set keeps its remove control.
    await expect(menu.getByTestId("composer-skills-menu-set-remove")).toHaveCount(
      2,
    );
    await menu.getByTestId("composer-skills-menu-manage").click();

    const picker = page
      .getByTestId("aside")
      .filter({ hasText: "Skill sets" })
      .first();
    await expect(picker).toBeVisible();
    for (const room of [SALES_PLAYBOOK, LEGAL_TONE]) {
      const item = picker
        .locator('[data-testid^="selector-item-"]')
        .filter({ hasText: room.title })
        .first();
      await expect(item.locator('input[type="checkbox"]')).toBeChecked();
    }
    await expect(page.getByTestId("ai-project-dialog")).toHaveCount(0);
    await expect(slashMenu(page)).toBeAttached();
  });

  // Spec: ai-chat-source-menus, "Saving a skill set change to the agent"
  test("Remove a set: the agent owner's removal in the slash menu unlinks the room from the agent", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const agent = await openAgentChat(
      page,
      baseUrl,
      mockRequest,
      AiProjectMockAccess.Owner,
    );

    const menu = await openSlashMenu(page);
    const unlinked = page.waitForRequest(
      (request) =>
        request.method() === "DELETE" &&
        request.url().includes(`/files/rooms/${agent.id}/sources`),
    );
    await setRow(menu, SALES_PLAYBOOK.title)
      .getByTestId("composer-skills-menu-set-remove")
      .click();

    // Only what changed is written: the one set, not the others.
    const request = await unlinked;
    expect(request.postDataJSON()).toEqual({ roomIds: [SALES_PLAYBOOK.id] });
    await expect.poll(async () => trimmed(await setNames(menu))).toEqual([
      LEGAL_TONE.title,
    ]);
    await expect
      .poll(() => agent.aiProject.instructionsRooms.map((room) => room.id))
      .toEqual([LEGAL_TONE.id]);
  });

  // Spec: ai-chat-source-menus, "Order and failure of skill set saves"
  test("Refused save: an error is shown and the set is listed in the chat again", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // The server refuses to unlink the room.
    const refuse = http.delete(
      `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/files/rooms/:id/sources`,
      () =>
        HttpResponse.json(
          { error: { message: "You don't have enough permission" } },
          { status: 403 },
        ),
    );
    await openAgentChat(page, baseUrl, mockRequest, AiProjectMockAccess.Owner, [
      refuse,
    ]);

    const menu = await openSlashMenu(page);
    await setRow(menu, SALES_PLAYBOOK.title)
      .getByTestId("composer-skills-menu-set-remove")
      .click();

    await expect(page.getByTestId("toast-content").first()).toBeVisible();
    await expect.poll(async () => trimmed(await setNames(menu))).toEqual(
      AGENT_SET_NAMES,
    );
  });
});
