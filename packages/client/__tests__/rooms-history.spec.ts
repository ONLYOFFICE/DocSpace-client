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
import { RoomsType } from "@docspace/ui-kit/enums";
import {
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
  rootHandler,
  myDocumentsHandler,
  myHandler,
  selfActivationStatusHandler,
  fileSharedUsersHandler,
  roomContentHandler,
  folderHistoryHandler,
  folderHistoryReportHandlers,
  type FolderHistoryHandlerHandle,
  type FolderHistoryReportHandle,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Public Room id from the roomList mock (getRoomList index 0, roomType 6)
const ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_CONTENT_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

// roomContentHandler creates the room on 2026-01-01, so every day of
// March 2026 up to the frozen "today" is selectable in the calendar
const FIXED_NOW = "2026-03-18T10:00:00.000Z";

const REPORT_URL = "/products/files/httphandlers/filehandler.ashx?report=42";

const FEEDS = [
  { id: 1, date: "2026-03-18T09:00:00.000Z", title: "Gamma" },
  { id: 2, date: "2026-03-16T09:00:00.000Z", title: "Beta" },
  { id: 3, date: "2026-03-10T09:00:00.000Z", title: "Alpha" },
];

// Enough entries on both sides of the picked day to keep the list scrollable
const LONG_FEED = [
  ...Array.from({ length: 25 }, (_, i) => ({
    id: 100 + i,
    date: `2026-03-18T${String(8 + Math.floor(i / 6)).padStart(2, "0")}:${String(i * 2).padStart(2, "0")}:00.000Z`,
    title: `Newest ${i}`,
  })),
  ...Array.from({ length: 25 }, (_, i) => ({
    id: 200 + i,
    date: `2026-03-16T${String(8 + Math.floor(i / 6)).padStart(2, "0")}:${String(i * 2).padStart(2, "0")}:00.000Z`,
    title: `Older ${i}`,
  })),
];

const HISTORY_BLOCKS = '[data-testid^="history_block_"]';
const INFO_PANEL_SCROLLER = ".info-panel-scroll";

const historyHandle = () => ({
  current: null as FolderHistoryHandlerHandle | null,
});

const reportHandle = () => ({
  current: null as FolderHistoryReportHandle | null,
});

async function openRoom(page: Page, baseUrl: string) {
  await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible();

  const historyTab = page.getByTestId("info_history_tab");

  if (!(await historyTab.isVisible().catch(() => false))) {
    await page.locator(".info-panel-toggle").click();
    await expect(historyTab).toBeVisible({ timeout: 10000 });
  }

  return historyTab;
}

async function openHistoryPanel(page: Page, baseUrl: string) {
  const historyTab = await openRoom(page, baseUrl);

  await historyTab.click();

  const historyPanel = page.getByTestId("info_panel_files_view_history");
  await expect(historyPanel).toBeVisible();

  return historyPanel;
}

async function openCalendar(page: Page) {
  const datePicker = page.getByTestId("info_history_date_picker");

  await page.getByTestId("info_history_calendar").click();

  await expect(datePicker.locator(".days-header")).toHaveText(/March\s+2026/);

  return datePicker;
}

async function selectDay(page: Page, day: string) {
  const datePicker = await openCalendar(page);

  await datePicker.getByRole("button", { name: day, exact: true }).click();
}

test.use({ timezoneId: "UTC" });

test.describe("Rooms — info panel history", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
    );

    // must be registered after myDocumentsHandler: its `files/:id` pattern
    // would otherwise resolve the room content request.
    // VDR keeps the history request free of the external links call, which
    // getHistory only makes for form, custom and public rooms
    mockRequest.use(
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.VirtualDataRoom,
      }),
      folderHistoryHandler(TEST_PORT, ROOM_ID, { feeds: FEEDS }),
    );
  });

  test("should hide history actions for a third-party room", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.VirtualDataRoom,
        providerId: 1,
      }),
    );

    const historyTab = await openRoom(page, baseUrl);

    await historyTab.click();

    await expect(
      page.getByTestId("info_panel_files_view_container"),
    ).toBeVisible();

    await expect(page.getByTestId("info_history_calendar")).toBeHidden();
    await expect(page.getByTestId("info_download_history")).toBeHidden();
  });

  test.describe("Date picker", () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date(FIXED_NOW));
    });

    test("should be shown on the history tab only", async ({
      page,
      baseUrl,
    }) => {
      await openHistoryPanel(page, baseUrl);

      const calendarButton = page.getByTestId("info_history_calendar");
      const detailsView = page.getByTestId("info_panel_files_view_details");

      await expect(calendarButton).toBeVisible();

      await page.getByTestId("info_details_tab").click();

      await expect(detailsView).toBeVisible();
      await expect(calendarButton).toBeHidden();
    });

    test("should request the history up to the selected day", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const handle = historyHandle();

      mockRequest.use(
        folderHistoryHandler(TEST_PORT, ROOM_ID, { feeds: FEEDS, handle }),
      );

      const historyPanel = await openHistoryPanel(page, baseUrl);
      const blocks = page.locator(HISTORY_BLOCKS);

      await expect(blocks).toHaveCount(FEEDS.length);
      expect(handle.current?.getLastRequest()?.toDate).toBeNull();

      await selectDay(page, "16");

      await expect(blocks).toHaveCount(2);

      expect(handle.current?.getLastRequest()?.toDate).toBe(
        "2026-03-16T23:59:59.999Z",
      );

      await expect(historyPanel.getByText("Beta")).toBeVisible();
      await expect(historyPanel.getByText("Alpha")).toBeVisible();
      await expect(historyPanel.getByText("Gamma")).toBeHidden();
    });

    test("should clear the selected day when the history tab is reopened", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const handle = historyHandle();

      mockRequest.use(
        folderHistoryHandler(TEST_PORT, ROOM_ID, { feeds: FEEDS, handle }),
      );

      await openHistoryPanel(page, baseUrl);

      const blocks = page.locator(HISTORY_BLOCKS);
      const detailsView = page.getByTestId("info_panel_files_view_details");
      const historyView = page.getByTestId("info_panel_files_view_history");

      await selectDay(page, "16");
      await expect(blocks).toHaveCount(2);

      handle.current?.reset();

      await page.getByTestId("info_details_tab").click();
      await expect(detailsView).toBeVisible();

      await page.getByTestId("info_history_tab").click();
      await expect(historyView).toBeVisible();

      await expect(blocks).toHaveCount(FEEDS.length);
      expect(handle.current?.getLastRequest()?.toDate).toBeNull();
    });

    test("should scroll the list back to the top after filtering", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(
        folderHistoryHandler(TEST_PORT, ROOM_ID, { feeds: LONG_FEED }),
      );

      await openHistoryPanel(page, baseUrl);

      const scroller = page.locator(INFO_PANEL_SCROLLER).first();

      await expect(page.locator(HISTORY_BLOCKS)).toHaveCount(LONG_FEED.length);

      await scroller.hover();
      await page.mouse.wheel(0, 3000);

      await expect
        .poll(() => scroller.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);

      await selectDay(page, "16");

      await expect(page.locator(HISTORY_BLOCKS)).toHaveCount(25);

      await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBe(0);
    });

    test("should disable days after today", async ({ page, baseUrl }) => {
      await openHistoryPanel(page, baseUrl);

      const datePicker = await openCalendar(page);

      await expect(
        datePicker.getByRole("button", { name: "18", exact: true }),
      ).toBeEnabled();

      await expect(
        datePicker.getByRole("button", { name: "19", exact: true }),
      ).toBeDisabled();
    });
  });

  test.describe("Report", () => {
    test("should open the generated report file", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const handle = reportHandle();

      mockRequest.use(
        ...folderHistoryReportHandlers(TEST_PORT, ROOM_ID, {
          pollsBeforeComplete: 0,
          resultFileUrl: REPORT_URL,
          handle,
        }),
      );

      await openHistoryPanel(page, baseUrl);

      const popupPromise = page.waitForEvent("popup");

      await page.getByTestId("info_download_history").click();

      const popup = await popupPromise;

      expect(popup.url()).toContain("report=42");
      expect(popup.url()).not.toContain("object%20Object");

      await popup.close();

      expect(handle.current?.getStartRequestCount()).toBe(1);
    });

    test("should poll the task status until the report is ready", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const handle = reportHandle();

      mockRequest.use(
        ...folderHistoryReportHandlers(TEST_PORT, ROOM_ID, {
          pollsBeforeComplete: 1,
          handle,
        }),
      );

      await openHistoryPanel(page, baseUrl);

      const downloadButton = page.getByTestId("info_download_history");
      const loader = page.locator("#info_download-history-loader");

      await downloadButton.click();

      await expect(loader).toBeVisible();
      await expect(downloadButton).toBeHidden();

      const toast = page.getByTestId("toast-content").first();

      await expect(toast).toBeVisible();
      await expect(toast).toContainText("The report will be saved to");

      await expect(loader).toBeHidden();
      await expect(downloadButton).toBeVisible();

      expect(handle.current?.getStatusRequestCount()).toBeGreaterThan(1);
    });

    test("should show the error returned by the task", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(
        ...folderHistoryReportHandlers(TEST_PORT, ROOM_ID, {
          pollsBeforeComplete: 0,
          error: "The maximum file size is exceeded (0 bytes).",
        }),
      );

      await openHistoryPanel(page, baseUrl);

      const downloadButton = page.getByTestId("info_download_history");

      await downloadButton.click();

      const toast = page.getByTestId("toast-content").first();

      await expect(toast).toBeVisible();
      await expect(toast).toContainText("The maximum file size is exceeded");

      await expect(downloadButton).toBeVisible();
    });
  });
});
