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

import { makeAutoObservable, runInAction } from "mobx";

import {
  getAiTemplates,
  installAiTemplate,
  type TAiInstalledTemplate,
  type TAiTemplate,
  type TAiTemplateCatalog,
} from "@docspace/shared/api/ai/templates";

/**
 * The Templates tab of the Agents list: the catalog of templates the AI
 * service ships and the one being installed. A card installs from its button
 * and from its menu, so both read here whether an installation is under way.
 */
class AiTemplatesStore {
  catalog: TAiTemplateCatalog | null = null;

  /** The catalog could not be read and none was read before. */
  failed = false;

  /** The id of the template being installed. */
  installingId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Reads the catalog again; the one read before stays shown meanwhile and
   * when the read fails.
   */
  fetchCatalog = async () => {
    try {
      const catalog = await getAiTemplates();
      runInAction(() => {
        this.catalog = catalog;
        this.failed = false;
      });
    } catch {
      runInAction(() => {
        this.failed = !this.catalog;
      });
    }
  };

  get isInstalling() {
    return this.installingId !== null;
  }

  /** Installs the template into the portal as new rooms. */
  install = async (template: TAiTemplate): Promise<TAiInstalledTemplate> => {
    this.installingId = template.id;
    try {
      return await installAiTemplate(template.id);
    } finally {
      runInAction(() => {
        this.installingId = null;
      });
    }
  };
}

export default AiTemplatesStore;
