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
  ? `Modal test on '${browser}' with '${deviceType}' dimension (model)`
  : `Modal test on '${browser}' with '${deviceType}' dimension`;

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

Scenario("Modal test - Copy", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  if (deviceType === "desktop") {
    I.click({ react: "TableCell", className: "files-item" });
  } else {
    I.click({ react: "Checkbox" });
  }
  I.wait(2);

  I.click("Copy");
  I.wait(1);
});

Scenario("Modal test - Move", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  I.click({
    react: "Checkbox",
  });
  I.wait(1);

  I.click("Move");
  I.wait(1);
});

Scenario("Modal test - Delete", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  if (deviceType === "desktop") {
    I.click({ react: "TableCell", className: "files-item" });
  } else {
    I.click({ react: "Checkbox" });
  }
  I.wait(2);

  I.click("Delete");
  I.wait(1);
});

Scenario("Modal test - Trash", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  I.mockEndpoint(Endpoints.getFolder(7), "1");
  //I.mockEndpoint(Endpoints.getFileOperation(7), "7-empty");
  I.click({ react: "CatalogItem", props: { id: 7 } });
  I.wait(3);
});

Scenario("Modal test - Add account (List of thirdparties)", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  I.click("Add account");
  I.wait(1);
});

Scenario("Modal test - Add account (Connection form)", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  I.click({
    react: "IconButton",
    props: { iconName: "images/services/more.svg" },
  });
  I.wait(1);
});

Scenario("Modal test - Overwrite confirmation", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");

  I.amOnPage("/products/files");
  I.wait(3);

  if (deviceType === "desktop") {
    I.click({ react: "TableCell", className: "files-item" });
  } else {
    I.click({ react: "Checkbox" });
  }
  I.wait(2);

  I.click("Copy");
  I.wait(1);
});

Scenario("Modal test - Sharing panel", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");
  I.mockEndpoint(Endpoints.share, "share");

  I.amOnPage("/products/files");
  I.wait(3);

  if (deviceType === "desktop") {
    I.click({ react: "TableCell", className: "files-item" });
  } else {
    I.click({ react: "Checkbox" });
  }
  I.wait(2);

  I.click("Share");
  I.wait(1);
});

Scenario("Modal test - Version history panel", ({ I }) => {
  I.mockEndpoint(Endpoints.root, "one");
  I.mockEndpoint(Endpoints.my, "default");
  I.mockEndpoint(Endpoints.getFolder(1), "1");
  I.mockEndpoint(Endpoints.history, "history");

  I.amOnPage("/products/files");
  I.wait(3);

  I.click({
    react: "ContextMenuButton",
    props: {
      className: "expandButton",
      title: "Show File Actions",
    },
  });
  I.wait(2);

  I.click("Version history");
  I.wait(1);

  I.click("Show version history");
  I.wait(1);
});
