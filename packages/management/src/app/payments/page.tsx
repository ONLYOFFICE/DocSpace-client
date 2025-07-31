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
  const { helpcenter } = externalResources;

  const docspaceFaqUrl = helpcenter.domain + helpcenter.entries.docspacefaq;

  const { trial } = quota;
  const { enterprise, developer, dueDate, openSource } = portalTariff;
  const { salesEmail, buyUrl } = paymentSettings;

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
    />
  );
}

export default Page;
