import React, { useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

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
  email,
  displayName,
  currentColorScheme,
  withMainButton,
  isMobileArticle,
  zendeskKey,
  showProgress,
  isShowLiveChat,
  isInfoPanelVisible,
}: ArticleZendeskProps) => {
  const { t, ready } = useTranslation("Common");
  const { interfaceDirection } = useTheme();
  const infoPanelOffset = isInfoPanelVisible ? 400 : 0;

  useEffect(() => {
    // console.log("Zendesk useEffect", { withMainButton, isMobileArticle });
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
  }, [withMainButton, isMobileArticle, showProgress, isInfoPanelVisible]);

  useEffect(() => {
    // console.log("Zendesk useEffect", { languageBaseName });
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
    // console.log("Zendesk useEffect", { currentColorScheme });
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      color: {
        theme: currentColorScheme?.main?.accent,
      },
    });
  }, [currentColorScheme?.main?.accent]);

  useEffect(() => {
    // console.log("Zendesk useEffect", { email, displayName });
    zendeskAPI.addChanges("webWidget", "prefill", {
      email: {
        value: email,
        // readOnly: true, // optional
      },
      name: {
        value: displayName ? displayName.trim() : "",
        // readOnly: true, // optional
      },
    });
  }, [email, displayName]);

  useEffect(() => {
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      position: { horizontal: interfaceDirection === "ltr" ? "right" : "left" },
    });
  }, [interfaceDirection]);

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
