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

"use client";

import React, { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";

import {
  setCompanyInfoSettings,
  restoreCompanyInfoSettings,
  getCompanyInfoSettings,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";
import { CompanyInfo } from "@docspace/shared/pages/Branding/CompanyInfo";

import useDeviceType from "@/hooks/useDeviceType";
import { getIsCustomizationAvailable, getIsSettingsPaid } from "@/lib";

export const CompanyInfoPage = ({
  portals,
  quota,
  companyInfoSettingsData,
  standalone,
  licenseUrl,
  buildInfo,
  isEnterprise,
}) => {
  const { t } = useTranslation("Common");
  const { currentDeviceType } = useDeviceType();
  const router = useRouter();
  const pathname = usePathname();

  const [companyData, setCompanyData] = useState(companyInfoSettingsData);
  const [isLoading, startTransition] = useTransition();

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);
  const isSettingPaid = getIsSettingsPaid(portals, isCustomizationAvailable);

  useResponsiveNavigation({
    redirectUrl: "/settings/branding",
    currentLocation: "company-info",
    deviceType: currentDeviceType,
    router: router,
    pathname: pathname,
  });

  const onSave = async (
    address: string,
    companyName: string,
    email: string,
    phone: string,
    site: string,
  ) => {
    startTransition(async () => {
      try {
        await setCompanyInfoSettings(address, companyName, email, phone, site);
        const companyData = await getCompanyInfoSettings();
        setCompanyData(companyData);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    });
  };

  const onRestore = async () => {
    startTransition(async () => {
      try {
        await restoreCompanyInfoSettings();
        const companyData = await getCompanyInfoSettings();
        setCompanyData(companyData);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    });
  };

  return (
    <CompanyInfo
      isSettingPaid={isSettingPaid}
      companySettings={companyData}
      onSave={onSave}
      onRestore={onRestore}
      isLoading={isLoading}
      companyInfoSettingsIsDefault={companyData.isDefault}
      standalone={standalone}
      licenseUrl={licenseUrl}
      buildVersionInfo={buildInfo}
      isEnterprise={isEnterprise}
    />
  );
};

