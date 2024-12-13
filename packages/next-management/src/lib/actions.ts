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

"use server";

import { headers } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import { TUser } from "@docspace/shared/api/people/types";
import { TSettings, TGetColorTheme } from "@docspace/shared/api/settings/types";
import { TGetAllPortals } from "@docspace/shared/api/management/types";

export async function getUser() {
  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getUser] = createRequest([`/people/@self`], [["", ""]], "GET");

  if (!cookie?.includes("asc_auth_key")) return undefined;
  const userRes = await fetch(getUser);

  if (userRes.status === 401) return undefined;

  if (!userRes.ok) return;

  const user = await userRes.json();

  return user.response as TUser;
}

export async function getSettings(share?: string) {
  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getSettings] = createRequest(
    [
      `/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
    ],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
  );

  const settingsRes = await fetch(getSettings);

  if (settingsRes.status === 403) return `access-restricted`;

  if (!settingsRes.ok) return;

  const settings = await settingsRes.json();

  return settings.response as TSettings;
}

export async function getAllPortals() {
  const [getAllPortals] = createRequest(
    [`/portal/get?statistics=true`],
    [["", ""]],
    "GET",
    undefined,
    true,
  );

  const portalsRes = await fetch(getAllPortals);

  if (!portalsRes.ok) return;

  const portals = await portalsRes.json();

  return portals as TGetAllPortals;
}

export async function getColorTheme() {
  const [getSettings] = createRequest(
    [`/settings/colortheme`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getSettings);

  if (!res.ok) return;

  const colorTheme = await res.json();

  return colorTheme.response as TGetColorTheme;
}

export async function getWhiteLabelLogos() {
  const [getWhiteLabelLogos] = createRequest(
    [`/settings/whitelabel/logos?isDefault=true`],
    [["", ""]],
    "GET",
  );

  const logosRes = await fetch(getWhiteLabelLogos);

  if (!logosRes.ok) return;

  const logos = await logosRes.json();

  return logos.response;
}

export async function getWhiteLabelText() {
  const [getWhiteLabelText] = createRequest(
    [`/settings/whitelabel/logotext?isDefault=true`],
    [["", ""]],
    "GET",
  );

  const textRes = await fetch(getWhiteLabelText);

  if (!textRes.ok) return;

  const text = await textRes.json();

  return text.response;
}

export async function getWhiteLabelIsDefault() {
  const [getWhiteLabelIsDefault] = createRequest(
    [`/settings/whitelabel/logos/isdefault?isDefault=true`],
    [["", ""]],
    "GET",
  );

  const isDefaultRes = await fetch(getWhiteLabelIsDefault);

  if (!isDefaultRes.ok) return;

  const isDefault = await isDefaultRes.json();

  return isDefault.response;
}

