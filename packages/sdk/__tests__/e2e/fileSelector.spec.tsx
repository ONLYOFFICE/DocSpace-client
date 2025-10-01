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
  HEADER_EMPTY_FOLDER,
  HEADER_ROOMS_LIST,
  TEndpoint,
} from "@docspace/shared/__mocks__/e2e";
import { FilterType } from "@docspace/shared/enums";

import { expect, test } from "./fixtures/base";
import { THEMES, TestHelper } from "./utils/testHelpers";
import { FileSelectorPage } from "./page-objects/SelectorPages";

const BASE_PATH = "/sdk/file-selector";

function testAllThemes(
  testName: string,
  params: Record<string, any>,
  screenshotName: string,
  headers: string[] = [HEADER_ROOMS_LIST],
  routerEndpoints?: TEndpoint[],
) {
  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: ${testName}`, async ({ page, mockRequest }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const route = helper.buildRoute(themeConfig, params);

      await mockRequest.setHeaders(route, headers);

      if (routerEndpoints) {
        await mockRequest.router(routerEndpoints);
      }

      await page.goto(route);

      await expect(page).toHaveScreenshot(
        helper.getScreenshotPath(themeConfig.prefix, screenshotName),
      );
    });
  });
}

test.describe("File selector single param", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes("default parameters", {}, "default");

  testAllThemes("acceptLabel", { acceptLabel: "CustomAccept" }, "accept-label");

  testAllThemes("breadcrumbs", { breadCrumbs: true }, "breadcrumbs");

  testAllThemes("cancel", { cancel: true }, "cancel");

  testAllThemes("cancelLabel", { cancelLabel: "CustomCancel" }, "cancel-label");

  testAllThemes("filter", { filter: FilterType.DocumentsOnly }, "filter");

  testAllThemes("id", { id: 5 }, "id", [HEADER_ROOMS_LIST], [endpoints.folder]);

  testAllThemes("search", { search: true }, "search");

  testAllThemes(
    "roomsOnly selector type",
    { selectorType: "roomsOnly" },
    "rooms-only",
  );

  testAllThemes(
    "userFolderOnly selector type",
    { selectorType: "userFolderOnly" },
    "user-folder-only",
  );

  testAllThemes("subtitle", { subtitle: true }, "subtitle");
});

test.describe("File selector multiple params", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "acceptLabel + breadcrumbs",
    { acceptLabel: "CustomAccept", breadCrumbs: true },
    "accept-label-breadcrumbs",
  );

  testAllThemes(
    "acceptLabel + cancel",
    { acceptLabel: "CustomAccept", cancel: true },
    "accept-label-cancel",
  );

  testAllThemes(
    "acceptLabel + cancelLabel",
    { acceptLabel: "CustomAccept", cancelLabel: "CustomCancel" },
    "accept-label-cancel-label",
  );

  testAllThemes(
    "acceptLabel + filter",
    { acceptLabel: "CustomAccept", filter: FilterType.DocumentsOnly },
    "accept-label-filter",
  );

  testAllThemes(
    "acceptLabel + id",
    { acceptLabel: "CustomAccept", id: 5 },
    "accept-label-id",
    [HEADER_ROOMS_LIST],
    [endpoints.folder],
  );

  testAllThemes(
    "acceptLabel + search",
    { acceptLabel: "CustomAccept", search: true },
    "accept-label-search",
  );

  testAllThemes(
    "acceptLabel + roomsOnly",
    { acceptLabel: "CustomAccept", selectorType: "roomsOnly" },
    "accept-label-rooms-only",
  );

  testAllThemes(
    "acceptLabel + userFolderOnly",
    { acceptLabel: "CustomAccept", selectorType: "userFolderOnly" },
    "accept-label-user-folder-only",
  );

  testAllThemes(
    "acceptLabel + subtitle",
    { acceptLabel: "CustomAccept", subtitle: true },
    "accept-label-subtitle",
  );

  testAllThemes(
    "breadcrumbs + cancel",
    { breadCrumbs: true, cancel: true },
    "breadcrumbs-cancel",
  );

  testAllThemes(
    "breadcrumbs + cancelLabel",
    { breadCrumbs: true, cancelLabel: "CustomCancel" },
    "breadcrumbs-cancel-label",
  );

  testAllThemes(
    "breadcrumbs + filter",
    { breadCrumbs: true, filter: FilterType.DocumentsOnly },
    "breadcrumbs-filter",
  );

  testAllThemes(
    "breadcrumbs + id",
    { breadCrumbs: true, id: 5 },
    "breadcrumbs-id",
    [HEADER_ROOMS_LIST],
    [endpoints.folder],
  );

  testAllThemes(
    "breadcrumbs + search",
    { breadCrumbs: true, search: true },
    "breadcrumbs-search",
  );

  testAllThemes(
    "breadcrumbs + roomsOnly",
    { breadCrumbs: true, selectorType: "roomsOnly" },
    "breadcrumbs-rooms-only",
  );

  testAllThemes(
    "breadcrumbs + userFolderOnly",
    { breadCrumbs: true, selectorType: "userFolderOnly" },
    "breadcrumbs-user-folder-only",
  );

  testAllThemes(
    "breadcrumbs + subtitle",
    { breadCrumbs: true, subtitle: true },
    "breadcrumbs-subtitle",
  );
});

test.describe("File selector complex params", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "acceptLabel + breadcrumbs + cancel",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      cancel: true,
    },
    "accept-label-breadcrumbs-cancel",
  );

  testAllThemes(
    "acceptLabel + breadcrumbs + cancelLabel",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      cancelLabel: "CustomCancel",
    },
    "accept-label-breadcrumbs-cancel-label",
  );

  testAllThemes(
    "acceptLabel + breadcrumbs + filter",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      filter: FilterType.DocumentsOnly,
    },
    "accept-label-breadcrumbs-filter",
  );

  testAllThemes(
    "acceptLabel + breadcrumbs + search",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      search: true,
    },
    "accept-label-breadcrumbs-search",
  );

  testAllThemes(
    "acceptLabel + breadcrumbs + roomsOnly",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      selectorType: "roomsOnly",
    },
    "accept-label-breadcrumbs-rooms-only",
  );

  testAllThemes(
    "acceptLabel + cancel + filter",
    {
      acceptLabel: "CustomAccept",
      cancel: true,
      filter: FilterType.DocumentsOnly,
    },
    "accept-label-cancel-filter",
  );

  testAllThemes(
    "acceptLabel + cancel + search",
    {
      acceptLabel: "CustomAccept",
      cancel: true,
      search: true,
    },
    "accept-label-cancel-search",
  );

  testAllThemes(
    "all params combined",
    {
      acceptLabel: "CustomAccept",
      breadCrumbs: true,
      cancel: true,
      cancelLabel: "CustomCancel",
      filter: FilterType.DocumentsOnly,
      search: true,
      subtitle: true,
    },
    "all-params",
  );
});

test.describe("File selector interactions", () => {
  test.describe.configure({ mode: "parallel" });

  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: verify header visibility`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasHeader()).toBe(false);

      route = helper.buildRoute(themeConfig, { header: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasHeader()).toBe(true);
    });

    test(`${themeConfig.name}: verify breadcrumbs toggle`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasBreadcrumbs()).toBe(false);

      route = helper.buildRoute(themeConfig, { breadCrumbs: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasBreadcrumbs()).toBe(true);
    });

    test(`${themeConfig.name}: verify search toggle`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasSearch()).toBe(false);

      route = helper.buildRoute(themeConfig, { search: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasSearch()).toBe(true);
    });

    test(`${themeConfig.name}: verify cancel button toggle`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      let route = helper.buildRoute(themeConfig, {});
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasCancelButton()).toBe(false);

      route = helper.buildRoute(themeConfig, { cancel: true });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await fileSelectorPage.hasCancelButton()).toBe(true);
    });

    test(`${themeConfig.name}: verify accept button text`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {
        acceptLabel: "CustomAccept",
      });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const buttonText = await fileSelectorPage.getAcceptButtonText();
      expect(buttonText).toContain("CustomAccept");
    });

    test(`${themeConfig.name}: verify cancel button text`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      const route = helper.buildRoute(themeConfig, {
        cancel: true,
        cancelLabel: "CustomCancel",
      });
      await mockRequest.setHeaders(route, [HEADER_ROOMS_LIST]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const buttonText = await fileSelectorPage.getCancelButtonText();
      expect(buttonText).toContain("CustomCancel");
    });
  });
});

test.describe("File selector empty folder", () => {
  test.describe.configure({ mode: "parallel" });

  testAllThemes(
    "empty folder state",
    { id: 999 },
    "empty-folder",
    [HEADER_EMPTY_FOLDER],
    [endpoints.folder],
  );

  THEMES.forEach((themeConfig) => {
    test(`${themeConfig.name}: verify empty folder message`, async ({
      page,
      mockRequest,
    }) => {
      const helper = new TestHelper(BASE_PATH, "file-selector");
      const fileSelectorPage = new FileSelectorPage(page);

      const route = helper.buildRoute(themeConfig, { id: 999 });
      await mockRequest.setHeaders(route, [HEADER_EMPTY_FOLDER]);
      await mockRequest.router([endpoints.folder]);
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      expect(await fileSelectorPage.isEmptyFolder()).toBe(true);
    });
  });
});
