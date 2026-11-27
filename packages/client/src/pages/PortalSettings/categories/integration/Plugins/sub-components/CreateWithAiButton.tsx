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

import { useEffect } from "react";
import { observer } from "mobx-react";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  useAiChatStore,
  useIsAiChatAvailable,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import type { TTranslation } from "@docspace/shared/types";

import { useStore } from "SRC_DIR/store/useStore";

import styles from "../Plugins.module.scss";

/**
 * "Create with AI": opens the AI chat beside the plugins list, in a new
 * conversation on the default agent whose composer already asks for a
 * plugin. The chat's model then asks what the plugin is to do and builds it
 * with its plugin tools, which the server offers to the owner and DocSpace
 * admins only.
 *
 * Shown where the server offers the user its plugin agent, which the page
 * asks about when it opens: the chat is then available on this page (Shell's
 * `isAiChatAvailable`). Without a plugin agent the chat's model has no tool
 * to build with, and the page looks as it did.
 */
const CreateWithAiButton = ({ t }: { t: TTranslation }) => {
  const isAiChatAvailable = useIsAiChatAvailable();
  const aiChatStore = useAiChatStore();
  const setCurrentPage = useAiChatStores().useRouter((s) => s.setCurrentPage);
  const aiPresetsStore = useStore("aiPresetsStore");
  const { aiServicesEnabled } = useStore("settingsStore");
  const { checkAiPluginAgent } = useStore("pluginStore");

  useEffect(() => {
    if (aiServicesEnabled) void checkAiPluginAgent();
  }, [aiServicesEnabled, checkAiPluginAgent]);

  if (!isAiChatAvailable) return null;

  const onClick = () => {
    // The default agent with nothing connected, as "Use in chat" resets it.
    aiPresetsStore.cancelApply();
    aiPresetsStore.setActivePreset(null);
    aiPresetsStore.setChatSkillRooms(null);
    aiChatStore.openPreset({
      profileId: null,
      profileName: null,
      contextRooms: [],
      knowledgeRooms: [],
      draft: t("WebPlugins:CreateWithAIPrompt"),
    });
    // Beside the list, whatever size the chat was left at.
    aiChatStore.setFullscreen(false);
    // The chat may have been left on its history or settings.
    setCurrentPage("chat");
  };

  return (
    <Button
      className={styles.createWithAiButton}
      label={t("WebPlugins:CreateWithAI")}
      size={ButtonSize.small}
      primary
      onClick={onClick}
      testId="create_plugin_with_ai_button"
    />
  );
};

export default observer(CreateWithAiButton);
