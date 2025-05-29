// (c) Copyright Ascensio System SIA 2009-2025
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
  API_PREFIX,
  BASE_URL,
  endpoints,
  getConfirmSuccess,
  getSuccessColorTheme,
  HEADER_SELF_ERROR_404,
  settingsNoAuth,
  successSelf,
  tfaAppSuccess,
} from "@docspace/shared/__mocks__/e2e";
import { createGetTfaSecretKeyAndQRHandler } from "@docspace/shared/__mocks__/login/handlers/getTfaSecretKeyAndQR";
import { expect, test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { http, HttpResponse } from "msw";
const URL = "/login/confirm/TfaActivation";
const NEXT_REQUEST_URL = "*/**/login/confirm/TfaActivation";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "TfaActivation",
  },

  {
    name: "email",
    value: "mail@mail.com",
  },
];

// const QUERY_PARAMS_WITH_LINK_DATA = QUERY_PARAMS.concat([
//   {
//     name: "linkData",
//     value: "yJ0eXBlIjoiTGlua0ludml",
//   },
//   {
//     name: "publicAuth",
//     value: "null",
//   },
// ]);

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);
// const URL_WITH_LINK_DATA_PARAMS = getUrlWithQueryParams(
//   URL,
//   QUERY_PARAMS_WITH_LINK_DATA,
// );
// const NEXT_REQUEST_URL_WITH_PARAMS = getUrlWithQueryParams(
//   NEXT_REQUEST_URL,
//   QUERY_PARAMS,
// );

const getHandlers = (port: string) => [
  http.get(
    `http://localhost:${port}/${API_PREFIX}/settings/tfaapp/setup`,
    () => {
      return HttpResponse.json(tfaAppSuccess);
    },
  ),
  http.get(
    `http://localhost:${port}/${API_PREFIX}/settings?withPassword=true`,
    () => {
      return HttpResponse.json(settingsNoAuth);
    },
  ),
  http.get(`http://localhost:${port}/${API_PREFIX}/people/*`, () => {
    return HttpResponse.json(successSelf);
  }),
  http.get(`http://localhost:${port}/${API_PREFIX}/settings/colortheme`, () => {
    return HttpResponse.json(getSuccessColorTheme());
  }),
  http.post(
    `http://localhost:${port}/${API_PREFIX}/authentication/confirm`,
    () => {
      return HttpResponse.json(getConfirmSuccess());
    },
  ),
];

test.beforeAll(async ({ requestInterceptor, port }) => {
  requestInterceptor.use(...getHandlers(port));
});

test("tfa activation render", async ({ page, port }) => {
  await page.goto(`http://localhost:${port}${URL_WITH_PARAMS}`);

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-activation",
    "tfa-activation-render.png",
  ]);
});

// test("tfa activation success", async ({ page, mockRequest }) => {
//   await mockRequest.router([
//     endpoints.tfaAppValidate,
//     endpoints.loginWithTfaCode,
//   ]);
//   await page.goto(URL_WITH_PARAMS);

//   await page.getByTestId("text-input").fill("123456");

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "tfa-activation",
//     "tfa-activation-success.png",
//   ]);

//   await page.getByTestId("button").click();

//   await page.waitForURL("/profile", { waitUntil: "load" });

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "tfa-activation",
//     "tfa-activation-success-redirect.png",
//   ]);
// });

// test("tfa activation success with link data", async ({ page, mockRequest }) => {
//   await mockRequest.router([
//     endpoints.tfaAppValidate,
//     endpoints.loginWithTfaCode,
//     endpoints.checkConfirmLink,
//   ]);
//   await page.goto(URL_WITH_LINK_DATA_PARAMS);

//   await page.getByTestId("text-input").fill("123456");

//   await page.getByTestId("button").click();

//   await page.waitForURL("/profile", { waitUntil: "load" });

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "tfa-activation",
//     "tfa-activation-with-link-data-success.png",
//   ]);
// });

// test("tfa activation error not validated", async ({ page, mockRequest }) => {
//   await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
//     HEADER_SELF_ERROR_404,
//   ]);
//   await mockRequest.router([endpoints.tfaAppValidateError]);
//   await page.goto(URL_WITH_PARAMS);

//   await page.getByTestId("text-input").fill("123456");

//   await page.getByTestId("button").click();

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "tfa-activation",
//     "tfa-activation-error-not-validated.png",
//   ]);
// });
