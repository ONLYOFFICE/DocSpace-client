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

import { useEffect } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";

import SsoComboBox from "./sub-components/SsoComboBox";
import SsoFormField from "./sub-components/SsoFormField";
import UploadXML from "./sub-components/UploadXML";
import {
  ssoBindingOptions,
  sloBindingOptions,
  nameIdOptions,
} from "./sub-components/constants";
import { DeviceType } from "@docspace/shared/enums";

const PROVIDER_URL = "https://idpservice/idp";

const StyledWrapper = styled.div`
  .radio-button-group {
    margin-left: 24px;
  }
`;

const IdpSettings = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Settings"]);
  const {
    ssoBinding,
    enableSso,
    setInput,
    sloBinding,
    nameIdFormat,
    spLoginLabel,
    entityId,
    ssoUrlPost,
    ssoUrlRedirect,
    sloUrlPost,
    sloUrlRedirect,
    entityIdHasError,
    spLoginLabelHasError,
    ssoUrlPostHasError,
    ssoUrlRedirectHasError,
    sloUrlPostHasError,
    sloUrlRedirectHasError,
    isInit,
    init,
    currentDeviceType,
  } = props;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  useEffect(() => {
    if (!isInit || isMobileView) init();
  }, [isInit]);

  return (
    <StyledWrapper>
      <UploadXML />

      <SsoFormField
        labelText={t("CustomEntryButton")}
        name="spLoginLabel"
        placeholder={t("Settings:SingleSignOn")}
        tabIndex={4}
        tooltipContent={<Text fontSize="12px">{t("CustomEntryTooltip")}</Text>}
        tooltipClass="custom-entry-tooltip icon-button"
        value={spLoginLabel}
        hasError={spLoginLabelHasError}
      />

      <SsoFormField
        labelText={t("ProviderURL")}
        name="entityId"
        placeholder={PROVIDER_URL}
        tabIndex={5}
        tooltipContent={<Text fontSize="12px">{t("ProviderURLTooltip")}</Text>}
        tooltipClass="provider-url-tooltip icon-button"
        value={entityId}
        hasError={entityIdHasError}
      />

      <SsoFormField
        labelText={t("SignOnEndpointUrl")}
        name={ssoBinding?.includes("POST") ? "ssoUrlPost" : "ssoUrlRedirect"}
        placeholder={
          ssoBinding?.includes("POST")
            ? "https://idpservice/SSO/POST"
            : "https://idpservice/SSO/REDIRECT"
        }
        tabIndex={7}
        tooltipContent={
          <Text fontSize="12px">{t("SignOnEndpointUrlTooltip")}</Text>
        }
        tooltipClass="sign-on-endpoint-url-tooltip icon-button"
        value={ssoBinding?.includes("POST") ? ssoUrlPost : ssoUrlRedirect}
        hasError={
          ssoBinding?.includes("POST")
            ? ssoUrlPostHasError
            : ssoUrlRedirectHasError
        }
      >
        <Box
          displayProp="flex"
          alignItems="center"
          flexDirection="row"
          marginProp="5px 0"
        >
          <Text fontSize="12px" fontWeight={400} noSelect>
            {t("Binding")}
          </Text>

          <RadioButtonGroup
            className="radio-button-group"
            isDisabled={!enableSso}
            name="ssoBinding"
            onClick={setInput}
            options={ssoBindingOptions}
            selected={ssoBinding}
            spacing="20px"
            tabIndex={6}
          />
        </Box>
      </SsoFormField>

      <SsoFormField
        labelText={t("LogoutEndpointUrl")}
        name={sloBinding?.includes("POST") ? "sloUrlPost" : "sloUrlRedirect"}
        placeholder={
          sloBinding?.includes("POST")
            ? "https://idpservice/SLO/POST"
            : "https://idpservice/SLO/REDIRECT"
        }
        tabIndex={9}
        tooltipContent={
          <Text fontSize="12px">{t("LogoutEndpointUrlTooltip")}</Text>
        }
        tooltipClass="logout-endpoint-url-tooltip icon-button"
        value={sloBinding?.includes("POST") ? sloUrlPost : sloUrlRedirect}
        hasError={
          ssoBinding?.includes("POST")
            ? sloUrlPostHasError
            : sloUrlRedirectHasError
        }
      >
        <Box
          displayProp="flex"
          alignItems="center"
          flexDirection="row"
          marginProp="5px 0"
        >
          <Text fontSize="12px" fontWeight={400}>
            {t("Binding")}
          </Text>

          <RadioButtonGroup
            className="radio-button-group"
            isDisabled={!enableSso}
            name="sloBinding"
            onClick={setInput}
            options={sloBindingOptions}
            selected={sloBinding}
            spacing="20px"
            tabIndex={8}
          />
        </Box>
      </SsoFormField>

      <SsoComboBox
        labelText={t("NameIDFormat")}
        value={nameIdFormat}
        name="nameIdFormat"
        options={nameIdOptions}
        tabIndex={8}
      />
    </StyledWrapper>
  );
};

export default inject(({ settingsStore, ssoStore }) => {
  const {
    ssoBinding,
    enableSso,
    setInput,
    sloBinding,
    nameIdFormat,
    spLoginLabel,
    entityId,
    ssoUrlPost,
    ssoUrlRedirect,
    sloUrlPost,
    sloUrlRedirect,
    entityIdHasError,
    spLoginLabelHasError,
    ssoUrlPostHasError,
    ssoUrlRedirectHasError,
    sloUrlPostHasError,
    sloUrlRedirectHasError,
    init,
    isInit,
  } = ssoStore;
  const { currentDeviceType } = settingsStore;

  return {
    ssoBinding,
    enableSso,
    setInput,
    sloBinding,
    nameIdFormat,
    spLoginLabel,
    entityId,
    ssoUrlPost,
    ssoUrlRedirect,
    sloUrlPost,
    sloUrlRedirect,
    entityIdHasError,
    spLoginLabelHasError,
    ssoUrlPostHasError,
    ssoUrlRedirectHasError,
    sloUrlPostHasError,
    sloUrlRedirectHasError,
    init,
    isInit,
    currentDeviceType,
  };
})(observer(IdpSettings));
