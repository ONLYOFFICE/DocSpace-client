// (c) Copyright Ascensio System SIA 2009-2026
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
