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

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { deviceDetect } from "react-device-detect";

import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";

import {
  getSettings,
  getVersionBuild,
  getQuota,
  getPortalTariff,
  getAllPortals,
  getWhiteLabelLogos,
  getWhiteLabelText,
  getWhiteLabelIsDefault,
  getAdditionalResources,
  getCompanyInfo,
} from "@/lib/actions";
import { getIsDefaultWhiteLabel } from "@/lib";

import BrandingPage from "./page.client";
import { logger } from "../../../../logger.mjs";

async function Page() {
  logger.info("Branding page");

  const [
    settings,
    buildInfo,
    quota,
    portalTariff,
    portals,
    whiteLabelLogos,
    whiteLabelText,
    whiteLabelIsDefault,
    additionalResources,
    companyInfo,
  ] = await Promise.all([
    getSettings(),
    getVersionBuild(),
    getQuota(),
    getPortalTariff(),
    getAllPortals(),
    getWhiteLabelLogos(),
    getWhiteLabelText(),
    getWhiteLabelIsDefault(),
    getAdditionalResources(),
    getCompanyInfo(),
  ]);

  if (settings === "access-restricted") {
    logger.info("Branding page access-restricted");

    const baseURL = await getBaseUrl();
    redirect(`${baseURL}/${settings}`);
  }
  if (!settings || !portalTariff) {
    logger.info(
      `Branding page settings: ${settings}, portalTariff: ${portalTariff}`,
    );

    const baseURL = await getBaseUrl();
    redirect(`${baseURL}/login`);
  }

  const { displayAbout, standalone, licenseAgreementsUrl, logoText } = settings;
  const { enterprise } = portalTariff;

  const showAbout = standalone && displayAbout;

  const isDefaultWhiteLabel = getIsDefaultWhiteLabel(whiteLabelIsDefault);

  const ua = (await headers()).get("user-agent") || "";
  const { isMobile } = deviceDetect(ua);

  return (
    <BrandingPage
      whiteLabelLogos={whiteLabelLogos}
      whiteLabelText={whiteLabelText}
      showAbout={showAbout}
      isDefaultWhiteLabel={isDefaultWhiteLabel}
      standalone={standalone}
      portals={portals?.tenants}
      quota={quota}
      additionalResources={additionalResources}
      companyInfo={companyInfo}
      buildInfo={buildInfo!}
      licenseAgreementsUrl={licenseAgreementsUrl!}
      isEnterprise={enterprise}
      logoText={logoText}
      isMobile={isMobile}
    />
  );
}

export default Page;
