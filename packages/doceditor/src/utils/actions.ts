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

"use server";

import { headers } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import { TenantStatus, EditorConfigErrorType } from "@docspace/shared/enums";
import { tryParseToNumber } from "@docspace/shared/utils/tryParseToNumber";
import type {
  TDocServiceLocation,
  TFile,
  TFileFillingFormStatus,
} from "@docspace/shared/api/files/types";
import { TUser } from "@docspace/shared/api/people/types";
import type {
  TGetColorTheme,
  TSettings,
} from "@docspace/shared/api/settings/types";

import { logger } from "@/../logger.mjs";

import type {
  ActionType,
  IInitialConfig,
  TCatchError,
  TError,
  TResponse,
} from "@/types";

import { availableActions, REPLACED_URL_PATH } from "./constants";

export async function getFillingSession(
  fillingSessionId: string,
  share?: string,
) {
  logger.debug("Start GET /files/file/fillresult");

  try {
    const [request] = await createRequest(
      [`/files/file/fillresult?fillingSessionId=${fillingSessionId}`],
      [
        ["Content-Type", "application/json;charset=utf-8"],
        share ? ["Request-Token", share] : ["", ""],
      ],
      "GET",
    );

    try {
      const response = await fetch(request);

      if (response.ok) return await response.json();

      logger.error(`GET /files/file/fillresult failed: ${response.status}`);

      throw new Error("Something went wrong", {
        cause: await response.json(),
      });
    } catch (error) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");
      logger.error(
        `error: ${error}, fillingSessionId: ${fillingSessionId}, url: ${hostname} Get filling session faile`,
      );
    }
  } catch (error) {
    logger.error(`Error in getFillingSession: ${error}`);
  }
}

export async function fileCopyAs(
  fileId: string,
  destTitle: string,
  destFolderId: string,
  enableExternalExt?: boolean,
  password?: string,
  toForm?: string,
): Promise<
  | {
      file: TFile | undefined;
      error:
        | string
        | {
            message: string;
            status: number;
            type: string;
            stack: string;
            statusCode?: number;
          }
        | undefined;
    }
  | undefined
> {
  logger.debug(`Start POST /files/file/${fileId}/copyas`);
  try {
    const [createFileRes] = await createRequest(
      [`/files/file/${fileId}/copyas`],
      [["Content-Type", "application/json;charset=utf-8"]],
      "POST",
      JSON.stringify({
        destTitle,
        destFolderId: tryParseToNumber(destFolderId),
        enableExternalExt,
        password,
        toForm: toForm === "true",
      }),
    );

    const fileRes = await fetch(createFileRes);

    if (fileRes.status === 401) {
      logger.debug(`POST /files/file/${fileId}/copyas user auth failed`);

      return {
        file: undefined,
        error: { status: 401, message: "", type: "", stack: "" },
      };
    }

    const file = await fileRes.json();

    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");

    if (!fileRes.ok && !file?.error) {
      logger.error(
        `error: ${fileRes}, url: ${hostname}, POST /files/file/${fileId}/copyas failed`,
      );

      return;
    }

    if (file.error)
      logger.error(
        `error: ${file.error}, url: ${hostname} POST /files/file/${fileId}/copyas failed`,
      );

    return {
      file: file.response,
      error: file.error
        ? typeof file.error === "string"
          ? file.error
          : {
              message: file.error?.message,
              status: file.error?.statusCode,
              type: file.error?.type,
              stack: file.error?.stack,
              statusCode: file?.statusCode,
            }
        : undefined,
    };
  } catch (e: unknown) {
    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");

    logger.error(
      `error: ${e}, url: ${hostname} POST /files/file/${fileId}/copyas failed`,
    );
    return {
      file: undefined,
      error:
        typeof e === "string"
          ? e
          : {
              message: e instanceof Error ? e.message : String(e),
              status:
                e && typeof e === "object" && "statusCode" in e
                  ? (e as { statusCode: number }).statusCode
                  : 0,
              type:
                e && typeof e === "object" && "type" in e
                  ? (e as { type: string }).type
                  : "unknown",
              stack: e instanceof Error ? (e.stack ?? "") : "",
            },
    };
  }
}

export async function createFile(
  parentId: string,
  title: string,
  templateId?: string,
  formId?: string,
): Promise<
  | {
      file: TFile | undefined;
      error:
        | string
        | {
            message: string;
            status: number;
            type: string;
            stack: string;
            statusCode?: number;
          }
        | undefined;
    }
  | undefined
> {
  logger.debug(`Start POST /files/${parentId}/file`);
  try {
    const [createFileRes] = await createRequest(
      [`/files/${parentId}/file`],
      [["Content-Type", "application/json;charset=utf-8"]],
      "POST",
      JSON.stringify({ title, templateId, formId }),
    );

    const fileRes = await fetch(createFileRes);

    if (fileRes.status === 401) {
      logger.error(`POST /files/${parentId}/file user auth failed`);

      return {
        file: undefined,
        error: { status: 401, message: "", type: "", stack: "" },
      };
    }

    if (!fileRes.ok && fileRes.status !== 403) {
      logger.error(`POST /files/${parentId}/file failed: ${fileRes.status}`);
      return;
    }

    const file = await fileRes.json();

    if (file.error) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");

      logger.error(
        `error: ${file.error}, url: ${hostname} POST /files/${parentId}/file failed`,
      );
    }
    return {
      file: file.response,
      error: file.error
        ? typeof file.error === "string"
          ? file.error
          : {
              message: file.error?.message,
              status: file.error?.statusCode,
              type: file.error?.type,
              stack: file.error?.stack,
              statusCode: file?.statusCode,
            }
        : undefined,
    };
  } catch (e: unknown) {
    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");
    logger.error(
      `error: ${e}, url: ${hostname} POST /files/${parentId}/file failed`,
    );
    return {
      file: undefined,
      error:
        typeof e === "string"
          ? e
          : {
              message: e instanceof Error ? e.message : String(e),
              status:
                e && typeof e === "object" && "statusCode" in e
                  ? (e as { statusCode: number }).statusCode
                  : 0,
              type:
                e && typeof e === "object" && "type" in e
                  ? (e as { type: string }).type
                  : "unknown",
              stack: e instanceof Error ? (e.stack ?? "") : "",
            },
    };
  }
}

export async function getUser(share?: string) {
  logger.debug("Start GET /people/@self");

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getUserRes] = await createRequest(
      [`/people/@self`],
      [share ? ["Request-Token", share] : ["", ""]],
      "GET",
      undefined,
    );

    if (!cookie?.includes("asc_auth_key")) return undefined;
    const userRes = await fetch(getUserRes);

    if (userRes.status === 401) return undefined;

    if (!userRes.ok) {
      const hedrs = await headers();

      const hostname = hedrs.get("x-forwarded-host");

      if (!share)
        logger.error(
          `error: ${userRes}, url: ${hostname} GET /people/@self failed`,
        );

      return;
    }

    const user = await userRes.json();

    return user.response as TUser;
  } catch (error) {
    logger.error(`Error in getUser: ${error}`);
  }
}

export async function getSettings(share?: string) {
  logger.debug("Start GET /settings");

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getSettingsRes] = await createRequest(
      [
        `/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
      ],
      [share ? ["Request-Token", share] : ["", ""]],
      "GET",
      undefined,
    );

    const settingsRes = await fetch(getSettingsRes);

    if (settingsRes.status === 403) return `access-restricted`;

    if (!settingsRes.ok) {
      const hedrs = await headers();

      const hostname = hedrs.get("x-forwarded-host");

      logger.error(
        `error: ${settingsRes}, url: ${hostname} GET /settings failed`,
      );

      return;
    }

    const settings = await settingsRes.json();

    return settings.response as TSettings;
  } catch (error) {
    logger.error(`Error in getSettings: ${error}`);
  }
}

export const checkIsAuthenticated = async () => {
  logger.debug("Start GET /authentication");

  try {
    const [request] = await createRequest(
      ["/authentication"],
      [["", ""]],
      "GET",
    );

    const res = await fetch(request);

    if (!res.ok) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");

      logger.error(
        `error: ${request}, url: ${hostname} GET /authentication failed`,
      );

      return;
    }

    const isAuth = await res.json();

    return isAuth.response as boolean;
  } catch (error) {
    logger.error(`Error in checkIsAuthenticated: ${error}`);
  }
};

export async function validatePublicRoomKey(key: string, fileId?: string) {
  logger.debug("Start GET /files/share");

  try {
    const [validatePublicRoomKeyRes] = await createRequest(
      [`/files/share/${key}?fileid=${fileId}`],
      [key ? ["Request-Token", key] : ["", ""]],
      "GET",
    );

    const res = await fetch(validatePublicRoomKeyRes);
    if (res.status === 401) return undefined;
    if (!res.ok) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");

      logger.error(`error: ${res}, url: ${hostname} GET /files/share failed`);

      return;
    }

    const room = await res.json();

    return room;
  } catch (error) {
    logger.error(`Error in validatePublicRoomKey: ${error}`);
  }
}

export async function getEditorUrl(
  editorSearchParams?: string,
  share?: string,
) {
  logger.debug(`Start GET /files/docservice`);

  const [request] = await createRequest(
    [`/files/docservice?${editorSearchParams || ""}`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
    undefined,
  );

  const res = await fetch(request);

  if (!res.ok) {
    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");

    logger.error(`error: ${res} url: ${hostname} GET /files/docservice failed`);

    return;
  }

  const editorUrl = await res.json();

  return editorUrl.response as TDocServiceLocation;
}

export async function openEdit(
  fileId: number | string,
  searchParams: string,
  share?: string,
) {
  logger.debug(`Start GET /files/file/${fileId}/openedit`);

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getConfig] = await createRequest(
      [`/files/file/${fileId}/openedit?${searchParams}`],
      [share ? ["Request-Token", share] : ["", ""]],
      "GET",
      undefined,
    );

    const res = await fetch(getConfig);

    const hostname = hdrs.get("x-forwarded-host");

    if (res.status !== 404) {
      const config = await res.json();

      if (res.ok) {
        config.response.editorUrl = (
          config.response as IInitialConfig
        ).editorUrl.replace(REPLACED_URL_PATH, "");
        return { ...config.response } as IInitialConfig;
      }

      const isAuth = share ? true : await checkIsAuthenticated();

      const editorUrl = isAuth
        ? (await getEditorUrl("", share))?.docServiceUrl
        : "";

      const status =
        config.error?.type === EditorConfigErrorType.NotFoundScope
          ? "not-found"
          : config.error?.type === EditorConfigErrorType.AccessDeniedScope &&
              isAuth
            ? "access-denied"
            : config.error?.type === EditorConfigErrorType.TenantQuotaException
              ? "quota-exception"
              : res.status === 415
                ? "not-supported"
                : undefined;

      const message = status ? config.error.message : undefined;

      const error = isAuth
        ? config.error.type === EditorConfigErrorType.LinkScope
          ? { message: message ?? "unauthorized", status, editorUrl }
          : { ...config.error, status, editorUrl }
        : { message: "unauthorized", status, editorUrl };

      logger.error(
        `fileId: ${fileId}, error: ${error} url: ${hostname} GET /files/file/${fileId}/openedit failed`,
      );

      return error as TError;
    }

    const editorUrl =
      cookie?.includes("asc_auth_key") || share
        ? (await getEditorUrl("", share))?.docServiceUrl
        : "";

    return {
      status: "not-found",
      editorUrl,
    } as TError;
  } catch (error) {
    logger.error(`Error in openEdit: ${error}`);
    return {
      status: "error",
      message: "An unexpected error occurred",
    } as TError;
  }
}

export async function getColorTheme() {
  logger.debug(`Start GET /settings/colortheme`);

  try {
    const [getSettingsRes] = await createRequest(
      [`/settings/colortheme`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getSettingsRes);

    if (!res.ok) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");

      logger.error(
        `error: ${res} url: ${hostname} GET /settings/colortheme failed`,
      );
      return;
    }

    const colorTheme = await res.json();

    return colorTheme.response as TGetColorTheme;
  } catch (error) {
    logger.error(`Error in getColorTheme: ${error}`);
  }
}

export async function getDeepLinkSettings() {
  logger.debug(`Start GET /settings/deeplink`);

  try {
    const [getSettingsRes] = await createRequest(
      [`/settings/deeplink`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getSettingsRes);

    if (!res.ok) {
      const hdrs = await headers();

      const hostname = hdrs.get("x-forwarded-host");

      logger.error(
        `error: ${res} url: ${hostname} GET /settings/deeplink failed`,
      );
      return;
    }

    const deepLinkSettings = await res.json();

    return deepLinkSettings.response;
  } catch (error) {
    logger.error(`Error in getDeepLinkSettings: ${error}`);
  }
}

export async function getFormFillingStatus(formId: string | number) {
  logger.debug(`Start GET /files/file/${formId}/formroles`);

  try {
    const [getFormFillingStatusRes] = await createRequest(
      [`/files/file/${formId}/formroles`],
      [["", ""]],
      "GET",
    );

    const response = await fetch(getFormFillingStatusRes);

    if (response.ok)
      return (await response.json()).response as TFileFillingFormStatus[];

    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");

    logger.error(
      `error: ${response} url: ${hostname} GET /files/file/${formId}/formroles failed`,
    );

    return [];
  } catch (error) {
    logger.error(`Error in getFormFillingStatus: ${error}`);
    return [];
  }
}

export async function getFileById(fileId: number | string) {
  logger.debug(`Start GET /files/file/${fileId}`);

  try {
    const [getFile] = await createRequest(
      [`/files/file/${fileId}`],
      [["", ""]],
      "GET",
    );

    const response = await fetch(getFile);

    if (response.ok) return (await response.json()).response as TFile;

    const hdrs = await headers();

    const hostname = hdrs.get("x-forwarded-host");

    logger.error(
      `error: ${response} url: ${hostname} GET /files/file/${fileId} failed`,
    );

    return null;
  } catch (error) {
    logger.error(`Error in getFileById: ${error}`);
    return null;
  }
}

export async function getData(
  fileId: string,
  version?: string,
  doc?: string,
  action?: ActionType,
  share?: string,
  editorType?: string,
) {
  const view = action === "view";

  try {
    const searchParams = new URLSearchParams();

    if (action && availableActions[action]) searchParams.append(action, "true");

    if (version) {
      searchParams.append("version", version);
    }
    if (doc) searchParams.append("doc", doc);
    if (share) searchParams.append("share", share);
    if (editorType) searchParams.append("editorType", editorType);

    const [config, user, settings] = await Promise.all([
      openEdit(fileId, searchParams.toString(), share),
      getUser(share),
      getSettings(share),
    ]);

    if ("editorConfig" in config && typeof settings !== "string") {
      const newFileId = config.file.id.toString();
      const response: TResponse = {
        config,
        user,
        settings,
        successAuth: false,
        isSharingAccess: false,
        doc,
        fileId: newFileId !== fileId ? newFileId : fileId,
      };

      const successAuth = !!user;

      if (!successAuth && !doc && !share) {
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

      const isSharingAccess = response.config.file.canShare;

      if (view) {
        response.config.editorConfig.mode = "view";
      }

      response.successAuth = successAuth;
      response.isSharingAccess = isSharingAccess;

      return response;
    }

    console.log("initDocEditor failed", config);

    const response: TResponse = {
      error: config,

      fileId,
    };

    if (
      typeof settings !== "string" &&
      settings?.tenantStatus === TenantStatus.PortalRestore
    ) {
      response.error = { message: "restore-backup" };
    }

    if (
      typeof settings !== "string" &&
      settings?.tenantStatus === TenantStatus.PortalDeactivate
    ) {
      response.error = { message: "unavailable" };
    }

    return response;
  } catch (e) {
    const err = e as TCatchError;
    console.error("initDocEditor failed", err);

    // const editorUrl = (await getEditorUrl("", share)).docServiceUrl;

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
