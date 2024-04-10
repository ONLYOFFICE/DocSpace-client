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
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@docspace/shared/components/checkbox";

const checkboxesNames = {
  idp: [
    "idpVerifyAuthResponsesSign",
    "idpVerifyLogoutRequestsSign",
    "idpVerifyLogoutResponsesSign",
  ],
  sp: [
    "spSignAuthRequests",
    "spSignLogoutRequests",
    "spSignLogoutResponses",
    "spEncryptAssertions",
  ],
};

const StyledWrapper = styled.div`
  margin: 16px 0;
  .checkbox-input {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 10px 0 6px 8px;
          `
        : css`
            margin: 10px 8px 6px 0;
          `}
  }
`;

const CheckboxSet = (props) => {
  const { t } = useTranslation("SingleSignOn");
  const {
    prefix,
    idpVerifyAuthResponsesSign,
    idpVerifyLogoutRequestsSign,
    idpVerifyLogoutResponsesSign,
    spSignAuthRequests,
    spSignLogoutRequests,
    spSignLogoutResponses,
    spEncryptAssertions,
    setCheckbox,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  } = props;

  const isDisabled =
    prefix === "sp" ? isDisabledSpSigning : isDisabledIdpSigning;

  return (
    <StyledWrapper>
      <Checkbox
        id={
          prefix === "idp"
            ? "idp-verify-auth-responses-sign"
            : "sp-sign-auth-requests"
        }
        className="checkbox-input"
        isDisabled={isDisabled}
        onChange={setCheckbox}
        label={prefix === "idp" ? t("idpAuthRequest") : t("spAuthRequest")}
        name={checkboxesNames[prefix][0]}
        tabIndex={10}
        isChecked={
          prefix === "idp" ? idpVerifyAuthResponsesSign : spSignAuthRequests
        }
      />
      <Checkbox
        id={
          prefix === "idp"
            ? "idp-verify-logout-requests-sign"
            : "sp-sign-logout-requests"
        }
        className="checkbox-input"
        isDisabled={isDisabled}
        onChange={setCheckbox}
        label={
          prefix === "idp" ? t("idpSignExitRequest") : t("spSignExitRequest")
        }
        name={checkboxesNames[prefix][1]}
        tabIndex={11}
        isChecked={
          prefix === "idp" ? idpVerifyLogoutRequestsSign : spSignLogoutRequests
        }
      />
      <Checkbox
        id={
          prefix === "idp"
            ? "idp-verify-logout-responses-sign"
            : "sp-sign-logout-responses"
        }
        className="checkbox-input"
        isDisabled={isDisabled}
        onChange={setCheckbox}
        label={
          prefix === "idp"
            ? t("idpSignResponseRequest")
            : t("spSignResponseRequest")
        }
        name={checkboxesNames[prefix][2]}
        tabIndex={12}
        isChecked={
          prefix === "idp"
            ? idpVerifyLogoutResponsesSign
            : spSignLogoutResponses
        }
      />

      {prefix === "sp" && (
        <Checkbox
          id="sp-encrypt-assertions"
          className="checkbox-input"
          isDisabled={isDisabledSpEncrypt}
          onChange={setCheckbox}
          label={t("spDecryptStatements")}
          name={checkboxesNames[prefix][3]}
          tabIndex={13}
          isChecked={spEncryptAssertions}
        />
      )}
    </StyledWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const {
    idpVerifyAuthResponsesSign,
    idpVerifyLogoutRequestsSign,
    idpVerifyLogoutResponsesSign,
    spSignAuthRequests,
    spSignLogoutRequests,
    spSignLogoutResponses,
    spEncryptAssertions,
    setCheckbox,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  } = ssoStore;

  return {
    idpVerifyAuthResponsesSign,
    idpVerifyLogoutRequestsSign,
    idpVerifyLogoutResponsesSign,
    spSignAuthRequests,
    spSignLogoutRequests,
    spSignLogoutResponses,
    spEncryptAssertions,
    setCheckbox,
    isDisabledSpSigning,
    isDisabledSpEncrypt,
    isDisabledIdpSigning,
  };
})(observer(CheckboxSet));
