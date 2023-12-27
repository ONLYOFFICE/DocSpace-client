import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components";
import { Button } from "@docspace/shared/components";
import { Link } from "@docspace/shared/components";
import { ModalDialog } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";
import { Textarea } from "@docspace/shared/components";

import ModalComboBox from "./ModalComboBox";
import StyledModalDialog from "../styled-containers/StyledModalDialog";

const AddSpCertificateModal = (props) => {
  const { t, ready } = useTranslation(["SingleSignOn", "Common"]);
  const {
    closeSpModal,
    addSpCertificate,
    spIsModalVisible,
    generateCertificate,
    setInput,
    spCertificate,
    spPrivateKey,
    isGeneratedCertificate,
    isCertificateLoading,
  } = props;

  const onGenerate = () => {
    if (isGeneratedCertificate) return;
    generateCertificate();
  };

  return (
    <StyledModalDialog
      zIndex={310}
      isLoading={!ready}
      autoMaxHeight
      autoMaxWidth
      onClose={closeSpModal}
      visible={spIsModalVisible}
    >
      <ModalDialog.Header>{t("NewCertificate")}</ModalDialog.Header>

      <ModalDialog.Body>
        <Link className="generate" isHovered onClick={onGenerate} type="action">
          {t("GenerateCertificate")}
        </Link>
        <Text isBold className="text-area-label" noSelect>
          {t("OpenCertificate")}
        </Text>

        <TextArea
          id="sp-certificate"
          className="text-area"
          name="spCertificate"
          onChange={setInput}
          value={spCertificate}
          isDisabled={isGeneratedCertificate}
          placeholder={t("PlaceholderCert")}
        />

        <Text isBold className="text-area-label" noSelect>
          {t("PrivateKey")}
        </Text>

        <TextArea
          id="sp-privateKey"
          className="text-area"
          name="spPrivateKey"
          onChange={setInput}
          value={spPrivateKey}
          isDisabled={isGeneratedCertificate}
          placeholder={t("PlaceholderCert")}
        />

        <ModalComboBox
          className="modal-combo"
          isDisabled={isGeneratedCertificate}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="ok-button"
          label={t("Common:OKButton")}
          onClick={() => addSpCertificate(t)}
          primary
          size="normal"
          isLoading={isCertificateLoading}
          isDisabled={isGeneratedCertificate || !spCertificate || !spPrivateKey}
        />
        <Button
          id="cancel-button"
          label={t("Common:CancelButton")}
          onClick={closeSpModal}
          size="normal"
          isDisabled={isGeneratedCertificate || isCertificateLoading}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ ssoStore }) => {
  const {
    closeSpModal,
    addSpCertificate,
    spIsModalVisible,
    generateCertificate,
    setInput,
    spCertificate,
    spPrivateKey,
    isGeneratedCertificate,
    isCertificateLoading,
  } = ssoStore;

  return {
    closeSpModal,
    addSpCertificate,
    spIsModalVisible,
    generateCertificate,
    setInput,
    spCertificate,
    spPrivateKey,
    isGeneratedCertificate,
    isCertificateLoading,
  };
})(observer(AddSpCertificateModal));
