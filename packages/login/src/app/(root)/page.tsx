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
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
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
      <>
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
            {!clientId ? (
              <ThirdParty
                thirdParty={thirdParty}
                capabilities={capabilities}
                ssoExists={ssoExists}
                oauthDataExists={oauthDataExists}
              />
            ) : null}
            {settings.enableAdmMess ? <RecoverAccess /> : null}
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
      </>
    </LoginContainer>
  ) : null;
}

export default Page;
