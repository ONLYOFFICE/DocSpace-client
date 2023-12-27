import React from "react";
import { Row } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

const ActionsBlock = ({ t, textStyles, keyTextStyles, CtrlKey }) => {
  return (
    <>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysOpen")}</Text>
          <Text {...keyTextStyles}>{t("HotkeysEnterKey")}</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysRemove")}</Text>
          <Text {...keyTextStyles}># {t("Common:Or")} Delete</Text>
        </>
      </Row>
      {/* <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysUndoLastAction")}</Text>
          <Text {...keyTextStyles}>{CtrlKey}+z</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysRedoLastUndoneAction")}</Text>
          <Text {...keyTextStyles}>{CtrlKey}+Shift+z</Text>
        </>
      </Row> */}
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysCopySelected")}</Text>
          <Text {...keyTextStyles}> {CtrlKey} + c</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysPasteSelected")}</Text>
          <Text {...keyTextStyles}> {CtrlKey} + v</Text>
        </>
      </Row>
      <Row className="hotkeys_row">
        <>
          <Text {...textStyles}>{t("HotkeysCutSelected")}</Text>
          <Text {...keyTextStyles}> {CtrlKey} + x</Text>
        </>
      </Row>
    </>
  );
};

export default ActionsBlock;
