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

import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  setCompanyInfoSettings,
  restoreCompanyInfoSettings,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveNavigation";
import { CompanyInfo } from "@docspace/shared/pages/Branding/CompanyInfo";

import withLoading from "SRC_DIR/HOCs/withLoading";
import LoaderCompanyInfoSettings from "../sub-components/loaderCompanyInfoSettings";
import { brandingRedirectUrl } from "./constants";

const CompanyInfoSettingsComponent = (props) => {
  const {
    t,
    isSettingPaid,
    isBrandingAvailable,
    displayAbout,
    companyInfoSettingsIsDefault,
    companyInfoSettingsData,
    tReady,
    setIsLoadedCompanyInfoSettingsData,
    isLoadedCompanyInfoSettingsData,
    buildVersionInfo,
    deviceType,
    getCompanyInfoSettings,
    standalone,
    licenseAgreementsUrl,
    isEnterprise,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "company-info",
    deviceType,
  });

  useEffect(() => {
    if (!(companyInfoSettingsData && tReady)) return;

    setIsLoadedCompanyInfoSettingsData(true);
  }, [companyInfoSettingsData, tReady]);

  const onSave = useCallback(
    async (address, companyName, email, phone, site, hideAbout) => {
      setIsLoading(true);

      try {
        await setCompanyInfoSettings(
          address,
          companyName,
          email,
          phone,
          site,
          hideAbout,
        );
        await getCompanyInfoSettings();
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading],
  );

  const onRestore = useCallback(async () => {
    setIsLoading(true);

    try {
      await restoreCompanyInfoSettings();
      await getCompanyInfoSettings();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  if (!isLoadedCompanyInfoSettingsData) return <LoaderCompanyInfoSettings />;

  return (
    <CompanyInfo
      t={t}
      isSettingPaid={isSettingPaid}
      companySettings={companyInfoSettingsData}
      onSave={onSave}
      onRestore={onRestore}
      isLoading={isLoading}
      companyInfoSettingsIsDefault={companyInfoSettingsIsDefault}
      buildVersionInfo={buildVersionInfo}
      standalone={standalone}
      licenseAgreementsUrl={licenseAgreementsUrl}
      isBrandingAvailable={isBrandingAvailable}
      displayAbout={displayAbout}
      isEnterprise={isEnterprise}
    />
  );
};

export const CompanyInfoSettings = inject(
  ({
    settingsStore,
    brandingStore,
    currentQuotaStore,
    currentTariffStatusStore,
  }) => {
    const {
      setIsLoadedCompanyInfoSettingsData,
      isLoadedCompanyInfoSettingsData,
    } = brandingStore;

    const {
      companyInfoSettingsIsDefault,
      companyInfoSettingsData,
      buildVersionInfo,
      checkEnablePortalSettings,
      deviceType,
      getCompanyInfoSettings,
      displayAbout,
      standalone,
      licenseAgreementsUrl,
    } = settingsStore;

    const { isCustomizationAvailable, isBrandingAvailable } = currentQuotaStore;

    const { isEnterprise } = currentTariffStatusStore;

    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

    return {
      companyInfoSettingsIsDefault,
      companyInfoSettingsData,
      setIsLoadedCompanyInfoSettingsData,
      isLoadedCompanyInfoSettingsData,
      buildVersionInfo,
      isSettingPaid,
      isBrandingAvailable,
      deviceType,
      displayAbout,
      getCompanyInfoSettings,
      standalone,
      licenseAgreementsUrl,
      isEnterprise,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(CompanyInfoSettingsComponent),
    ),
  ),
);
