import React, { useEffect } from "react";
import styled from "styled-components";
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { TextInput } from "@docspace/shared/components/text-input";
import { useStore } from "SRC_DIR/store";
import { parseDomain } from "SRC_DIR/utils";
import { toastr } from "@docspace/shared/components/toast";

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
  const { spacesStore, settingsStore } = useStore();
  const [domainNameError, setDomainNameError] =
    React.useState<null | Array<object>>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
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
    const isValidDomain = parseDomain(domain, setDomainNameError, t);

    if (!isValidDomain) return;

    try {
      setIsLoading(true);

      await setDomainName(domain);
      await settingsStore.getAllPortals();
      await getPortalDomain();

      onClose();
    } catch (err) {
      toastr.error(err);
    } finally {
      setIsLoading(false);
    }
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
            {domainNameError &&
              domainNameError.map((err, index) => (
                <Text
                  key={index}
                  fontSize="12px"
                  fontWeight="400"
                  color="#F24724"
                >
                  {err}
                </Text>
              ))}
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          isLoading={isLoading}
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
