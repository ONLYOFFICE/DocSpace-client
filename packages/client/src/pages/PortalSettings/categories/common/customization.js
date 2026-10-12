/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import styles from "./customization.module.scss";
import { LanguageAndTimeZoneSettings } from "./Customization/language-and-time-zone";
import { WelcomePageSettings } from "./Customization/welcome-page-settings";
import { PortalRenaming } from "./Customization/portal-renaming";
import { DNSSettings } from "./Customization/dns-settings";
import { ConfigureDeepLink } from "./Customization/configure-deep-link";
import { AdManagement } from "./Customization/ad-management";
import { AiServicesManagement } from "./Customization/ai-services-management";
import CustomizationNavbar from "./customization-navbar";
import LoaderDescriptionCustomization from "./sub-components/loaderDescriptionCustomization";

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
    <div className={styles.customization}>
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
      <StyledSettingsSeparator />
      <AiServicesManagement />
    </div>
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
