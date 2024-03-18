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
  ? `Login render on '${browser}' with '${deviceType}' dimension (model)`
  : `Login render on '${browser}' with '${deviceType}' dimension`;

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

Scenario("Login page components render test", async ({ I }) => {
  I.see("Web Office");
  I.seeElement({
    react: "TextInput",
    props: {
      id: "login",
      name: "login",
      type: "email",
      autoComplete: "username",
    },
  });
  I.seeElement({
    react: "PasswordInput",
    props: {
      id: "password",
      inputName: "password",
      type: "password",
      autoComplete: "current-password",
    },
  });
  I.seeElement({
    react: "Checkbox",
    props: {
      className: "login-checkbox",
      isChecked: false,
    },
  });
  I.seeElement({
    react: "HelpButton",
    props: {
      className: "login-tooltip",
    },
  });
  I.seeElement({
    react: "Link",
    props: {
      className: "login-link",
      type: "page",
    },
  });
  I.seeElement({
    react: "Button",
    props: {
      className: "login-button",
      type: "page",
    },
  });

  I.see("Sign in with Facebook");
  I.see("Sign in with Google");
  I.see("Sign in with LinkedIn");

  I.see("Register");

  I.saveScreenshot(`1.login-page-render.png`);
  if (!isModel) {
    I.seeVisualDiff(`1.login-page-render.png`, {
      tolerance: 1,
      prepareBaseImage: true,
    });
  }
});

Scenario("Reset mail tab render test", async ({ I }) => {
  I.seeElement({
    react: "Link",
    props: {
      className: "login-link",
      type: "page",
    },
  });

  I.click("Forgot your password?");

  I.see("Password recovery");
  I.see(
    "Please, enter the email you used for registration. The password recovery instructions will be sent to it."
  );
  I.seeElement({
    react: "TextInput",
  });
  I.see("Send");

  I.saveScreenshot(`2.reset-mail-tab.png`);
  if (!isModel) {
    I.seeVisualDiff(`2.reset-mail-tab.png`, {
      tolerance: 1,
      prepareBaseImage: true,
    });
  }
});

//TODO: check help button test on mobile chromium/ff
if (browser === "webkit" || deviceType === "desktop") {
  Scenario("Help button modal render test", async ({ I }) => {
    I.seeElement({
      react: "HelpButton",
      props: {
        className: "login-tooltip",
      },
    });

    I.click({
      react: "HelpButton",
      props: {
        className: "login-tooltip",
      },
    });
    I.see(
      "The default session lifetime is 20 minutes. Check this option to set it to 1 year. To set your own value, go to Settings."
    );

    I.saveScreenshot(`3.help-button-modal.png`);
    if (!isModel) {
      I.seeVisualDiff(`3.help-button-modal.png`, {
        tolerance: 1,
        prepareBaseImage: true,
      });
    }
  });
}

Scenario("Modal - Password recovery test", async ({ I }) => {
  I.seeElement({
    react: "Link",
    props: {
      className: "login-link",
    },
  });

  I.click({
    react: "Link",
    props: {
      className: "login-link",
    },
  });

  I.wait(2);

  I.see("Password recovery");
  I.see(
    "Please, enter the email you used for registration. The password recovery instructions will be sent to it."
  );
  I.seeElement({
    react: "EmailInput",
  });
  I.see("Send");
  I.see("Cancel");

  I.saveScreenshot(`4.modal-password-recovery.png`);
  if (!isModel) {
    I.seeVisualDiff(`4.modal-password-recovery.png`, {
      tolerance: 1,
      prepareBaseImage: true,
    });
  }
});

Scenario("Modal - Registration test", async ({ I }) => {
  I.click({
    react: "Register",
  });

  I.wait(2);

  I.see("Registration request");
  I.seeElement({
    react: "EmailInput",
  });
  I.see("Send request");
  I.see("Cancel");

  I.saveScreenshot(`5.modal-registration-request.png`);
  if (!isModel) {
    I.seeVisualDiff(`6.modal-registration-request.png`, {
      tolerance: 1,
      prepareBaseImage: true,
    });
  }
});

Scenario("Modal - Authorization test", async ({ I }) => {
  I.seeElement({
    react: "Link",
    props: {
      className: "more-label",
    },
  });
  I.click("Show more");

  I.wait(2);

  I.see("Authorization");
  I.see("Sign in with SSO");
  I.see("Sign in with Google");
  I.see("Sign in with Facebook");
  I.see("Sign in with LinkedIn");

  I.saveScreenshot(`7.modal-authorization.png`);
  if (!isModel) {
    I.seeVisualDiff(`7.modal-authorization.png`, {
      tolerance: 1,
      prepareBaseImage: true,
    });
  }
});
