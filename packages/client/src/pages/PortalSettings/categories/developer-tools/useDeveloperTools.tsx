/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";

import { toastr } from "@docspace/ui-kit/components/toast";

import {
  getApiKeyPermissions,
  getApiKeys,
} from "@docspace/shared/api/api-keys";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import WebhooksStore from "SRC_DIR/store/WebhooksStore";
import OAuthStore from "SRC_DIR/store/OAuthStore";

export type UseDeveloperToolsProps = {
  getCSPSettings?: SettingsStore["getCSPSettings"];
  loadWebhooks?: WebhooksStore["loadWebhooks"];
  loadWebhookTriggers?: WebhooksStore["loadWebhookTriggers"];
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
  loadWebhookTriggers,
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
  const getJavascriptSDKData = React.useCallback(async () => {
    await getCSPSettings?.();
  }, [getCSPSettings]);

  const getWebhooksData = React.useCallback(async () => {
    await Promise.all([loadWebhooks?.(), loadWebhookTriggers?.()]);
  }, [loadWebhooks, loadWebhookTriggers]);

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

    await Promise.all(actions);
  }, [
    getJavascriptSDKData,
    getWebhooksData,
    getOAuthData,
    getKeysData,
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
