import React from "react";
import styled from "styled-components";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { TextInput } from "@docspace/shared/components/text-input";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { useStore } from "SRC_DIR/store";
import { validatePortalName } from "SRC_DIR/utils";

const StyledModal = styled(ModalDialogContainer)`
  #modal-dialog {
    min-height: 326px;
  }

  .create-docspace-input-block {
    padding: 16px 0;
  }

  .cancel-btn {
    display: inline-block;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 8px;`
        : `margin-left: 8px;`}
  }

  .create-docspace-checkbox {
    margin-bottom: 10px;
  }

  .create-docspace-input {
    width: 100%;
  }
`;

const CreatePortalDialog = () => {
  const [visit, setVisit] = React.useState<boolean>(false);
  const [restrictAccess, setRestrictAccess] = React.useState<boolean>(false);
  const [registerError, setRegisterError] = React.useState<null | string>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { spacesStore, authStore } = useStore();
  const { tenantAlias, baseDomain, domainValidator } = authStore.settingsStore;

  const {
    createPortalDialogVisible: visible,
    setCreatePortalDialogVisible,
    createNewPortal,
  } = spacesStore;

  const { t } = useTranslation(["Management", "Common"]);

  const [name, setName] = React.useState<string>("");

  const onHandleName = (e) => {
    setName(e.target.value);
    if (registerError) setRegisterError(null);
  };

  const onHandleClick = async () => {
    const { firstName, lastName, email } = authStore.userStore.user;

    const data = {
      firstName,
      lastName,
      email,
      portalName: name,
      limitedAccessSpace: restrictAccess,
    };

    const protocol = window?.location?.protocol;
    const host = `${tenantAlias}.${baseDomain}`;

    const isValidPortalName = validatePortalName(
      name,
      domainValidator,
      setRegisterError,
      t
    );

    if (isValidPortalName) {
      setIsLoading(true);
      await createNewPortal(data)
        .then(async (data) => {
          const { tenant } = data;
          if (visit) {
            const portalUrl = `${protocol}//${tenant?.domain}/`;

            return window.open(portalUrl, "_self");
          }

          await authStore.settingsStore.getAllPortals();
          onClose();
        })
        .catch((error) => {
          setRegisterError(error?.response?.data?.message);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const onClose = () => {
    setCreatePortalDialogVisible(false);
  };

  return (
    <StyledModal
      isLarge
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("CreatingDocSpace")}</ModalDialog.Header>
      <ModalDialog.Body className="create-docspace-body">
        <Text noSelect={true}>{t("CreateSpaceDescription")}</Text>
        <div className="create-docspace-input-block">
          <Text
            fontSize="13px"
            fontWeight="600"
            style={{ paddingBottom: "5px" }}
          >
            {t("DocSpaceName")}
          </Text>
          <TextInput
            onChange={onHandleName}
            value={name}
            hasError={!!registerError}
            placeholder={t("EnterName")}
            className="create-docspace-input"
          />
          <div>
            <Text fontSize="12px" fontWeight="400" color="#F24724">
              {registerError}
            </Text>
          </div>
          <div style={{ marginTop: "6px", wordWrap: "break-word" }}>
            <Text
              fontSize="12px"
              fontWeight="400"
              color="#A3A9AE"
            >{`${name}.${baseDomain}`}</Text>
          </div>
        </div>
        <div>
          <Checkbox
            className="create-docspace-checkbox"
            label={t("VisitSpace")}
            onChange={() => setVisit((visit) => !visit)}
            isChecked={visit}
          />

          <Checkbox
            label={t("RestrictAccess")}
            onChange={() => setRestrictAccess((access) => !access)}
            isChecked={restrictAccess}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          isLoading={isLoading}
          key="CreateButton"
          label={t("Common:Create")}
          size="normal"
          scale
          primary
          onClick={onHandleClick}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </StyledModal>
  );
};

export default observer(CreatePortalDialog);
