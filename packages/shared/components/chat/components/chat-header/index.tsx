import React from "react";
import { observer } from "mobx-react";

import styles from "./ChatHeader.module.scss";

import SelectChat from "./sub-components/SelectChat";
import CreateChat from "./sub-components/CreateChat";
import { useMessageStore } from "../../store/messageStore";
import SelectModel from "./sub-components/SelectModel";

const ChatHeader = () => {
  const { sessions, messages } = useMessageStore();

  return (
    <div className={styles.chatHeader}>
      {sessions.size > 0 ? <SelectChat /> : null}
      {messages.length > 0 ? <CreateChat /> : null}
      <SelectModel />
    </div>
  );
};

export default observer(ChatHeader);
