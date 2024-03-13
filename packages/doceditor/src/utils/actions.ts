"use server";

import { headers } from "next/headers";

import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { TenantStatus } from "@docspace/shared/enums";

import { TCatchError, TError, TResponse } from "@/types";

const API_PREFIX = "api/2.0";

const skip_port_forward = process.env.NODE_PORT_FORWARD === "false";

export async function fileCopyAs(
  fileId: string,
  destTitle: string,
  destFolderId: string,
  enableExternalExt?: boolean,
  password?: string,
) {
  try {
    const hdrs = headers();

    const host = hdrs.get("x-forwarded-host");
    const proto = hdrs.get("x-forwarded-proto");
    const cookie = hdrs.get("cookie");
    const port = !skip_port_forward && hdrs.get("x-forwarded-port");

    const baseURL = `${proto}://${host}${port ? `:${port}` : ""}`;
    const baseAPIUrl = `${baseURL}/${API_PREFIX}`;

    const createFileUrl = new URL(`${baseAPIUrl}/files/file/${fileId}/copyas`);

    const createFile = new Request(createFileUrl, {
      headers: {
        cookie: cookie ?? "",
        "Content-Type": "application/json;charset=utf-8",
      },
      method: "POST",
      body: JSON.stringify({
        destTitle,
        destFolderId: +destFolderId,
        enableExternalExt,
        password,
      }),
    });

    const file = await (await fetch(createFile)).json();

    return {
      file: file.response,
      error: { ...file.error },
    };
  } catch (e) {
    return { file: undefined, error: e as object | string };
  }
}

export async function createFile(
  parentId: string,
  title: string,
  templateId?: string,
  formId?: string,
) {
  try {
    const hdrs = headers();

    const host = hdrs.get("x-forwarded-host");
    const proto = hdrs.get("x-forwarded-proto");
    const cookie = hdrs.get("cookie");
    const port = !skip_port_forward && hdrs.get("x-forwarded-port");

    const baseURL = `${proto}://${host}${port ? `:${port}` : ""}`;
    const baseAPIUrl = `${baseURL}/${API_PREFIX}`;

    const createFileUrl = new URL(`${baseAPIUrl}/files/${parentId}/file`);

    const createFile = new Request(createFileUrl, {
      headers: {
        cookie: cookie ?? "",
        "Content-Type": "application/json;charset=utf-8",
      },
      method: "POST",
      body: JSON.stringify({ title, templateId, formId }),
    });

    const file = await (await fetch(createFile)).json();

    return {
      file: file.response,
      error: { ...file.error },
    };
  } catch (e) {
    return { file: undefined, error: e as object | string };
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

    const host = hdrs.get("x-forwarded-host");
    const proto = hdrs.get("x-forwarded-proto");
    const port = !skip_port_forward && hdrs.get("x-forwarded-port");

    const baseURL = `${proto}://${host}${port ? `:${port}` : ""}`;
    const baseAPIUrl = `${baseURL}/${API_PREFIX}`;

    const configURL = new URL(`${baseAPIUrl}/files/file/${fileId}/openedit`);
    const editorURL = new URL(`${baseAPIUrl}/files/docservice`);
    const userURL = new URL(`${baseAPIUrl}/people/@self`);
    const settingsURL = new URL(`${baseAPIUrl}/settings?withPassword=false`);

    if (view) configURL.searchParams.append("view", view ? "true" : "false");
    if (version) {
      configURL.searchParams.append("version", version);
      editorURL.searchParams.append("version", version);
    }
    if (doc) configURL.searchParams.append("doc", doc);
    if (share) configURL.searchParams.append("share", share);
    if (editorType) configURL.searchParams.append("editorType", editorType);

    const getConfig = new Request(configURL, {
      headers: hdrs,
    });
    const getEditorUrl = new Request(editorURL, {
      headers: hdrs,
    });
    const getUser = new Request(userURL, {
      headers: hdrs,
    });
    const getSettings = new Request(settingsURL, {
      headers: hdrs,
    });

    const resActions = [];

    resActions.push(fetch(getConfig));
    resActions.push(fetch(getEditorUrl));
    resActions.push(fetch(getUser));
    resActions.push(fetch(getSettings));

    const [configRes, editorUrlRes, userRes, settingsRes] =
      await Promise.all(resActions);

    const actions = [];

    if (configRes.ok) {
      actions.push(configRes.json());
      actions.push(editorUrlRes.json());
      actions.push(userRes.json());
      actions.push(settingsRes.json());

      const [config, editorUrl, user, settings] = await Promise.all(actions);

      const response: TResponse = {
        config: config.response,
        editorUrl: editorUrl.response,
        user: user.response,
        settings: settings.response,
        successAuth: false,
        isSharingAccess: false,
        doc,
        fileId,
      };

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

