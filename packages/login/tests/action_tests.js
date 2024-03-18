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

const Endpoints = require("./mocking/endpoints.js");

const browser = process.env.profile || "chromium";
const deviceType = process.env.DEVICE_TYPE || "desktop";

const isModel = !!process.env.MODEL;

const featureName = isModel
  ? `Login actions on '${browser}' with '${deviceType}' dimension (model)`
  : `Login actions on '${browser}' with '${deviceType}' dimension`;

Feature(featureName);

// doing it before others scenario
Before(async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.build, "build");
  I.mockEndpoint(Endpoints.providers, "providers");
  I.mockEndpoint(Endpoints.capabilities, "capabilities");
  I.mockEndpoint(Endpoints.people, "");
  I.amOnPage("/login");
  I.wait(2);
});

Scenario("Checkbox click test", async ({ I }) => {
  I.seeElement({
    react: "Checkbox",
    props: {
      className: "login-checkbox",
      isChecked: false,
    },
  });

  I.click({ react: "Checkbox" });

  I.seeElement({
    react: "Checkbox",
    props: {
      className: "login-checkbox",
      isChecked: true,
    },
  });

  I.saveScreenshot(`6.checked-checkbox.png`);
  if (!isModel) {
    I.seeVisualDiff(`6.checked-checkbox.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Test login error", async ({ I }) => {
  I.mockEndpoint(Endpoints.auth, "authError");
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("Required field");
  I.fillField("login", "test@mail.ru");
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("Required field");
  I.fillField("password", secret("0000000"));
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("User authentication failed");
});

Scenario("Test login success", async ({ I }) => {
  I.mockEndpoint(Endpoints.people, "self");
  I.mockEndpoint(Endpoints.modules, "info");
  I.mockEndpoint(Endpoints.auth, "authSuccess");
  I.fillField("login", "test@mail.ru");
  I.fillField("password", secret("12345678"));
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("Documents");
});

Scenario("Test fix wrong login", async ({ I }) => {
  I.mockEndpoint(Endpoints.people, "self");
  I.mockEndpoint(Endpoints.modules, "info");
  I.mockEndpoint(Endpoints.auth, "authError");
  I.fillField("login", "test@mail.ru");
  I.fillField("password", secret("12345678!"));
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("User authentication failed");

  I.mockEndpoint(Endpoints.auth, "authSuccess");
  I.fillField("password", secret("12345678"));
  I.click({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });
  I.see("Documents");
});
