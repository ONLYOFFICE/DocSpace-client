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
