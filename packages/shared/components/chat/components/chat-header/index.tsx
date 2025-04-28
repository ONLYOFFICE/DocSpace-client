import React from "react";
import { observer } from "mobx-react";

import { useMessageStore } from "../../store/messageStore";

import styles from "./ChatHeader.module.scss";

import SelectChat, { SelectChatProps } from "./sub-components/SelectChat";
import CreateChat from "./sub-components/CreateChat";
import SelectModel from "./sub-components/SelectModel";

const ChatHeader = ({
  isFullScreen,
  isPanel,
  currentDeviceType,
}: SelectChatProps) => {
  const { sessions, messages } = useMessageStore();

  return (
    <div className={styles.chatHeader} data-panel={isPanel ? "true" : "false"}>
      {isFullScreen && currentDeviceType === "desktop" && !isPanel ? null : (
        <>
          {sessions.size > 0 ? (
            <SelectChat
              isFullScreen={isFullScreen}
              isPanel={isPanel}
              currentDeviceType={currentDeviceType}
            />
          ) : null}
          {messages.length > 0 ? <CreateChat /> : null}
        </>
      )}

      {isPanel ? null : <SelectModel />}
    </div>
  );
};

export default observer(ChatHeader);
