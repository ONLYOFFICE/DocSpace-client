import React from "react";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import Button from "@docspace/components/button";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import ModalDialog from "@docspace/components/modal-dialog";
import { useStore } from "SRC_DIR/store";
import Link from "@docspace/components/link";

const DeletePortalDialog = () => {
  const { spacesStore, authStore } = useStore();
  const { currentColorScheme } = authStore.settingsStore;

  const {
    currentPortal,
    deletePortalDialogVisible: visible,
    setDeletePortalDialogVisible,
  } = spacesStore;

  const { t } = useTranslation(["Management", "Common"]);

  const { owner, domain } = currentPortal;
  const { displayName, email } = owner;

  const onClose = () => setDeletePortalDialogVisible(false);

  const onDelete = () => {
    const protocol = window?.location?.protocol;
    return window.open(
      `${protocol}//${domain}/portal-settings/delete-data/deletion`,
      "_self"
    );
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body className="">
        <Trans
          i18nKey="DeletePortalText"
          t={t}
          domain={domain}
          displayName={displayName}
          email={email}
        >
          Please note: only the owner is able to delete the selected DocSpace.
          The owner of <strong>{{ domain }}</strong> is{" "}
          <strong>{{ displayName }}</strong>{" "}
          <Link
            className="email-link"
            type="page"
            href={`mailto:${email}`}
            noHover
            color={currentColorScheme?.main?.accent}
            title={email}
          >
            {{ email }}{" "}
          </Link>
          . If you are not the owner, you will not be able to access the
          DocSpace deletion settings by clicking the DELETE button and will be
          redirected to the Rooms section.
        </Trans>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:Delete")}
          size="normal"
          scale
          primary
          onClick={onDelete}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default observer(DeletePortalDialog);
