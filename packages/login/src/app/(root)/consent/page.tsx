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
          user={user}
          baseUrl={config?.oauth2?.origin}
        />
      </>
    </LoginContainer>
  ) : null;
}

export default Page;
