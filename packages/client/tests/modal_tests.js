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
