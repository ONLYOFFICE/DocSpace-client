import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
//import withCultureNames from "@docspace/common/hoc/withCultureNames";
import LanguageAndTimeZone from "./Customization/language-and-time-zone";
import WelcomePageSettings from "./Customization/welcome-page-settings";
import PortalRenaming from "./Customization/portal-renaming";
import DNSSettings from "./Customization/dns-settings";
import CustomizationNavbar from "./customization-navbar";
import { Base } from "@docspace/shared/themes";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import LoaderDescriptionCustomization from "./sub-components/loaderDescriptionCustomization";
import withLoading from "SRC_DIR/HOCs/withLoading";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import { mobileMore } from "@docspace/shared/utils";

const StyledComponent = styled.div`
  width: 100%;

  .combo-button-label {
    max-width: 100%;
  }

  .category-description {
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    margin-bottom: 20px;
    max-width: 700px;
  }

  .category-item-description {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    max-width: 1024px;
  }

  .category-item-heading {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }

  .category-item-title {
    font-weight: bold;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    line-height: 22px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 4px;
          `
        : css`
            margin-right: 4px;
          `}
  }

  .settings-block {
    margin-bottom: 24px;
  }

  @media ${mobileMore} {
    .settings-block {
      max-width: 350px;
      height: auto;
    }
  }
`;

StyledComponent.defaultProps = { theme: Base };

const Customization = (props) => {
  const {
    t,
    isLoaded,
    tReady,
    setIsLoadedCustomization,
    isLoadedPage,
    viewMobile,
    isSettingPaid,
    enablePortalRename,
    resetIsInit,
  } = props;

  const isLoadedSetting = isLoaded && tReady;

  useEffect(() => {
    setDocumentTitle(t("Customization"));

    return () => {
      resetIsInit();
    };
  }, []);

  useEffect(() => {
    if (isLoadedSetting) {
      setIsLoadedCustomization(isLoadedSetting);
    }
  }, [isLoadedSetting]);

  return viewMobile ? (
    <CustomizationNavbar
      isLoadedPage={isLoadedPage}
      isSettingPaid={isSettingPaid}
    />
  ) : (
    <StyledComponent>
      {!isLoadedPage ? (
        <LoaderDescriptionCustomization />
      ) : (
        <div className="category-description">
          {t("Settings:CustomizationDescription")}
        </div>
      )}
      <LanguageAndTimeZone isMobileView={viewMobile} />
      <StyledSettingsSeparator />
      <WelcomePageSettings isMobileView={viewMobile} />
      <StyledSettingsSeparator />
      <DNSSettings isMobileView={viewMobile} />

      {enablePortalRename && (
        <>
          <StyledSettingsSeparator />
          <PortalRenaming isMobileView={viewMobile} />
        </>
      )}
    </StyledComponent>
  );
};

export default inject(({ settingsStore, common, currentQuotaStore }) => {
  const { enablePortalRename } = settingsStore;
  const { isBrandingAndCustomizationAvailable } = currentQuotaStore;
  const { isLoaded, setIsLoadedCustomization, resetIsInit } = common;

  return {
    isLoaded,
    setIsLoadedCustomization,
    isSettingPaid: isBrandingAndCustomizationAvailable,
    enablePortalRename,
    resetIsInit,
  };
})(
  withLoading(withTranslation(["Settings", "Common"])(observer(Customization)))
);
