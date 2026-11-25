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

import React from "react";
import { observer } from "mobx-react";

import {
  useAiChatStore,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import { useStore } from "SRC_DIR/store/useStore";

/**
 * Fulfils the "Use in chat" of a skill set or a knowledge base, recorded by
 * `aiPresetsStore.requestUseInChat`: the chat opens in a new conversation on
 * the default agent, with that skill set or knowledge base connected and
 * nothing else. A set also becomes the chat's context room (Shell's
 * `contextRoom`), so the chat keeps it connected when it mounts.
 *
 * The chat stores are reachable only inside `AiAgentProviders`, which a
 * MobX store cannot call into, so the row records the request and this
 * component, mounted once inside them, performs it.
 */
const SkillSetChatBridgeComponent = () => {
  const aiPresetsStore = useStore("aiPresetsStore");
  const pending = aiPresetsStore.pendingUseInChat;

  const aiChatStore = useAiChatStore();
  const setCurrentPage = useAiChatStores().useRouter((s) => s.setCurrentPage);

  React.useEffect(() => {
    if (!pending) return;
    // Read-and-clear, so the same request is not performed twice.
    const request = aiPresetsStore.consumeUseInChat();
    if (!request) return;
    const { room, draft, knowledge } = request;

    // The default agent: a pick of another one still being read is called off.
    aiPresetsStore.cancelApply();
    aiPresetsStore.setActivePreset(null);
    // A knowledge base is connected as one, with no skill set beside it.
    aiPresetsStore.setChatSkillRooms(knowledge ? null : [room]);
    aiChatStore.openPreset({
      profileId: null,
      profileName: null,
      contextRooms: knowledge ? [] : [room],
      knowledgeRooms: knowledge ? [room] : [],
      // A skill's row starts the composer with the skill's call.
      ...(draft ? { draft } : {}),
    });
    // The chat may have been left on its history or settings.
    setCurrentPage("chat");
  }, [pending, aiPresetsStore, aiChatStore, setCurrentPage]);

  return null;
};

export const SkillSetChatBridge = observer(SkillSetChatBridgeComponent);

export default SkillSetChatBridge;
