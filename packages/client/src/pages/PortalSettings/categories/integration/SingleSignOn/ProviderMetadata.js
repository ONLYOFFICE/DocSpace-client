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
import { useNavigate, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import { mobile, size } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";

import MetadataUrlField from "./sub-components/MetadataUrlField";

const StyledWrapper = styled.div`
  .button-wrapper {
    padding-block: 16px;
    position: sticky;
    bottom: 0;
    margin-top: 32px;
    background-color: ${({ theme }) => theme.backgroundColor};

    @media ${mobile} {
      position: fixed;
      padding-inline: 16px;
      inset-inline: 0;
    }
  }
`;

const ProviderMetadata = (props) => {
  const { t } = useTranslation("SingleSignOn");
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadMetadata, currentDeviceType, isSSOAvailable } = props;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const url = window.location.origin;

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("sp-metadata") &&
      navigate("/portal-settings/integration/single-sign-on");
  };

  return (
    <StyledWrapper>
      <MetadataUrlField
        labelText={t("SPEntityId")}
        name="spEntityId"
        placeholder={`${url}/sso/metadata`}
        tooltipContent={<Text fontSize="12px">{t("SPEntityIdTooltip")}</Text>}
        tooltipClass="sp-entity-id-tooltip icon-button"
      />

      <MetadataUrlField
        labelText={t("SPAssertionConsumerURL")}
        name="spAssertionConsumerUrl"
        placeholder={`${url}/sso/acs`}
        tooltipContent={
          <Text fontSize="12px">{t("SPAssertionConsumerURLTooltip")}</Text>
        }
        tooltipClass="sp-assertion-consumer-url-tooltip icon-button"
      />

      <MetadataUrlField
        labelText={t("SPSingleLogoutURL")}
        name="spSingleLogoutUrl"
        placeholder={`${url}/sso/slo/callback`}
        tooltipContent={
          <Text fontSize="12px">{t("SPSingleLogoutURLTooltip")}</Text>
        }
        tooltipClass="sp-single-logout-url-tooltip icon-button"
      />

      <div className="button-wrapper">
        <Button
          id="download-metadata-xml"
          label={t("DownloadMetadataXML")}
          primary
          scale={isMobileView}
          size={isMobileView ? "normal" : "small"}
          tabIndex={25}
          onClick={downloadMetadata}
          isDisabled={!isSSOAvailable}
        />
      </div>
    </StyledWrapper>
  );
};

export default inject(({ ssoStore, settingsStore, currentQuotaStore }) => {
  const { downloadMetadata } = ssoStore;
  const { currentDeviceType } = settingsStore;
  const { isSSOAvailable } = currentQuotaStore;

  return {
    downloadMetadata,
    currentDeviceType,
    isSSOAvailable,
  };
})(observer(ProviderMetadata));
