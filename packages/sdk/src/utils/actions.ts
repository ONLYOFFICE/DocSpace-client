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
import { TenantStatus } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  TGetColorTheme,
  TSettings,
} from "@docspace/shared/api/settings/types";

import type {
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import FilesFilter from "@docspace/shared/api/files/filter";

import { logger } from "@/../logger.mjs";

import type { TCatchError, TError, TResponse } from "@/types";

const log = logger.child({ module: "API" });

export async function getData(share?: string) {
  try {
    const searchParams = new URLSearchParams();

    if (share) searchParams.append("share", share);

    const [user, settings] = await Promise.all([
      getUser(share),
      getSettings(share),
    ]);

    if (typeof settings !== "string") {
      const response: TResponse = {
        user,
        settings,
        successAuth: false,
        isSharingAccess: false,
      };

      const successAuth = !!user;

      if (!successAuth && !share) {
        response.error = { message: "unauthorized" };
      }

      if (
        typeof response.settings !== "string" &&
        response.settings?.tenantStatus === TenantStatus.PortalRestore
      ) {
        response.error = { message: "restore-backup" };
      }

      if (
        typeof response.settings !== "string" &&
        response.settings?.tenantStatus === TenantStatus.PortalDeactivate
      ) {
        response.error = { message: "unavailable" };
      }

      response.successAuth = successAuth;

      return response;
    }
  } catch (e) {
    const err = e as TCatchError;

    let message = "";
    if (typeof err === "string") message = err;
    else
      message =
        ("response" in err && err.response?.data?.error?.message) ||
        ("message" in err && err.message) ||
        "";

    const status =
      typeof err !== "string"
        ? ("response" in err && err?.response?.data?.statusCode) ||
          ("response" in err && err?.response?.data?.status) ||
          ""
        : "";

    const error: TError = {
      message,
      status,
      editorUrl: "",
    };
    return { error };
  }
}

export async function getUser(share?: string) {
  log.debug("Start GET /people/@self");

  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getUser] = createRequest(
    [`/people/@self`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
    undefined,
  );

  if (!cookie?.includes("asc_auth_key")) return undefined;
  const userRes = await fetch(getUser, { next: { revalidate: 600 } });

  if (userRes.status === 401) return undefined;

  if (!userRes.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    if (!share)
      log.error({ error: userRes, url: hostname }, `GET /people/@self failed`);

    return;
  }

  const user = await userRes.json();

  return user.response as TUser;
}

export async function getSettings(share?: string) {
  log.debug("Start GET /settings");

  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getSettings] = createRequest(
    [
      `/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
    ],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
    undefined,
  );

  const settingsRes = await fetch(getSettings, { next: { revalidate: 600 } });

  if (settingsRes.status === 403) return `access-restricted`;

  if (!settingsRes.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error({ error: settingsRes, url: hostname }, `GET /settings failed`);

    return;
  }

  const settings = await settingsRes.json();

  return settings.response as TSettings;
}

export async function getFilesSettings(share?: string) {
  log.debug("Start GET /files/settings");

  const [getFilesSettings] = createRequest(
    [`files/settings`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
    undefined,
  );

  const settingsRes = await fetch(getFilesSettings, {
    next: { revalidate: 600 },
  });

  if (settingsRes.status === 403) return `access-restricted`;

  if (!settingsRes.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error(
      { error: settingsRes, url: hostname },
      `GET /files/settings failed`,
    );

    return;
  }

  const settings = await settingsRes.json();

  return settings.response as TFilesSettings;
}

export const checkIsAuthenticated = async () => {
  log.debug("Start GET /authentication");

  const [request] = createRequest(["/authentication"], [["", ""]], "GET");

  const res = await fetch(request, { next: { revalidate: 600 } });

  if (!res.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error({ error: request, url: hostname }, `GET /authentication failed`);

    return;
  }

  const isAuth = await res.json();

  return isAuth.response as boolean;
};

export async function validatePublicRoomKey(key: string) {
  log.debug("Start GET /files/share");

  const [validatePublicRoomKey] = createRequest(
    [`/files/share/${key}`],
    [key ? ["Request-Token", key] : ["", ""]],
    "GET",
  );

  const res = await fetch(validatePublicRoomKey, { next: { revalidate: 5 } });
  if (res.status === 401) return undefined;
  if (!res.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error({ error: res, url: hostname }, `GET /files/share failed`);

    return;
  }

  const room = await res.json();

  return room.response;
}

export async function getColorTheme() {
  log.debug(`Start GET /settings/colortheme`);

  const [getSettings] = createRequest(
    [`/settings/colortheme`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getSettings, { next: { revalidate: 600 } });

  if (!res.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error({ error: res, url: hostname }, "GET /settings/colortheme failed");
    return;
  }

  const colorTheme = await res.json();

  return colorTheme.response as TGetColorTheme;
}

export async function getFolder(
  folderId: string | number,
  filter: FilesFilter,
  share?: string,
) {
  let params = `${folderId}`;

  if (filter) {
    params = `${folderId}?${filter.toApiUrlParams()}`;
  }

  log.debug(`Start GET /files/${params}`);

  const [getFolder] = createRequest(
    [`/files/${params}`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
    undefined,
  );

  const res = await fetch(getFolder, { next: { revalidate: 5 } });

  if (!res.ok) {
    const hdrs = headers();

    const hostname = hdrs.get("x-forwarded-host");

    log.error({ error: res, url: hostname }, `GET /files/${params} failed`);
    return;
  }

  const folder = await res.json();

  return folder.response as TGetFolder;
}
