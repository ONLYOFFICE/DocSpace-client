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
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import PropTypes from "prop-types";
import AddIdpCertificateModal from "./sub-components/AddIdpCertificateModal";
import AddSpCertificateModal from "./sub-components/AddSpCertificateModal";
import CertificatesTable from "./sub-components/CertificatesTable";
import CheckboxSet from "./sub-components/CheckboxSet";
import HideButton from "./sub-components/HideButton";
import SsoComboBox from "./sub-components/SsoComboBox";
import {
  decryptAlgorithmsOptions,
  verifyAlgorithmsOptions,
} from "./sub-components/constants";

const StyledWrapper = styled.div`
  .icon-button {
    padding: 0 5px;
  }

  .certificates-box {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 40px 0 12px 0;
  }

  .certificates-buttons-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex-direction: row;
  }
`;

const Certificates = (props) => {
  const { t } = useTranslation("SingleSignOn");
  const {
    provider,
    enableSso,
    openIdpModal,
    openSpModal,
    idpCertificates,
    spCertificates,
    idpShowAdditionalParameters,
    spShowAdditionalParameters,
    idpVerifyAlgorithm,
    spEncryptAlgorithm,
    spSigningAlgorithm,
    isLoadingXml,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  } = props;

  let prefix = "";
  let additionalParameters = false;
  let certificates = [];

  switch (provider) {
    case "IdentityProvider":
      prefix = "idp";
      additionalParameters = idpShowAdditionalParameters;
      certificates = idpCertificates;
      break;
    case "ServiceProvider":
      prefix = "sp";
      additionalParameters = spShowAdditionalParameters;
      certificates = spCertificates;
      break;
    default:
      break;
  }

  return (
    <StyledWrapper>
      <div className="certificates-box">
        <Text as="h2" fontSize="15px" fontWeight={600} noSelect>
          {prefix === "idp" ? t("idpCertificates") : t("spCertificates")}
        </Text>

        <HelpButton
          offsetRight={0}
          tooltipContent={
            prefix === "idp" ? (
              <Text fontSize="12px">{t("idpCertificatesTooltip")}</Text>
            ) : (
              <Text fontSize="12px">{t("spCertificatesTooltip")}</Text>
            )
          }
          className={
            prefix === "idp"
              ? "idp-certificates-tooltip icon-button"
              : "sp-certificates-tooltip icon-button"
          }
          dataTestId={
            prefix === "idp"
              ? "idp_certificates_help_button"
              : "sp_certificates_help_button"
          }
        />
      </div>

      {certificates.length > 0 ? <CertificatesTable prefix={prefix} /> : null}

      <div className="certificates-buttons-box">
        {prefix === "idp" ? (
          <>
            <Button
              id="idp-add-certificate"
              isDisabled={!enableSso || isLoadingXml}
              label={t("AddCertificate")}
              onClick={openIdpModal}
              size="small"
              tabIndex={9}
              testId="idp_add_certificate_button"
            />
            <AddIdpCertificateModal />
          </>
        ) : null}

        {prefix === "sp" ? (
          <>
            <Button
              id="sp-add-certificate"
              isDisabled={!enableSso || isLoadingXml}
              label={t("AddCertificate")}
              onClick={openSpModal}
              size="small"
              tabIndex={9}
              testId="sp_add_certificate_button"
            />
            <AddSpCertificateModal />
          </>
        ) : null}

        <HideButton
          id={prefix === "idp" ? "idp-hide-button" : "sp-hide-button"}
          value={additionalParameters}
          label={
            prefix === "idp"
              ? "idpShowAdditionalParameters"
              : "spShowAdditionalParameters"
          }
          isAdditionalParameters
          dataTestId={
            prefix === "idp"
              ? "idp_hide_show_parameters_button"
              : "sp_hide_show_parameters_button"
          }
        />
      </div>

      {additionalParameters ? (
        <>
          <CheckboxSet prefix={prefix} />

          {provider === "IdentityProvider" ? (
            <SsoComboBox
              isDisabled={isDisabledIdpSigning}
              labelText={t("idpSigningAlgorithm")}
              name="idpVerifyAlgorithm"
              options={verifyAlgorithmsOptions}
              tabIndex={14}
              value={idpVerifyAlgorithm}
              dataTestId="idp_signing_combobox"
            />
          ) : null}

          {provider === "ServiceProvider" ? (
            <>
              <SsoComboBox
                isDisabled={isDisabledSpSigning}
                labelText={t("spSigningAlgorithm")}
                name="spSigningAlgorithm"
                options={verifyAlgorithmsOptions}
                tabIndex={14}
                value={spSigningAlgorithm}
                dataTestId="sp_signing_combobox"
              />

              <SsoComboBox
                isDisabled={isDisabledSpEncrypt}
                labelText={t("StandardDecryptionAlgorithm")}
                name="spEncryptAlgorithm"
                options={decryptAlgorithmsOptions}
                tabIndex={15}
                value={spEncryptAlgorithm}
                dataTestId="sp_decryption_combobox"
              />
            </>
          ) : null}
        </>
      ) : null}
    </StyledWrapper>
  );
};

Certificates.propTypes = {
  provider: PropTypes.oneOf(["IdentityProvider", "ServiceProvider"]),
};

export default inject(({ ssoStore }) => {
  const {
    enableSso,
    openIdpModal,
    openSpModal,
    idpCertificates,
    spCertificates,
    idpShowAdditionalParameters,
    spShowAdditionalParameters,
    idpVerifyAlgorithm,
    spEncryptAlgorithm,
    spSigningAlgorithm,
    isLoadingXml,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  } = ssoStore;

  return {
    enableSso,
    openIdpModal,
    openSpModal,
    idpCertificates,
    spCertificates,
    idpShowAdditionalParameters,
    spShowAdditionalParameters,
    idpVerifyAlgorithm,
    spEncryptAlgorithm,
    spSigningAlgorithm,
    isLoadingXml,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  };
})(observer(Certificates));
