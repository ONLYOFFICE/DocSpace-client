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
const changeCulture = require("./helpers/changeCulture.js");
const config = require("../../../../../buildtools/config/appsettings.json");
const ignoringCultures = require("./ignoringCultures.json");

const isModel = !!process.env.MODEL;

const cultures = isModel ? ["en"] : config.web.cultures;

const settingsTranslationFile = `settingsTranslation`;

const featureName = isModel
  ? `Files translation(model) `
  : `Files translation tests`;

Feature(featureName, { timeout: 90 });

Before(async ({ I }) => {
  I.mockData();
});

for (const culture of cultures) {
  Scenario(`Main page test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.mainPage.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.see("My documents");
    I.saveScreenshot(`${culture}-main-page.png`);
    I.seeVisualDiff(`${culture}-main-page.png`, {
      tolerance: 0.025,
      prepareBaseImage: false,
      // ignoredBox: { top: 0, left: 0, bottom: 0, right: 1720 },
    });
  });

  Scenario(`Profile menu test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.profileMenu.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.openProfileMenu();
    I.wait(3);
    I.saveScreenshot(`${culture}-profile-menu.png`);
    I.seeVisualDiff(`${culture}-profile-menu.png`, {
      tolerance: 0.05,
      prepareBaseImage: false,
    });
  });

  Scenario(`Main button test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.mainButton.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.seeElement({ react: "MainButton" });
    I.click({ react: "MainButton" });
    I.wait(3);
    I.saveScreenshot(`${culture}-main-button.png`);
    I.seeVisualDiff(`${culture}-main-button.png`, {
      tolerance: 0.01,
      prepareBaseImage: false,
      ignoredBox: { top: 0, left: 256, bottom: 0, right: 0 },
    });
  });

  Scenario(`Table settings test ${culture}`, { timeout: 30 }, ({ I }) => {
    const isException = ignoringCultures.tableSettings.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.seeElement({ react: "TableSettings" });
    I.click({ react: "TableSettings" });
    I.wait(3);
    I.saveScreenshot(`${culture}-table-settings.png`);
    I.seeVisualDiff(`${culture}-table-settings.png`, {
      tolerance: 0.07,
      prepareBaseImage: false,
      ignoredBox: { top: 0, left: 0, bottom: 0, right: 1770 },
    });
  });

  Scenario(`Add button test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.addButton.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.seeElement({
      react: "ContextMenuButton",
      props: { className: "add-button" },
    });
    I.click({ react: "ContextMenuButton", props: { className: "add-button" } });
    I.wait(3);
    I.saveScreenshot(`${culture}-add-button.png`);
    I.seeVisualDiff(`${culture}-add-button.png`, {
      tolerance: 0.01,
      prepareBaseImage: false,
    });
  });

  Scenario(`Sort menu test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.sortMenu.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.switchView("tile");
    I.seeElement({
      react: "IconButton",
      props: { className: "sort-icon" },
    });
    I.click({ react: "IconButton", props: { className: "sort-icon" } });
    I.wait(3);
    I.saveScreenshot(`${culture}-sort-menu.png`);
    I.seeVisualDiff(`${culture}-sort-menu.png`, {
      tolerance: 0.01,
      prepareBaseImage: false,
    });
  });

  Scenario(`Filter block test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.filterBlock.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.seeElement({
      react: "FilterButton",
    });
    I.click({ react: "FilterButton" });
    I.wait(3);
    I.saveScreenshot(`${culture}-filter-block.png`);
    I.seeVisualDiff(`${culture}-filter-block.png`, {
      tolerance: 0.01,
      prepareBaseImage: false,
    });
  });

  Scenario(`Context menu test ${culture}`, { timeout: 30 }, ({ I }) => {
    changeCulture(culture);
    const isException = ignoringCultures.contextMenu.indexOf(culture) != -1;
    I.mockEndpoint(Endpoints.my, "default");
    if (!isException) {
      I.mockEndpoint(Endpoints.self, `selfTranslation`);
      I.mockEndpoint(Endpoints.settings, settingsTranslationFile);
    }
    I.amOnPage("/products/files");
    I.wait(3);
    I.openContextMenu();
    I.wait(3);
    I.saveScreenshot(`${culture}-context-menu.png`);
    I.seeVisualDiff(`${culture}-context-menu.png`, {
      tolerance: 0.01,
      prepareBaseImage: false,
    });
  });
}
