import React from "react";
import classNames from "classnames";

import AIIconReactSvgUrl from "PUBLIC_DIR/images/ai.chat.avatar.react.svg?url";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";

import { ChatMessageType } from "../../../../types/chat";

import styles from "../../ChatMessageBody.module.scss";

import Agent from "./agent";
import { MarkdownField } from "./markdown";

const Message = ({ message }: { message: ChatMessageType }) => {
  return (
    <div
      className={classNames(styles.message, {
        [styles.userMessage]: message.isSend,
      })}
    >
      <Avatar
        size={AvatarSize.min}
        source={!message.isSend ? AIIconReactSvgUrl : message.icon || ""}
        role={AvatarRole.user}
        noClick
        isNotIcon
        imgClassName={!message.isSend ? styles.aiAvatar : ""}
      />

      <div
        className={classNames(
          styles.chatMessageContent,
          styles.chatMessagePadding,
          styles.chatMessageBorderRadius,
          {
            [styles.chatMessageUser]: message.isSend,
            [styles.chatMessageAI]: !message.isSend,
          },
        )}
      >
        {message.content_blocks &&
        message.content_blocks.length > 0 &&
        message.content_blocks.some((b) =>
          b.contents.some((bc) => bc.type === "tool_use"),
        ) ? (
          <Agent content={message.content_blocks} />
        ) : null}

        <MarkdownField chatMessage={message.message as string} />
      </div>
    </div>
  );
};

export default Message;
