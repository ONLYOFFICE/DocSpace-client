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

import { notFound, redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { LANGUAGE } from "@docspace/shared/constants";
import { EmployeeType } from "@docspace/shared/enums";

import { GreetingCreateUserContainer } from "@/components/GreetingContainer";
import { getStringFromSearchParams } from "@/utils";
import {
  getCapabilities,
  getPortalPasswordSettings,
  getSettings,
  getThirdPartyProviders,
  getUserFromConfirm,
  getInvitationSettings,
  getUserByEncEmail,
} from "@/utils/actions";
import { logger } from "logger.mjs";
import { TConfirmLinkParams } from "@/types";
import CreateUserForm from "./page.client";

type LinkInviteProps = {
  searchParams: Promise<{ [key: string]: string }>;
  params: Promise<{ Invite: string }>;
};

async function Page(props: LinkInviteProps) {
  logger.info("Invite page");
  const { searchParams: sp, params: p } = props;
  const searchParams = (await sp) as TConfirmLinkParams;
  const params = await p;
  if (params.Invite !== "LinkInvite" && params.Invite !== "EmpInvite") {
    logger.info(`Invite page notFound params.Invite: ${params.Invite}`);
    return notFound();
  }

  const type = searchParams.type ?? "";
  const uid = searchParams.uid;
  const emplType = searchParams.emplType ?? "";
  const encemail = searchParams.encemail ?? "";
  const confirmKey = getStringFromSearchParams(searchParams);

  const headersList = await headers();
  const hostName =
    headersList.get("x-forwarded-host-test") ??
    headersList.get("x-forwarded-host") ??
    "";

  const [
    user,
    settings,
    thirdParty,
    capabilities,
    passwordSettings,
    invitationSettings,
  ] = await Promise.all([
    uid
      ? getUserFromConfirm(uid, confirmKey)
      : getUserByEncEmail(encemail, confirmKey),
    getSettings(),
    getThirdPartyProviders(true),
    getCapabilities(),
    getPortalPasswordSettings(confirmKey),
    getInvitationSettings(),
  ]);

  if (
    user === "access-restricted" ||
    passwordSettings === "access-restricted" ||
    invitationSettings === "access-restricted"
  ) {
    redirect("/access-restricted");
  }

  if (
    !invitationSettings?.allowInvitingGuests &&
    emplType === String(EmployeeType.Guest)
  ) {
    redirect("/");
  }

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = (await cookies()).get(LANGUAGE)?.value ?? settingsCulture;

  return settings && typeof settings !== "string" ? (
    <>
      <GreetingCreateUserContainer
        type={type}
        displayName={user?.displayName}
        culture={culture}
        hostName={hostName}
      />
      <FormWrapper id="invite-form">
        <CreateUserForm
          userNameRegex={settings.userNameRegex}
          passwordHash={settings.passwordHash}
          displayName={user?.displayName}
          passwordSettings={passwordSettings}
          capabilities={capabilities}
          thirdPartyProviders={thirdParty}
          legalTerms={settings.externalResources?.common?.entries?.legalterms}
          licenseUrl={settings.externalResources?.common?.entries?.license}
          isStandalone={settings.standalone}
          logoText={settings.logoText}
          invitationSettings={invitationSettings}
          hostName={hostName}
        />
      </FormWrapper>
    </>
  ) : null;
}

export default Page;
