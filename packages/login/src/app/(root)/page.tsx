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

import { LANGUAGE, PROVIDERS_DATA } from "@docspace/shared/constants";

import {
  getOAuthClient,
  getCapabilities,
  getSettings,
  getSSO,
  getThirdPartyProviders,
} from "@/utils/actions";
import Login from "@/components/Login";
import LoginForm from "@/components/LoginForm";
import ThirdParty from "@/components/ThirdParty";
import RecoverAccess from "@/components/RecoverAccess";
import Register from "@/components/Register";
import { GreetingLoginContainer } from "@/components/GreetingContainer";
import { LoginContainer } from "@/components/LoginContainer";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function Page(props: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { searchParams: sp } = props;
  const searchParams = await sp;
  const clientId = searchParams.client_id;

  const [settings, thirdParty, capabilities, ssoSettings, oauthData] =
    await Promise.all([
      getSettings(),
      getThirdPartyProviders(),
      getCapabilities(),
      getSSO(),
      clientId ? getOAuthClient(clientId) : undefined,
    ]);

  const ssoUrl = capabilities ? capabilities.ssoUrl : "";
  const hideAuthPage = ssoSettings ? ssoSettings.hideAuthPage : false;
  const ssoExists = !!ssoUrl;
  const oauthDataExists =
    !capabilities?.oauthEnabled || !thirdParty || thirdParty.length === 0
      ? false
      : thirdParty
          .map((item) => {
            if (!(item.provider in PROVIDERS_DATA)) return undefined;

            return item;
          })
          .some((item) => !!item);

  const isRegisterContainerVisible =
    typeof settings === "string" ? undefined : settings?.enabledJoin;

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = (await cookies()).get(LANGUAGE)?.value ?? settingsCulture;

  if (ssoUrl && hideAuthPage && !searchParams?.skipssoredirect) {
    redirect(ssoUrl);
  }

  return settings && typeof settings !== "string" ? (
    <LoginContainer isRegisterContainerVisible={isRegisterContainerVisible}>
      <GreetingLoginContainer
        greetingSettings={settings.greetingSettings}
        culture={culture}
      />

      <FormWrapper id="login-form">
        <Login>
          <LoginForm
            hashSettings={settings?.passwordHash}
            cookieSettingsEnabled={settings?.cookieSettingsEnabled}
            clientId={clientId}
            client={oauthData?.client}
            reCaptchaPublicKey={settings?.recaptchaPublicKey}
            reCaptchaType={settings?.recaptchaType}
            ldapDomain={capabilities?.ldapDomain}
            ldapEnabled={capabilities?.ldapEnabled || false}
            baseDomain={settings?.baseDomain}
          />

          <ThirdParty
            thirdParty={thirdParty}
            capabilities={capabilities}
            ssoExists={ssoExists}
            oauthDataExists={oauthDataExists}
            isOauth={!!clientId}
          />

          {settings.enableAdmMess ? (
            <RecoverAccess
              reCaptchaPublicKey={settings?.recaptchaPublicKey}
              reCaptchaType={settings?.recaptchaType}
            />
          ) : null}
          {settings.enabledJoin ? (
            <Register
              id="login_register"
              enabledJoin
              trustedDomains={settings.trustedDomains}
              trustedDomainsType={settings.trustedDomainsType}
              isAuthenticated={false}
            />
          ) : null}
        </Login>
      </FormWrapper>
    </LoginContainer>
  ) : null;
}

export default Page;
