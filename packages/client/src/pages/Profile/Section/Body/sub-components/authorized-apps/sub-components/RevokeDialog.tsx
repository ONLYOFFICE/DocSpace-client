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
  logoText,
}: RevokeDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const isMobile = currentDeviceType === "mobile";
  const isGroup = selection.length > 1;
  const name = bufferSelection?.name;

  const firstDesc = isGroup ? (
    <Trans
      t={t}
      i18nKey="RevokeConsentDescriptionGroup"
      ns="OAuth"
      values={{
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }}
    />
  ) : (
    <Trans
      t={t}
      i18nKey="RevokeConsentDescription"
      ns="OAuth"
      values={{
        name,
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }}
    />
  );
  const secondDesc = isGroup ? (
    <Trans
      t={t}
      i18nKey="RevokeConsentLoginGroup"
      ns="OAuth"
      values={{
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }}
    />
  ) : (
    <Trans
      t={t}
      i18nKey="RevokeConsentLogin"
      ns="OAuth"
      values={{
        name,
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }}
    />
  );

  const onRevokeAction = async () => {
    if (isRequestRunning) return;

    setIsRequestRunning(true);

    if (isGroup || selection.length) {
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
          testId="dialog_revoke_consent_button"
        />
        <Button
          label={t("Common:CancelButton")}
          scale={isMobile}
          size={ButtonSize.normal}
          isDisabled={isRequestRunning}
          onClick={onCloseAction}
          testId="dialog_revoke_consent_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RevokeDialog;
