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

import type { Locator } from "@playwright/test";

import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const SDK_ROUTE = "/developer-tools/javascript-sdk";
const PRESET_ROUTE = "/developer-tools/javascript-sdk/docspace";
const FIRST_RENDER_TIMEOUT = 15_000;
// max-width of the SDK page content: two 342px preset tiles plus their gutter.
const CONTENT_WIDTH = 700;

// boundingBox() answers null for anything that did not render, and null boxes
// read as zeros in comparisons - which is how a geometry assertion turns green
// on a page that never drew the element.
const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();

  expect(box, `${locator} has no box`).not.toBeNull();

  return box!;
};

// Mirrors externalResources in the settings mock: five connectors carry their
// own integrations entry, the rest fall back to the connectors catalog.
const SITE_DOMAIN = "https://www.onlyoffice.com/ru";
const ALL_CONNECTORS_URL = `${SITE_DOMAIN}/all-connectors.aspx`;
const ZOOM_URL = "https://marketplace.zoom.us/apps/OW6rOq-nRgCihG5eps_p-g";
const ZAPIER_URL = "https://zapier.com/apps/onlyoffice-docspace/integrations";

const CONNECTORS = [
  { id: "n8n", name: "n8n" },
  { id: "zapier", name: "Zapier" },
  { id: "pipedrive", name: "Pipedrive" },
  { id: "zoom", name: "Zoom" },
  { id: "monday", name: "monday.com" },
  { id: "moodle", name: "Moodle" },
  { id: "drupal", name: "Drupal" },
  { id: "wordpress", name: "WordPress" },
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

    // The section closes the page, below the presets grid, and keeps the width
    // of the page content: two columns of the same tile as the presets above.
    const connectorsBox = await boxOf(page.getByTestId("sdk-connector-zoom"));
    const presetBox = await boxOf(
      page.getByTestId("sdk_preset_Editor_container"),
    );
    const gridBox = await boxOf(page.getByTestId("sdk-connectors-grid"));

    expect(connectorsBox.y).toBeGreaterThan(presetBox.y);
    expect(gridBox.width).toBe(CONTENT_WIDTH);

    const [first, second, third] = await Promise.all(
      CONNECTORS.slice(0, 3).map((connector) =>
        boxOf(page.getByTestId(`sdk-connector-${connector.id}`)),
      ),
    );

    expect(second.y).toBe(first.y);
    expect(third.y).toBeGreaterThan(first.y);
    expect(third.x).toBe(first.x);
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
  test("closes the page below the preview and the controls column", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PRESET_ROUTE}`);

    const tile = page.getByTestId(`sdk-connector-${CONNECTORS[0].id}`);
    await expect(tile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    // A preset page mounts the catalog once, so no id can resolve twice and
    // turn every locator here into a strict-mode violation.
    for (const connector of CONNECTORS) {
      await expect(
        page.getByTestId(`sdk-connector-${connector.id}`),
      ).toHaveCount(1);
    }
    await expect(page.getByTestId("sdk-connector-all")).toHaveCount(1);

    const tileBox = await boxOf(tile);
    const gridBox = await boxOf(page.getByTestId("sdk-connectors-grid"));
    // The frame itself, not the column around it: the column runs to the
    // section's right edge while the preview is capped at 800px.
    const previewBox = await boxOf(page.getByTestId("sdk_preview_frame"));
    const eventLogBox = await boxOf(page.getByTestId("sdk_event_log"));
    const controlsBox = await boxOf(page.getByTestId("sdk_preset_controls"));

    // A block of its own under everything: it starts at the section's left
    // edge, next to the controls column rather than inside it, and clears the
    // whole preview - the event log included, which used to overflow the
    // fixed-height tab body and land on top of these tiles.
    expect(tileBox.x).toBeLessThan(previewBox.x);
    expect(tileBox.y).toBeGreaterThan(previewBox.y + previewBox.height);
    expect(tileBox.y).toBeGreaterThan(eventLogBox.y + eventLogBox.height);
    expect(tileBox.y).toBeGreaterThan(controlsBox.y + controlsBox.height);

    // Full width, and no wider: the grid ends where the preview ends. The
    // frame draws a 1px border of its own outside the 800px, and overhangs
    // its column by that much when the section is too narrow to reach 800 -
    // hence the 2px, which is the border and nothing else.
    const gridRight = gridBox.x + gridBox.width;
    const previewRight = previewBox.x + previewBox.width;

    expect(gridRight).toBeGreaterThanOrEqual(previewRight - 2);
    expect(gridRight).toBeLessThanOrEqual(previewRight);
  });

  test("opens the instructions dialog from a preset page", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${PRESET_ROUTE}`);

    const tile = page.getByTestId("sdk-connector-drupal");
    await expect(tile).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await tile.click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Drupal", { exact: true })).toBeVisible();
    await expect(dialog.getByTestId("integration-step")).toHaveCount(3);
    await expect(
      page.getByTestId("integration-create-instance-drupal"),
    ).toBeHidden();
  });
});
