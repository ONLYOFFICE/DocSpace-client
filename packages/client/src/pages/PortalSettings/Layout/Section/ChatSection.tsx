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
import { inject, observer } from "mobx-react";

import Section, {
  type SectionProps,
} from "@onlyoffice/apps-ui-kit/components/section";
import { useAiChatPanel } from "@onlyoffice/apps-ui-kit/ai-agent/ai-chat-panel";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";

import SectionWrapper from "SRC_DIR/components/Section";
import {
  type ChatNoAccessStoreProps,
  mapChatNoAccessStores,
  useChatNoAccess,
} from "SRC_DIR/Hooks/useChatNoAccess";

import styles from "./ChatSection.module.scss";

type ChatSectionProps = SectionProps & {
  /** The page has the AI chat beside it. */
  withChat: boolean;
  aiNoAccessStores: ChatNoAccessStoreProps;
};

/**
 * The settings section, with the AI chat docked beside it on the page that
 * has one, as the Files sections have it: the plugins page, where "Create
 * with AI" opens the chat to build a plugin. Fullscreen, and any open chat
 * below the desktop width, collapses the section under the chat, as it does
 * there.
 *
 * Every settings page renders this one component, and `withChat` only
 * switches the chat's props: a different component for the page with the
 * chat would remount the page under it whenever the chat appears or the
 * user moves between that page and its neighbours, and load it again.
 */
const ChatSection = ({
  withChat,
  aiNoAccessStores,
  children,
  ...rest
}: ChatSectionProps) => {
  const isDesktop = useIsDesktop();
  const { aiReady, noAccessProps, topUpDialog } =
    useChatNoAccess(aiNoAccessStores);
  const chatPanel = useAiChatPanel(withChat, { aiReady, noAccessProps });

  const isFullscreen =
    !!chatPanel?.isChatPanelVisible &&
    (chatPanel.isChatPanelFullscreen || !isDesktop);

  // A chat that covers the page is closed when the page is left, for a
  // settings page without the chat or for another section: nothing draws
  // the panel on the former, where it would stay open unseen (the tab's
  // title and the fullscreen memory follow it), and it would cover the
  // latter as it opens. Home closes it so on its own navigation; a chat
  // docked beside the list stays open, as it does there.
  const aiChatStore = useAiChatStore();
  const isDesktopRef = React.useRef(isDesktop);
  isDesktopRef.current = isDesktop;
  React.useEffect(() => {
    if (!withChat) return undefined;

    return () => {
      if (!aiChatStore.isVisible) return;
      if (aiChatStore.effectiveFullscreen || !isDesktopRef.current)
        aiChatStore.close();
    };
  }, [withChat, aiChatStore]);

  const chatProps = chatPanel
    ? {
        isChatPanelAvailable: true,
        isChatPanelVisible: chatPanel.isChatPanelVisible,
        setIsChatPanelVisible: (visible: boolean) => {
          if (!visible) chatPanel.closeChatPanel();
        },
        isChatPanelResizable: true,
        isChatPanelFullscreen: isFullscreen,
        chatPanelWidth: chatPanel.chatPanelWidth,
        setChatPanelWidth: chatPanel.setChatPanelWidth,
        setChatPanelFullscreen: chatPanel.setChatPanelFullscreen,
        unsetChatPanelFullscreen: chatPanel.unsetChatPanelFullscreen,
        // Collapsed to no width under the fullscreen chat, the section
        // stays mounted: out of the tab order and of pointer's reach.
        inert: isFullscreen,
      }
    : null;

  return (
    <>
      <div
        className={styles.chatHost}
        data-layout-mode={isFullscreen ? "ai-fullscreen" : undefined}
      >
        <SectionWrapper {...rest} {...chatProps}>
          {children}
          {chatPanel ? (
            <Section.ChatPanel>{chatPanel.chatPanelContent}</Section.ChatPanel>
          ) : null}
        </SectionWrapper>
      </div>
      {chatPanel ? topUpDialog : null}
    </>
  );
};

export default inject((stores: TStore) => ({
  aiNoAccessStores: mapChatNoAccessStores(stores),
}))(observer(ChatSection));
