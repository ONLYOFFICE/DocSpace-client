import React from "react";
import copyToClipboard from "copy-to-clipboard";
import classNames from "classnames";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import AIIconReactSvgUrl from "PUBLIC_DIR/images/ai.chat.avatar.react.svg?url";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";
import { Text } from "../../../../../text";
import { IconButton } from "../../../../../icon-button";
import { toastr } from "../../../../../toast";

import { ChatMessageType } from "../../../../types/chat";

import styles from "../../ChatMessageBody.module.scss";
import { MarkdownField } from "./markdown";
import Agent from "./agent";

const Message = ({ message }: { message: ChatMessageType }) => {
  const [hovered, setHovered] = React.useState(false);

  const onCopyMessage = () => {
    copyToClipboard(message.message as string);

    toastr.success("Copied to clipboard");
  };

  return (
    <div
      className={classNames(styles.message, {
        [styles.userMessage]: message.isSend,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          styles.messageContent,
          styles.chatMessagePadding,
          styles.chatMessageBorderRadius,
          {
            [styles.chatMessageUser]: message.isSend,
            [styles.chatMessageAI]: !message.isSend,
          },
        )}
      >
        {/* {message.content_blocks && message.content_blocks.length > 0 ? (
          <Agent content={message.content_blocks} />
        ) : null} */}

        <MarkdownField chatMessage={message.message as string} />
      </div>
    </div>
  );
};

export default Message;
