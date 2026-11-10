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

import { makeAutoObservable } from "mobx";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type {
  KnowledgeConfig,
  TByokKey,
  TByokProvider,
  TDocumentAgentSettings,
} from "@docspace/shared/api/ai/types";
import {
  updateKnowledgeConfig,
  getKnowledgeConfig,
  getDocumentAgentSettings,
  updateDocumentAgentSettings,
  getByokKeys,
  getByokProviders,
  setByokKey,
  deleteByokKey,
} from "@docspace/shared/api/ai";
import { KnowledgeType } from "@docspace/shared/api/ai/enums";

// Knowledge-base (vectorization) settings only. The provider/MCP-server/
// web-search management that used to live here was built on the removed
// C# AI API; those settings are now handled by the chat-lib (profiles,
// tools and web-search engines of the Node AI service).
/** What the Document Agent tab shows until the portal has saved anything. */
export const DOCUMENT_AGENT_DEFAULTS: TDocumentAgentSettings = {
  enabled: true,
  profileId: null,
  reasoning: "default",
  maxToolCalls: 150,
  maxFileBytes: 32 * 1024 * 1024,
  taskLog: false,
  taskLogFolderId: null,
};

class AISettingsStore {
  knowledgeConfig: KnowledgeConfig | null = null;

  knowledgeInitied = false;

  documentAgentSettings: TDocumentAgentSettings = DOCUMENT_AGENT_DEFAULTS;

  documentAgentInitied = false;

  byokKeys: TByokKey[] = [];

  byokProviders: TByokProvider[] = [];

  byokProviderNames: Record<string, string> = {};

  byokInitied = false;

  constructor() {
    makeAutoObservable(this);
  }

  setKnowledgeInitied = (value: boolean) => {
    this.knowledgeInitied = value;
  };

  setKnowledgeConfig = (config: KnowledgeConfig | null) => {
    this.knowledgeConfig = config;
  };

  fetchKnowledge = async () => {
    try {
      const res = await getKnowledgeConfig();

      this.setKnowledgeInitied(true);

      if (res) this.setKnowledgeConfig(res);
    } catch (e) {
      console.error(e);
    }
  };

  updateKnowledge = async (type: KnowledgeType, key: string) => {
    await updateKnowledgeConfig(type, key);
    this.setKnowledgeConfig({ type, key });
  };

  restoreKnowledge = async () => {
    await updateKnowledgeConfig(KnowledgeType.None, "");
    this.setKnowledgeConfig(null);
  };

  // The same settings again keep their object: the tab rebuilds its draft
  // on a new one, and a refetch on every visit must not throw edits away.
  setDocumentAgentSettings = (settings: TDocumentAgentSettings) => {
    if (JSON.stringify(settings) === JSON.stringify(this.documentAgentSettings)) return;
    this.documentAgentSettings = settings;
  };

  setDocumentAgentInitied = (value: boolean) => {
    this.documentAgentInitied = value;
  };

  // The AI service answers its own defaults for a portal that has never
  // saved the settings; a read that fails leaves the ones above.
  fetchDocumentAgentSettings = async () => {
    try {
      const res = await getDocumentAgentSettings();

      if (res) this.setDocumentAgentSettings({ ...DOCUMENT_AGENT_DEFAULTS, ...res });
    } catch (e) {
      console.error(e);
    } finally {
      this.setDocumentAgentInitied(true);
    }
  };

  updateDocumentAgentSettings = async (settings: TDocumentAgentSettings) => {
    const res = await updateDocumentAgentSettings(settings);
    this.setDocumentAgentSettings({ ...settings, ...(res ?? {}) });
  };

  resetDocumentAgentSettings = async () => {
    await this.updateDocumentAgentSettings(DOCUMENT_AGENT_DEFAULTS);
  };

  setByokData = (keys: TByokKey[], providers: TByokProvider[]) => {
    this.byokKeys = keys;
    this.byokProviders = providers;
    providers.forEach(({ id, name }) => {
      this.byokProviderNames[id] = name;
    });
  };

  setByokInitied = (value: boolean) => {
    this.byokInitied = value;
  };

  fetchByok = async () => {
    try {
      const [keys, providers] = await Promise.all([
        getByokKeys(),
        getByokProviders(),
      ]);

      this.setByokData(keys ?? [], providers ?? []);
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      this.setByokInitied(true);
    }
  };

  saveByokKey = async (modelId: string, provider: string, key: string) => {
    await setByokKey(modelId, provider, key);
    await this.fetchByok();
  };

  removeByokKey = async (modelId: string) => {
    await deleteByokKey(modelId);
    await this.fetchByok();
  };
}

export default AISettingsStore;
