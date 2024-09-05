import React from "react";
import { useTranslation, Trans } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { RevokeDialogProps } from "../AuthorizedApps.types";

const RevokeDialog = ({
  visible,
  onRevoke,
  onClose,
  selection,
  bufferSelection,
  currentDeviceType,
}: RevokeDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const isMobile = currentDeviceType === "mobile";
  const isGroup = selection.length > 1;
  const name = bufferSelection?.name;

  const firstDesc = isGroup ? (
    t("RevokeConsentDescriptionGroup")
  ) : (
    <Trans t={t} i18nKey="RevokeConsentDescription" ns="OAuth">
      Once you revoke the consent to use the ONLYOFFICE DocSpace auth data in
      the service {{ name }}, ONLYOFFICE DocSpace will automatically stop
      logging into {{ name }}. Your account in {{ name }} will not be deleted.
    </Trans>
  );
  const secondDesc = isGroup ? (
    t("RevokeConsentLogin")
  ) : (
    <Trans t={t} i18nKey="RevokeConsentLogin" ns="OAuth">
      If you want to renew an automatic login into {{ name }} using ONLYOFFICE
      DocSpace, you will be asked to grant access to your DocSpace account data.
    </Trans>
  );

  const onRevokeAction = async () => {
    if (isRequestRunning) return;

    setIsRequestRunning(true);

    if (isGroup) {
      await onRevoke(selection);
    } else {
      await onRevoke([bufferSelection.clientId]);
    }

    setIsRequestRunning(false);
    onClose();
  };

  const onCloseAction = () => {
    if (isRequestRunning) return;

    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      isLarge
      autoMaxHeight
      withFooterBorder={isMobile}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("RevokeConsent")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text style={{ marginBottom: "16px" }}>{firstDesc}</Text>

        <Text>{secondDesc}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Revoke")}
          primary
          scale={isMobile}
          size={ButtonSize.normal}
          isLoading={isRequestRunning}
          onClick={onRevokeAction}
        />
        <Button
          label={t("Common:CancelButton")}
          scale={isMobile}
          size={ButtonSize.normal}
          isDisabled={isRequestRunning}
          onClick={onCloseAction}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RevokeDialog;
