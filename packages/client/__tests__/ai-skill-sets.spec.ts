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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiSectionsHandlers,
  aiSkillSetsHandlers,
  AI_PROJECTS,
  DOCUMENT_SUMMARY,
  skillSetsMock,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import type { SkillSetMock } from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Skill sets of the AI Chat section (`ai-skill-sets`): the list of the
 * Instructions rooms with its columns and sort, a set's Details with its
 * skills, an opened set listing its skills by name, description and date, a
 * skill's Details with its command and "View instructions", the Edit skill
 * dialog with its Markdown toolbar and save, and "Use in chat" on the rows.
 *
 * The stock sets are "Document assistant" (the Administrator's, three
 * skills, "Document summary" first), "Legal tone" and "Sales assistant";
 * each test gets a fresh copy, as a save changes the files.
 */

const AI_ROOMS_URL = "/ai-rooms/filter";

const setUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const DESKTOP = { width: 1440, height: 1024 };

const table = (page: Page) => page.getByTestId("table-body");
const header = (page: Page) => page.getByTestId("table-header");
const sidebar = (page: Page) => page.locator("#article-container");
const toast = (page: Page) => page.getByTestId("toast-content");
const properties = (page: Page) =>
  page.getByTestId("info_panel_details_properties");
/** A property of the Details tab, by its id (the property's key). */
const property = (page: Page, id: string) =>
  properties(page).locator(`[id="${id}"]`);

const row = (page: Page, title: string) =>
  table(page).locator("[data-testid^=table-row-]").filter({ hasText: title });

/** The titles of the listed rows, top to bottom, as far as `titles` names them. */
const rowOrder = async (page: Page, titles: string[]) => {
  const texts = await table(page)
    .locator("[data-testid^=table-row-]")
    .allTextContents();
  return texts
    .map((text) => titles.find((title) => text.includes(title)))
    .filter(Boolean);
};

/** The editor of the Edit skill dialog and of the instructions view. */
const editor = (page: Page) =>
  page.getByTestId("generate-skill-editor").locator(".cm-content");
const editorLine = (page: Page, index: number) =>
  editor(page).locator(".cm-line").nth(index);

const documentAssistant = (sets: SkillSetMock[]) =>
  sets.find((set) => set.title === "Document assistant")!;

/** Opens the Skill sets list from the section's sidebar entry. */
const openSkillSets = async (page: Page, baseUrl: string) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
  await expect(table(page)).toBeVisible();
  await sidebar(page).getByText("Skill sets", { exact: true }).click();
  await expect(table(page)).toContainText("Document assistant");
};

/** Opens a skill set on its own page. */
const openSet = async (page: Page, baseUrl: string, set: SkillSetMock) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${baseUrl}${setUrl(set.id)}`);
  await expect(table(page)).toBeVisible();
  // The descriptions are read from the files: the rows are drawn once they are.
  await expect(table(page)).toContainText(DOCUMENT_SUMMARY.description);
};

/** Opens the Info panel on its Details tab. */
const openDetails = async (page: Page) => {
  const detailsTab = page.getByTestId("info_details_tab");
  if (!(await detailsTab.isVisible().catch(() => false))) {
    await page.locator(".info-panel-toggle").click();
    await expect(detailsTab).toBeVisible({ timeout: 10000 });
  }
  await detailsTab.click();
};

/** Selects a row by a cell that is not its name, which would open it. */
const selectRow = async (rowLocator: Locator, cell: RegExp) => {
  await rowLocator.getByTestId(cell).first().click();
};

/** Opens the Edit skill dialog from a skill's menu. */
const openEditSkill = async (page: Page, title: string) => {
  await row(page, title).getByTestId("context-menu-button").first().click();
  await page.locator("#option_edit-skill").click();
  await expect(page.getByTestId("edit-skill-name")).toBeVisible();
  // The instructions are read from the file before the editor is drawn.
  await expect(editor(page)).toBeVisible();
};

/** Puts the caret at the start of a line of the editor and selects the line. */
const selectEditorLine = async (page: Page, index: number) => {
  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+Home");
  for (let i = 0; i < index; i += 1) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
};

const selectedText = (page: Page) =>
  page.evaluate(() => document.getSelection()?.toString() ?? "");

test.describe("AI Chat: Skill sets", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS]),
    );
  });

  test.describe("the list", () => {
    let sets: SkillSetMock[];

    test.beforeEach(({ mockRequest }) => {
      sets = skillSetsMock();
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSkillSetsHandlers(TEST_PORT, sets),
      );
    });

    // Spec: ai-skill-sets, "Columns of the Skill sets list"
    test("Skill sets in the table", async ({ page, baseUrl }) => {
      await openSkillSets(page, baseUrl);

      // Name, Skills, Owner and Last modified, in that order.
      await expect(header(page).getByTestId("column-Name")).toContainText(
        "Name",
      );
      await expect(
        header(page).getByTestId("column-SkillsSkillSets"),
      ).toContainText("Skills");
      await expect(
        header(page).getByTestId("column-OwnerSkillSets"),
      ).toContainText("Owner");
      await expect(
        header(page).getByTestId("column-ActivitySkillSets"),
      ).toContainText("Last modified");
      await expect(header(page)).toHaveText(
        /Name[\s\S]*Skills[\s\S]*Owner[\s\S]*Last modified/,
      );

      // "Document assistant" holds three skills and is the Administrator's.
      const assistant = row(page, "Document assistant");
      await expect(
        assistant.getByTestId(/^skill-sets-cell-skills-/),
      ).toHaveText("3");
      await expect(
        assistant.getByTestId(/^skill-sets-cell-owner-/),
      ).toContainText("Administrator");
      await expect(
        assistant.getByTestId(/^skill-sets-cell-activity-/),
      ).not.toBeEmpty();
      await expect(
        row(page, "Sales assistant").getByTestId(/^skill-sets-cell-skills-/),
      ).toHaveText("2");

      await expectScreenshot(page, [
        "desktop",
        "ai-skill-sets",
        "skill-sets-list.png",
      ]);
    });

    // Spec: ai-skill-sets, "Columns of the Skill sets list"
    test("Sorted by owner", async ({ page, baseUrl }) => {
      await openSkillSets(page, baseUrl);
      const titles = sets.map((set) => set.title);
      // Newest first by default.
      await expect
        .poll(() => rowOrder(page, titles))
        .toEqual(["Document assistant", "Legal tone", "Sales assistant"]);

      const sorted = page.waitForRequest(
        (request) =>
          request.url().includes("/files/rooms?") &&
          new URL(request.url()).searchParams.get("sortBy") === "Author",
      );
      await header(page)
        .getByTestId("column-OwnerSkillSets")
        .getByText("Owner", { exact: true })
        .click();
      const request = await sorted;

      // Administrator, Jane Reviewer, Zoe Counsel - or the other way round.
      const byOwner = ["Document assistant", "Sales assistant", "Legal tone"];
      const ascending =
        new URL(request.url()).searchParams.get("sortOrder") === "ascending";
      await expect
        .poll(() => rowOrder(page, titles))
        .toEqual(ascending ? byOwner : [...byOwner].reverse());
    });

    // Spec: ai-skill-sets, "Skill set in the Info panel"
    test("Skill set selected", async ({ page, baseUrl }) => {
      await openSkillSets(page, baseUrl);

      await selectRow(
        row(page, "Document assistant"),
        /^skill-sets-cell-skills-/,
      );
      await openDetails(page);

      await expect(property(page, "Content")).toContainText("Skills: 3");
      await expect(property(page, "Owner")).toContainText("Administrator");
      await expect(property(page, "Date modified")).toBeVisible();
      await expect(property(page, "Last modified by")).toBeVisible();
      await expect(property(page, "Creation date")).toBeVisible();
      // No room type and no storage size for a skill set.
      await expect(property(page, "Type")).toHaveCount(0);
      await expect(property(page, "Storage")).toHaveCount(0);

      // Its skills, each by name and command.
      const skills = page.getByTestId("skill-set-info-skills");
      await expect(skills.locator("li")).toHaveCount(3);
      for (const [name, command] of [
        ["Document summary", "/document-summary"],
        ["Clause check", "/clause-check"],
        ["Meeting notes", "/meeting-notes"],
      ]) {
        await expect(skills.locator("li").filter({ hasText: name })).toContainText(
          command,
        );
      }

      await expectScreenshot(page, [
        "desktop",
        "ai-skill-sets",
        "skill-set-details.png",
      ]);
    });

    // Spec: ai-skill-sets, "Use a skill set in the chat"
    test("Set in a new chat", async ({ page, baseUrl }) => {
      await openSkillSets(page, baseUrl);

      const sales = row(page, "Sales assistant");
      await sales.hover();
      await sales.getByTestId("quick-buttons-use-in-chat").click();

      // A fresh conversation on the default agent, fullscreen.
      await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute(
        "data-open",
        "true",
      );
      await expect(
        page.locator('[data-layout-mode="ai-fullscreen"]'),
      ).toBeAttached();
      await expect(page.getByTestId("composer-input")).toHaveValue("");
    });
  });

  test.describe("an opened skill set", () => {
    let sets: SkillSetMock[];

    test.beforeEach(({ mockRequest }) => {
      sets = skillSetsMock();
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "owner"),
        ...aiSkillSetsHandlers(TEST_PORT, sets),
      );
    });

    // Spec: ai-skill-sets, "Skills of an opened skill set"
    test("Open a skill set", async ({ page, baseUrl }) => {
      const set = documentAssistant(sets);
      await openSet(page, baseUrl, set);

      // Name, Description and Last modified; the type column keeps the
      // file type and there is no Command column.
      await expect(header(page).getByTestId("column-Name")).toBeVisible();
      await expect(
        header(page).getByTestId("column-DescriptionSkill"),
      ).toContainText("Description");
      await expect(
        header(page).getByTestId("column-ModifiedSkill"),
      ).toContainText("Last modified");
      await expect(header(page)).not.toContainText("Command");

      await expect(table(page).locator("[data-testid^=table-row-]")).toHaveCount(
        set.skills.length,
      );
      for (const skill of set.skills) {
        const name = skill.title.replace(/\.md$/, "");
        const skillRow = row(page, name);
        // Its name without the extension.
        await expect(
          skillRow.getByTestId(/^skills-cell-name-/),
        ).not.toContainText(".md");
        await expect(
          skillRow.getByTestId(/^skills-cell-modified-/),
        ).not.toBeEmpty();
      }

      // The description from the file, in full on hover.
      const description = row(page, "Document summary")
        .getByTestId(/^skills-cell-description-/)
        .locator("[title]")
        .first();
      await expect(description).toHaveText(DOCUMENT_SUMMARY.description);
      await expect(description).toHaveAttribute(
        "title",
        DOCUMENT_SUMMARY.description,
      );

      await expectScreenshot(page, [
        "desktop",
        "ai-skill-sets",
        "skill-set-open.png",
      ]);
    });

    // Spec: ai-skill-sets, "Command of a skill"
    test("Skill in the list", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));

      await selectRow(
        row(page, "Document summary"),
        /^skills-cell-modified-/,
      );
      await openDetails(page);

      await expect(property(page, "Command")).toContainText(
        "/document-summary",
      );
    });

    // Spec: ai-skill-sets, "Skill in the Info panel"
    test("Skill selected", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));

      await selectRow(
        row(page, "Document summary"),
        /^skills-cell-modified-/,
      );
      await openDetails(page);

      const description = page.getByTestId(
        "info_panel_details_skill_description",
      );
      await expect(description).toHaveText(DOCUMENT_SUMMARY.description);
      await expect(property(page, "Skill set")).toContainText(
        "Document assistant",
      );
      await expect(property(page, "Owner")).toContainText("Administrator");
      await expect(property(page, "Command")).toContainText(
        "/document-summary",
      );
      await expect(property(page, "Date modified")).toBeVisible();
      await expect(property(page, "Last modified by")).toBeVisible();
      await expect(property(page, "Creation date")).toBeVisible();
      // A skill, not the Markdown file that holds it.
      for (const id of ["Type", "File extension", "Size", "Versions"]) {
        await expect(property(page, id)).toHaveCount(0);
      }

      // The description first, then the properties, then "View instructions".
      const viewInstructions = page.getByTestId(
        "info_panel_details_view_instructions_button",
      );
      await expect(viewInstructions).toContainText("View instructions");
      const top = async (locator: Locator) =>
        (await locator.boundingBox())?.y ?? Number.NaN;
      const descriptionTop = await top(description);
      const propertiesTop = await top(property(page, "Skill set"));
      const buttonTop = await top(viewInstructions);
      expect(descriptionTop).toBeLessThan(propertiesTop);
      expect(propertiesTop).toBeLessThan(buttonTop);

      await expectScreenshot(page, [
        "desktop",
        "ai-skill-sets",
        "skill-details.png",
      ]);
    });

    // Spec: ai-skill-sets, "View instructions"
    test("Editor", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await selectRow(
        row(page, "Document summary"),
        /^skills-cell-modified-/,
      );
      await openDetails(page);

      await page
        .getByTestId("info_panel_details_view_instructions_button")
        .click();

      // The instructions, read-only, titled by the skill's name.
      const view = page.getByTestId("view-skill-dialog");
      await expect(view).toBeAttached();
      await expect(page.getByText("Document summary", { exact: true }).last())
        .toBeVisible();
      await expect(editor(page)).toContainText("Read the whole document");
      await expect(editor(page)).not.toContainText("description:");
      await expect(editor(page)).toHaveAttribute("contenteditable", "false");
      await expect(page.getByTestId("view-skill-close")).toBeVisible();

      // Edit turns it into the Edit skill form on the same skill.
      await page.getByTestId("view-skill-edit").click();
      await expect(page.getByTestId("edit-skill-dialog")).toBeAttached();
      await expect(page.getByTestId("edit-skill-name")).toHaveValue(
        "Document summary",
      );
      await expect(page.getByTestId("edit-skill-description")).toHaveValue(
        DOCUMENT_SUMMARY.description,
      );
    });

    // Spec: ai-skill-sets, "Edit skill"
    test("Open", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await openEditSkill(page, "Document summary");

      await expect(page.getByTestId("edit-skill-dialog")).toBeAttached();
      await expect(page.getByTestId("edit-skill-name")).toHaveValue(
        "Document summary",
      );
      await expect(page.getByTestId("edit-skill-command")).toHaveText(
        "Command in chat: /document-summary",
      );
      await expect(page.getByTestId("edit-skill-description")).toHaveValue(
        DOCUMENT_SUMMARY.description,
      );
      await expect(editor(page)).toContainText("Read the whole document");
      await expect(editor(page)).toContainText("## Steps");
      await expect(editor(page)).not.toContainText("description:");

      await expectScreenshot(page, [
        "desktop",
        "ai-skill-sets",
        "edit-skill-dialog.png",
      ]);
    });

    // Spec: ai-skill-sets, "Markdown toolbar"
    test("Toolbar", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await openEditSkill(page, "Document summary");

      // Seven buttons, each named on hover, then the note.
      const toolbar = page.getByTestId("edit-skill-toolbar");
      const buttons = toolbar.locator("button");
      await expect(buttons).toHaveCount(7);
      const names = [
        "Bold",
        "Italic",
        "Heading",
        "Bulleted list",
        "Numbered list",
        "Code",
        "Link",
      ];
      for (let i = 0; i < names.length; i += 1) {
        await expect(buttons.nth(i)).toHaveAttribute("title", names[i]);
        await expect(buttons.nth(i)).toBeEnabled();
      }
      await expect(toolbar).toContainText("Markdown supported");
    });

    // Spec: ai-skill-sets, "What the toolbar buttons do"
    test("Bold twice", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await openEditSkill(page, "Document summary");

      await selectEditorLine(page, 0);
      await expect.poll(() => selectedText(page)).toBe("Read the whole document");

      const bold = page.getByTestId("edit-skill-toolbar-bold");
      await bold.click();
      await expect(editorLine(page, 0)).toHaveText(
        "**Read the whole document**",
      );
      // The focus stays in the editor, with the text still selected.
      await expect(editor(page)).toBeFocused();
      await expect.poll(() => selectedText(page)).toBe("Read the whole document");

      await bold.click();
      await expect(editorLine(page, 0)).toHaveText("Read the whole document");
      await expect.poll(() => selectedText(page)).toBe("Read the whole document");
    });

    // Spec: ai-skill-sets, "What the toolbar buttons do"
    test("List over a heading", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await openEditSkill(page, "Document summary");

      await selectEditorLine(page, 1);
      await expect.poll(() => selectedText(page)).toBe("## Steps");

      await page.getByTestId("edit-skill-toolbar-bulleted").click();
      await expect(editorLine(page, 1)).toHaveText("- Steps");
    });

    // Spec: ai-skill-sets, "Saving a skill"
    test("Name changed", async ({ page, baseUrl }) => {
      const set = documentAssistant(sets);
      await openSet(page, baseUrl, set);
      await openEditSkill(page, "Clause check");

      const name = page.getByTestId("edit-skill-name");
      const save = page.getByTestId("edit-skill-save");

      // A name without a letter or a digit is not saved.
      await name.fill("!!!");
      await expect(
        page.getByText("The name must contain at least one letter or digit"),
      ).toBeVisible();
      await expect(save).toBeDisabled();

      await name.fill("Risk review");
      await expect(page.getByTestId("edit-skill-command")).toHaveText(
        "Command in chat: /risk-review",
      );
      await save.click();

      await expect(toast(page)).toContainText("The skill has been saved");
      await expect(page.getByTestId("edit-skill-dialog")).toHaveCount(0);

      // The file is renamed and its frontmatter names the new command.
      const file = set.skills.find((skill) => skill.id === 778202)!;
      expect(file.title).toBe("Risk review.md");
      expect(file.text).toContain('name: "risk-review"');
      await expect(table(page)).toContainText("Risk review");
      await expect(table(page)).not.toContainText("Clause check");
    });

    // Spec: ai-skill-sets, "Saving a skill"
    test("Refused", async ({ page, baseUrl, mockRequest }) => {
      const message = "The skill file has an invalid frontmatter.";
      mockRequest.use(
        ...aiSkillSetsHandlers(TEST_PORT, sets, { refuseUpdate: message }),
      );
      const set = documentAssistant(sets);
      const before = set.skills[0].text;
      await openSet(page, baseUrl, set);
      await openEditSkill(page, "Document summary");

      const description = page.getByTestId("edit-skill-description");
      await description.fill("Summarizes any document briefly.");
      await page.getByTestId("edit-skill-save").click();

      // The service's message is shown and the dialog keeps the user's text.
      await expect(toast(page)).toContainText(message);
      await expect(page.getByTestId("edit-skill-dialog")).toBeAttached();
      await expect(description).toHaveValue(
        "Summarizes any document briefly.",
      );
      expect(set.skills[0].text).toBe(before);
    });

    // Spec: ai-skill-sets, "Use a skill set in the chat"
    test("Skill in a new chat", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));

      const skillRow = row(page, "Document summary");
      await skillRow.hover();
      await skillRow.getByTestId("quick-buttons-use-in-chat").click();

      await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute(
        "data-open",
        "true",
      );
      await expect(page.getByTestId("composer-input")).toHaveValue(
        "/document-summary ",
      );
    });
  });

  test.describe("a reader of a skill set", () => {
    let sets: SkillSetMock[];

    test.beforeEach(({ mockRequest }) => {
      sets = skillSetsMock({ readOnly: true });
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "regular"),
        ...aiSkillSetsHandlers(TEST_PORT, sets),
      );
    });

    // Spec: ai-skill-sets, "View instructions"
    test("Reader", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));
      await selectRow(
        row(page, "Document summary"),
        /^skills-cell-modified-/,
      );
      await openDetails(page);

      await page
        .getByTestId("info_panel_details_view_instructions_button")
        .click();

      await expect(page.getByTestId("view-skill-dialog")).toBeAttached();
      await expect(editor(page)).toContainText("Read the whole document");
      await expect(editor(page)).toHaveAttribute("contenteditable", "false");
      await expect(page.getByTestId("view-skill-edit")).toHaveCount(0);

      await page.getByTestId("view-skill-close").click();
      await expect(page.getByTestId("view-skill-dialog")).toHaveCount(0);
    });

    // Spec: ai-skill-sets, "Edit skill"
    test("Read-only user", async ({ page, baseUrl }) => {
      await openSet(page, baseUrl, documentAssistant(sets));

      await row(page, "Document summary")
        .getByTestId("context-menu-button")
        .first()
        .click();
      // The menu is open: it offers what a reader may do, and no Edit skill.
      await expect(page.locator("[id^=option_]").first()).toBeVisible();
      await expect(page.locator("#option_edit-skill")).toHaveCount(0);
    });
  });
});
