import React from "react";

import AiChatReactSvg from "PUBLIC_DIR/images/ai.chat.react.svg";

import { Text } from "../../text";

import { TChatProps } from "../Navigation.types";

import styles from "../Navigation.module.scss";

const ChatBtn = ({ chatOpen, toggleChat }: TChatProps) => {
  return (
    <div
      className={`${styles.chatButton} ${chatOpen ? styles.chatButtonOpen : ""}`.trim()}
      onClick={() => toggleChat?.(!chatOpen)}
    >
      <AiChatReactSvg />
      <Text
        fontSize="13px"
        lineHeight="15px"
        fontWeight={600}
        className={styles.chatButtonText}
      >
        AI Chat
      </Text>
    </div>
  );
};

export default ChatBtn;
