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

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit";
import AiAgentProviders, {
  useApi,
  useStores,
} from "@docspace/ui-kit/ai-agent/providers";
import {
  useAttachHostFilesToChat,
  notifyAlreadyAttached,
  notifyAttachmentLimit,
} from "@docspace/ui-kit/ai-agent/providers/files";
import { ChatToolbar } from "@docspace/ui-kit/ai-agent/chat-toolbar";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import { getFileInfo } from "@docspace/shared/api/files";
import {
  frameCallCommand,
  frameCallEvent,
  getFrameId,
} from "@docspace/shared/utils/common";

import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";

import styles from "./page.module.scss";

const NewChat = dynamic(() => import("@docspace/ui-kit/ai-agent/new-chat"), {
  ssr: false,
});

type ChatParamsBridgeProps = {
  fileId: string;
  threadId: string;
};

const ChatParamsBridge = ({ fileId, threadId }: ChatParamsBridgeProps) => {
  const { t } = useTranslation(["Common"]);
  const api = useApi();
  const stores = useStores();
  const attachFilesToChat = useAttachHostFilesToChat();
  const switchToThread = stores.useThreadsStore((s) => s.onSwitchToThread);

  const appliedRef = React.useRef(false);

  React.useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    const resumeThread = threadId
      ? api.threads
          .getById(threadId)
          .then((thread) => {
            if (thread) switchToThread(threadId);
          })
          .catch(() => {})
      : Promise.resolve();

    if (!fileId) return;

    resumeThread
      .then(() => getFileInfo(fileId))
      .then((file) =>
        attachFilesToChat([
          {
            id: file.id,
            title: file.title,
            fileExst: file.fileExst,
            fileType: file.fileType,
          },
        ]),
      )
      .then(({ duplicates, skipped }) => {
        // Resuming a thread can land on a composer that already holds this
        // file, and the cap applies here as anywhere else — both drop the
        // chip silently, so say which one happened.
        notifyAlreadyAttached(t, duplicates);
        notifyAttachmentLimit(t, skipped);
      })
      .catch((error: unknown) => {
        frameCallEvent({
          event: "onAppError",
          data: error instanceof Error ? error.message : String(error),
        });
      });
  }, [api, attachFilesToChat, fileId, switchToThread, threadId, t]);

  return null;
};

type ChatPageProps = {
  agentId: string;
  entityId: string;
  fileId: string;
  threadId: string;
  canUseAi: boolean;
  isPortalAdmin: boolean;
  isStandalone: boolean;
};

const ChatPage = ({
  agentId,
  entityId,
  fileId,
  threadId,
  canUseAi,
  isPortalAdmin,
  isStandalone,
}: ChatPageProps) => {
  const { i18n } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const { headerOffset, headerHeight } = useFrameHeaderConfig();

  React.useEffect(() => {
    frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
    frameCallCommand("setIsLoaded");
  }, []);

  const getAgentRoomId = React.useCallback(() => {
    if (!agentId) return null;

    const id = Number(agentId);
    return Number.isFinite(id) ? id : null;
  }, [agentId]);

  const chatEntityId = agentId || entityId || undefined;

  const frameInsets: React.CSSProperties | undefined =
    headerOffset > 0 || headerHeight > 0
      ? {
          paddingInlineStart: headerOffset > 0 ? headerOffset : undefined,
          paddingBlockStart: headerHeight > 0 ? headerHeight : undefined,
        }
      : undefined;

  return (
    <div className={styles.chatRoot} style={frameInsets}>
      <AiAgentProviders
        key={chatEntityId ?? "user-chat"}
        theme={isBase ? PORTAL_BASE_THEME_ID : PORTAL_DARK_THEME_ID}
        locale={i18n.language}
        isStandalone={isStandalone}
        canUseAi={canUseAi}
        entityId={chatEntityId}
        getAgentRoomId={getAgentRoomId}
      >
        {canUseAi ? (
          <ChatParamsBridge fileId={fileId} threadId={threadId} />
        ) : null}
        <div className={styles.chat}>
          {canUseAi ? <ChatToolbar /> : null}
          <div className={styles.chatBody}>
            <NewChat
              aiReady={canUseAi}
              noAccessProps={{
                standalone: isStandalone,
                isPortalAdmin,
              }}
            />
          </div>
        </div>
      </AiAgentProviders>
    </div>
  );
};

export default ChatPage;
