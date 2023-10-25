import React, { useEffect } from "react";
import styled from "styled-components";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import ModalDialog from "@docspace/components/modal-dialog";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { TextInput, Checkbox } from "@docspace/components";
import { useStore } from "SRC_DIR/store";
import { parseDomain } from "SRC_DIR/utils";

const StyledModal = styled(ModalDialogContainer)`
  .create-docspace-input-block {
    padding-top: 16px;
  }
  .create-docspace-input {
    width: 100%;
  }
`;

const ChangeDomainDialogComponent = () => {
  const { t } = useTranslation(["Management", "Common"]);
  const { spacesStore, authStore } = useStore();
  const [domainNameError, setDomainNameError] = React.useState<null | Array<object>>(null);

  const {
    setDomainName,
    getPortalDomain,
    setChangeDomainDialogVisible,
    domainDialogVisible: visible,
  } = spacesStore;

  const [domain, setDomain] = React.useState("");

  const onHandleDomain = (e) => {
    if (domainNameError) setDomainNameError(null);
    setDomain(e.target.value);
  };

  const onClose = () => {
    setChangeDomainDialogVisible(false);
  };

  const onClickDomainChange = async () => {

    const isValidDomain = parseDomain(domain, setDomainNameError);

    if (!isValidDomain) return;

    await setDomainName(domain);
    await authStore.settingsStore.getAllPortals();
    await getPortalDomain();
    onClose();
  };

  return (
    <StyledModal
      visible={visible}
      isLarge
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("DomainSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text noSelect={true} fontSize="13px">
          {t("ChangeDomainDescription")}
        </Text>
        <div className="create-docspace-input-block">
          <Text
            fontSize="13px"
            fontWeight="600"
            style={{ paddingBottom: "5px" }}
          >
            {t("DomainName")}
          </Text>
          <TextInput
            hasError={!!domainNameError}
            onChange={onHandleDomain}
            value={domain}
            placeholder={t("EnterDomain")}
            className="create-docspace-input"
          />
             <div>
              {domainNameError && domainNameError.map((err, index) => (
                <Text key={index} fontSize="12px" fontWeight="400" color="#F24724">{err.message}</Text>
              ))}
            </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:ChangeButton")}
          onClick={onClickDomainChange}
          size="normal"
          primary
          scale={true}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale={true}
        />
      </ModalDialog.Footer>
    </StyledModal>
  );
};

export default observer(ChangeDomainDialogComponent);
