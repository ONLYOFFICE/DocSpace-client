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

const Helper = require("@codeceptjs/helper");

const path = require("path");

class PlaywrightHelper extends Helper {
  // before/after hooks
  /**
   * @protected
   */
  _before() {
    const { page } = this.helpers.Playwright;

    // clear all routes between tests
    page._routes = [];
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']
  async mockEndpoint(endpoint, scenario) {
    const { page } = this.helpers.Playwright;
    const rootDir = "tests/mocking/mock-data/";
    endpoint.url.forEach(async (url, index) => {
      await page.route(new RegExp(url), (route) => {
        if (scenario !== "") {
          route.fulfill({
            path: path.resolve(rootDir, endpoint.baseDir, `${scenario}.json`),
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*",
            },
          });
        } else {
          route.fulfill();
        }
      });
    });
  }

  async checkRequest(url, form, baseDir, scenario) {
    const { page } = this.helpers.Playwright;
    const rootDir = "tests/mocking/mock-data/";
    await page.route(new RegExp(url), (route) => {
      for (let key in form) {
        assert(route.request().postData().includes(form[key]));
      }

      return route.fulfill({
        path: path.resolve(rootDir, baseDir, `${scenario}.json`),
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    });
  }
}

module.exports = PlaywrightHelper;
