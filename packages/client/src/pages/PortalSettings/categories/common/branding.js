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
