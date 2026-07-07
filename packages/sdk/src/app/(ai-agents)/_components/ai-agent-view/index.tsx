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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import { observer } from "mobx-react";
import dynamic from "next/dynamic";

import NoAgentItem from "../no-agent-item";
import NoAccessAgent from "../no-access-agent";
import AliasFilesList from "../alias-files-list";
import {
  useAiRoomStore,
  useAgentLoadingStore,
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useKnowledgeFilesStore,
  useResultFilesStore,
} from "../../_store";

import styles from "./AIAgentView.module.scss";

// New chat (`@onlyoffice/ai-chat` via ui-kit `new-chat`). It owns its own
// scroll viewport and routing (ChatPage / SettingsPage / ChatList), so no
// external-scroll / sticky-header glue is needed — it only needs a
// bounded-height flex parent (.aiAgentChat) and the AiAgentProviders stack
// supplied by AiAgentsAiChatProviders.
const NewChat = dynamic(() => import("@docspace/ui-kit/ai-agent/new-chat"), {
  ssr: false,
});

const AiAgentView = () => {
  const aiRoomStore = useAiRoomStore();
  const loadingStore = useAgentLoadingStore();
  const aiConfigStore = useAgentsAIConfigStore();
  const userStore = useAgentsUserStore();

  const {
    currentTab,
    roomId,
    knowledgeId,
    resultId,
    isErrorAIAgentNotAvailable,
  } = aiRoomStore;

  // SDK analogue of `accessRightsStore.canUseChat`: chat requires a
  // configured AI provider and a non-visitor user.
  const canUseChat =
    aiConfigStore.aiReady && !!userStore.user && !userStore.user.isVisitor;

  // No room selected — show a no-agent placeholder (ported from client
  // NoAgentItem.tsx in InfoPanel).
  if (!roomId) {
    return <NoAgentItem />;
  }

  // Agent fetch failed / no access — match client `NoAccessContainer`
  // (Agent variant). Suppressed while the body loader is on, so we don't
  // flash the error during the initial fetch.
  if (
    currentTab === "chat" &&
    isErrorAIAgentNotAvailable &&
    !loadingStore.showBodyLoader
  ) {
    return <NoAccessAgent />;
  }

  const hasNoAccessToChat = !canUseChat && !loadingStore.showBodyLoader;
  const shouldRenderChat =
    currentTab === "chat" &&
    !hasNoAccessToChat &&
    (!isErrorAIAgentNotAvailable || loadingStore.showBodyLoader);

  // The new chat is rendered conditionally (no cross-tab `display:none`
  // persistence): it owns its own viewport, threads are server-backed and
  // re-hydrated on mount, and the AiAgentProviders stack (mounted section-wide
  // in layout.client.tsx) already remounts per agent, so keeping a stale
  // subtree alive across tabs buys nothing.
  return (
    <>
      {shouldRenderChat ? (
        <div className={styles.aiAgentChat}>
          <NewChat />
        </div>
      ) : null}

      {currentTab === "knowledge" && knowledgeId ? (
        <AliasFilesList useStore={useKnowledgeFilesStore} />
      ) : null}
      {currentTab === "result" && resultId ? (
        <AliasFilesList useStore={useResultFilesStore} />
      ) : null}
    </>
  );
};

export default observer(AiAgentView);
