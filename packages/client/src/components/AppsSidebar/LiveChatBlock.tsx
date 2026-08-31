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
import { isMobile } from "react-device-detect";

import ArticleLiveChat from "@docspace/ui-kit/components/article/sub-components/LiveChat";

type LiveChatBlockProps = {
  isLiveChatAvailable: boolean;
  languageBaseName: string;
  zendeskEmail: string;
  chatDisplayName: string;
  zendeskKey: string;
  isShowLiveChat: boolean;
  isMobileArticle: boolean;
  showProgress: boolean;
  isInfoPanelVisible: boolean;
};

/**
 * Loads the Zendesk widget for the sidebar. It renders nothing itself - it only
 * injects the Zendesk snippet and forwards settings to it, which is what the
 * "Live chat" switch in the profile menu (ProfileActionsStore.onLiveChatClick)
 * shows and hides. The availability gate repeats the one that adds the switch to
 * the menu, so the two can never disagree.
 */
const LiveChatBlock = ({
  isLiveChatAvailable,
  ...rest
}: LiveChatBlockProps) => {
  if (isMobile || !isLiveChatAvailable) return null;

  return <ArticleLiveChat {...rest} />;
};

// Every field comes from the stores, so the public component takes no props.
const LiveChatBlockConnected = inject<TStore>(
  ({
    authStore,
    settingsStore,
    userStore,
    uploadDataStore,
    infoPanelStore,
    backup,
    profileActionsStore,
  }) => {
    const { downloadingProgress } = backup;
    const isBackupProgressVisible =
      downloadingProgress > 0 && downloadingProgress < 100;

    return {
      isLiveChatAvailable: authStore.isLiveChatAvailable,
      languageBaseName: authStore.languageBaseName,
      zendeskEmail: userStore.user?.email ?? "",
      chatDisplayName: userStore.user?.displayName ?? "",
      zendeskKey: settingsStore.zendeskKey,
      isShowLiveChat: profileActionsStore.isShowLiveChat,
      isMobileArticle: settingsStore.isMobileArticle,
      showProgress:
        uploadDataStore.primaryProgressDataStore.isPrimaryProgressVisbile ||
        uploadDataStore.secondaryProgressDataStore.isSecondaryProgressVisbile ||
        isBackupProgressVisible,
      isInfoPanelVisible: infoPanelStore.isVisible,
    };
  },
)(observer(LiveChatBlock)) as unknown as React.ComponentType;

export default LiveChatBlockConnected;
