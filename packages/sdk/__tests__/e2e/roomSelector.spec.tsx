// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import {
  endpoints,
  HEADER_ROOMS_LIST,
  roomListHandler,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";
import { THEMES, TestHelper } from "./utils/testHelpers";
import { RoomSelectorPage } from "./page-objects/SelectorPages";

const BASE_PATH = "/sdk/room-selector";

function testAllThemes(
  testName: string,
  params: Record<string, any>,
  screenshotName: string,
  headers: string[] = [HEADER_ROOMS_LIST],
) {
  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: ${testName}`, async ({ page, mockRequest }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const route = helper.buildRoute(themeConfig, params);

      await mockRequest.setHeaders(route, headers);
      await page.goto(route);

      await expect(page).toHaveScreenshot(
        helper.getScreenshotPath(themeConfig.prefix, screenshotName),
      );
    });
  });
}

test.describe("Room selector single param", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes("default", {}, "room-selector");

  testAllThemes("with search", { search: true }, "room-search-selector");

  testAllThemes("with ru locale", { locale: "ru" }, "ru-room-selector");

  testAllThemes("with header", { header: true }, "header-room-selector");

  testAllThemes("with cancel button", { cancel: true }, "cancel-room-selector");
});

test.describe("Room selector two params", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "header + search",
    { header: true, search: true },
    "header-search-room-selector",
  );

  testAllThemes(
    "header + ru locale",
    { header: true, locale: "ru" },
    "header-ru-room-selector",
  );

  testAllThemes(
    "header + cancel",
    { header: true, cancel: true },
    "header-cancel-room-selector",
  );

  testAllThemes(
    "search + ru locale",
    { locale: "ru", search: true },
    "search-ru-room-selector",
  );

  testAllThemes(
    "search + cancel",
    { cancel: true, search: true },
    "search-cancel-room-selector",
  );

  testAllThemes(
    "ru locale + cancel",
    { locale: "ru", cancel: true },
    "ru-cancel-room-selector",
  );
});

test.describe("Room selector three params", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "header + search + ru locale",
    { header: true, locale: "ru", search: true },
    "header-search-ru-room-selector",
  );

  testAllThemes(
    "header + search + cancel",
    { header: true, cancel: true, search: true },
    "header-search-cancel-room-selector",
  );

  testAllThemes(
    "header + ru locale + cancel",
    { header: true, locale: "ru", cancel: true },
    "header-ru-cancel-room-selector",
  );

  testAllThemes(
    "search + ru locale + cancel",
    { locale: "ru", cancel: true, search: true },
    "search-ru-cancel-room-selector",
  );
});

test.describe("Room selector all params", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "all params",
    {
      header: true,
      locale: "ru",
      cancel: true,
      search: true,
    },
    "header-search-ru-cancel-room-selector",
  );
});

test.describe("Room selector interactions", () => {
  test.describe.configure({ mode: "parallel" });

  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: verify header visibility`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasHeader()).toBe(false);

      route = helper.buildRoute(themeConfig, { header: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasHeader()).toBe(true);
    });

    test(`${themeConfig.name}: verify search toggle`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasSearch()).toBe(false);

      route = helper.buildRoute(themeConfig, { search: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasSearch()).toBe(true);
    });

    test(`${themeConfig.name}: verify cancel button toggle`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasCancelButton()).toBe(false);

      route = helper.buildRoute(themeConfig, { cancel: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      expect(await roomSelectorPage.hasCancelButton()).toBe(true);
    });

    test(`${themeConfig.name}: verify room count`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);

      const count = await roomSelectorPage.getRoomCount();
      expect(count).toBeGreaterThan(0);
    });

    test(`${themeConfig.name}: verify breadcrumbs visibility`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);

      expect(await roomSelectorPage.hasBreadcrumbs()).toBe(true);
    });
  });
});

test.describe("Room selector button text", () => {
  test.describe.configure({ mode: "parallel" });

  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: custom accept button text`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {
        acceptLabel: "Select Room",
      });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);

      const buttonText = await roomSelectorPage.getAcceptButtonText();
      expect(buttonText).toContain("Select Room");
    });

    test(`${themeConfig.name}: custom cancel button text`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "room-selector");
      const roomSelectorPage = new RoomSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {
        cancel: true,
        cancelLabel: "Close",
      });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);

      const buttonText = await roomSelectorPage.getCancelButtonText();
      expect(buttonText).toContain("Close");
    });
  });
});

test.describe("Room selector locales", () => {
  test.describe.configure({ mode: "parallel" });

  const locales = ["en", "ru", "de", "fr", "es"];

  locales.forEach((locale) => {
    testAllThemes(`locale: ${locale}`, { locale }, `${locale}-room-selector`);
  });

  // Combined with other params
  locales.forEach((locale) => {
    testAllThemes(
      `locale ${locale} + search`,
      { locale, search: true },
      `${locale}-search-room-selector`,
    );
  });
});
