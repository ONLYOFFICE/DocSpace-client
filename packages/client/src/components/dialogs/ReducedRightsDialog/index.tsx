import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

type ReducedRightsDialogProps = {
  visible: boolean;
  adminName: string;
  setReducedRightsData: (visible: boolean, admin?: string) => void;
};

const ReducedRightsDialog: React.FC<ReducedRightsDialogProps> = ({
  visible,
  adminName,

  setReducedRightsData,
}) => {
  const { t } = useTranslation(["Common", "Files"]);

  const onCloseDialog = () => {
    setReducedRightsData(false);
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
            adminName,
          }}
          components={{ 1: <span style={{ fontWeight: 600 }} /> }}
        />
        <Text style={{ marginTop: "16px" }}>
          <Trans
            t={t}
            ns="Files"
            i18nKey="PersonalContentRemovalNotice"
            values={{ sectionName: t("Common:MyDocuments") }}
            components={{ 1: <span style={{ fontWeight: 600 }} /> }}
          />
        </Text>
        <Text style={{ marginTop: "16px" }}>
          {t("Common:ForQuestionsContactPortalAdmin", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OKButton"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          primary
          onClick={onCloseDialog}
          scale
        />
        <Button
          key="RedirectButton"
          label={t("Files:GoToSection", {
            sectionName: t("Common:MyDocuments"),
          })}
          size={ButtonSize.normal}
          onClick={onRedirect}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore }: TStore) => {
  const { reducedRightsData, setReducedRightsData } = dialogsStore;

  return {
    visible: reducedRightsData.visible,
    adminName: reducedRightsData.adminName,
    setReducedRightsData,
  };
})(observer(ReducedRightsDialog));
