import React from "react";

import { Text } from "../../../../../../text";

import { ChatMessageType } from "../../../../../types/chat";

import styles from "./Agent.module.scss";

const Agent = ({ content }: { content: ChatMessageType["content_blocks"] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className={styles.agent}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.agentHeader + (isOpen ? ` ${styles.isOpen}` : "")}
      >
        Finished
      </div>
      {isOpen ? (
        <div className={styles.agentContent}>
          {content?.map((block) =>
            block.contents.map((blockContent, idx) => {
              const type = blockContent.type;

              const key: string = type;

              const contentNode: React.ReactNode = null;

              if (type === "text") return null;

              return (
                <React.Fragment key={key}>
                  <div className={styles.agentContentBlock}>
                    <Text isBold>{blockContent.header?.title}</Text>
                    {contentNode}
                  </div>
                  {idx !== block.contents.length - 1 ? (
                    <div className={styles.agentContentBlockSeparator} />
                  ) : null}
                </React.Fragment>
              );
            }),
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Agent;
