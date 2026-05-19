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
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";

import {
  getSettings,
  getQuota,
  getPortalTariff,
  getPaymentSettings,
} from "@/lib/actions";

import BonusPage from "./page.client";
import { logger } from "../../../logger.mjs";

async function Page() {
  logger.info("Bonus page");

  const [settings, quota, portalTariff, paymentSettings] = await Promise.all([
    getSettings(),
    getQuota(),
    getPortalTariff(),
    getPaymentSettings(),
  ]);

  const baseURL = await getBaseUrl();

  if (settings === "access-restricted") {
    logger.info("Bonus page access-restricted");

    redirect(`${baseURL}/${settings}`);
  }
  if (!settings || !quota || !portalTariff || !paymentSettings) {
    logger.info(
      `Bonus page settings: ${settings}, quota: ${quota}, portalTariff: ${portalTariff}, paymentSettings: ${paymentSettings}`,
    );

    redirect(`${baseURL}/login`);
  }

  const { logoText, externalResources } = settings;
  const { site, helpcenter, support } = externalResources;
  const forEnterprisesUrl = site.domain + site.entries.forenterprises;
  const enterpriseInstallScriptUrl =
    helpcenter.domain + helpcenter.entries.enterpriseinstallscript;
  const enterpriseInstallWindowsUrl =
    helpcenter.domain + helpcenter.entries.enterpriseinstallwindows;
  const feedbackAndSupportUrl = support.domain;
  const demoOrderUrl = site.domain + site.entries.demoorder;

  const { trial } = quota;
  const { enterprise, developer, openSource } = portalTariff;
  const { salesEmail } = paymentSettings;

  const dataBackupUrl = `${helpcenter.domain}/administration/docspace-settings.aspx#CreatingBackup_block`;

  if (!openSource) {
    logger.info(`Bonus page redirect${baseURL}/error/403`);
    return redirect(`${baseURL}/error/403`);
  }

  return (
    <BonusPage
      isEnterprise={enterprise}
      isTrial={trial}
      isDeveloper={developer}
      isCommunity={openSource}
      feedbackAndSupportUrl={feedbackAndSupportUrl}
      salesEmail={salesEmail}
      dataBackupUrl={dataBackupUrl}
      logoText={logoText}
      enterpriseInstallScriptUrl={enterpriseInstallScriptUrl}
      enterpriseInstallWindowsUrl={enterpriseInstallWindowsUrl}
      forEnterprisesUrl={forEnterprisesUrl}
      demoOrderUrl={demoOrderUrl}
    />
  );
}

export default Page;
