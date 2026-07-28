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
  getLicenseQuota,
  getSettingsFiles,
} from "@/lib/actions";

import PaymentsPage from "./page.client";
import { logger } from "../../../logger.mjs";
import { TariffState } from "@docspace/shared/enums";
import { getDaysRemaining } from "@docspace/shared/utils/common";

async function Page() {
  logger.info("Payments page");

  const [
    settings,
    quota,
    portalTariff,
    paymentSettings,
    licenseQuota,
    filesSettings,
  ] = await Promise.all([
    getSettings(),
    getQuota(),
    getPortalTariff(),
    getPaymentSettings(),
    getLicenseQuota(),
    getSettingsFiles(),
  ]);

  if (settings === "access-restricted") {
    logger.info("Payments page access-restricted");

    const baseURL = await getBaseUrl();
    redirect(`${baseURL}/${settings}`);
  }
  if (
    !settings ||
    !quota ||
    !portalTariff ||
    !paymentSettings ||
    !licenseQuota ||
    !filesSettings
  ) {
    logger.info(
      `Payments page settings: ${settings}, quota: ${quota}, portalTariff: ${portalTariff}, paymentSettings: ${paymentSettings}, licenseQuota: ${licenseQuota}, filesSettings: ${filesSettings}`,
    );

    const baseURL = await getBaseUrl();
    redirect(`${baseURL}/login`);
  }

  const { logoText, externalResources } = settings;
  const { helpcenter, support } = externalResources;

  const docspaceFaqUrl = helpcenter.domain + helpcenter.entries.docspacefaq;
  const feedbackAndSupportUrl = support.domain;

  const { trial, features } = quota;
  const { enterprise, developer, dueDate, openSource, state, delayDueDate } =
    portalTariff;
  const { salesEmail, buyUrl } = paymentSettings;
  const isLifetimeLicense =
    features.find((f) => f.id === "lifetime")?.value === true;

  if (openSource) {
    const baseURL = await getBaseUrl();

    logger.info(`Payments page redirect${baseURL}/error/403`);
    return redirect(`${baseURL}/error/403`);
  }

  return (
    <PaymentsPage
      isTrial={trial}
      salesEmail={salesEmail}
      isDeveloper={developer}
      buyUrl={buyUrl}
      dueDate={dueDate}
      isEnterprise={enterprise}
      logoText={logoText}
      docspaceFaqUrl={docspaceFaqUrl}
      licenseQuota={licenseQuota}
      filesSettings={filesSettings}
      isLifetimeLicense={isLifetimeLicense}
      isGracePeriod={state === TariffState.Delay}
      isNotPaidPeriod={state === TariffState.NotPaid}
      gracePeriodEndDate={delayDueDate}
      delayDaysCount={getDaysRemaining(delayDueDate)}
      feedbackAndSupportUrl={feedbackAndSupportUrl}
    />
  );
}

export default Page;
