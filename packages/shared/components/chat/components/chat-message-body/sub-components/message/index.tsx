import React from "react";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";
import { Text } from "../../../../../text";

import { ChatMessageType } from "../../../../types/chat";

import styles from "./Message.module.scss";
import { MarkdownField } from "./markdown";

const Message = ({ message }: { message: ChatMessageType }) => {
  console.log(message);
  return (
    <div className={styles.message}>
      <Avatar
        size={AvatarSize.small}
        source={message.icon || ""}
        role={AvatarRole.user}
      />
      <div className={styles.messageContent}>
        <div className={styles.messageHeader}>
          <Text>{message.sender_name}</Text>
        </div>
        <MarkdownField
          chatMessage={message.message as string}
          editedFlag={false}
          isEmpty={false}
          chat={message}
        />
      </div>
    </div>
  );
};

export default Message;
