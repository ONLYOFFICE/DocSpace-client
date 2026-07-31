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

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { LANGUAGE } from "@docspace/shared/constants";

import {
  getConfig,
  getOAuthClient,
  getOauthJWTToken,
  getScopeList,
  getSettings,
  getUser,
} from "@/utils/actions";
import { GreetingLoginContainer } from "@/components/GreetingContainer";
import { LoginContainer } from "@/components/LoginContainer";

import { logger } from "logger.mjs";
import Consent from "./page.client";

async function Page(props: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  logger.info("Consent page");

  const { searchParams: sp } = props;
  const searchParams = await sp;
  const clientId = searchParams.clientId ?? searchParams.client_id;

  const [user, settings, config] = await Promise.all([
    getUser(),
    getSettings(),
    getConfig(),
  ]);

  const cookieStore = await cookies();

  const token = cookieStore.get(`x-signature-${user!.id}`)?.value;
  let new_token = "";

  if (!token) {
    logger.info("Consent page missing token");
    new_token = await getOauthJWTToken();
  }

  const [data, scopes] = await Promise.all([
    getOAuthClient(clientId),
    getScopeList(new_token),
  ]);

  const client = data?.client as IClientProps;

  if (!client || (client && !("clientId" in client)) || !scopes || !user)
    return "";

  const isRegisterContainerVisible =
    typeof settings === "string" ? undefined : settings?.enabledJoin;

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = cookieStore.get(LANGUAGE)?.value ?? settingsCulture;

  const currentScopes = cookieStore.get("x-scopes")?.value?.split(";");

  return settings && typeof settings !== "string" ? (
    <LoginContainer isRegisterContainerVisible={isRegisterContainerVisible}>
      <>
        <GreetingLoginContainer
          greetingSettings={settings?.greetingSettings}
          culture={culture}
        />
        <Consent
          client={client}
          scopes={scopes}
          currentScopesProp={
            currentScopes?.length ? currentScopes : client.scopes
          }
          user={user}
          baseUrl={config?.oauth2?.origin}
        />
      </>
    </LoginContainer>
  ) : null;
}

export default Page;
