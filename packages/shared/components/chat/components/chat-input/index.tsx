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

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TFile } from "../../../../api/files/types";
import { InfoPanelEvents } from "../../../../enums";
import { RectangleSkeleton } from "../../../../skeletons";

import { Textarea } from "../../../textarea";

import { useMessageStore } from "../../store/messageStore";
import { useChatStore } from "../../store/chatStore";

import { ChatInputProps } from "../../types";

import ToolsSettings from "./ToolsSettings";
import Attachment from "./Attachment";
import FilesList from "./FilesList";

import styles from "./ChatInput.module.scss";
import Buttons from "./Buttons";

const ChatInput = ({ getIcon, isLoading }: ChatInputProps) => {
  const { t } = useTranslation(["Common"]);

  const {
    startChat,
    sendMessage,

    currentChatId,
  } = useMessageStore();
  const { fetchChat, currentChat } = useChatStore();

  const [value, setValue] = React.useState("");
  const [inputWidth, setInputWidth] = React.useState(0);
  const [selectedFiles, setSelectedFiles] = React.useState<Partial<TFile>[]>(
    [],
  );

  const [isFilesSelectorVisible, setIsFilesSelectorVisible] =
    React.useState(false);
  const [isMcpToolsVisible, setIsMcpToolsVisible] = React.useState(false);

  const prevSession = React.useRef(currentChatId);
  const inputRef = React.useRef<HTMLDivElement>(null);
  const toolSettingsRef = React.useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (val === "\n") {
      return;
    }

    setValue(val);
  };

  const handleRemoveFile = (file: Partial<TFile>) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const sendMessageAction = React.useCallback(async () => {
    // if (!value) return;
    try {
      if (!currentChatId) {
        startChat(
          value,
          selectedFiles.map((file) => file.id!.toString()),
        );
      } else {
        sendMessage(
          value,
          selectedFiles.map((file) => file.id!.toString()),
        );
      }

      setValue("");
      setSelectedFiles([]);
    } catch (e) {
      console.log(e);
    }
  }, [currentChatId, startChat, sendMessage, value, selectedFiles]);

  const onKeyEnter = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) return sendMessageAction();
    },
    [sendMessageAction],
  );

  const showFilesSelector = () => {
    setIsMcpToolsVisible(false);
    setIsFilesSelectorVisible(true);
  };
  const hideFilesSelector = () => setIsFilesSelectorVisible(false);
  const toggleFilesSelector = () => {
    if (isFilesSelectorVisible) {
      hideFilesSelector();
    } else {
      showFilesSelector();
    }
  };

  const showMcpTools = () => {
    setIsFilesSelectorVisible(false);
    setIsMcpToolsVisible(true);
  };
  const hideMcpTools = () => setIsMcpToolsVisible(false);
  const toggleMcpTools = () => {
    if (isMcpToolsVisible) {
      hideMcpTools();
    } else {
      showMcpTools();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyEnter);

    return () => {
      window.removeEventListener("keydown", onKeyEnter);
    };
  }, [onKeyEnter]);

  React.useEffect(() => {
    if (currentChatId && !currentChat) {
      fetchChat(currentChatId);
    }

    prevSession.current = currentChatId;

    setValue("");
    setSelectedFiles([]);
  }, [currentChatId, currentChat, fetchChat]);

  React.useEffect(() => {
    const onResize = () => {
      setInputWidth(inputRef.current?.offsetWidth ?? 0);

      setTimeout(() => setInputWidth(inputRef.current?.offsetWidth ?? 0), 0);
    };

    window.addEventListener("resize", onResize);

    window.addEventListener(InfoPanelEvents.showInfoPanel, onResize);
    window.addEventListener(InfoPanelEvents.hideInfoPanel, onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener(InfoPanelEvents.showInfoPanel, onResize);
    };
  }, []);

  return (
    <>
      <div
        className={classNames(styles.chatInput)}
        ref={(ref) => {
          if (ref) setInputWidth(ref.offsetWidth);
          inputRef.current = ref;
        }}
      >
        {isLoading ? (
          <RectangleSkeleton width="100%" height="116px" borderRadius="3px" />
        ) : (
          <>
            <Textarea
              onChange={handleChange}
              value={value}
              isFullHeight
              className={styles.chatInputTextArea}
              wrapperClassName={classNames({
                [styles.chatInputTextAreaWrapper]: true,
                [styles.chatInputTextAreaWrapperFiles]:
                  selectedFiles.length > 0,
              })}
              placeholder={t("Common:AIChatInput")}
              isChatMode
            />

            <FilesList
              files={selectedFiles}
              getIcon={getIcon}
              onRemove={handleRemoveFile}
            />

            <Buttons
              inputWidth={inputWidth}
              isFilesSelectorVisible={isFilesSelectorVisible}
              toggleFilesSelector={toggleFilesSelector}
              isMcpToolsVisible={isMcpToolsVisible}
              toggleMcpTools={toggleMcpTools}
              toolSettingsRef={toolSettingsRef}
              sendMessageAction={sendMessageAction}
            />
          </>
        )}
      </div>
      <Attachment
        isVisible={isFilesSelectorVisible}
        toggleAttachment={toggleFilesSelector}
        getIcon={getIcon}
        setSelectedFiles={setSelectedFiles}
      />
      <ToolsSettings
        isVisible={isMcpToolsVisible}
        toggleToolsSettings={toggleMcpTools}
        forwardedRef={toolSettingsRef}
      />
    </>
  );
};

export default observer(ChatInput);
