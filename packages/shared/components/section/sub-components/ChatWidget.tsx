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

import { memo, useEffect, useState, createElement } from "react";
import { useTheme } from "styled-components";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import SendIconReactSvgUrl from "PUBLIC_DIR/images/send-message.svg?url";
import ProviderIconImageUrl from "PUBLIC_DIR/images/icons/32/ai.bot32.svg?url";
import UserIconImageUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";
import ProviderImageUrl from "PUBLIC_DIR/images/ai.bot.svg?url";

import { TFile, TFolder } from "../../../api/files/types";
import { DeviceType } from "../../../enums";
import { Portal } from "../../portal";
import { IconButton } from "../../icon-button";
import { TViewAs } from "../../../types";
import { classNames, getCookie } from "../../../utils";
import styles from "../Section.module.scss";

export const ChatWidget = memo(
  ({
    isVisible,
    setIsVisible,
    anotherDialogOpen,
    viewAs,
    currentDeviceType,
    chatFiles = [],
    mainBarVisible,
  }: {
    isVisible?: boolean;
    setIsVisible?: (isVisible: boolean) => void;
    anotherDialogOpen?: boolean;
    viewAs?: TViewAs;
    currentDeviceType?: DeviceType;
    chatFiles?: (TFile | TFolder)[];
    mainBarVisible?: boolean;
  }) => {
    const { interfaceDirection, isBase } = useTheme();

    const toChatFiles = () => {
      return chatFiles.map((f) => {
        return { id: f.id, title: f.title, isFolder: f.isFolder };
      });
    };

    const onClose = () => setIsVisible && setIsVisible(false);

    useEffect(() => {
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target?.id === "chatPanelWrapper") setIsVisible?.(false);
      };

      if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
        document.addEventListener("mousedown", onMouseDown);

      window.onpopstate = () => {
        if (currentDeviceType !== DeviceType.desktop && isVisible)
          setIsVisible?.(false);
      };

      return () => document.removeEventListener("mousedown", onMouseDown);
    }, [currentDeviceType, isVisible, setIsVisible, viewAs]);

    const files = toChatFiles();

    const parentId = chatFiles.length
      ? "parentId" in chatFiles[0]
        ? chatFiles[0].parentId
        : chatFiles[0].folderId
      : "";

    const [flowId, setFlowId] = useState<string>(
      "8b865d2e-b2b6-4158-9d57-d3465998e304",
    );

    useEffect(() => {
      try {
        const storedFlowId = localStorage.getItem("x-chat-flow-id");
        if (storedFlowId) {
          setFlowId(storedFlowId);
        }
      } catch (error) {
        console.error("Error reading flowId from localStorage:", error);
      }
    }, []);

    const tweaks = parentId
      ? JSON.stringify({
          tweaks: {
            "ChatInput-hcS64": {},
            "TogetherAIModel-Qfvv7": {},
            "ChatOutput-tjfon": {},
            "InputParser-6wAPc": {},
            "ConditionalRouter-CUNeM": {},
            "RunFlow-TnxpB": {},
            "ParseReferences-wn59Q": {},
            "ConditionalRouter-4jjfR": {},
            "TextInput-OvpRl": {},
            "GetFilesFromFolders-BWaG7": {},
            "TextInput-z5Y8m": {
              current_folder: parentId,
            },
            "RagPrompt-vGvXR": {},
            "SystemPrompt-cM1BX": {},
            "GetFoldersContent-APjkO": {},
            "ToolCallingAgent-U12uF": {},
            "OnlyofficeDocspaceFolderListDocuments-6gGL6": {},
            "TogetherAIModel-i6idC": {},
            "RunFlow-PBB3K": {},
            "RagPrompt-uEtrv": {},
            "CustomComponent-TPR8t": {},
            "TogetherAIModel-YLhJ2": {},
            "ChatOutput-4t5Zg": {},
            "EnvExtractor-picCE": {},
          },
        })
      : "";

    const chat = createElement("langflow-chat-widget", {
      // api_key: "string",
      // output_type: "string",
      // input_type: "string",
      // output_component: "string",
      // host_url: "string",
      // flow_id: "string",
      // tweaks: "json",
      // output_type: "string",
      // input_type: "string",
      // output_component: "string",
      tweaks: tweaks || undefined,
      host_url: window.location.origin,
      bearer_token: getCookie("access_token_lf"),
      // additional_headers={undefined}
      session_id: "",
      // api_key="string"
      flow_id: flowId,
      list_files: JSON.stringify(files),
      provider_image: ProviderImageUrl,
      user_icon_image: UserIconImageUrl,
      provider_icon_image: ProviderIconImageUrl,
      send_icon_image: SendIconReactSvgUrl,
      interface_theme: isBase ? "light" : "dark",
      interface_direction: interfaceDirection,
      header_text: "DocSpace AI chat", // TODO: AI tranlstion
      empty_screen_text: "How can I help you today?", // TODO: AI tranlstion
      placeholder_text: "Message ...", // TODO: AI tranlstion
      chat_user_name: "Me", // TODO: AI tranlstion
      chat_provider_name: "AI", // TODO: AI tranlstion
    });

    const chatWidgetComponent = (
      <div className={styles.chatWrapper} id="chatPanelWrapper">
        <div className={styles.chatPanel}>
          <IconButton
            size={17}
            className={classNames(styles.closeChatPanel, {
              [styles.withBar]: mainBarVisible,
            })}
            iconName={CrossReactSvgUrl}
            onClick={onClose}
            isClickable
            isStroke
            aria-label="close"
          />
          {chat}
        </div>
      </div>
    );

    const renderPortal = () => {
      const rootElement = document.getElementById("root");

      return (
        <Portal
          element={chatWidgetComponent}
          appendTo={rootElement || undefined}
          visible={isVisible ? !anotherDialogOpen : false}
        />
      );
    };

    const isMobileView =
      currentDeviceType === DeviceType.mobile ||
      currentDeviceType === DeviceType.tablet;

    return !isVisible ||
      (anotherDialogOpen && currentDeviceType !== DeviceType.desktop)
      ? null
      : isMobileView
        ? renderPortal()
        : chatWidgetComponent;
  },
);

ChatWidget.displayName = "ChatWidget";
