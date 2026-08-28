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
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { useStores as useAiChatStores } from "@docspace/ui-kit/ai-agent/providers";
import { useOpenAiChat } from "@docspace/ui-kit/ai-agent/ai-chat-panel/hooks/useOpenAiChat";
import {
  useAttachHostFilesToChat,
  notifyAlreadyAttached,
  notifyAttachmentLimit,
} from "@docspace/ui-kit/ai-agent/providers/files";

import { useStore } from "SRC_DIR/store/useStore";

/**
 * Fulfils the "Ask AI" requests recorded by `dialogsStore.askAIFile`: opens the
 * side AI chat panel (when it is closed) and attaches the file to the composer.
 *
 * The work needs hooks from the AI chat providers, which a MobX store cannot
 * call, so the action stores a request and this component — mounted once inside
 * `AiAgentProviders` — performs it. That keeps every entry point (context menu,
 * Ctrl+I, info panel AI card, "Analyze responses") on one code path.
 */
const AskAIChatBridgeComponent = () => {
  const { t } = useTranslation("Common");

  const dialogsStore = useStore("dialogsStore");
  const pendingFile = dialogsStore.askAIFile;

  const openChat = useOpenAiChat();
  const attachFilesToChat = useAttachHostFilesToChat();
  const setCurrentPage = useAiChatStores().useRouter((s) => s.setCurrentPage);

  React.useEffect(() => {
    if (!pendingFile) return;

    // Read-and-clear, so a second invocation of this effect with the same
    // closure attaches nothing.
    const file = dialogsStore.consumeAskAIFile();
    if (!file) return;

    // Opening a closed panel starts a fresh thread; an already open chat keeps
    // its conversation and just receives the attachment.
    openChat();
    // The panel may have been left on the history page, where the composer —
    // and therefore the freshly attached chip — is not on screen.
    setCurrentPage("chat");

    attachFilesToChat([file])
      .then(({ skipped, duplicates }) => {
        // A file that did not make it onto the composer — capped or
        // already there — must not disappear without a word.
        notifyAlreadyAttached(t, duplicates);
        notifyAttachmentLimit(t, skipped);
      })
      .catch((error: unknown) => {
        toastr.error(
          error instanceof Error ? error : { message: String(error) },
        );
      });
  }, [
    pendingFile,
    dialogsStore,
    openChat,
    setCurrentPage,
    attachFilesToChat,
    t,
  ]);

  return null;
};

export const AskAIChatBridge = observer(AskAIChatBridgeComponent);

export default AskAIChatBridge;

