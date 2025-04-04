import React from "react";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";

import styles from "../ChatHeader.module.scss";

const SelectChat = () => {
  return (
    <div className={styles.selectChat}>
      <SelectSessionReactSvg />
    </div>
  );
};

export default SelectChat;
