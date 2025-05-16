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

import SelectReactSvgUrl from "PUBLIC_DIR/images/select.react.svg?url";
import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";

import { Textarea } from "../../../textarea";
import { IconButton } from "../../../icon-button";

import { useFilesStore } from "../../store/filesStore";
import { useMessageStore } from "../../store/messageStore";

import FilePreview from "../file-preview";

import FilesSelector from "./components/FileSelector";

import styles from "./ChatInput.module.scss";
import { ChatInputProps } from "./ChatInput.types";

const ChatInput = ({
  currentDeviceType,
  displayFileExtension,
  getIcon,
}: ChatInputProps) => {
  const { t } = useTranslation(["Common"]);

  const {
    sendMessage,
    cancelBuild,
    isInit,
    isRequestRunning,
    isEmptyMessages,
    currentSession,
  } = useMessageStore();
  const { files, wrapperHeight, clearFiles } = useFilesStore();

  const [value, setValue] = React.useState("");
  const [showSelector, setShowSelector] = React.useState(false);

  const prevSession = React.useRef(currentSession);

  const isSendDisabled = !isInit ? false : value ? isRequestRunning : false;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSendDisabled) return;

    if (e.target.value === "\n") return;

    setValue(e.target.value);
  };

  const toggleSelector = () => {
    setShowSelector((prev) => !prev);
  };

  const sendMessageAction = React.useCallback(() => {
    if (isRequestRunning || !value || showSelector) return;

    sendMessage(value, files, () => {
      setValue("");
      clearFiles();
    });
  }, [isRequestRunning, value, showSelector, files, sendMessage, clearFiles]);

  const onKeyEnter = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) return sendMessageAction();
      if (e.key === "Escape") return setShowSelector(false);
    },
    [sendMessageAction],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyEnter);

    return () => {
      window.removeEventListener("keydown", onKeyEnter);
    };
  }, [onKeyEnter]);

  React.useEffect(() => {
    if (currentSession.includes(prevSession.current)) return;

    prevSession.current = currentSession;
    setValue("");
    clearFiles();
  }, [currentSession, clearFiles]);

  const withFile = files.length !== 0;

  const placeholder = isEmptyMessages
    ? t("Common:AIChatInputFirstMessage")
    : t("Common:AIChatInputAskAI");

  const isDisabled = !isInit ? !value : isRequestRunning ? false : !value;

  const sendIconProps = !isInit
    ? { onClick: sendMessageAction, isDisabled, iconNode: null }
    : {
        onClick: isRequestRunning ? cancelBuild : sendMessageAction,
        isDisabled,
        iconNode: isRequestRunning ? (
          <div className={styles.whiteSquare} />
        ) : null,
      };

  return (
    <div
      className={classNames(styles.chatInput)}
      style={
        {
          "--chat-input-textarea-wrapper-with-files-padding": `${wrapperHeight + 24}px 8px 44px`,
          "--chat-input-textarea-wrapper-with-files-height": `${116 + wrapperHeight + 24}px`,
          "--chat-input-textarea-wrapper-with-files-max-height": `${172 + wrapperHeight + 24}px`,
        } as React.CSSProperties
      }
    >
      <Textarea
        onChange={handleChange}
        value={value}
        isFullHeight
        className={styles.chatInputTextArea}
        wrapperClassName={classNames({
          [styles.chatInputTextAreaWrapperWithFiles]: withFile,
          [styles.chatInputTextAreaWrapper]: !withFile,
        })}
        placeholder={placeholder}
        isChatMode
      />
      <FilePreview
        getIcon={getIcon}
        displayFileExtension={displayFileExtension}
        withRemoveFile
        files={files}
      />
      <div className={styles.chatInputButtons}>
        <IconButton
          iconName={SelectReactSvgUrl}
          size={16}
          isClickable
          onClick={toggleSelector}
          className={styles.chatInputButtonsFile}
        />

        <IconButton
          iconName={SendReactSvgUrl}
          size={12}
          isClickable
          className={classNames(
            styles.chatInputButtonsFile,
            styles.chatInputButtonsSend,
            {
              [styles.disabled]: isDisabled,
            },
          )}
          {...sendIconProps}
        />
      </div>
      {showSelector ? (
        <FilesSelector
          showSelector={showSelector}
          toggleSelector={toggleSelector}
          getIcon={getIcon}
          currentDeviceType={currentDeviceType}
        />
      ) : null}
    </div>
  );
};

export default observer(ChatInput);
