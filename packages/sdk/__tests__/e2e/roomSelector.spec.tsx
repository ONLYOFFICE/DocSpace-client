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
import { describe } from "node:test";

const path = "/sdk/room-selector";

describe("Render room selector light", () => {
  test("should open light /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-room-selector.png",
    ]);
  });

  test("should open light with search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-room-search-selector.png",
    ]);
  });

  test("should open light with ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-ru-room-selector.png",
    ]);
  });

  test("should open light with header /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-room-selector.png",
    ]);
  });

  test("should open light with cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-cancel-room-selector.png",
    ]);
  });

  test("should open light with header and search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-search-room-selector.png",
    ]);
  });

  test("should open light with header and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-ru-room-selector.png",
    ]);
  });

  test("should open light with header and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-cancel-room-selector.png",
    ]);
  });

  test("should open light with search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-search-ru-room-selector.png",
    ]);
  });

  test("should open light with search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-search-cancel-room-selector.png",
    ]);
  });

  test("should open light with ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-ru-cancel-room-selector.png",
    ]);
  });

  test("should open light with header, search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-search-ru-room-selector.png",
    ]);
  });

  test("should open light with header, search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-search-cancel-room-selector.png",
    ]);
  });

  test("should open light with search, ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-search-ru-cancel-room-selector.png",
    ]);
  });

  test("should open light with all features enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-all-features-room-selector.png",
    ]);
  });
});

describe("Room selector light empty", () => {
  test("should open light empty /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-room-selector.png",
    ]);
  });

  test("should open light empty with search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-room-search-selector.png",
    ]);
  });

  test("should open light empty with ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-ru-room-selector.png",
    ]);
  });

  test("should open light empty with header /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-room-selector.png",
    ]);
  });

  test("should open light empty with cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with header and search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-search-room-selector.png",
    ]);
  });

  test("should open light empty with header and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-ru-room-selector.png",
    ]);
  });

  test("should open light empty with header and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-search-ru-room-selector.png",
    ]);
  });

  test("should open light empty with search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-search-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-ru-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with header, search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-search-ru-room-selector.png",
    ]);
  });

  test("should open light empty with header, search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-search-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with search, ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ru&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-search-ru-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with all features enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ru&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-all-features-room-selector.png",
    ]);
  });
});

describe("Render room rtl selector light", () => {
  test("should open light with ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-ar-SA-room-selector.png",
    ]);
  });

  test("should open light with header and ar-SA  locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-ar-SA-room-selector.png",
    ]);
  });

  test("should open light with search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open light with ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open light with header, search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-header-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open light with search, ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-search-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open light with all features ar-SA enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-all-features-ar-SA-room-selector.png",
    ]);
  });
});

describe("Room selector rtl light empty", () => {
  test("should open light empty with ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-ar-SA-room-selector.png",
    ]);
  });

  test("should open light empty with header and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-ar-SA-room-selector.png",
    ]);
  });

  test("should open light empty with search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open light empty with ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with header, search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-header-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open light empty with search, ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&locale=ar-SA&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-search-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open light empty with all features ar-SA enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&header=true&locale=ar-SA&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "light-empty-all-features-ar-SA-room-selector.png",
    ]);
  });
});

describe("Render room selector dark", () => {
  test("should open dark /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-room-selector.png",
    ]);
  });

  test("should open dark with search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-room-search-selector.png",
    ]);
  });

  test("should open dark with ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-ru-room-selector.png",
    ]);
  });

  test("should open dark with header /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-room-selector.png",
    ]);
  });

  test("should open dark with cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-cancel-room-selector.png",
    ]);
  });

  test("should open dark with header and search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-search-room-selector.png",
    ]);
  });

  test("should open dark with header and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-ru-room-selector.png",
    ]);
  });

  test("should open dark with header and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-cancel-room-selector.png",
    ]);
  });

  test("should open dark with search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-search-ru-room-selector.png",
    ]);
  });

  test("should open dark with search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-search-cancel-room-selector.png",
    ]);
  });

  test("should open dark with ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-ru-cancel-room-selector.png",
    ]);
  });

  test("should open dark with header, search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-search-ru-room-selector.png",
    ]);
  });

  test("should open dark with header, search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-search-cancel-room-selector.png",
    ]);
  });

  test("should open dark with search, ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-search-ru-cancel-room-selector.png",
    ]);
  });

  test("should open dark with all features enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-all-features-room-selector.png",
    ]);
  });
});

describe("Room selector dark empty", () => {
  test("should open dark empty /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-room-selector.png",
    ]);
  });

  test("should open dark empty with search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-room-search-selector.png",
    ]);
  });

  test("should open dark empty with ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-ru-room-selector.png",
    ]);
  });

  test("should open dark empty with header /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-room-selector.png",
    ]);
  });

  test("should open dark empty with cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with header and search /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-search-room-selector.png",
    ]);
  });

  test("should open dark empty with header and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-ru-room-selector.png",
    ]);
  });

  test("should open dark empty with header and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-search-ru-room-selector.png",
    ]);
  });

  test("should open dark empty with search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-search-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-ru-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with header, search and ru locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-search-ru-room-selector.png",
    ]);
  });

  test("should open dark empty with header, search and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-search-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with search, ru locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ru&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-search-ru-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with all features enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-all-features-room-selector.png",
    ]);
  });
});

describe("Render room rtl selector dark", () => {
  test("should open dark with ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark with header and ar-SA  locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ar-SA`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark with search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark with ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open dark with header, search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ru&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-header-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark with search, ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-search-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open dark with all features ar-SA enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ar-SA&cancel=true&search=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-all-features-ar-SA-room-selector.png",
    ]);
  });
});

describe("Room selector rtl dark empty", () => {
  test("should open dark empty with ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark empty with header and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ar-SA`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark empty with search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark empty with ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&cancel=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with header, search and ar-SA locale /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ar-SA&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-header-search-ar-SA-room-selector.png",
    ]);
  });

  test("should open dark empty with search, ar-SA locale and cancel button /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&locale=ar-SA&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-search-ar-SA-cancel-room-selector.png",
    ]);
  });

  test("should open dark empty with all features ar-SA enabled /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&header=true&locale=ar-SA&cancel=true&search=true`;

    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "dark-empty-all-features-ar-SA-room-selector.png",
    ]);
  });
});

describe("Room selector custom labels", () => {
  test("should open with custom submit label /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=Custom`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "custom-submit-room-selector.png",
    ]);
  });

  test("should open with custom cancel label /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancelLabel=Custom&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "custom-cancel-room-selector.png",
    ]);
  });

  test("should open with custom submit and cancel label /sdk/room-selector route", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&acceptLabel=CustomSub&cancelLabel=CustomCan&cancel=true`;

    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "custom-submit-cancel-room-selector.png",
    ]);
  });
});

describe("Room selector actions", () => {
  test("should handle accept button click and validate console logs for regular room", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);
    await page.goto(pageRoute);

    // Add console log listener
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("onSelectCallback")) logs.push(msg.text());
    });

    const button = page.getByTestId("button");

    expect(button).toBeDisabled();

    // Select first room and click accept
    await page.getByTestId("selector-item-1").click();

    expect(button).toBeEnabled();

    await button.click();

    const hdrs = new Headers();
    hdrs.set(HEADER_ROOMS_LIST, "1");

    const roomList = await roomListHandler(hdrs).json();
    const selectedItem = roomList.response.folders[1];

    expect(selectedItem).toBeDefined();

    // Verify console logs
    expect(logs).toHaveLength(1);

    const submitedItem = JSON.parse(logs[0]).enrichedData;

    expect(submitedItem.id).toBe(selectedItem.id);
    expect(submitedItem.label).toBe(selectedItem.title);
    expect(submitedItem.roomType).toBe(selectedItem.roomType);
  });

  test("should handle cancel button click and validate console log", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Base&cancel=true&cancelLabel=Cancel`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    // Add console log listener
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("onCloseCallback")) logs.push(msg.text());
    });

    const button = page.getByText("Cancel");

    await button.click();

    // Verify console logs
    expect(logs).toHaveLength(1);
  });
});

describe("Room selector search actions", () => {
  test("should handle search input", async ({ page, mockRequest }) => {
    const pageRoute = `${path}?theme=Base&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await mockRequest.router([endpoints.filteredRoomList]);

    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder("Search");
    await searchInput.fill("test");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-search-room-selector.png",
    ]);

    await mockRequest.router([endpoints.emptyRoomList]);

    await searchInput.fill("Empty filter");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-empty-search-room-selector.png",
    ]);
  });

  test("should handle search  input ar-SA", async ({ page, mockRequest }) => {
    const pageRoute = `${path}?theme=Base&search=true&locale=ar-SA`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await mockRequest.router([endpoints.filteredRoomList]);

    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder("بحث");
    await searchInput.fill("test");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-ar-SA-search-room-selector.png",
    ]);

    await mockRequest.router([endpoints.emptyRoomList]);

    await searchInput.fill("Empty filter");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-ar-SA-empty-search-room-selector.png",
    ]);
  });

  test("should handle dark search input", async ({ page, mockRequest }) => {
    const pageRoute = `${path}?theme=Dark&search=true`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await mockRequest.router([endpoints.filteredRoomList]);

    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder("Search");
    await searchInput.fill("test");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-search-dark-room-selector.png",
    ]);

    await mockRequest.router([endpoints.emptyRoomList]);

    await searchInput.fill("Empty filter");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-empty-dark-search-room-selector.png",
    ]);
  });

  test("should handle dark search input ar-SA", async ({
    page,
    mockRequest,
  }) => {
    const pageRoute = `${path}?theme=Dark&search=true&locale=ar-SA`;
    await mockRequest.setHeaders(pageRoute, [HEADER_ROOMS_LIST]);

    await page.goto(pageRoute);

    await mockRequest.router([endpoints.filteredRoomList]);

    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder("بحث");
    await searchInput.fill("test");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-ar-SA-dark-search-room-selector.png",
    ]);

    await mockRequest.router([endpoints.emptyRoomList]);

    await searchInput.fill("Empty filter");

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot([
      "desktop",
      "room-selector",
      "action-ar-SA-dark-empty-search-room-selector.png",
    ]);
  });
});
