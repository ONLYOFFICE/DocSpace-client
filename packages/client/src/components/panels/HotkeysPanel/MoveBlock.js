import React from "react";
import { Row } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

const MoveBlock = ({ t, textStyles, keyTextStyles, CtrlKey }) => {
  return (
    <>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysMoveDown")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + ↓</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysMoveUp")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + ↑</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysMoveLeft")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + ←</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysMoveRight")}</Text>
          <Text {...keyTextStyles}>{CtrlKey} + →</Text>
        </>
      </Row>
    </>
  );
};

export default MoveBlock;
