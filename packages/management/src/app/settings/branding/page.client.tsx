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

import { StyledBrandingPage } from "./page.styled";

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
    <StyledBrandingPage>
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
    </StyledBrandingPage>
  );
};

export default BrandingPage;
