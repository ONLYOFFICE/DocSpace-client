"use server";

import { headers } from "next/headers";

import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { TenantStatus } from "@docspace/shared/enums";

import { IInitialConfig, TCatchError, TError, TResponse } from "@/types";
import { error } from "console";
import { isTemplateFile } from ".";
import { TDocServiceLocation } from "@docspace/shared/api/files/types";

const API_PREFIX = "api/2.0";
const SKIP_PORT_FORWARD = process.env.NODE_PORT_FORWARD === "false";

export const getBaseUrl = () => {
  const hdrs = headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");
  const port = !SKIP_PORT_FORWARD ? hdrs.get("x-forwarded-port") : "";

  // const baseURL = `${proto}://${host}${port ? `:${port}` : ""}`;
  const baseURL = `${proto}://${host}`;

  return baseURL;
};

export const getAPIUrl = () => {
  const baseUrl = getBaseUrl();
  const baseAPIUrl = `${baseUrl}/${API_PREFIX}`;

  return baseAPIUrl;
};

export const createRequest = (
  paths: string[],
  newHeaders: [string, string][],
  method: string,
  body?: string,
) => {
  const hdrs = new Headers(headers());

  const apiURL = getAPIUrl();

  newHeaders.forEach((hdr) => {
    if (hdr[0]) hdrs.set(hdr[0], hdr[1]);
  });

  const urls = paths.map((path) => `${apiURL}${path}`);

  const requests = urls.map(
    (url) => new Request(url, { headers: hdrs, method, body }),
  );

  return requests;
};

const processFillFormDraft = async (
  config: IInitialConfig,
  searchParams: URLSearchParams,
  editorSearchParams: URLSearchParams,
  share?: string,
): Promise<
  [string, IInitialConfig, TDocServiceLocation | undefined] | undefined
> => {
  const templateFileId = config.file.id;

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

  if (!response.ok) return;

  const { response: formUrl } = await response.json();

  const queryParams = new URLSearchParams(formUrl.split("?")[1]);
  const queryFileId = queryParams.get("fileid");
  const queryVersion = queryParams.get("version");

  if (!queryFileId) return;

  if (queryVersion) {
    searchParams.set("version", queryVersion);
    editorSearchParams.set("version", queryVersion);
  }

  const queries = [
    `/files/file/${queryFileId}/openedit?${searchParams.toString()}`,
  ];

  if (queryVersion) {
    queries.push(`/files/docservice?${editorSearchParams.toString()}`);
  }

  const [getConfig, getEditorUrl] = createRequest(
    queries,
    [share ? ["Request-Token", share] : ["", ""]],
    "GET",
  );

  const resActions = [];

  resActions.push(fetch(getConfig));
  getEditorUrl && resActions.push(fetch(getEditorUrl));

  const [configRes, editorUrlRes] = await Promise.all(resActions);

  if (!configRes.ok) return;

  const actions = [];

  actions.push(configRes.json());
  editorUrlRes && actions.push(editorUrlRes.json());

  const [newConfig, newEditorUrl] = await Promise.all(actions);

  return [queryFileId, newConfig.response, newEditorUrl?.response];
};

export async function fileCopyAs(
  fileId: string,
  destTitle: string,
  destFolderId: string,
  enableExternalExt?: boolean,
  password?: string,
) {
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
          ? error
          : {
              message: file.error?.message,
              status: file.error?.statusCode,
              type: file.error?.type,
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
            },
    };
  }
}

export async function createFile(
  parentId: string,
  title: string,
  templateId?: string,
  formId?: string,
) {
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
          ? error
          : {
              message: file.error?.message,
              status: file.error?.statusCode,
              type: file.error?.type,
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
            },
    };
  }
}

export async function getData(
  fileId?: string,
  version?: string,
  doc?: string,
  view?: boolean,
  share?: string,
  editorType?: string,
) {
  try {
    const hdrs = headers();

    const cookie = hdrs.get("cookie");

    const searchParams = new URLSearchParams();
    const editorSearchParams = new URLSearchParams();

    if (view) searchParams.append("view", view ? "true" : "false");
    if (version) {
      searchParams.append("version", version);
      editorSearchParams.append("version", version);
    }
    if (doc) searchParams.append("doc", doc);
    if (share) searchParams.append("share", share);
    if (editorType) searchParams.append("editorType", editorType);

    const [getConfig, getEditorUrl, getSettings, getUser] = createRequest(
      [
        `/files/file/${fileId}/openedit?${searchParams.toString()}`,
        `/files/docservice?${editorSearchParams.toString()}`,
        `/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
        `/people/@self`,
      ],
      [share ? ["Request-Token", share] : ["", ""]],
      "GET",
    );

    const resActions = [];

    resActions.push(fetch(getConfig));
    resActions.push(fetch(getEditorUrl));
    resActions.push(fetch(getSettings));
    resActions.push(fetch(getUser));

    const [configRes, editorUrlRes, settingsRes, userRes] =
      await Promise.all(resActions);

    const actions = [];

    if (configRes.ok) {
      actions.push(configRes.json());
      actions.push(editorUrlRes.json());
      actions.push(settingsRes.json());
      if (userRes.status !== 401) actions.push(userRes.json());

      const [config, editorUrl, settings, user] = await Promise.all(actions);

      const response: TResponse = {
        config: config.response,
        editorUrl: editorUrl.response,
        user: user?.response,
        settings: settings.response,
        successAuth: false,
        isSharingAccess: false,
        doc,
        fileId,
      };

      if (isTemplateFile(response.config)) {
        const result = await processFillFormDraft(
          response.config,
          searchParams,
          editorSearchParams,
          share,
        );

        if (result) {
          const [newFileId, newConfig, newEditorUrl] = result;

          response.fileId = newFileId;
          response.config = newConfig;
          if (newEditorUrl) response.editorUrl = newEditorUrl;
        }
      }

      // needed to reset rtl language in Editor
      response.config.editorConfig.lang = getLtrLanguageForEditor(
        response.user?.cultureName,
        response.settings.culture,
        true,
      );

      if (response.settings.tenantStatus === TenantStatus.PortalRestore) {
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

    const response: TResponse = { error: { message: "unauthorized" }, fileId };

    return response;
  } catch (e) {
    const err = e as TCatchError;
    console.error("initDocEditor failed", err);
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
    };
    return { error };
  }
}
