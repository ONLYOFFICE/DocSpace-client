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
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";

const URL = "/portal-settings/security/access-portal/access-control";
const SAVE_PATH = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/files/settings/externalsharingsettings`;

const saveHandler = (body?: object) =>
  http.put(SAVE_PATH, async ({ request }) => {
    if (body) Object.assign(body, await request.json());
    return new Response(JSON.stringify({ response: {} }));
  });

test.describe("Access Control", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.Authenticated));
  });

  test.describe("Allowed mode (default)", () => {
    test("initial state", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);

      const section = page.getByTestId("external_sharing_radio");
      await expect(section).toBeVisible();

      const allowedRadio = page.getByTestId("external_sharing_allowed");
      await expect(allowedRadio.locator("input")).toBeChecked();

      const defaultLinkSection = page.getByTestId("default_link_type_radio");
      await expect(defaultLinkSection).toBeVisible();

      const saveButton = page.getByTestId("access_control_save_button");
      await expect(saveButton).toBeDisabled();

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "initial-allowed.png",
      ]);
    });
  });

  test.describe("Switch to Restricted", () => {
    test("restricted UI elements appear", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);

      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

      await page.getByTestId("external_sharing_restricted").click();

      await expect(
        page.getByTestId("applies_to_documents_checkbox"),
      ).toBeVisible();
      await expect(page.getByTestId("applies_to_rooms_checkbox")).toBeVisible();
      await expect(
        page.getByTestId("applies_to_documents_checkbox").locator("input"),
      ).toBeChecked();
      await expect(
        page.getByTestId("applies_to_rooms_checkbox").locator("input"),
      ).toBeChecked();

      await expect(
        page.getByTestId("links_before_restriction_radio"),
      ).toBeVisible();
      await expect(
        page.getByTestId("links_block_access").locator("input"),
      ).toBeChecked();

      await expect(
        page.getByTestId("default_link_type_radio"),
      ).not.toBeVisible();

      await expect(
        page.getByTestId("access_control_save_button"),
      ).toBeEnabled();

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "restricted-ui.png",
      ]);
    });

    test("save restricted settings", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);
      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

      await page.getByTestId("external_sharing_restricted").click();

      const savedBody: Record<string, unknown> = {};
      mockRequest.use(saveHandler(savedBody));

      await page.getByTestId("access_control_save_button").click();

      await expect(
        page.getByTestId("access_control_save_button"),
      ).toBeDisabled();

      expect(savedBody.externalShare).toBe(false);
      expect(savedBody.externalShareApplyToDocuments).toBe(true);
      expect(savedBody.externalShareApplyToRooms).toBe(true);
      expect(savedBody.blockExistingLinksOnRestrict).toBe(true);

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "save-restricted.png",
      ]);
    });

    test("cancel reverts changes", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);
      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

      await page.getByTestId("external_sharing_restricted").click();
      await expect(
        page.getByTestId("applies_to_documents_checkbox"),
      ).toBeVisible();

      await page.getByTestId("access_control_cancel_button").click();

      await expect(
        page.getByTestId("external_sharing_allowed").locator("input"),
      ).toBeChecked();
      await expect(page.getByTestId("default_link_type_radio")).toBeVisible();
      await expect(
        page.getByTestId("access_control_save_button"),
      ).toBeDisabled();

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "cancel-reverts.png",
      ]);
    });
  });

  test.describe("Applies to", () => {
    test("restricted — only Documents", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);
      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

      await page.getByTestId("external_sharing_restricted").click();
      await page.getByTestId("applies_to_rooms_checkbox").click();

      await expect(
        page.getByTestId("applies_to_rooms_checkbox").locator("input"),
      ).not.toBeChecked();
      await expect(
        page.getByTestId("applies_to_documents_checkbox").locator("input"),
      ).toBeChecked();

      const savedBody: Record<string, unknown> = {};
      mockRequest.use(saveHandler(savedBody));
      await page.getByTestId("access_control_save_button").click();

      await expect(
        page.getByTestId("access_control_save_button"),
      ).toBeDisabled();
      expect(savedBody.externalShareApplyToDocuments).toBe(true);
      expect(savedBody.externalShareApplyToRooms).toBe(false);

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "docs-only-restriction.png",
      ]);
    });

    test("restricted — only Rooms", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(filesSettingsHandler(TEST_PORT, { externalShare: true }));

      await page.goto(`${baseUrl}${URL}`);
      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

      await page.getByTestId("external_sharing_restricted").click();
      await page.getByTestId("applies_to_documents_checkbox").click();

      await expect(
        page.getByTestId("applies_to_documents_checkbox").locator("input"),
      ).not.toBeChecked();
      await expect(
        page.getByTestId("applies_to_rooms_checkbox").locator("input"),
      ).toBeChecked();

      const savedBody: Record<string, unknown> = {};
      mockRequest.use(saveHandler(savedBody));
      await page.getByTestId("access_control_save_button").click();

      await expect(
        page.getByTestId("access_control_save_button"),
      ).toBeDisabled();
      expect(savedBody.externalShareApplyToDocuments).toBe(false);
      expect(savedBody.externalShareApplyToRooms).toBe(true);

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "rooms-only-restriction.png",
      ]);
    });
  });

  test.describe("Switch back to Allowed", () => {
    test("default link type section reappears", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: true,
          externalShareApplyToRooms: true,
          blockExistingLinksOnRestrict: true,
        }),
      );

      await page.goto(`${baseUrl}${URL}`);
      await expect(page.getByTestId("external_sharing_radio")).toBeVisible();
      await expect(
        page.getByTestId("external_sharing_restricted").locator("input"),
      ).toBeChecked();

      await page.getByTestId("external_sharing_allowed").click();

      await expect(page.getByTestId("default_link_type_radio")).toBeVisible();
      await expect(
        page.getByTestId("applies_to_documents_checkbox"),
      ).not.toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "access-control",
        "back-to-allowed.png",
      ]);
    });
  });
});

