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
import {
  getSettings,
  getUserByEncEmail,
  getUserFromConfirm,
} from "@/utils/actions";
import { cookies } from "next/headers";

import { LANGUAGE } from "@docspace/shared/constants";
import { getStringFromSearchParams } from "@/utils";

import { GreetingGuestContainer } from "@/components/GreetingContainer";
import { logger } from "logger.mjs";
import { TConfirmLinkParams } from "@/types";
import GuestShareLinkForm from "./page.client";

type GuestShareLinkProps = {
  searchParams: Promise<{ [key: string]: string }>;
};

async function Page(props: GuestShareLinkProps) {
  logger.info("GuestShareLink page");

  const { searchParams: sp } = props;
  const searchParams = (await sp) as TConfirmLinkParams;
  const uid = searchParams.uid ?? "";
  const encemail = searchParams.encemail ?? "";
  const confirmKey = getStringFromSearchParams(searchParams);

  const [settings, initiator, guest] = await Promise.all([
    getSettings(),
    getUserFromConfirm(uid, confirmKey),
    getUserByEncEmail(encemail, confirmKey),
  ]);

  if (
    initiator === "access-restricted" ||
    guest === "access-restricted"
  ) {
    redirect("/access-restricted");
  }

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = (await cookies()).get(LANGUAGE)?.value ?? settingsCulture;

  return (
    <>
      <GreetingGuestContainer
        displayName={initiator?.displayName}
        culture={culture}
      />
      {settings && typeof settings !== "string" ? (
        <GuestShareLinkForm
          guestDisplayName={guest?.displayName}
          guestAvatar={guest?.avatar}
        />
      ) : null}
    </>
  );
}

export default Page;
