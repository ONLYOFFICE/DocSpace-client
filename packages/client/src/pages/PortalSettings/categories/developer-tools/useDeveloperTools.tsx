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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";

import {
  getApiKeyPermissions,
  getApiKeys,
} from "@docspace/shared/api/api-keys";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import WebhooksStore from "SRC_DIR/store/WebhooksStore";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import { TApiKey } from "@docspace/shared/api/api-keys/types";

export type UseDeveloperToolsProps = {
  getCSPSettings?: SettingsStore["getCSPSettings"];
  loadWebhooks?: WebhooksStore["loadWebhooks"];
  fetchClients?: OAuthStore["fetchClients"];
  fetchScopes?: OAuthStore["fetchScopes"];
  isInit?: OAuthStore["isInit"];
  setIsInit?: OAuthStore["setIsInit"];
  setErrorOAuth?: OAuthStore["setErrorOAuth"];
  errorOAuth?: OAuthStore["errorOAuth"];

  setApiKeys?: SettingsStore["setApiKeys"];
  setPermissions?: SettingsStore["setPermissions"];
  setErrorKeys?: SettingsStore["setErrorKeys"];

  addAbortControllers?: SettingsStore["addAbortControllers"];
};

const useDeveloperTools = ({
  getCSPSettings,
  loadWebhooks,
  fetchClients,
  fetchScopes,
  isInit,
  setIsInit,
  setErrorOAuth,
  errorOAuth,
  setApiKeys,
  setPermissions,
  setErrorKeys,
  addAbortControllers,
}: UseDeveloperToolsProps) => {
  const { ready: translationsReady } = useTranslation([
    "JavascriptSdk",
    "Webhooks",
    "Settings",
    "WebPlugins",
    "Common",
    "OAuth",
  ]);

  const getJavascriptSDKData = React.useCallback(async () => {
    await getCSPSettings?.();
  }, [getCSPSettings]);

  const getWebhooksData = React.useCallback(async () => {
    await loadWebhooks?.();
  }, [loadWebhooks]);

  const getOAuthData = React.useCallback(async () => {
    const actions = [];

    try {
      if (!isInit) {
        actions.push(fetchScopes?.());
      }
      actions.push(fetchClients?.());

      await Promise.all(actions);
    } catch (e) {
      setErrorOAuth?.(e as Error);
    }

    setIsInit?.(true);
  }, [fetchClients, fetchScopes, isInit, setIsInit]);

  const getKeysData = React.useCallback(async () => {
    const ApiKeysAbortController = new AbortController();
    const ApiKeyPermissionsAbortController = new AbortController();
    addAbortControllers?.([
      ApiKeysAbortController,
      ApiKeyPermissionsAbortController,
    ]);

    try {
      const [keys, permissionsData] = await Promise.all([
        getApiKeys(ApiKeysAbortController.signal),
        getApiKeyPermissions(ApiKeyPermissionsAbortController.signal),
      ]);

      setApiKeys?.(keys);
      setPermissions?.(permissionsData);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "CanceledError" || err.message === "canceled")
      ) {
        return;
      }

      toastr.error(err as Error);
      setErrorKeys?.(err as Error);
    }
  }, [getApiKeys, getApiKeyPermissions, addAbortControllers]);

  // Waiting for translations to load for the API page, since there is no request logic there.
  const waiters = React.useRef<((ready: boolean) => void)[]>([]);
  React.useEffect(() => {
    if (translationsReady) {
      waiters.current.forEach((resolve) => resolve(true));
      waiters.current = [];
    }
  }, [translationsReady]);

  const waitForTranslations = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (translationsReady) {
        resolve(true);
      } else {
        waiters.current.push(resolve);
      }
    });
  }, [translationsReady]);

  const getDeveloperToolsInitialValue = React.useCallback(async () => {
    const actions = [];

    if (window.location.pathname.includes("javascript-sdk"))
      actions.push(getJavascriptSDKData());

    if (window.location.pathname.includes("webhooks"))
      actions.push(getWebhooksData());

    if (window.location.pathname.includes("oauth"))
      actions.push(getOAuthData());

    if (window.location.pathname.includes("api-keys"))
      actions.push(getKeysData());

    if (window.location.pathname.includes("api")) {
      await waitForTranslations();
      return;
    }

    await Promise.all(actions);
  }, [
    getJavascriptSDKData,
    getWebhooksData,
    getOAuthData,
    getKeysData,
    waitForTranslations,
  ]);

  return {
    getDeveloperToolsInitialValue,
    getJavascriptSDKData,
    getWebhooksData,
    getOAuthData,
    errorOAuth,
    getKeysData,
  };
};

export default useDeveloperTools;
