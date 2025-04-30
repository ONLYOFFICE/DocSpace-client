import React from "react";
import copy from "copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// @ts-expect-error file not inside global exports
import a11yLight from "react-syntax-highlighter/dist/cjs/styles/prism/a11y-one-light";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useTheme } from "../../../../../../hooks/useTheme";

import { Text } from "../../../../../text";
import { IconButton } from "../../../../../icon-button";

import styles from "../../ChatMessageBody.module.scss";

type CodeBlockProps = {
  language?: string;
  content: string;
};

const CodeBlock = ({ language, content }: CodeBlockProps) => {
  const { isBase } = useTheme();

  const onCopy = () => {
    copy(content);
  };

  return (
    <div className={styles.codeContainer}>
      <div className={styles.codeHeader}>
        {language ? <Text>{language}</Text> : null}
        <IconButton
          iconName={CopyIconUrl}
          size={16}
          isClickable
          onClick={onCopy}
        />
      </div>
      <SyntaxHighlighter
        language={language}
        style={isBase ? a11yLight : a11yDark}
        className={styles.codeBody}
        customStyle={isBase ? {} : { background: "none" }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
