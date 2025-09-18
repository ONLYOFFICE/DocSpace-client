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
  addAbortControllers,
}: UseDeveloperToolsProps) => {
  const [listItems, setListItems] = useState<TApiKey[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [errorKeys, setErrorKeys] = useState<Error | null>(null);

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

      setListItems(keys);
      setPermissions(permissionsData);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "CanceledError" || err.message === "canceled")
      ) {
        return;
      }

      toastr.error(err as Error);
      setErrorKeys(err as Error);
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
  }, [getJavascriptSDKData, getWebhooksData, getOAuthData, getKeysData]);

  return {
    getDeveloperToolsInitialValue,
    getJavascriptSDKData,
    getWebhooksData,
    getOAuthData,
    errorOAuth,
    getKeysData,
    errorKeys,
    listItems,
    setListItems,
    permissions,
  };
};

export default useDeveloperTools;
