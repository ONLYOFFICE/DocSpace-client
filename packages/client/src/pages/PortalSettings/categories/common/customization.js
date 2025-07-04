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

import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import { injectDefaultTheme, mobileMore } from "@docspace/shared/utils";
import { LanguageAndTimeZoneSettings } from "./Customization/language-and-time-zone";
import { WelcomePageSettings } from "./Customization/welcome-page-settings";
import { PortalRenaming } from "./Customization/portal-renaming";
import { DNSSettings } from "./Customization/dns-settings";
import { ConfigureDeepLink } from "./Customization/configure-deep-link";
import { AdManagement } from "./Customization/ad-management";
import CustomizationNavbar from "./customization-navbar";
import LoaderDescriptionCustomization from "./sub-components/loaderDescriptionCustomization";

const StyledComponent = styled.div.attrs(injectDefaultTheme)`
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
    font-size: 12px;
    max-width: 1024px;
  }

  .category-item-heading {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }

  .category-item-title {
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    margin-inline-end: 4px;
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
    isEnterprise,
  } = props;

  const isLoadedSetting = isLoaded && tReady;

  useEffect(() => {
    setDocumentTitle(t("Settings:Customization"));

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
      <LanguageAndTimeZoneSettings isMobileView={viewMobile} />
      <StyledSettingsSeparator />
      <WelcomePageSettings isMobileView={viewMobile} />
      <StyledSettingsSeparator />
      <DNSSettings isMobileView={viewMobile} />

      {enablePortalRename ? (
        <>
          <StyledSettingsSeparator />
          <PortalRenaming isMobileView={viewMobile} />
        </>
      ) : null}
      <StyledSettingsSeparator />
      <ConfigureDeepLink />
      {isEnterprise ? (
        <>
          <StyledSettingsSeparator />
          <AdManagement />
        </>
      ) : null}
    </StyledComponent>
  );
};

export default inject(
  ({ settingsStore, common, currentQuotaStore, currentTariffStatusStore }) => {
    const { enablePortalRename } = settingsStore;
    const { isCustomizationAvailable } = currentQuotaStore;
    const { isLoaded, setIsLoadedCustomization, resetIsInit } = common;
    const { isEnterprise } = currentTariffStatusStore;

    return {
      isLoaded,
      setIsLoadedCustomization,
      isSettingPaid: isCustomizationAvailable,
      enablePortalRename,
      resetIsInit,
      isEnterprise,
    };
  },
)(
  withLoading(withTranslation(["Settings", "Common"])(observer(Customization))),
);
