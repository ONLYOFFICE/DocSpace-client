import React from "react";
import copy from "copy-to-clipboard";

import FileReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { IconButton } from "../../../../../icon-button";

import styles from "../../ChatMessageBody.module.scss";

type ButtonsBlockProps = {
  message: string;
};

const ButtonsBlock = ({ message }: ButtonsBlockProps) => {
  const onCopy = () => {
    copy(message);
  };

  return (
    <div className={styles.buttonsBlock}>
      <IconButton
        iconName={CopyReactSvgUrl}
        size={16}
        isClickable
        onClick={onCopy}
      />
      <IconButton iconName={FileReactSvgUrl} size={16} isClickable />
    </div>
  );
};

export default ButtonsBlock;
