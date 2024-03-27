// (c) Copyright Ascensio System SIA 2010-2024
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

const Helper = require('@codeceptjs/helper');

const path = require('path');

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
    const rootDir = 'tests/mocking/mock-data/';
    endpoint.url.forEach(async (url, index) => {
      await page.route(new RegExp(url), (route) => {
        if (scenario !== '') {
          route.fulfill({
            path: path.resolve(rootDir, endpoint.baseDir, `${scenario}.json`),
            headers: {
              'content-type': 'application/json',
              'access-control-allow-origin': '*',
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
    const rootDir = 'tests/mocking/mock-data/';
    await page.route(new RegExp(url), (route) => {
      for (let key in form) {
        assert(route.request().postData().includes(form[key]));
      }

      return route.fulfill({
        path: path.resolve(rootDir, baseDir, `${scenario}.json`),
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      });
    });
  }
}

module.exports = PlaywrightHelper;
