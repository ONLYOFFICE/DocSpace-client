// (c) Copyright Ascensio System SIA 2009-2025
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

import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";
import StyledBodyContent from "../styled-containers/StyledModalDialog";

const AddIdpCertificateModal = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Common"]);
  const {
    closeIdpModal,
    addIdpCertificate,
    idpIsModalVisible,
    setInput,
    idpCertificate,
    isCertificateLoading,
  } = props;

  return (
    <ModalDialog
      autoMaxHeight
      autoMaxWidth
      displayType="modal"
      onClose={closeIdpModal}
      visible={idpIsModalVisible}
    >
      <ModalDialog.Header>{t("NewCertificate")}</ModalDialog.Header>

      <ModalDialog.Body>
        <StyledBodyContent>
          <Text isBold className="text-area-label">
            {t("OpenCertificate")}
          </Text>

          <Textarea
            className="text-area"
            id="idp-certificate"
            name="idpCertificate"
            onChange={setInput}
            value={idpCertificate}
            placeholder={t("PlaceholderCert")}
            heightTextArea="72px"
          />
        </StyledBodyContent>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="ok-button"
          label={t("Common:OKButton")}
          onClick={() => addIdpCertificate(t)}
          primary
          scale
          isLoading={isCertificateLoading}
          isDisabled={!idpCertificate}
          size="normal"
        />
        <Button
          id="cancel-button"
          label={t("Common:CancelButton")}
          onClick={closeIdpModal}
          size="normal"
          scale
          isDisabled={isCertificateLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ ssoStore }) => {
  const {
    closeIdpModal,
    addIdpCertificate,
    idpIsModalVisible,
    setInput,
    idpCertificate,
    isCertificateLoading,
  } = ssoStore;

  return {
    closeIdpModal,
    addIdpCertificate,
    idpIsModalVisible,
    setInput,
    idpCertificate,
    isCertificateLoading,
  };
})(observer(AddIdpCertificateModal));
