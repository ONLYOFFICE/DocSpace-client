import React from "react";
import copyToClipboard from "copy-to-clipboard";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";
import { Text } from "../../../../../text";
import { IconButton } from "../../../../../icon-button";
import { toastr } from "../../../../../toast";

import { ChatMessageType } from "../../../../types/chat";

import styles from "./Message.module.scss";
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
      className={styles.message}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar
        size={AvatarSize.small}
        source={message.icon || ""}
        role={AvatarRole.user}
        noClick
      />

      <div className={styles.messageContent}>
        <div className={styles.messageHeader}>
          <div className={styles.messageHeaderInfo}>
            <Text fontSize="16px" isBold>
              {message.sender_name}
            </Text>
            {!message.isSend && message.properties?.source?.source ? (
              <Text fontSize="13px" className={styles.source}>
                {message.properties?.source?.source}
              </Text>
            ) : null}
          </div>

          {hovered ? (
            <IconButton
              iconName={CopyIconUrl}
              size={16}
              isClickable
              onClick={onCopyMessage}
            />
          ) : null}
        </div>

        {message.content_blocks && message.content_blocks.length > 0 ? (
          <Agent content={message.content_blocks} />
        ) : null}

        <MarkdownField chatMessage={message.message as string} />
      </div>
    </div>
  );
};

export default Message;
