"use server";
import { headers } from "next/headers";

import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { TenantStatus } from "@docspace/shared/enums";

import { IResponse } from "@/types";
import { redirect } from "next/navigation";

const API_PREFIX = "api/2.0";

export async function getData(
  fileId: string,
  version?: string,
  doc?: string,
  view?: boolean,
  share?: string,
) {
  const hdrs = headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");

  const baseAPIUrl = `${proto}://${host}/${API_PREFIX}`;

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

  if (!configRes.ok) return redirect("/error");

  const actions = [];

  actions.push(configRes.json());
  actions.push(editorUrlRes.json());
  actions.push(userRes.json());
  actions.push(settingsRes.json());

  const [config, editorUrl, user, settings] = await Promise.all(actions);

  const response: IResponse = {
    config: config.response,
    editorUrl: editorUrl.response,
    user: user.response,
    settings: settings.response,
    successAuth: false,
    isSharingAccess: false,
    error: "",
  };

  // needed to reset rtl language in Editor
  response.config.editorConfig.lang = getLtrLanguageForEditor(
    response.user?.cultureName,
    response.settings.culture,
    true,
  );

  let error: unknown;

  if (response.settings.tenantStatus === TenantStatus.PortalRestore) {
    response.error = "restore-backup";
  }

  const successAuth = !!user;

  if (!successAuth && !doc && !share) {
    response.error = error = {
      unAuthorized: true,
    };
  }

  const isSharingAccess = response.config.file.canShare;

  if (view) {
    response.config.editorConfig.mode = "view";
  }

  response.successAuth = successAuth;
  response.isSharingAccess = isSharingAccess;

  return response;
}
