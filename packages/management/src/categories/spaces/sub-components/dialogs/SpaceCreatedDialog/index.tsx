import React from "react";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import { Text, Button, ModalDialog, ButtonSize } from "@docspace/shared/components";

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { useStore } from "SRC_DIR/store";

const SpaceCreatedDialog = () => {
  const { spacesStore } = useStore();

  const {
    spaceCreatedDialogVisible: visible,
    setSpaceCreatedDialogVisible,
    referenceLink,
  } = spacesStore;

  const onClose = () => setSpaceCreatedDialogVisible(false);

  const onClick = () => {
    let url = new URL(referenceLink);
    url.searchParams.append("referenceUrl", "/management");
    return window.location.replace(url);
  };

  const { t } = useTranslation(["Management", "Common"]);

  return (
    <ModalDialogContainer
      visible={visible}
      isLarge
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("SpaceCreated")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("SpaceCreatedTitle")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("GoToSpace")}
          size={ButtonSize.normal}
          primary
          onClick={onClick}
        />
        <Button
          key="CancelButton"
          label={t("StayInSettings")}
          size={ButtonSize.normal}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default observer(SpaceCreatedDialog);
