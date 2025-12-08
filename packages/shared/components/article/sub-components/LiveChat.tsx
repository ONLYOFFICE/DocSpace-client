// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";
import { useTheme } from "../../../hooks/useTheme";
import { LIVE_CHAT_LOCAL_STORAGE_KEY } from "../../../constants";
import { Zendesk } from "../../zendesk";
import { zendeskAPI } from "../../zendesk/Zendesk.utils";
import { ArticleZendeskProps } from "../Article.types";

const baseConfig = {
  webWidget: {
    zIndex: 201,
    chat: {
      menuOptions: { emailTranscript: false },
    },
  },
};

const ArticleLiveChat = ({
  languageBaseName,
  zendeskEmail,
  chatDisplayName,
  withMainButton,
  isMobileArticle,
  zendeskKey,
  showProgress,
  isShowLiveChat,
  isInfoPanelVisible,
}: ArticleZendeskProps) => {
  const { t, ready } = useTranslation("Common");
  const { currentColorScheme } = useTheme();
  const { isRTL } = useInterfaceDirection();
  const infoPanelOffset = isInfoPanelVisible ? 400 : 0;

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      offset:
        withMainButton && isMobileArticle
          ? {
              horizontal: "68px",
              vertical: "11px",
            }
          : {
              horizontal: showProgress
                ? `${`${infoPanelOffset + 90}px`}`
                : `${`${infoPanelOffset + 4}px`}`,
              vertical: "11px",
            },
    });
  }, [
    withMainButton,
    isMobileArticle,
    showProgress,
    isInfoPanelVisible,
    infoPanelOffset,
  ]);

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "setLocale", languageBaseName);

    if (ready)
      zendeskAPI.addChanges("webWidget", "updateSettings", {
        launcher: {
          label: {
            "*": t("Common:Support"),
          },
          chatLabel: {
            "*": t("Common:Support"),
          },
        },
      });
  }, [languageBaseName, ready, t]);

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      color: {
        theme: currentColorScheme?.main?.accent,
      },
    });
  }, [currentColorScheme?.main?.accent]);

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "prefill", {
      email: {
        value: zendeskEmail,
      },
      name: {
        value: chatDisplayName ? chatDisplayName.trim() : "",
      },
    });
  }, [zendeskEmail, chatDisplayName]);

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      position: { horizontal: isRTL ? "left" : "right" },
    });
  }, [isRTL]);

  const onZendeskLoaded = useCallback(() => {
    const isShowChat =
      localStorage.getItem(LIVE_CHAT_LOCAL_STORAGE_KEY) === "true" || false;

    zendeskAPI.addChanges("webWidget", isShowChat ? "show" : "hide");
  }, []);

  return zendeskKey ? (
    <Zendesk
      defer
      zendeskKey={zendeskKey}
      onLoaded={onZendeskLoaded}
      config={baseConfig}
      isShowLiveChat={isShowLiveChat}
    />
  ) : null;
};

ArticleLiveChat.displayName = "LiveChat";

export default ArticleLiveChat;
