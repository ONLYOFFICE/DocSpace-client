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

const { setHeadlessWhen, setWindowSize } = require("@codeceptjs/configure");

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

const sizes = {
  mobile: { width: 375, height: 667 },
  smallTablet: { width: 600, height: 667 },
  tablet: { width: 1023, height: 667 },
  desktop: { width: 1920, height: 1080 },
};

const deviceType = process.env.DEVICE_TYPE || "desktop";

const device = sizes[deviceType];

setWindowSize(device.width, device.height);

const browser = process.env.profile || "chromium";

const isModel = !!process.env.MODEL;

const screenshotOutput = isModel
  ? `./tests/screenshots/${browser}/${deviceType}`
  : `./tests/output/${browser}/${deviceType}`;

exports.config = {
  tests: "./tests/*_tests.js",
  output: screenshotOutput,
  helpers: {
    Playwright: {
      url: "http://localhost:8092",
      // show browser window
      show: false,
      browser: browser,
      // restart browser between tests
      restart: true,
      waitForNavigation: "networkidle0",
      // don't save screenshot on failure
      disableScreenshots: false,
    },
    ResembleHelper: {
      require: "codeceptjs-resemblehelper",
      screenshotFolder: "./tests/output/",
      baseFolder: `./tests/screenshots/${browser}/${deviceType}`,
      diffFolder: "./tests/output/diff/",
    },
    PlaywrightHelper: {
      require: "./tests/helpers/playwright.helper.js",
    },
  },
  include: {
    I: "./steps_file.js",
  },
  bootstrap: null,
  mocha: {
    reporterOptions: {
      mochawesome: {
        stdout: "-",
        options: {
          reportDir: `./tests/reports/${browser}/${deviceType}`,
          reportFilename: "report",
        },
      },
      "mocha-junit-reporter": {
        stdout: "-",
        options: {
          mochaFile: `./tests/reports/${browser}/${deviceType}/report.xml`,
          attachments: false, //add screenshot for a failed test
        },
      },
    },
  },
  name: "ASC.Web.Login",
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
};
