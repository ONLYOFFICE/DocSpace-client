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
  ? `Context menu test on '${browser}' with '${deviceType}' dimension (model)`
  : `Context menu test on '${browser}' with '${deviceType}' dimension`;

Feature(featureName);

Before(async ({ I }) => {
  I.mockEndpoint(Endpoints.self, "self");
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.build, "build");
  I.mockEndpoint(Endpoints.info, "info");
  I.mockEndpoint(Endpoints.common, "common");
  I.mockEndpoint(Endpoints.cultures, "cultures");
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.fileSettings, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");
  I.mockEndpoint(Endpoints.capabilities, "capabilities");
  I.mockEndpoint(Endpoints.thirdparty, "thirdparty");
  I.mockEndpoint(Endpoints.thumbnails, "thumbnails");
});

Scenario("Context menu", ({ I }) => {
  I.mockEndpoint(Endpoints.share, "share");
  I.mockEndpoint(Endpoints.history, "history");
  I.mockEndpoint(Endpoints.favorites, "favorites");
  I.mockEndpoint(Endpoints.fileops, "fileops");
  I.mockEndpoint(Endpoints.copy, "copy");
  I.mockEndpoint(Endpoints.getFile(5417), "5417");
  I.mockEndpoint(Endpoints.getFileOperation(1), "1");
  I.mockEndpoint(Endpoints.getSubfolder(1), "1");
  I.amOnPage("/products/files");

  I.wait(3);

  // open context menu
  I.click({
    react: "ContextMenuButton",
    props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
  });

  I.saveScreenshot(`context-menu.default.png`);
  if (!isModel) {
    I.seeVisualDiff(`context-menu.default.png`, {
      tolerance: 3,
      prepareBaseImage: false,
    });
  }

  if (deviceType === "desktop") {
    // open sharing settings panel
    I.click({ name: "sharing-settings" });

    I.wait(1);

    I.saveScreenshot(`context-menu.sharing-settings.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.sharing-settings.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }

    // close sharing settings panel
    I.forceClick({ react: "Backdrop" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    // copy link
    I.click({ name: "link-for-portal-users" });
    I.see("Link has been copied to the clipboard");

    // close toast
    I.click({ react: "Toast" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    // open version history panel
    I.click({ name: "show-version-history" });

    I.wait(2);

    I.saveScreenshot(`context-menu.version-history.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.version-history.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }

    // close version history panel
    I.forceClick({ react: "Backdrop" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    // add to favorites
    I.click({ name: "mark-as-favorite" });

    I.see("Added to favorites");
    // close toast
    I.click({ react: "Toast" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    // add to favorites
    I.click({ name: "remove-from-favorites" });

    I.see("Removed from favorites");
    // close toast
    I.click({ react: "Toast" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "download-as" });

    I.wait(1);

    I.saveScreenshot(`context-menu.download-as.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.download-as.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }
    // close download as panel
    I.click({ react: "Button", props: { label: "Cancel" } });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "move-to" });

    I.wait(1);

    I.saveScreenshot(`context-menu.move-to.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.move-to.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }

    // close move to panel
    I.forceClick({ react: "Backdrop" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "copy-to" });

    I.wait(1);

    I.saveScreenshot(`context-menu.copy-to.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.copy-to.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }

    // close move to panel
    I.forceClick({ react: "Backdrop" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "copy" });

    // open context menu
    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "rename" });

    I.type("Rename file");

    I.pressKey("Enter");

    I.see("Done");

    I.wait(1);

    I.click({
      react: "ContextMenuButton",
      props: { iconName: "/static/images/icons/16/vertical-dots.react.svg" },
    });

    I.click({ name: "delete" });

    I.wait(1);

    I.saveScreenshot(`context-menu.delete.png`);
    if (!isModel) {
      I.seeVisualDiff(`context-menu.delete.png`, {
        tolerance: 3,
        prepareBaseImage: false,
      });
    }

    I.click({ react: "Button", props: { label: "Cancel" } });
  }
});
