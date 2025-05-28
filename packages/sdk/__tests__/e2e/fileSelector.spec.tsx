/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import {
  endpoints,
  HEADER_EMPTY_FOLDER,
  HEADER_ROOMS_LIST,
} from "@docspace/shared/__mocks__/e2e";
import { FilterType } from "@docspace/shared/enums";

import { expect, test } from "./fixtures/base";
import { describe } from "node:test";

const path = "/sdk/file-selector";

describe("File selector single param light", () => {
  test("should open base theme with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-default.png",
    ]);
  });

  test("should open base theme with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label.png",
    ]);
  });

  test("should open base theme with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs.png",
    ]);
  });

  test("should open base theme with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel.png",
    ]);
  });

  test("should open base theme with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label.png",
    ]);
  });

  test("should open base theme with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter.png",
    ]);
  });

  test("should open base theme with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id.png",
    ]);
  });

  test("should open base theme with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search.png",
    ]);
  });

  test("should open base theme with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-rooms-only.png",
    ]);
  });

  test("should open base theme with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-user-folder-only.png",
    ]);
  });

  test("should open base theme with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-subtitle.png",
    ]);
  });
});

describe("File selector single param dark", () => {
  test("should open dark theme with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-default.png",
    ]);
  });

  test("should open dark theme with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&acceptLabel=CustomAccept`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-accept-label.png",
    ]);
  });

  test("should open dark theme with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&breadCrumbs=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-breadcrumbs.png",
    ]);
  });

  test("should open dark theme with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-cancel.png",
    ]);
  });

  test("should open dark theme with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-cancel-label.png",
    ]);
  });

  test("should open dark theme with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-filter.png",
    ]);
  });

  test("should open dark theme with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-id.png",
    ]);
  });

  test("should open dark theme with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-search.png",
    ]);
  });

  test("should open dark theme with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-rooms-only.png",
    ]);
  });

  test("should open dark theme with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-user-folder-only.png",
    ]);
  });

  test("should open dark theme with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-subtitle.png",
    ]);
  });
});

describe("File selector single param RTL light", () => {
  // Default test
  test("should open rtl base theme with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-default.png",
    ]);
  });

  test("should open rtl base theme with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&acceptLabel=CustomAccept`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-accept-label.png",
    ]);
  });

  test("should open rtl base theme with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&breadCrumbs=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-breadcrumbs.png",
    ]);
  });

  test("should open rtl base theme with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-cancel.png",
    ]);
  });

  test("should open rtl base theme with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-cancel-label.png",
    ]);
  });

  test("should open rtl base theme with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-filter.png",
    ]);
  });

  test("should open rtl base theme with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-id.png",
    ]);
  });

  test("should open rtl base theme with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-search.png",
    ]);
  });

  test("should open rtl base theme with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-rooms-only.png",
    ]);
  });

  test("should open rtl base theme with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-user-folder-only.png",
    ]);
  });

  test("should open rtl base theme with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-rtl-base-subtitle.png",
    ]);
  });
});

describe("File selector param combinations light", () => {
  test("should open with search, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-breadcrumbs-cancel.png",
    ]);
  });

  test("should open with search, breadcrumbs and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-breadcrumbs-id.png",
    ]);
  });

  test("should open with search, breadcrumbs and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-breadcrumbs-subtitle.png",
    ]);
  });

  test("should open with search, cancel and acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&cancel=true&acceptLabel=CustomAccept`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-cancel-accept-label.png",
    ]);
  });

  test("should open with search, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&cancel=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-cancel-filter.png",
    ]);
  });

  test("should open with breadcrumbs, cancel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-cancel-rooms-only.png",
    ]);
  });

  test("should open with breadcrumbs, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-id-subtitle.png",
    ]);
  });

  test("should open with cancel, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-accept-label-cancel-label.png",
    ]);
  });

  test("should open with filter, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-id-user-folder-only.png",
    ]);
  });

  test("should open with subtitle, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&subtitle=true&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-subtitle-accept-label-filter.png",
    ]);
  });

  test("should open with search, selectorType and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&selectorType=roomsOnly&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-rooms-only-subtitle.png",
    ]);
  });

  test("should open with search, filter and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&filter=${FilterType.DocumentsOnly}&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-filter-cancel-label.png",
    ]);
  });

  test("should open with breadcrumbs, filter and acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&acceptLabel=CustomAccept`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-filter-accept-label.png",
    ]);
  });

  test("should open with cancel, subtitle and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&subtitle=true&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-subtitle-user-folder-only.png",
    ]);
  });

  test("should open with id, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&cancelLabel=CustomCancel&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-cancel-label-rooms-only.png",
    ]);
  });

  test("should open with filter, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&cancelLabel=CustomCancel&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-cancel-label-subtitle.png",
    ]);
  });

  test("should open with breadcrumbs, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&acceptLabel=CustomAccept&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-accept-label-user-folder-only.png",
    ]);
  });

  test("should open with acceptLabel, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-id-subtitle.png",
    ]);
  });

  test("should open with acceptLabel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-search-rooms-only.png",
    ]);
  });

  test("should open with breadcrumbs, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancelLabel=CustomCancel&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-cancel-label-subtitle.png",
    ]);
  });

  test("should open with cancel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-filter-id.png",
    ]);
  });

  test("should open with cancel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-search-user-folder-only.png",
    ]);
  });

  test("should open with cancelLabel, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-search-subtitle.png",
    ]);
  });

  test("should open with filter, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-search-subtitle.png",
    ]);
  });

  test("should open with id, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-search-rooms-only.png",
    ]);
  });

  test("should open with acceptLabel, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&breadCrumbs=true&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-breadcrumbs-cancel.png",
    ]);
  });

  test("should open with acceptLabel, breadcrumbs and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&breadCrumbs=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-breadcrumbs-filter.png",
    ]);
  });

  test("should open with acceptLabel, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancel=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-cancel-filter.png",
    ]);
  });

  test("should open with acceptLabel, cancel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancel=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-cancel-id.png",
    ]);
  });

  test("should open with acceptLabel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-filter-id.png",
    ]);
  });

  test("should open with acceptLabel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-filter-rooms-only.png",
    ]);
  });

  test("should open with acceptLabel, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancelLabel=CustomCancel&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-cancel-label-subtitle.png",
    ]);
  });

  test("should open with acceptLabel, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancelLabel=CustomCancel&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-accept-label-cancel-label-user-folder-only.png",
    ]);
  });

  test("should open with breadcrumbs, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-cancel-filter.png",
    ]);
  });

  test("should open with breadcrumbs, cancel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-cancel-id.png",
    ]);
  });

  test("should open with breadcrumbs, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-filter-id.png",
    ]);
  });

  test("should open with breadcrumbs, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-filter-rooms-only.png",
    ]);
  });

  test("should open with breadcrumbs, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-filter-subtitle.png",
    ]);
  });

  test("should open with breadcrumbs, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-id-selector-type.png",
    ]);
  });

  test("should open with breadcrumbs, search and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-search-cancel-label.png",
    ]);
  });

  test("should open with breadcrumbs, search and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-search-filter.png",
    ]);
  });

  test("should open with breadcrumbs, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-search-rooms-only.png",
    ]);
  });

  test("should open with cancel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-filter-selector-type.png",
    ]);
  });

  test("should open with cancel, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-filter-subtitle.png",
    ]);
  });

  test("should open with cancel, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-id-subtitle.png",
    ]);
  });

  test("should open with cancel, search and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-search-cancel-label.png",
    ]);
  });

  test("should open with cancel, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-search-id.png",
    ]);
  });

  test("should open with cancel, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-search-subtitle.png",
    ]);
  });

  test("should open with cancel, cancelLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-cancel-label-filter.png",
    ]);
  });

  test("should open with cancel, cancelLabel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-cancel-label-id.png",
    ]);
  });

  test("should open with cancel, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-cancel-label-user-folder-only.png",
    ]);
  });

  test("should open with cancel, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-cancel-label-subtitle.png",
    ]);
  });

  test("should open with cancelLabel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-filter-id.png",
    ]);
  });

  test("should open with cancelLabel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-filter-rooms-only.png",
    ]);
  });

  test("should open with cancelLabel, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-id-user-folder-only.png",
    ]);
  });

  test("should open with cancelLabel, search and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-search-filter.png",
    ]);
  });

  test("should open with cancelLabel, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-search-id.png",
    ]);
  });

  test("should open with cancelLabel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-cancel-label-search-rooms-only.png",
    ]);
  });

  test("should open with filter, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-id-subtitle.png",
    ]);
  });

  test("should open with filter, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-search-id.png",
    ]);
  });

  test("should open with filter, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-filter-search-selector-type.png",
    ]);
  });

  test("should open with id, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-accept-label-cancel-label.png",
    ]);
  });

  test("should open with id, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-accept-label-filter.png",
    ]);
  });

  test("should open with id, acceptLabel and search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-accept-label-search.png",
    ]);
  });

  test("should open with id, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-accept-label-rooms-only.png",
    ]);
  });

  test("should open with id, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-breadcrumbs-cancel.png",
    ]);
  });

  test("should open with id, breadcrumbs and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-breadcrumbs-filter.png",
    ]);
  });

  test("should open with id, breadcrumbs and search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-id-breadcrumbs-search.png",
    ]);
  });

  test("should open with search, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-accept-label-cancel-label.png",
    ]);
  });

  test("should open with search, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-accept-label-filter.png",
    ]);
  });

  test("should open with search, acceptLabel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-accept-label-id.png",
    ]);
  });

  test("should open with search, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-accept-label-rooms-only.png",
    ]);
  });

  test("should open with search, acceptLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-search-accept-label-subtitle.png",
    ]);
  });

  test("should open with selectorType, acceptLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&acceptLabel=CustomAccept&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-accept-label-subtitle.png",
    ]);
  });

  test("should open with selectorType, breadcrumbs and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&breadCrumbs=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-breadcrumbs-subtitle.png",
    ]);
  });

  test("should open with selectorType, cancel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&cancel=true&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-cancel-subtitle.png",
    ]);
  });

  test("should open with selectorType, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&cancelLabel=CustomCancel&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-cancel-label-subtitle.png",
    ]);
  });

  test("should open with selectorType, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&filter=${FilterType.DocumentsOnly}&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-filter-subtitle.png",
    ]);
  });

  test("should open with selectorType, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-selector-type-id-subtitle.png",
    ]);
  });

  test("should open with breadcrumbs, cancel label and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancelLabel=CustomCancel&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);
    await mockRequest.router([endpoints.folder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-base-breadcrumbs-cancel-label-id.png",
    ]);
  });
});

describe("File selector single param light empty", () => {
  test("should open base theme empty with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-default.png",
    ]);
  });

  test("should open base theme empty with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label.png",
    ]);
  });

  test("should open base theme empty with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs.png",
    ]);
  });

  test("should open base theme empty with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel.png",
    ]);
  });

  test("should open base theme empty with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label.png",
    ]);
  });

  test("should open base theme empty with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter.png",
    ]);
  });

  test("should open base theme empty with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id.png",
    ]);
  });

  test("should open base theme empty with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search.png",
    ]);
  });

  test("should open base theme empty with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-rooms-only.png",
    ]);
  });

  test("should open base theme empty with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-user-folder-only.png",
    ]);
  });

  test("should open base theme empty with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-subtitle.png",
    ]);
  });
});

describe("File selector single param dark empty", () => {
  test("should open dark theme empty with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-default.png",
    ]);
  });

  test("should open dark theme empty with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&acceptLabel=CustomAccept`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-accept-label.png",
    ]);
  });

  test("should open dark theme empty with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&breadCrumbs=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-breadcrumbs.png",
    ]);
  });

  test("should open dark theme empty with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-cancel.png",
    ]);
  });

  test("should open dark theme empty with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-cancel-label.png",
    ]);
  });

  test("should open dark theme empty with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-filter.png",
    ]);
  });

  test("should open dark theme empty with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-id.png",
    ]);
  });

  test("should open dark theme empty with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&search=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-search.png",
    ]);
  });

  test("should open dark theme empty with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-rooms-only.png",
    ]);
  });

  test("should open dark theme empty with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-user-folder-only.png",
    ]);
  });

  test("should open dark theme empty with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-dark-empty-subtitle.png",
    ]);
  });
});

describe("File selector single param RTL light empty", () => {
  // Default test
  test("should open empty rtl base theme with default parameters /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-default.png",
    ]);
  });

  test("should open empty rtl base theme with acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&acceptLabel=CustomAccept`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-accept-label.png",
    ]);
  });

  test("should open empty rtl base theme with breadcrumbs /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&breadCrumbs=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-breadcrumbs.png",
    ]);
  });

  test("should open empty rtl base theme with cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&cancel=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-cancel.png",
    ]);
  });

  test("should open empty rtl base theme with cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-cancel-label.png",
    ]);
  });

  test("should open empty rtl base theme with filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-filter.png",
    ]);
  });

  test("should open empty rtl base theme with id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-id.png",
    ]);
  });

  test("should open empty rtl base theme with search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&search=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-search.png",
    ]);
  });

  test("should open empty rtl base theme with roomsOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-rooms-only.png",
    ]);
  });

  test("should open empty rtl base theme with userFolderOnly selector type /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-user-folder-only.png",
    ]);
  });

  test("should open empty rtl base theme with subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?locale=ar-SA&theme=Base&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-rtl-base-subtitle.png",
    ]);
  });
});

describe("File selector param combinations light empty", () => {
  test("should open empty with search, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&cancel=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-breadcrumbs-cancel.png",
    ]);
  });

  test("should open empty with search, breadcrumbs and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-breadcrumbs-id.png",
    ]);
  });

  test("should open empty with search, breadcrumbs and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&breadCrumbs=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-breadcrumbs-subtitle.png",
    ]);
  });

  test("should open empty with search, cancel and acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&cancel=true&acceptLabel=CustomAccept`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-cancel-accept-label.png",
    ]);
  });

  test("should open empty with search, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&cancel=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-cancel-filter.png",
    ]);
  });

  test("should open empty with breadcrumbs, cancel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-cancel-rooms-only.png",
    ]);
  });

  test("should open empty with breadcrumbs, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-id-subtitle.png",
    ]);
  });

  test("should open empty with cancel, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-accept-label-cancel-label.png",
    ]);
  });

  test("should open empty with filter, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-id-user-folder-only.png",
    ]);
  });

  test("should open empty with subtitle, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&subtitle=true&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-subtitle-accept-label-filter.png",
    ]);
  });

  test("should open empty with search, selectorType and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&selectorType=roomsOnly&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-rooms-only-subtitle.png",
    ]);
  });

  test("should open empty with search, filter and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&filter=${FilterType.DocumentsOnly}&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-filter-cancel-label.png",
    ]);
  });

  test("should open empty with breadcrumbs, filter and acceptLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&acceptLabel=CustomAccept`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-filter-accept-label.png",
    ]);
  });

  test("should open empty with cancel, subtitle and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&subtitle=true&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-subtitle-user-folder-only.png",
    ]);
  });

  test("should open empty with id, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&cancelLabel=CustomCancel&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-cancel-label-rooms-only.png",
    ]);
  });

  test("should open empty with filter, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&cancelLabel=CustomCancel&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-cancel-label-subtitle.png",
    ]);
  });

  test("should open empty with breadcrumbs, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&acceptLabel=CustomAccept&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-accept-label-user-folder-only.png",
    ]);
  });

  test("should open empty with acceptLabel, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-id-subtitle.png",
    ]);
  });

  test("should open empty with acceptLabel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&search=true&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-search-rooms-only.png",
    ]);
  });

  test("should open empty with breadcrumbs, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancelLabel=CustomCancel&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-cancel-label-subtitle.png",
    ]);
  });

  test("should open empty with cancel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-filter-id.png",
    ]);
  });

  test("should open empty with cancel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-search-user-folder-only.png",
    ]);
  });

  test("should open empty with cancelLabel, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-search-subtitle.png",
    ]);
  });

  test("should open empty with filter, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-search-subtitle.png",
    ]);
  });

  test("should open empty with id, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&search=true&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-search-rooms-only.png",
    ]);
  });

  test("should open empty with acceptLabel, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&breadCrumbs=true&cancel=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-breadcrumbs-cancel.png",
    ]);
  });

  test("should open empty with acceptLabel, breadcrumbs and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&breadCrumbs=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-breadcrumbs-filter.png",
    ]);
  });

  test("should open empty with acceptLabel, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancel=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-cancel-filter.png",
    ]);
  });

  test("should open empty with acceptLabel, cancel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancel=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-cancel-id.png",
    ]);
  });

  test("should open empty with acceptLabel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-filter-id.png",
    ]);
  });

  test("should open empty with acceptLabel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-filter-rooms-only.png",
    ]);
  });

  test("should open empty with acceptLabel, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancelLabel=CustomCancel&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-cancel-label-subtitle.png",
    ]);
  });

  test("should open empty with acceptLabel, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomAccept&cancelLabel=CustomCancel&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-accept-label-cancel-label-user-folder-only.png",
    ]);
  });

  test("should open empty with breadcrumbs, cancel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-cancel-filter.png",
    ]);
  });

  test("should open empty with breadcrumbs, cancel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancel=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-cancel-id.png",
    ]);
  });

  test("should open empty with breadcrumbs, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-filter-id.png",
    ]);
  });

  test("should open empty with breadcrumbs, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-filter-rooms-only.png",
    ]);
  });

  test("should open empty with breadcrumbs, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&filter=${FilterType.DocumentsOnly}&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-filter-subtitle.png",
    ]);
  });

  test("should open empty with breadcrumbs, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-id-selector-type.png",
    ]);
  });

  test("should open empty with breadcrumbs, search and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-search-cancel-label.png",
    ]);
  });

  test("should open empty with breadcrumbs, search and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-search-filter.png",
    ]);
  });

  test("should open empty with breadcrumbs, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&search=true&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-search-rooms-only.png",
    ]);
  });

  test("should open empty with cancel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-filter-selector-type.png",
    ]);
  });

  test("should open empty with cancel, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&filter=${FilterType.DocumentsOnly}&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-filter-subtitle.png",
    ]);
  });

  test("should open empty with cancel, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-id-subtitle.png",
    ]);
  });

  test("should open empty with cancel, search and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-search-cancel-label.png",
    ]);
  });

  test("should open empty with cancel, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-search-id.png",
    ]);
  });

  test("should open empty with cancel, search and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-search-subtitle.png",
    ]);
  });

  test("should open empty with cancel, cancelLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-cancel-label-filter.png",
    ]);
  });

  test("should open empty with cancel, cancelLabel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-cancel-label-id.png",
    ]);
  });

  test("should open empty with cancel, cancelLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&selectorType=userFolderOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-cancel-label-user-folder-only.png",
    ]);
  });

  test("should open empty with cancel, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=CustomCancel&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-cancel-label-subtitle.png",
    ]);
  });

  test("should open empty with cancelLabel, filter and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-filter-id.png",
    ]);
  });

  test("should open empty with cancelLabel, filter and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&filter=${FilterType.DocumentsOnly}&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-filter-rooms-only.png",
    ]);
  });

  test("should open empty with cancelLabel, id and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&id=5&selectorType=userFolderOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-id-user-folder-only.png",
    ]);
  });

  test("should open empty with cancelLabel, search and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-search-filter.png",
    ]);
  });

  test("should open empty with cancelLabel, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-search-id.png",
    ]);
  });

  test("should open empty with cancelLabel, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=CustomCancel&search=true&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-cancel-label-search-rooms-only.png",
    ]);
  });

  test("should open empty with filter, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-id-subtitle.png",
    ]);
  });

  test("should open empty with filter, search and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-search-id.png",
    ]);
  });

  test("should open empty with filter, search and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&filter=${FilterType.DocumentsOnly}&search=true&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-filter-search-selector-type.png",
    ]);
  });

  test("should open empty with id, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-accept-label-cancel-label.png",
    ]);
  });

  test("should open empty with id, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-accept-label-filter.png",
    ]);
  });

  test("should open empty with id, acceptLabel and search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-accept-label-search.png",
    ]);
  });

  test("should open empty with id, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&acceptLabel=CustomAccept&selectorType=roomsOnly`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-accept-label-rooms-only.png",
    ]);
  });

  test("should open empty with id, breadcrumbs and cancel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&cancel=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-breadcrumbs-cancel.png",
    ]);
  });

  test("should open empty with id, breadcrumbs and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&filter=${FilterType.DocumentsOnly}`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-breadcrumbs-filter.png",
    ]);
  });

  test("should open empty with id, breadcrumbs and search /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&id=5&breadCrumbs=true&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-id-breadcrumbs-search.png",
    ]);
  });

  test("should open empty with search, acceptLabel and cancelLabel /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&cancelLabel=CustomCancel`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-accept-label-cancel-label.png",
    ]);
  });

  test("should open empty with search, acceptLabel and filter /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&filter=${FilterType.DocumentsOnly}`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-accept-label-filter.png",
    ]);
  });

  test("should open empty with search, acceptLabel and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-accept-label-id.png",
    ]);
  });

  test("should open empty with search, acceptLabel and selectorType /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&selectorType=roomsOnly`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-accept-label-rooms-only.png",
    ]);
  });

  test("should open empty with search, acceptLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true&acceptLabel=CustomAccept&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-search-accept-label-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, acceptLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&acceptLabel=CustomAccept&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-accept-label-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, breadcrumbs and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&breadCrumbs=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-breadcrumbs-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, cancel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&cancel=true&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-cancel-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, cancelLabel and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&cancelLabel=CustomCancel&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-cancel-label-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, filter and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&filter=${FilterType.DocumentsOnly}&subtitle=true`;

    await page.goto(pageRoute);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-filter-subtitle.png",
    ]);
  });

  test("should open empty with selectorType, id and subtitle /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&selectorType=roomsOnly&id=5&subtitle=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-selector-type-id-subtitle.png",
    ]);
  });

  test("should open empty with breadcrumbs, cancel label and id /sdk/file-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&breadCrumbs=true&cancelLabel=CustomCancel&id=5`;
    await mockRequest.setHeaders(pageRoute, [HEADER_EMPTY_FOLDER]);

    await page.goto(pageRoute);
    await mockRequest.router([endpoints.emptyFolder]);
    await expect(page).toHaveScreenshot([
      "desktop",
      "file-selector",
      "file-selector-empty-base-breadcrumbs-cancel-label-id.png",
    ]);
  });
});
