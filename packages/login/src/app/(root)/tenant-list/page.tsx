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

import { cookies } from "next/headers";

import { LANGUAGE } from "@docspace/shared/constants";

import { GreetingLoginContainer } from "@/components/GreetingContainer";
import { LoginContainer } from "@/components/LoginContainer";
import { getSettings } from "@/utils/actions";

import { logger } from "logger.mjs";
import TenantList from "./page.client";

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  logger.info("Tenant list page");

  const { searchParams: sp } = props;
  const searchParams = await sp;

  const settings = await getSettings();

  // const { portals } = JSON.parse(searchParams.portals);
  const clientId = searchParams.clientId;

  const isRegisterContainerVisible =
    typeof settings === "string" ? undefined : settings?.enabledJoin;

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = (await cookies()).get(LANGUAGE)?.value ?? settingsCulture;
  return settings && typeof settings !== "string" ? (
    <LoginContainer isRegisterContainerVisible={isRegisterContainerVisible}>
      <>
        <GreetingLoginContainer
          greetingSettings={settings?.greetingSettings}
          culture={culture}
        />
        <TenantList clientId={clientId} baseDomain={settings.baseDomain} />
      </>
    </LoginContainer>
  ) : null;
}
