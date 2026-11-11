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
import { useLocation } from "react-router";

import {
  useAiChatStore,
  useStores as useAiChatStores,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import { useStore } from "SRC_DIR/store/useStore";

/**
 * Fulfils the requests recorded by `dialogsStore.requestAiChatPage`: the AI
 * section's sidebar entries AI Chat and Recent open the chat fullscreen, on
 * the conversation or on its history.
 *
 * The page lives in the chat library's router, reachable only inside
 * `AiAgentProviders`, so the sidebar records the request and this component -
 * mounted once inside the providers - performs it.
 */
const AiChatPageBridgeComponent = () => {
  const dialogsStore = useStore("dialogsStore");
  const request = dialogsStore.aiChatPageRequest;

  const location = useLocation();
  const aiChatStore = useAiChatStore();
  const useRouter = useAiChatStores().useRouter;
  const goToChat = useRouter((s) => s.goToChat);
  // Waits for the threads to be read, as the chat toolbar's history button.
  const openHistory = useRouter((s) => s.openHistory);

  React.useEffect(() => {
    if (!request) return;
    // The click also navigated: wait for that navigation to land.
    if (
      request.afterLocationKey !== null &&
      request.afterLocationKey === location.key
    )
      return;

    const consumed = dialogsStore.consumeAiChatPageRequest();
    if (!consumed) return;

    // After the effects of the navigation have run: leaving an AI project
    // releases its chat and closes the panel, and on a phone a section change
    // closes it too. Opened before them, the chat would be closed again.
    // Not cleared on re-run: the request is consumed already, so a re-run
    // has nothing else to do it with.
    window.setTimeout(() => {
      // A closed panel starts a fresh conversation, an open one keeps its
      // thread - the same as every other way to open the chat.
      aiChatStore.openNewChat();
      aiChatStore.setFullscreen(true);
      if (consumed.page === "history") void openHistory();
      else goToChat();
    }, 0);
  }, [
    request,
    location.key,
    dialogsStore,
    aiChatStore,
    goToChat,
    openHistory,
  ]);

  return null;
};

export const AiChatPageBridge = observer(AiChatPageBridgeComponent);

export default AiChatPageBridge;
