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
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const SDK_ROUTE = "/developer-tools/javascript-sdk";
const FIRST_RENDER_TIMEOUT = 15_000;

const TILE_MAX_WIDTH = 342;
const GUTTER = 16;
const TILE_SIDE_INSET = 17;
const THUMBNAIL_RATIO = 310 / 180;

const APPS_TILE = "sdk_preset_Apps_container";
const PUBLIC_ROOM_TILE = "sdk_preset_Public room_container";
const EDITOR_TILE = "sdk_preset_Editor_container";

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();

  expect(box, `${locator} has no box`).not.toBeNull();

  return box!;
};

const expectClose = (actual: number, expected: number, label: string) => {
  expect(Math.abs(actual - expected), label).toBeLessThanOrEqual(1);
};

const expectProportionalThumbnail = async (tile: Locator) => {
  const tileBox = await boxOf(tile);
  const imageBox = await boxOf(tile.locator("img"));

  expectClose(
    imageBox.width,
    tileBox.width - 2 * TILE_SIDE_INSET,
    "thumbnail fills the tile width",
  );
  expectClose(
    imageBox.height,
    imageBox.width / THUMBNAIL_RATIO,
    "thumbnail keeps its proportions",
  );
  expect(
    imageBox.x + imageBox.width,
    "thumbnail stays inside the tile",
  ).toBeLessThanOrEqual(tileBox.x + tileBox.width);
};

const openPresets = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 1024 });
  await page.goto(SDK_ROUTE);

  const apps = page.getByTestId(APPS_TILE);
  await expect(apps).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

  return {
    apps,
    publicRoom: page.getByTestId(PUBLIC_ROOM_TILE),
    grid: apps.locator(".."),
  };
};

test.beforeEach(async ({ mockRequest }) => {
  mockRequest.use(settingsHandler(TEST_PORT, TypeSettings.Authenticated));
});

test.describe("JavaScript SDK preset tiles", () => {
  test("keeps two 342px tiles with full-width thumbnails on a wide screen", async ({
    page,
  }) => {
    const { apps, publicRoom } = await openPresets(page, 1440);
    const appsBox = await boxOf(apps);
    const publicRoomBox = await boxOf(publicRoom);

    expectClose(appsBox.width, TILE_MAX_WIDTH, "tile width");
    expectClose(publicRoomBox.width, TILE_MAX_WIDTH, "tile width");
    expectClose(publicRoomBox.y, appsBox.y, "tiles share a row");
    expectClose(
      publicRoomBox.x,
      appsBox.x + TILE_MAX_WIDTH + GUTTER,
      "gutter between the columns",
    );

    await expectProportionalThumbnail(apps);
    await expectProportionalThumbnail(publicRoom);
    await expectProportionalThumbnail(page.getByTestId(EDITOR_TILE));
  });

  test("shrinks both columns together with their thumbnails between 600 and 700px", async ({
    page,
  }) => {
    const { apps, publicRoom, grid } = await openPresets(page, 720);
    const gridBox = await boxOf(grid);
    const appsBox = await boxOf(apps);
    const publicRoomBox = await boxOf(publicRoom);

    expect(gridBox.width, "content narrower than two full tiles").toBeLessThan(
      2 * TILE_MAX_WIDTH + GUTTER,
    );
    expect(gridBox.width, "content above the one-column limit").toBeGreaterThan(
      600,
    );

    expectClose(publicRoomBox.y, appsBox.y, "tiles share a row");
    expectClose(appsBox.width, (gridBox.width - GUTTER) / 2, "half the grid");
    expectClose(publicRoomBox.width, appsBox.width, "equal columns");

    await expectProportionalThumbnail(apps);
    await expectProportionalThumbnail(publicRoom);
  });

  test("stacks the tiles into one full-width column below 600px", async ({
    page,
  }) => {
    const { apps, publicRoom, grid } = await openPresets(page, 560);
    const gridBox = await boxOf(grid);
    const appsBox = await boxOf(apps);
    const publicRoomBox = await boxOf(publicRoom);

    expect(gridBox.width, "content below the one-column limit").toBeLessThan(
      600,
    );

    expectClose(appsBox.width, gridBox.width, "tile spans the content");
    expectClose(publicRoomBox.x, appsBox.x, "single column");
    expect(publicRoomBox.y, "tiles stack").toBeGreaterThanOrEqual(
      appsBox.y + appsBox.height + GUTTER - 1,
    );

    await expectProportionalThumbnail(apps);
    await expectProportionalThumbnail(publicRoom);
  });
});
