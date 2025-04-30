import React from "react";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";

import FileReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { IconButton } from "../../../../../icon-button";

import { ChatMessageType } from "../../../../types/chat";

import styles from "../../ChatMessageBody.module.scss";

type ButtonsBlockProps = Pick<ChatMessageType, "message">;

const ButtonsBlock = ({ message }: ButtonsBlockProps) => {
  const { t } = useTranslation(["Common"]);
  const onCopy = () => {
    if (typeof message === "string") {
      copy(message);
    }
  };

  return (
    <div className={styles.buttonsBlock}>
      <IconButton
        iconName={CopyReactSvgUrl}
        size={16}
        isClickable
        onClick={onCopy}
        tooltipId="copyTooltip"
        tooltipContent={t("Common:CopyMessage")}
      />
      <IconButton
        iconName={FileReactSvgUrl}
        size={16}
        isClickable
        tooltipId="fileTooltip"
        tooltipContent={t("Common:SaveMessage")}
      />
    </div>
  );
};

export default ButtonsBlock;
