"use server";

import { headers } from "next/headers";

import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { TenantStatus } from "@docspace/shared/enums";

import { TCatchError, TError, TResponse } from "@/types";

const API_PREFIX = "api/2.0";

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
    const cookie = hdrs.get("cookie");

    const baseURL = `${proto}://${host}`;
    const baseAPIUrl = `${baseURL}/${API_PREFIX}`;

    const configURL = new URL(`${baseAPIUrl}/files/file/${fileId}/openedit`);
    const editorURL = new URL(`${baseAPIUrl}/files/docservice`);
    const userURL = new URL(`${baseAPIUrl}/people/@self`);
    const settingsURL = new URL(
      `${baseAPIUrl}/settings?withPassword=${cookie?.includes("asc_auth_key") ? "false" : "true"}`,
    );

    if (view) configURL.searchParams.append("view", view ? "true" : "false");
    if (version) {
      configURL.searchParams.append("version", version);
      editorURL.searchParams.append("version", version);
    }
    if (doc) configURL.searchParams.append("doc", doc);
    if (share) configURL.searchParams.append("share", share);
    if (editorType) configURL.searchParams.append("editorType", editorType);

    const headersList: HeadersInit = [];

    hdrs.forEach((value, key) => headersList.push([key, value]));

    if (share) headersList.push(["Request-Token", share]);

    const getConfig = new Request(configURL, {
      headers: headersList,
    });
    const getEditorUrl = new Request(editorURL, {
      headers: headersList,
    });

    const getSettings = new Request(settingsURL, {
      headers: headersList,
    });

    const resActions = [];

    resActions.push(fetch(getConfig));
    resActions.push(fetch(getEditorUrl));
    resActions.push(fetch(getSettings));
    const getUser = new Request(userURL, {
      headers: headersList,
    });

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
