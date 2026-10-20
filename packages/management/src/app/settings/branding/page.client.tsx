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

"use client";

import React, { MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { DeviceType } from "@docspace/shared/enums";
import { MobileView } from "@docspace/shared/pages/Branding/MobileView";
import type { ILogo } from "@docspace/shared/pages/Branding/WhiteLabel/WhiteLabel.types";
import type { ICompanySettings } from "@docspace/shared/pages/Branding/CompanyInfo/CompanyInfo.types";
import type { IBuildInfo } from "@docspace/shared/components/about-dialog/About.types";
import type { TAdditionalResources } from "@docspace/shared/api/settings/types";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";
import type { TPortals } from "@docspace/shared/api/management/types";

import { getIsCustomizationAvailable, getIsSettingsPaid } from "@/lib";
import useDeviceType from "@/hooks/useDeviceType";

import { BrandNamePage } from "./brand-name/page.client";
import { WhiteLabelPage } from "./white-label/page.client";
import { CompanyInfoPage } from "./company-info/page.client";
import { AdditionalResourcesPage } from "./additional-resources/page.client";

import styles from "./branding.module.scss";

const baseUrl = "/settings";

const BrandingPage = ({
  whiteLabelLogos,
  whiteLabelText,
  showAbout,
  isDefaultWhiteLabel,
  standalone,
  portals,
  quota,
  additionalResources,
  companyInfo,
  buildInfo,
  licenseAgreementsUrl,
  isEnterprise,
  logoText,
  isMobile,
}: {
  whiteLabelLogos: ILogo[];
  whiteLabelText: string;
  showAbout: boolean;
  isDefaultWhiteLabel: boolean;
  standalone: boolean;
  portals?: TPortals[];
  quota?: TPaymentQuota;
  additionalResources: TAdditionalResources;
  companyInfo: ICompanySettings;
  buildInfo: IBuildInfo;
  licenseAgreementsUrl: string;
  isEnterprise: boolean;
  logoText: string;
  isMobile?: boolean;
}) => {
  const router = useRouter();
  const { currentDeviceType } = useDeviceType();
  const isMobileView = isMobile || currentDeviceType === DeviceType.mobile;

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);
  const isSettingPaid = getIsSettingsPaid(isCustomizationAvailable, portals);

  const onClickLink = (e: MouseEvent<Element>) => {
    const target = e.target as HTMLAnchorElement;
    e.preventDefault();
    router.push(target.pathname);
  };

  if (isMobileView)
    return (
      <MobileView
        isSettingPaid={isSettingPaid}
        displayAbout={showAbout}
        displayAdditional
        baseUrl={baseUrl}
        onClickLink={onClickLink}
      />
    );
  return (
    <div className={styles.wrapper}>
      <BrandNamePage
        brandName={whiteLabelText}
        isSettingPaid={isSettingPaid}
        standalone={standalone}
        quota={quota}
      />
      <WhiteLabelPage
        whiteLabelLogos={whiteLabelLogos}
        showAbout={showAbout}
        isDefaultWhiteLabel={isDefaultWhiteLabel}
        standalone={standalone}
        portals={portals}
        quota={quota}
      />
      <hr />
      <CompanyInfoPage
        portals={portals}
        displayAbout={showAbout}
        quota={quota}
        companyInfoSettingsData={companyInfo}
        standalone={standalone}
        licenseAgreementsUrl={licenseAgreementsUrl}
        buildInfo={buildInfo}
        isEnterprise={isEnterprise}
        logoText={logoText}
      />
      <hr />
      <AdditionalResourcesPage
        portals={portals}
        quota={quota}
        additionalResourcesData={additionalResources}
      />
    </div>
  );
};

export default BrandingPage;
