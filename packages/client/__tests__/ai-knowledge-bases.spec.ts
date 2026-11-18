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
  aiKnowledgeBasesHandlers,
  knowledgeBaseFilesMock,
  KNOWLEDGE_BASES,
  KNOWLEDGE_BASE_FAILED_ID,
  KNOWLEDGE_BASE_INDEXED_ID,
  KNOWLEDGE_BASE_INDEXING_ID,
  KNOWLEDGE_FAILED_FILE_TITLE,
  KnowledgeFileMockStatus,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Knowledge bases list of the AI Chat section (Knowledge rooms) and an
 * opened knowledge base (`ai-knowledge-bases`, boards 14 and 15): the
 * columns of both tables, the "Indexing" and "Error" marks a base takes from
 * its files and a file from its own state, what the Details of each say,
 * and "Use in chat" on a base's row.
 *
 * The stock bases (`KNOWLEDGE_BASES`): "Company policies", 48 files of
 * which one failed and two are being indexed; "Product documentation", one
 * file being indexed; "Company glossary", every file indexed.
 */

const AI_ROOMS_URL = "/ai-rooms/filter";

const baseUrlOf = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const table = (page: Page) => page.getByTestId("table-body");

const tableHeader = (page: Page) => page.getByTestId("table-header");

const sidebar = (page: Page) => page.locator("#article-container");

const row = (page: Page, title: string) =>
  table(page).locator("[data-testid^=table-row-]").filter({ hasText: title });

const titleOf = (id: number) => {
  const base = KNOWLEDGE_BASES.find((room) => room.id === id);
  if (!base) throw new Error(`No stock knowledge base ${id}`);
  return base.title;
};

const FAILED_BASE = titleOf(KNOWLEDGE_BASE_FAILED_ID);
const INDEXING_BASE = titleOf(KNOWLEDGE_BASE_INDEXING_ID);
const INDEXED_BASE = titleOf(KNOWLEDGE_BASE_INDEXED_ID);

/** The Knowledge bases entry of the sidebar: the section's list narrowed to the Knowledge rooms. */
const openKnowledgeBases = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${AI_ROOMS_URL}`);
  await expect(table(page)).toBeVisible();
  await sidebar(page).getByText("Knowledge bases", { exact: true }).click();
  for (const base of KNOWLEDGE_BASES) {
    await expect(table(page)).toContainText(base.title);
  }
};

/** Selects a row by a cell other than its name, which would open it. */
const selectRow = (rowLocator: Locator, cell: RegExp) =>
  rowLocator.getByTestId(cell).click();

/** Opens the Info panel on Details for what is selected. */
const openDetails = async (page: Page) => {
  const detailsTab = page.getByTestId("info_details_tab");

  if (!(await detailsTab.isVisible().catch(() => false))) {
    await page.locator(".info-panel-toggle").click();
    await expect(detailsTab).toBeVisible({ timeout: 10000 });
  }

  await detailsTab.click();
};

const property = (page: Page, id: string) =>
  page.getByTestId(`info_panel_details_property_${id}`);

test.describe("AI Chat: Knowledge bases", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "owner"),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      ...aiKnowledgeBasesHandlers(TEST_PORT),
    );
  });

  test.describe("the list", () => {
    // Spec: ai-knowledge-bases, "Columns of the Knowledge bases list"
    test("Knowledge bases in the table", async ({ page, baseUrl }) => {
      await openKnowledgeBases(page, baseUrl);

      const header = tableHeader(page);
      await expect(header).toContainText("Name");
      await expect(header).toContainText("Owner");
      await expect(header).toContainText("Last modified");
      await expect(header).not.toContainText("Type");
      await expect(header).not.toContainText("Tags");
      await expect(header).not.toContainText("Storage");

      await expect(row(page, FAILED_BASE)).toContainText("Administrator");
    });

    // Spec: ai-knowledge-bases, "Indexing state of a knowledge base"
    test("One file failed", async ({ page, baseUrl }) => {
      await openKnowledgeBases(page, baseUrl);

      const failedRow = row(page, FAILED_BASE);
      const error = failedRow.getByTestId("knowledge-base-error-badge");
      await expect(error).toHaveText("Error");
      await expect(
        failedRow.getByTestId("knowledge-base-indexing-badge"),
      ).toHaveCount(0);

      // The hint sends the user into the base to see which files failed.
      await error.hover();
      await expect(page.getByText("Indexing failed")).toBeVisible();
      await expect(
        page.getByText(
          "Some files of this knowledge base could not be indexed. Open it to see which ones.",
        ),
      ).toBeVisible();
    });

    // Spec: ai-knowledge-bases, "Indexing state of a knowledge base"
    test("All indexed", async ({ page, baseUrl }) => {
      await openKnowledgeBases(page, baseUrl);

      // A base still being indexed, with no failed file, carries "Indexing".
      const indexingRow = row(page, INDEXING_BASE);
      await expect(
        indexingRow.getByTestId("knowledge-base-indexing-badge"),
      ).toHaveText("Indexing");
      await expect(
        indexingRow.getByTestId("knowledge-base-error-badge"),
      ).toHaveCount(0);

      // Wait for the failed base's mark, so the indexed one has been read too.
      await expect(
        row(page, FAILED_BASE).getByTestId("knowledge-base-error-badge"),
      ).toBeVisible();
      const indexedRow = row(page, INDEXED_BASE);
      await expect(
        indexedRow.getByTestId("knowledge-base-indexing-badge"),
      ).toHaveCount(0);
      await expect(
        indexedRow.getByTestId("knowledge-base-error-badge"),
      ).toHaveCount(0);

      await expectScreenshot(page, [
        "desktop",
        "ai-knowledge-bases",
        "knowledge-bases-list.png",
      ]);
    });

    // Spec: ai-knowledge-bases, "The list does not follow indexing live"
    test("Indexing finished meanwhile", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      const files = knowledgeBaseFilesMock();
      mockRequest.use(...aiKnowledgeBasesHandlers(TEST_PORT, { files }));

      await openKnowledgeBases(page, baseUrl);
      const indexingRow = row(page, INDEXING_BASE);
      await expect(
        indexingRow.getByTestId("knowledge-base-indexing-badge"),
      ).toBeVisible();

      // The last file finishes indexing; the base's room does not change.
      files[KNOWLEDGE_BASE_INDEXING_ID].forEach((file) => {
        file.vectorizationStatus = KnowledgeFileMockStatus.Completed;
      });

      // Opening its Details reads the base again.
      await selectRow(indexingRow, /^knowledge-bases-cell-activity-/);
      await openDetails(page);

      await expect(property(page, "Status")).toContainText("Indexed");
      await expect(
        indexingRow.getByTestId("knowledge-base-indexing-badge"),
      ).toHaveCount(0);
    });

    // Spec: ai-knowledge-bases, "Knowledge base in the Info panel"
    test("Indexed base", async ({ page, baseUrl }) => {
      await openKnowledgeBases(page, baseUrl);

      await selectRow(
        row(page, INDEXED_BASE),
        /^knowledge-bases-cell-activity-/,
      );
      await openDetails(page);

      await expect(property(page, "Content")).toContainText("Files: 2");
      await expect(property(page, "Status")).toContainText("Indexed");
      // A knowledge base is told by its files, not by a room type.
      await expect(property(page, "Type")).toHaveCount(0);

      // A base with a failed file says so in its Status.
      await selectRow(
        row(page, FAILED_BASE),
        /^knowledge-bases-cell-activity-/,
      );
      await expect(property(page, "Content")).toContainText("Files: 48");
      await expect(property(page, "Status")).toContainText("Error");
    });

    // Spec: ai-knowledge-bases, "Use a knowledge base in the chat"
    test("Base in a new chat", async ({ page, baseUrl }) => {
      await openKnowledgeBases(page, baseUrl);

      await row(page, FAILED_BASE)
        .getByTestId("quick-buttons-use-in-chat")
        .click();

      // The chat opens on the default agent, in a new conversation.
      await expect(page.getByTestId("composer-input")).toBeVisible();
    });

    // Spec: ai-knowledge-bases, "Use a knowledge base in the chat"
    test("offers no Use in chat while vectorization is off", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(aiConfigHandler(TEST_PORT, false, false, true));

      await openKnowledgeBases(page, baseUrl);

      for (const base of KNOWLEDGE_BASES) {
        await expect(
          row(page, base.title).getByTestId("quick-buttons-use-in-chat"),
        ).toHaveCount(0);
      }
    });
  });

  test.describe("an opened base", () => {
    // Spec: ai-knowledge-bases, "Files of an opened knowledge base"
    test("Open a knowledge base", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${baseUrlOf(KNOWLEDGE_BASE_FAILED_ID)}`);
      await expect(table(page)).toBeVisible();

      const header = tableHeader(page);
      await expect(header).toContainText("Name");
      await expect(header).toContainText("Size");
      await expect(header).toContainText("Added by");
      await expect(header).toContainText("Added");

      const failedRow = row(page, KNOWLEDGE_FAILED_FILE_TITLE);
      await expect(
        failedRow.getByTestId(/^knowledge-files-cell-size-/),
      ).toContainText("KB");
      await expect(
        failedRow.getByTestId(/^knowledge-files-cell-author-/),
      ).toContainText("Administrator");
      await expect(
        failedRow.getByTestId(/^knowledge-files-cell-created-/),
      ).not.toBeEmpty();

      await expectScreenshot(page, [
        "desktop",
        "ai-knowledge-bases",
        "knowledge-base-open.png",
      ]);
    });

    // Spec: ai-knowledge-bases, "Indexing state of a file"
    test("Failed file", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${baseUrlOf(KNOWLEDGE_BASE_FAILED_ID)}`);
      await expect(table(page)).toBeVisible();

      // Files being indexed carry "Indexing".
      await expect(
        row(page, "Travel policy.docx").getByTestId("preparing-for-ai-badge"),
      ).toHaveText("Indexing");

      const failedRow = row(page, KNOWLEDGE_FAILED_FILE_TITLE);
      const error = failedRow.getByTestId("failed-vectorization-badge");
      await expect(error).toHaveText("Error");
      await expect(failedRow.getByTestId("preparing-for-ai-badge")).toHaveCount(
        0,
      );

      // The owner may index it again: the hint offers Try again.
      await error.hover();
      await expect(page.getByText("Preparation failed")).toBeVisible();
      await expect(page.getByText("Try again", { exact: true })).toBeVisible();
    });

    // Spec: ai-knowledge-bases, "File in the Info panel"
    test("Failed file selected", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${baseUrlOf(KNOWLEDGE_BASE_FAILED_ID)}`);
      await expect(table(page)).toBeVisible();

      await selectRow(
        row(page, KNOWLEDGE_FAILED_FILE_TITLE),
        /^knowledge-files-cell-created-/,
      );
      await openDetails(page);

      const note = page.getByTestId("info_panel_details_indexing_error");
      await expect(note).toHaveText(
        "Couldn’t prepare the file for AI — run preparation again.",
      );
      const status = property(page, "Status");
      await expect(status).toContainText("Error");

      // The note stands above the properties.
      const noteBox = await note.boundingBox();
      const statusBox = await status.boundingBox();
      expect(noteBox && statusBox && noteBox.y < statusBox.y).toBe(true);
    });
  });
});
