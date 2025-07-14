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

import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";

import { Textarea } from "../../../textarea";
import { IconButton } from "../../../icon-button";

import { useMessageStore } from "../../store/messageStore";
import { useChatStore } from "../../store/chatStore";

import styles from "./ChatInput.module.scss";

const ChatInput = () => {
  const { t } = useTranslation(["Common"]);

  const {
    startChat,
    sendMessage,
    stopMessage,
    isRequestRunning,
    currentChatId,
    messages,
  } = useMessageStore();
  const { fetchChat, currentChat } = useChatStore();

  const [value, setValue] = React.useState("");

  const prevSession = React.useRef(currentChatId);
  const inputRef = React.useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (val === "\n") {
      return;
    }

    setValue(val);
  };

  const sendMessageAction = React.useCallback(async () => {
    if (!currentChatId) {
      startChat(value);

      setValue("");

      return;
    }

    sendMessage(value);

    setValue("");
  }, [currentChatId, startChat, sendMessage, value]);

  const onKeyEnter = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) return sendMessageAction();
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
    if (currentChatId && !currentChat) {
      console.log(currentChatId, prevSession.current, currentChat);
      fetchChat(currentChatId);
    }

    prevSession.current = currentChatId;

    setValue("");
  }, [currentChatId, currentChat, fetchChat]);

  const placeholder =
    messages.length === 0
      ? t("Common:AIChatInputFirstMessage")
      : t("Common:AIChatInputAskAI");

  const sendIconProps = !isRequestRunning
    ? { onClick: sendMessageAction, isDisabled: false, iconNode: null }
    : {
        onClick: stopMessage,
        isDisabled: false,
        iconNode: isRequestRunning ? (
          <div className={styles.whiteSquare} />
        ) : null,
      };

  return (
    <div className={classNames(styles.chatInput)} ref={inputRef}>
      <Textarea
        onChange={handleChange}
        value={value}
        isFullHeight
        className={styles.chatInputTextArea}
        wrapperClassName={classNames({
          [styles.chatInputTextAreaWrapper]: true,
        })}
        placeholder={placeholder}
        isChatMode
      />

      <div className={styles.chatInputButtons}>
        <IconButton
          iconName={SendReactSvgUrl}
          size={12}
          isClickable
          className={classNames(styles.chatInputButtonsSend, {
            [styles.disabled]: false,
          })}
          {...sendIconProps}
        />
      </div>
    </div>
  );
};

export default observer(ChatInput);
