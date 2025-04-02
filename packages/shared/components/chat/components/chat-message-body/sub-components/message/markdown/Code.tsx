import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { Text } from "../../../../../../text";
import { IconButton } from "../../../../../../icon-button";

import styles from "./Message.module.scss";

const Code = ({
  language,
  content,
}: {
  language?: string;
  content: string;
}) => {
  return (
    <div className={styles.codeContainer}>
      <div className={styles.codeHeader}>
        <Text>{language}</Text>
        <IconButton
          iconName={CopyIconUrl}
          size={16}
          isClickable
          onClick={() => {}}
        />
      </div>
      <SyntaxHighlighter language={language} style={tomorrow}>
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
