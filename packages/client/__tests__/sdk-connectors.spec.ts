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

import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const SDK_ROUTE = "/developer-tools/javascript-sdk";
const PRESET_ROUTE = "/developer-tools/javascript-sdk/docspace";
const FIRST_RENDER_TIMEOUT = 15_000;

// Mirrors externalResources in the settings mock: five connectors carry their
// own integrations entry, the rest fall back to the connectors catalog.
const SITE_DOMAIN = "https://www.onlyoffice.com/ru";
const ALL_CONNECTORS_URL = `${SITE_DOMAIN}/all-connectors.aspx`;
const ZOOM_URL = "https://marketplace.zoom.us/apps/OW6rOq-nRgCihG5eps_p-g";
const ZAPIER_URL = "https://zapier.com/apps/onlyoffice-docspace/integrations";

// The connectors the Docs Connect card on Home carries lead, in its order; the
// ones only the SDK page offers follow.
const CONNECTORS = [
  { id: "nextcloud", name: "Nextcloud" },
  { id: "owncloud", name: "ownCloud" },
  { id: "confluence", name: "Confluence" },
  { id: "alfresco", name: "Alfresco" },
  { id: "moodle", name: "Moodle" },
  { id: "n8n", name: "n8n" },
  { id: "drupal", name: "Drupal" },
  { id: "monday", name: "monday.com" },
  { id: "pipedrive", name: "Pipedrive" },
  { id: "wordpress", name: "WordPress" },
  { id: "zapier", name: "Zapier" },
  { id: "zoom", name: "Zoom" },
];

test.beforeEach(async ({ mockRequest }) => {
  mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.Authenticated));
});

test.describe("JavaScript SDK connectors", () => {
  test("lists every connector below the presets grid", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${SDK_ROUTE}`);

    await expect(
      page.getByText("Discover ready-to-use connectors"),
    ).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    for (const connector of CONNECTORS) {
      const tile = page.getByTestId(`sdk-connector-${connector.id}`);

      await expect(tile).toBeVisible();
      await expect(tile).toContainText(connector.name);
    }

    const renderedOrder = await page
      .locator('[data-testid^="sdk-connector-"]')
      .evaluateAll((tiles) =>
        tiles.map((tile) => tile.getAttribute("data-testid")),
      );

    expect(renderedOrder).toEqual([
      ...CONNECTORS.map((connector) => `sdk-connector-${connector.id}`),
      "sdk-connector-all",
    ]);

    // The section closes the page, below the presets grid.
    const connectorsBox = await page
      .getByTestId("sdk-connector-zoom")
      .boundingBox();
    const presetBox = await page
      .getByTestId("sdk_preset_Editor_container")
      .boundingBox();

    expect(connectorsBox?.y ?? 0).toBeGreaterThan(presetBox?.y ?? 0);
  });

  test("links the catalog tile to the connectors page", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${SDK_ROUTE}`);

    const seeAll = page.getByTestId("sdk-connector-all");

    await expect(seeAll).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await expect(seeAll).toContainText("See all connectors");
    await expect(seeAll).toHaveAttribute("href", ALL_CONNECTORS_URL);
    await expect(seeAll).toHaveAttribute("target", "_blank");
    // Full width is a compact-layout affordance only.
    await expect(seeAll).not.toHaveAttribute("data-span", "2");
  });

  test("opens embedding instructions for a marketplace connector", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${SDK_ROUTE}`);

    const tile = page.getByTestId("sdk-connector-zoom");
    await expect(tile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await tile.click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Zoom", { exact: true })).toBeVisible();
    await expect(
      dialog.getByText(/^Embed your .+ rooms and files directly in Zoom$/),
    ).toBeVisible();
    await expect(dialog.getByTestId("integration-step")).toHaveCount(3);
    await expect(dialog.getByTestId("integration-step").first()).toContainText(
      "from its marketplace",
    );

    await expect(dialog.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      ZOOM_URL,
    );
    await expect(page.getByTestId("integration-github-zoom")).toBeVisible();
    // The SDK page cannot provision anything: that button belongs to Docs
    // Connect, which passes hideInstanceAction here.
    await expect(
      page.getByTestId("integration-create-instance-zoom"),
    ).toBeHidden();
  });

  test("opens automation instructions for a workflow connector", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${SDK_ROUTE}`);

    const tile = page.getByTestId("sdk-connector-zapier");
    await expect(tile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await tile.click();

    const dialog = page.getByRole("dialog");

    await expect(
      dialog.getByText(/^Automate document workflows between .+ and Zapier$/),
    ).toBeVisible();
    await expect(dialog.getByTestId("integration-step")).toHaveCount(3);
    await expect(dialog.getByTestId("integration-step").nth(1)).toContainText(
      "Create credentials",
    );

    await expect(dialog.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      ZAPIER_URL,
    );
  });

  test("falls back to the catalog for a connector with no dedicated page", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${SDK_ROUTE}`);

    const tile = page.getByTestId("sdk-connector-monday");
    await expect(tile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await tile.click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      ALL_CONNECTORS_URL,
    );
  });
});

test.describe("JavaScript SDK preset connectors", () => {
  test("renders the sidebar and bottom catalogs without colliding test ids", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PRESET_ROUTE}`);

    const sidebarTile = page.getByTestId(
      `sdk-connector-compact-${CONNECTORS[0].id}`,
    );
    await expect(sidebarTile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    // Both instances are mounted on a preset page; each id must resolve to a
    // single element or every locator here turns into a strict-mode violation.
    for (const connector of CONNECTORS) {
      await expect(
        page.getByTestId(`sdk-connector-compact-${connector.id}`),
      ).toHaveCount(1);
      await expect(
        page.getByTestId(`sdk-connector-${connector.id}`),
      ).toHaveCount(1);
    }

    // The sidebar is a fixed 350px column: two tiles per row, arrows dropped,
    // and the catalog tile spans the full width so its label stays readable.
    const seeAllCompact = page.getByTestId("sdk-connector-compact-all");
    await expect(seeAllCompact).toHaveAttribute("data-span", "2");
    await expect(page.getByTestId("sdk-connector-all")).not.toHaveAttribute(
      "data-span",
      "2",
    );

    const firstBox = await sidebarTile.boundingBox();
    const secondBox = await page
      .getByTestId(`sdk-connector-compact-${CONNECTORS[1].id}`)
      .boundingBox();

    // Side by side, not stacked: the second tile starts further along the row
    // and still overlaps the first one vertically.
    expect(secondBox?.x ?? 0).toBeGreaterThan(firstBox?.x ?? 0);
    expect(secondBox?.y ?? 0).toBeLessThan(
      (firstBox?.y ?? 0) + (firstBox?.height ?? 0),
    );
  });

  test("opens the instructions dialog from the sidebar catalog", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PRESET_ROUTE}`);

    const sidebarTile = page.getByTestId("sdk-connector-compact-drupal");
    await expect(sidebarTile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await sidebarTile.click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Drupal", { exact: true })).toBeVisible();
    await expect(dialog.getByTestId("integration-step")).toHaveCount(3);
    await expect(
      page.getByTestId("integration-create-instance-drupal"),
    ).toBeHidden();
  });
});
