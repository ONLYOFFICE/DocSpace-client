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
import { redirect } from "next/navigation";

import { getSelf } from "@/api/people";
import {
  AGENT_ID_HEADER,
  FILTER_HEADER,
  PATHNAME_HEADER,
} from "@/utils/constants";

export const dynamic = "force-dynamic";

export default async function ChatServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();

  const agentId = hdrs.get(AGENT_ID_HEADER) || "";

  const filterHeader = hdrs.get(FILTER_HEADER) || "";
  const filterParams = new URLSearchParams(filterHeader);
  const providerName = filterParams.get("providerName") || "";
  const inviteKey = filterParams.get("inviteKey") || "";
  const emplType = filterParams.get("emplType") || "";
  const uid = filterParams.get("uid") || "";

  const user = await getSelf();

  if (!user && providerName) {
    const proto = hdrs.get("x-forwarded-proto") || "https";
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
    const pathname = hdrs.get(PATHNAME_HEADER) ?? "/chat";

    const returnParams = new URLSearchParams();

    if (agentId) returnParams.set("agentId", agentId);

    const fileId = filterParams.get("fileId");
    if (fileId) returnParams.set("fileId", fileId);

    const chatId = filterParams.get("chatId");
    if (chatId) returnParams.set("chatId", chatId);

    const returnQs = returnParams.toString();
    const successRedirectURL = `${proto}://${host}/sdk${pathname}${returnQs ? `?${returnQs}` : ""}`;

    const authParams = new URLSearchParams();
    authParams.set("providerName", providerName);
    if (inviteKey) authParams.set("inviteKey", inviteKey);
    if (emplType) authParams.set("emplType", emplType);
    if (uid) authParams.set("uid", uid);
    authParams.set("successRedirectURL", successRedirectURL);

    redirect(`/auth?${authParams.toString()}`);
  }

  return children;
}
