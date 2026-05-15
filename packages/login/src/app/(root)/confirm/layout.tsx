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

import { headers } from "next/headers";

import ConfirmRoute from "@/components/ConfirmRoute";
import type { TConfirmLinkParams } from "@/types";
import { checkConfirmLink, getSettings, getUser } from "@/utils/actions";
import { ValidationResult } from "@/utils/enums";
import { redirect } from "next/navigation";
import { logger } from "logger.mjs";
import styles from "./confirm.module.scss";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.info("Confirm layout");

  const hdrs = await headers();
  const searchParams = hdrs.get("x-confirm-query") ?? "";
  const type = hdrs.get("x-confirm-type") ?? "";
  const hostName =
    hdrs.get("x-forwarded-host-test") ?? hdrs.get("x-forwarded-host") ?? "";
  const proto = hdrs.get("x-forwarded-proto");

  const queryParams = Object.fromEntries(
    new URLSearchParams(searchParams.toString()),
  ) as TConfirmLinkParams;

  const confirmLinkParams: TConfirmLinkParams = {
    type,
    ...queryParams,
  };

  const [settings, confirmLinkResult] = await Promise.all([
    getSettings(),
    checkConfirmLink(confirmLinkParams),
  ]);

  const user = type === "GuestShareLink" ? await getUser() : undefined;

  const isUserExisted =
    confirmLinkResult?.result == ValidationResult.UserExisted;
  const isUserExcluded =
    confirmLinkResult?.result == ValidationResult.UserExcluded;
  const objectSettings = typeof settings === "string" ? undefined : settings;

  if (isUserExisted) {
    const path = confirmLinkResult.isAgent
      ? `ai-agents/${confirmLinkResult?.roomId}/chat`
      : `rooms/shared/${confirmLinkResult?.roomId}/filter`;

    const finalUrl = confirmLinkResult?.roomId
      ? `${proto}://${hostName}/${path}?folder=${confirmLinkResult?.roomId}`
      : "/";

    logger.info("Confirm layout UserExisted");

    redirect(finalUrl ?? "/");
  }

  if (isUserExcluded) {
    logger.info("Confirm layout UserExcluded");

    redirect("/");
  }

  return (
    <div id="confirm-body" className={styles.confirmBody}>
      <ConfirmRoute
        socketUrl={objectSettings?.socketUrl}
        confirmLinkResult={confirmLinkResult}
        confirmLinkParams={confirmLinkParams}
        user={user}
      >
        {children}
      </ConfirmRoute>
    </div>
  );
}
