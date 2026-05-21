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
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { isManagement } from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";
import { MobileView } from "@docspace/shared/pages/Branding/MobileView";

import withLoading from "SRC_DIR/HOCs/withLoading";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import { WhiteLabel } from "./Branding/whitelabel";
import { BrandName } from "./Branding/brandName";
import { CompanyInfoSettings } from "./Branding/companyInfoSettings";
import { AdditionalResources } from "./Branding/additionalResources";

import LoaderBrandingSubtitle from "./sub-components/loaderBrandingSubtitle";
import styles from "./branding.module.scss";

const baseUrl = "/portal-settings/customization";

const Branding = ({
  t,
  isWhiteLabelLoaded,
  isBrandNameLoaded,
  isSettingPaid,
  standalone,
  deviceType,
  portals,
  displayAbout,
}) => {
  const navigate = useNavigate();
  const isMobileView = deviceType === DeviceType.mobile;

  useEffect(() => {
    setDocumentTitle(t("Common:Branding"));
  }, []);

  const hideBlock = isManagement() ? false : portals?.length > 1;

  const showSettings = standalone && !hideBlock;

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  if (isMobileView) {
    const mobileViewDisplayAbout = showSettings && displayAbout;

    return (
      <MobileView
        isSettingPaid={isSettingPaid || standalone}
        displayAbout={mobileViewDisplayAbout}
        displayAdditional={showSettings}
        baseUrl={baseUrl}
        onClickLink={onClickLink}
      />
    );
  }

  return (
    <div
      className={classNames(styles.branding, {
        isEnableBranding: isSettingPaid,
        settings_unavailable: !isSettingPaid,
      })}
    >
      {!isWhiteLabelLoaded && !isBrandNameLoaded ? (
        <LoaderBrandingSubtitle />
      ) : (
        <div className="category-description">
          {t("Common:BrandingSubtitle")}
        </div>
      )}
      <BrandName />
      <hr />
      <WhiteLabel />
      {showSettings ? (
        <>
          <hr />
          <CompanyInfoSettings />
          <hr />
          <AdditionalResources />
        </>
      ) : null}
    </div>
  );
};

export default inject(({ settingsStore, currentQuotaStore, brandingStore }) => {
  const { isCustomizationAvailable } = currentQuotaStore;
  const { isWhiteLabelLoaded, isBrandNameLoaded } = brandingStore;
  const {
    standalone,
    portals,
    deviceType,
    checkEnablePortalSettings,
    displayAbout,
  } = settingsStore;
  const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

  return {
    isWhiteLabelLoaded,
    isBrandNameLoaded,
    isSettingPaid,
    standalone,
    portals,
    deviceType,
    displayAbout,
  };
})(withLoading(withTranslation(["Settings", "Common"])(observer(Branding))));
