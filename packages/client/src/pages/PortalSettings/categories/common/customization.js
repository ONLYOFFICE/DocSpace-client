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

import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
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
  withLoading(withTranslation(["Settings", "Common"])(observer(Customization))),
);
