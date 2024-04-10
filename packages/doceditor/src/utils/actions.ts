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

import {
  createRequest,
  getBaseUrl,
} from "@docspace/shared/utils/next-ssr-helper";
import { TenantStatus, EditorConfigErrorType } from "@docspace/shared/enums";
import type {
  TDocServiceLocation,
  TFile,
} from "@docspace/shared/api/files/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TSettings } from "@docspace/shared/api/settings/types";

import type { IInitialConfig, TCatchError, TError, TResponse } from "@/types";

import { REPLACED_URL_PATH } from "./constants";

import { isTemplateFile } from ".";

const processFillFormDraft = async (
  config: IInitialConfig,
  searchParams: URLSearchParams,

  share?: string,
): Promise<[string, IInitialConfig | TError, string | undefined] | void> => {
  const templateFileId = config.file.id;

  const formUrl = await checkFillFromDraft(templateFileId, share);

  if (!formUrl) return;

  const basePath = getBaseUrl();
  const url = new URL(basePath + formUrl);

  const queryFileId = url.searchParams.get("fileid");
  const queryVersion = url.searchParams.get("version");

  if (!queryFileId) return;

  url.searchParams.delete("fileid");

  const combinedSearchParams = new URLSearchParams({
    ...Object.fromEntries(searchParams),
    ...Object.fromEntries(url.searchParams),
  });

  const actions: [Promise<IInitialConfig | TError>] = [
    openEdit(queryFileId, combinedSearchParams.toString(), share),
  ];

  const [newConfig] = await Promise.all(actions);

  return [queryFileId, newConfig, url.hash ?? ""];
};

export async function fileCopyAs(
  fileId: string,
  destTitle: string,
  destFolderId: string,
  enableExternalExt?: boolean,
  password?: string,
): Promise<{
  file: TFile | undefined;
  error:
    | string
    | { message: string; status: number; type: string; stack: string }
    | undefined;
}> {
  try {
    const [createFile] = createRequest(
      [`/files/file/${fileId}/copyas`],
      [["Content-Type", "application/json;charset=utf-8"]],
      "POST",
      JSON.stringify({
        destTitle,
        destFolderId: +destFolderId,
        enableExternalExt,
        password,
      }),
    );

    const file = await (await fetch(createFile)).json();

    console.log("File copyas success ", file);

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
            }
        : undefined,
    };
  } catch (e: any) {
    console.log("File copyas error ", e);
    return {
      file: undefined,
      error:
        typeof e === "string"
          ? e
          : {
              message: e.message,
              status: e.statusCode,
              type: e.type,
              stack: e.stack,
            },
    };
  }
}

export async function createFile(
  parentId: string,
  title: string,
  templateId?: string,
  formId?: string,
): Promise<{
  file: TFile | undefined;
  error:
    | string
    | { message: string; status: number; type: string; stack: string }
    | undefined;
}> {
  try {
    const [createFile] = createRequest(
      [`/files/${parentId}/file`],
      [["Content-Type", "application/json;charset=utf-8"]],
      "POST",
      JSON.stringify({ title, templateId, formId }),
    );

    const file = await (await fetch(createFile)).json();
    console.log("File create success ", file);
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
            }
        : undefined,
    };
  } catch (e: any) {
    console.log("File create error ", e);
    return {
      file: undefined,
      error:
        typeof e === "string"
          ? e
          : {
              message: e.message,
              status: e.statusCode,
              type: e.type,
              stack: e.stack,
            },
    };
  }
}

export async function getData(
  fileId: string,
  version?: string,
  doc?: string,
  view?: boolean,
  share?: string,
  editorType?: string,
) {
  try {
    const hdrs = headers();

    const searchParams = new URLSearchParams();

    if (view) searchParams.append("view", view ? "true" : "false");
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

    if ("token" in config) {
      const response: TResponse = {
        config,
        user,
        settings,
        successAuth: false,
        isSharingAccess: false,
        doc,
        fileId,
      };

      if (isTemplateFile(response.config)) {
        const result = await processFillFormDraft(
          response.config,
          searchParams,
          share,
        );

        if (result) {
          const [newFileId, newConfig, hash] = result;

          response.fileId = newFileId;
          response.config = newConfig as IInitialConfig;

          if (hash) response.hash = hash;
        }
      }

      if (response.settings?.tenantStatus === TenantStatus.PortalRestore) {
        response.error = { message: "restore-backup" };
      }

      const successAuth = !!user;

      if (!successAuth && !doc && !share) {
        response.error = { message: "unauthorized" };
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

    return response;
  } catch (e) {
    const err = e as TCatchError;
    console.error("initDocEditor failed", err);

    const editorUrl = (await getEditorUrl("", share)).docServiceUrl;

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
      editorUrl,
    };
    return { error };
  }
}

export async function getUser(share?: string) {
  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getUser] = createRequest(
    [`/people/@self`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
  );

  if (!cookie?.includes("asc_auth_key")) return undefined;
  const userRes = await fetch(getUser);

  if (userRes.status === 401) return undefined;

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

  const resActions = [];

  resActions.push(fetch(getSettings));

  const [settingsRes] = await Promise.all(resActions);

  const actions = [];

  actions.push(settingsRes.json());

  const [settings] = await Promise.all(actions);

  return settings.response as TSettings;
}

export async function checkFillFromDraft(
  templateFileId: number,
  share?: string,
) {
  const [checkFillFormDraft] = createRequest(
    [`/files/masterform/${templateFileId}/checkfillformdraft`],
    [
      share ? ["Request-Token", share] : ["", ""],
      ["Content-Type", "application/json;charset=utf-8"],
    ],
    "POST",
    JSON.stringify({ fileId: templateFileId }),
  );

  const response = await fetch(checkFillFormDraft);

  if (!response.ok) return null;

  const { response: formUrl } = await response.json();

  return formUrl as string;
}

export async function openEdit(
  fileId: number | string,
  searchParams: string,
  share?: string,
) {
  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getConfig] = createRequest(
    [`/files/file/${fileId}/openedit?${searchParams}`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
  );

  const res = await fetch(getConfig);

  const config = await res.json();

  if (res.ok) {
    config.response.editorUrl = (
      config.response as IInitialConfig
    ).editorUrl.replace(REPLACED_URL_PATH, "");
    return config.response as IInitialConfig;
  }

  const editorUrl = (await getEditorUrl("", share)).docServiceUrl;

  const status =
    config.error.type === EditorConfigErrorType.NotFoundScope
      ? "not-found"
      : config.error.type === EditorConfigErrorType.AccessDeniedScope
        ? "access-denied"
        : res.status === 415
          ? "not-supported"
          : undefined;

  const message = status ? config.error.message : undefined;

  const error =
    cookie?.includes("asc_auth_key") || share
      ? config.error.type === EditorConfigErrorType.LinkScope
        ? { message: message ?? "unauthorized", status, editorUrl }
        : { ...config.error, status, editorUrl }
      : { message: message ?? "unauthorized", status, editorUrl };

  return error as TError;
}

export async function getEditorUrl(
  editorSearchParams?: string,
  share?: string,
) {
  const [request] = createRequest(
    [`/files/docservice?${editorSearchParams ? editorSearchParams : ""}`],
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
  );

  const res = await fetch(request);

  const editorUrl = await res.json();

  return editorUrl.response as TDocServiceLocation;
}
