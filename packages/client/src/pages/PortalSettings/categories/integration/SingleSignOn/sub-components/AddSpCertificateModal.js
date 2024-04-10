// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";

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

        <Textarea
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

        <Textarea
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
