import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

import { mobile, size } from "@docspace/components/utils/device";

import MetadataUrlField from "./sub-components/MetadataUrlField";
import { useIsMobileView } from "../../../utils/useIsMobileView";

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
  const isMobileView = useIsMobileView();
  const navigate = useNavigate();
  const location = useLocation();

  const { downloadMetadata } = props;

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
        />
      </div>
    </StyledWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const { downloadMetadata } = ssoStore;

  return {
    downloadMetadata,
  };
})(observer(ProviderMetadata));
