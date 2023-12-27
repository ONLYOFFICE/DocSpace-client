import React from "react";
import { Row } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

const CreationBlock = ({ t, textStyles, keyTextStyles, CtrlKey }) => {
  return (
    <>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysUploadFile")}</Text>
          <Text {...keyTextStyles}>Shift + u</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("Article:UploadFolder")}</Text>
          <Text {...keyTextStyles}>Shift + i</Text>
        </>
      </Row>
    </>
  );
};

export default CreationBlock;
