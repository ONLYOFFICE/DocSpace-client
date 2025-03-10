import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const StyledText = styled(Text)`
  margin-top: 16px;
`;

type ReducedRightsDialogProps = {
  visible: boolean;
  personalUserFolderTitle?: string;
  setReducedRightsVisible: (visible: boolean) => void;
};

const ReducedRightsDialog: React.FC<ReducedRightsDialogProps> = ({
  visible,
  personalUserFolderTitle,
  setReducedRightsVisible,
}) => {
  const { t } = useTranslation(["Common", "Files"]);

  const onCloseDialog = () => {
    setReducedRightsVisible(false);
  };

  const onRedirect = () => {
    window.DocSpace.navigate(
      combineUrl(window.ClientConfig?.proxy?.url, "/rooms/personal"),
    );

    onCloseDialog();
  };

  return (
    <ModalDialog visible={visible} onClose={onCloseDialog} autoMaxHeight>
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans
          t={t}
          ns="Files"
          i18nKey="YourUserTypeHasChanged"
          values={{
            userType: t("Common:Guest"),
            productName: t("Common:ProductName"),
            adminName: "Name",
          }}
          components={{ 1: <span style={{ fontWeight: 600 }} /> }}
        />
        <StyledText>
          <Trans
            t={t}
            ns="Files"
            i18nKey="PersonalFolderErasureWarningInfo"
            values={{ sectionName: personalUserFolderTitle }}
            components={{ 1: <span style={{ fontWeight: 600 }} /> }}
          />
        </StyledText>
        <StyledText>
          {t("Common:ForQuestionsContactPortalAdmin", {
            productName: t("Common:ProductName"),
          })}
        </StyledText>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("Common:OK")}
          size={ButtonSize.normal}
          primary
          onClick={onCloseDialog}
          scale
        />
        <Button
          key="RedirectButton"
          label={t("Files:GoToPersonal")}
          size={ButtonSize.normal}
          onClick={onRedirect}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, treeFoldersStore }: TStore) => {
  const { reducedRightsVisible: visible, setReducedRightsVisible } =
    dialogsStore;

  const { personalUserFolderTitle } = treeFoldersStore;

  return {
    visible,
    setReducedRightsVisible,
    personalUserFolderTitle,
  };
})(observer(ReducedRightsDialog));
