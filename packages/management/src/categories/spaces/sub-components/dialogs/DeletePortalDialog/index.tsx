import React from "react";
import styled from "styled-components";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import ModalDialog from "@docspace/components/modal-dialog";
import { useStore } from "SRC_DIR/store";
import Link from "@docspace/components/link";


const DeletePortalDialog = () => {
    const { spacesStore } = useStore();

    const {
        deletePortalDialogVisible: visible,
        setDeletePortalDialogVisible,
      } = spacesStore;

      const { t } = useTranslation(["Management", "Common"]);  

    const onClose = () => setDeletePortalDialogVisible(false);


    const address= "portal.docspace.site";
    const ownerName= "Dmitry Sychugov";
    const email = "Daimends1@onlyoffice.com";
    

    return (
        <ModalDialogContainer 
            isLarge
            visible={visible}
            onClose={onClose}
            displayType="modal"
        >
            <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
            <ModalDialog.Body className="">
            <Trans i18nKey="DeletePortalText" t={t} address="portal.docspace.site" ownerName="Dmitry Sychugov" email="Daimends1@onlyoffice.com">
                
                Please note: only the owner is able to delete the selected DocSpace. The owner of <strong>{{address}}</strong> is <strong>{{ownerName}}</strong>
                
                <Link
                    className="email-link"
                    type="page"
                    href={`mailto:${email}`}
                    noHover
              //  color={currentColorScheme.main.accent}
                    title={email}
              >
                {{ email }}
              </Link>.
              If you are not the owner, you will not be able to access the DocSpace deletion settings by clicking the DELETE button and will be redirected to the Rooms section.
                
            </Trans>
            </ModalDialog.Body>
            <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:Delete")}
          size="normal"
          scale
          primary
       //   onClick={onHandleClick}
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
    )
}

export default observer(DeletePortalDialog);