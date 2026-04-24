import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { DeviceType } from "@docspace/shared/enums";
import { getBrandName } from "@docspace/shared/constants/brands";

type ReducedRightsDialogProps = {
  visible: boolean;
  adminName: string;
  currentDeviceType: DeviceType;
  setReducedRightsData: (visible: boolean, admin?: string) => void;
};

const ReducedRightsDialog: React.FC<ReducedRightsDialogProps> = ({
  visible,
  adminName,
  currentDeviceType,
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
    <ModalDialog
      visible={visible}
      onClose={onCloseDialog}
      autoMaxHeight
      isLarge
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans
          t={t}
          ns="Files"
          i18nKey="YourUserTypeHasChanged"
          values={{
            userType: t("Common:Guest"),
            productName: getBrandName("ProductName"),
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
            productName: getBrandName("ProductName"),
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
          scale={currentDeviceType === DeviceType.mobile}
        />
        <Button
          key="RedirectButton"
          label={t("Common:MyDocuments")}
          size={ButtonSize.normal}
          onClick={onRedirect}
          scale={currentDeviceType === DeviceType.mobile}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, settingsStore }: TStore) => {
  const { reducedRightsData, setReducedRightsData } = dialogsStore;
  const { currentDeviceType } = settingsStore;

  return {
    visible: reducedRightsData.visible,
    adminName: reducedRightsData.adminName,
    currentDeviceType,
    setReducedRightsData,
  };
})(observer(ReducedRightsDialog));

