import React from "react";

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/plus.svg";

import { Text } from "../../../../text";

import styles from "../ChatHeader.module.scss";

const CreateChat = () => {
  return (
    <div className={styles.createChat}>
      <PlusReactSvgUrl />
      <Text fontSize="14px" lineHeight="16px" fontWeight={600}>
        New chat
      </Text>
    </div>
  );
};

export default CreateChat;
