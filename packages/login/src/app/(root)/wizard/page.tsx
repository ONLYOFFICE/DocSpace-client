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
import { cookies } from "next/headers";

import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";

import {
  getMachineName,
  getPortalPasswordSettings,
  getIsLicenseRequired,
  getSettings,
  getPortalTimeZones,
  getPortalCultures,
} from "@/utils/actions";

import WizardGreeting from "@/components/WizardGreeting/index.client";
import { LoginContainer } from "@/components/LoginContainer";

import { getUserTimezone } from "@docspace/shared/utils/common";
import { LANGUAGE, TIMEZONE } from "@docspace/shared/constants";
import { logger } from "logger.mjs";
import WizardForm from "./page.client";

async function Page() {
  logger.info("Wizard page");

  const settings = await getSettings();

  const objectSettings = typeof settings === "string" ? undefined : settings;

  if (!objectSettings || !objectSettings.wizardToken) {
    redirect("/");
  }

  const [
    passwordSettings,
    machineName,
    isRequiredLicense,
    portalTimeZones,
    portalCultures,
  ] = await Promise.all([
    getPortalPasswordSettings(objectSettings?.wizardToken),
    getMachineName(objectSettings?.wizardToken),
    getIsLicenseRequired(),
    getPortalTimeZones(objectSettings?.wizardToken),
    getPortalCultures(),
  ]);

  if (passwordSettings === "access-restricted") redirect("/access-restricted");

  const commonResources = objectSettings?.externalResources?.common?.entries;
  const forumLinkUrl = objectSettings?.externalResources?.forum?.domain;

  const cookieStore = await cookies();
  const timezoneCookie = cookieStore.get(TIMEZONE);
  const userTimezone = timezoneCookie
    ? timezoneCookie.value
    : getUserTimezone();

  const culture = cookieStore.get(LANGUAGE)?.value ?? objectSettings?.culture;

  return (
    <LoginContainer>
      <>
        <WizardGreeting culture={culture} />
        <FormWrapper id="wizard-form">
          <WizardForm
            passwordSettings={passwordSettings}
            machineName={machineName}
            isRequiredLicense={isRequiredLicense}
            portalCultures={portalCultures}
            portalTimeZones={portalTimeZones}
            licenseUrl={commonResources.license}
            forumLinkUrl={forumLinkUrl}
            wizardToken={objectSettings?.wizardToken}
            passwordHash={objectSettings?.passwordHash}
            documentationEmail={commonResources.documentationemail}
            isAmi={objectSettings?.isAmi}
            userTimeZone={userTimezone}
          />
        </FormWrapper>
      </>
    </LoginContainer>
  );
}

export default Page;
