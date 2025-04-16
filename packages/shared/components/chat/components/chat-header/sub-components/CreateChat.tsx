import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/plus.svg";

import { Text } from "../../../../text";

import { useMessageStore } from "../../../store/messageStore";

import styles from "../ChatHeader.module.scss";

const CreateChat = () => {
  const { startNewSessions } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  return (
    <div className={styles.createChat} onClick={startNewSessions}>
      <PlusReactSvgUrl />
      <Text fontSize="14px" lineHeight="16px" fontWeight={600}>
        {t("Common:AINewChat")}
      </Text>
    </div>
  );
};

export default observer(CreateChat);
