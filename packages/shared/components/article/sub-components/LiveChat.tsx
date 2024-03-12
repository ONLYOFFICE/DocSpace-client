import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { LIVE_CHAT_LOCAL_STORAGE_KEY } from "../../../constants";
import { Zendesk } from "../../zendesk";
import { zendeskAPI } from "../../zendesk/Zendesk.utils";
import { ArticleZendeskProps } from "../Article.types";

const baseConfig = {
  webWidget: {
    zIndex: 9999,
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
}: ArticleZendeskProps) => {
  const { t, ready } = useTranslation("Common");
  const { interfaceDirection } = useTheme();
  useEffect(() => {
    // console.log("Zendesk useEffect", { withMainButton, isMobileArticle });
    zendeskAPI.addChanges("webWidget", "updateSettings", {
      offset:
        withMainButton && isMobileArticle
          ? { horizontal: "68px", vertical: "11px" }
          : {
              horizontal: showProgress ? "90px" : "4px",
              vertical: "11px",
            },
    });
  }, [withMainButton, isMobileArticle, showProgress]);

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

  const onZendeskLoaded = () => {
    const isShowLiveChat =
      localStorage.getItem(LIVE_CHAT_LOCAL_STORAGE_KEY) === "true" || false;

    zendeskAPI.addChanges("webWidget", isShowLiveChat ? "show" : "hide");
  };

  return zendeskKey ? (
    <Zendesk
      defer
      zendeskKey={zendeskKey}
      onLoaded={onZendeskLoaded}
      config={baseConfig}
    />
  ) : null;
};

ArticleLiveChat.displayName = "LiveChat";

export default ArticleLiveChat;
