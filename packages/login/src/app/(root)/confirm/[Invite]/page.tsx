// (c) Copyright Ascensio System SIA 2009-2024
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

import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";

import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { LANGUAGE } from "@docspace/shared/constants";

import { GreetingCreateUserContainer } from "@/components/GreetingContainer";
import { getStringFromSearchParams } from "@/utils";
import {
  getCapabilities,
  getPortalPasswordSettings,
  getSettings,
  getThirdPartyProviders,
  getUserFromConfirm,
} from "@/utils/actions";
import CreateUserForm from "./page.client";

type LinkInviteProps = {
  searchParams: { [key: string]: string };
  params: { Invite: string };
};

async function Page({ searchParams, params }: LinkInviteProps) {
  if (params.Invite !== "LinkInvite" && params.Invite !== "EmpInvite")
    return notFound();

  const type = searchParams.type;
  const uid = searchParams.uid;
  const confirmKey = getStringFromSearchParams(searchParams);

  const headersList = headers();
  const hostName = headersList.get("x-forwarded-host") ?? "";

  const [settings, user, thirdParty, capabilities, passwordSettings] =
    await Promise.all([
      getSettings(),
      getUserFromConfirm(uid, confirmKey),
      getThirdPartyProviders(),
      getCapabilities(),
      getPortalPasswordSettings(confirmKey),
    ]);

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = cookies().get(LANGUAGE)?.value ?? settingsCulture;

  return (
    <>
      {settings && typeof settings !== "string" && (
        <>
          <GreetingCreateUserContainer
            type={type}
            firstName={user?.firstName}
            lastName={user?.lastName}
            culture={culture}
            hostName={hostName}
          />
          <FormWrapper id="invite-form">
            <CreateUserForm
              userNameRegex={settings.userNameRegex}
              passwordHash={settings.passwordHash}
              firstName={user?.firstName}
              lastName={user?.lastName}
              passwordSettings={passwordSettings}
              capabilities={capabilities}
              thirdPartyProviders={thirdParty}
              legalTerms={settings.legalTerms}
              licenseUrl={settings.licenseUrl}
              isStandalone={settings.standalone}
              logoText={settings.logoText}
            />
          </FormWrapper>
        </>
      )}
    </>
  );
}

export default Page;
