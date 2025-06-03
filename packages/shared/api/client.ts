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

import defaultConfig from "PUBLIC_DIR/scripts/config.json";
import { AxiosRequestConfig } from "axios";
import {
  RoomsApi,
  FilesFilesApi,
  FilesFoldersApi,
  ApiKeysApi,
  GroupApi,
  SecurityOAuth2Api,
  SettingsWebpluginsApi,
  PortalPaymentApi,
  PortalQuotaApi,
  PortalUsersApi,
  FilesSharingApi,
  FilesQuotaApi,
  FilesSettingsApi,
} from "@onlyoffice/docspace-api-typescript";

import AxiosClient, {
  TReqOption,
  dsApiConfiguration,
  TError,
} from "../utils/axiosClient";
import { combineUrl } from "../utils/combineUrl";

const { proxy: proxyConf } = defaultConfig;
const { url: proxyURL } = proxyConf;

const client = new AxiosClient();
interface BaseApiClass {
  [key: string]: any;
}

class ApiClient<T extends BaseApiClass> {
  public apiInstance: T;

  constructor(
    ApiClass: new (
      configuration?: typeof dsApiConfiguration,
      basePath?: string,
      axios?: any,
    ) => T,
  ) {
    this.apiInstance = new ApiClass(dsApiConfiguration);
  }

  async makeApiRequest<R>(
    apiMethod: keyof T,
    args: unknown[] = [],
    options: ApiOptions = {},
    skipRedirect = false,
    isOAuth = false,
  ): Promise<R> {
    try {
      const response = await this.executeApiMethod(apiMethod, args, options);
      this.handleRedirect(response, options);
      return this.processResponse<R>(response, options, isOAuth);
    } catch (error) {
      return this.handleError<R>(error, options, skipRedirect);
    }
  }

  private async executeApiMethod(
    apiMethod: keyof T,
    args: unknown[],
    options: ApiOptions,
  ) {
    const method = this.apiInstance[apiMethod] as Function;
    if (typeof method !== "function") {
      throw new Error(`Method ${String(apiMethod)} not found on API instance`);
    }

    const response = await method.call(this.apiInstance, ...args, options);
    const error = client.getResponseError(response);
    if (error) throw new Error(error);

    return response;
  }

  private handleRedirect(
    response: { headers?: Record<string, string | string[]> },
    options: ApiOptions,
  ): void {
    const redirectUri = response.headers?.["x-redirect-uri"];
    if (
      redirectUri &&
      options.withRedirect &&
      typeof redirectUri === "string" &&
      typeof window !== "undefined"
    ) {
      window.location.replace(redirectUri);
    }
  }

  private processResponse<R>(
    response: any,
    options: ApiOptions,
    isOAuth: boolean,
  ): R {
    if (!response?.data || response.isAxiosError) {
      return null as unknown as R;
    }

    if (this.isPaginatedResponse(response.data)) {
      return {
        total: response.data.total ? +response.data.total : 0,
        items: response.data.response,
      } as unknown as R;
    }

    if (response.request?.responseType === "text") {
      return response.data;
    }

    if (
      (options.baseURL === "/apisystem" || isOAuth) &&
      !response.data.response
    ) {
      return response.data;
    }

    return response.data.response;
  }

  private isPaginatedResponse(
    data: unknown,
  ): data is { total: unknown; response: unknown } {
    return Boolean(
      data &&
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data) &&
        typeof data !== "string" &&
        "total" in (data as Record<string, unknown>),
    );
  }

  private async handleError<R>(
    error: unknown,
    options: ApiOptions,
    skipRedirect: boolean,
  ): Promise<R> {
    const typedError = error as TError;
    console.log("Request Failed", { error: typedError });

    if (typedError?.response?.status === 401 && client.isSSR) {
      typedError.response.data = {
        ...typedError.response.data,
        error: { ...typedError.response.data?.error, message: 401 },
      };
    }

    if (typeof window !== "undefined" && !client.isSSR) {
      return this.handleClientError<R>(typedError, options, skipRedirect);
    }

    if (typedError.response?.status === 401) {
      return Promise.resolve(null as unknown as R);
    }

    throw this.wrapError(typedError);
  }

  private async handleClientError<R>(
    error: TError,
    options: ApiOptions,
    skipRedirect: boolean,
  ): Promise<R> {
    const status = error.response?.status;

    switch (status) {
      case 401:
        return this.handleUnauthorized<R>(error, options);
      case 402:
        this.handlePaymentRequired();
        break;
      case 403:
        this.handleForbidden(skipRedirect);
        break;
      case 429:
        throw this.createRateLimitError(error);
    }

    throw this.wrapError(error);
  }

  private async handleUnauthorized<R>(
    error: TError,
    options: ApiOptions,
  ): Promise<R> {
    if (options.skipUnauthorized) return null as unknown as R;
    if (options.skipLogout) throw this.wrapError(error);

    console.log("Debug is SDK frame", window?.ClientConfig?.isFrame);

    if (!window?.ClientConfig?.isFrame) {
      await this.performLogout();
    }

    throw this.wrapError(error);
  }

  private handlePaymentRequired(): void {
    if (!window.location.pathname.includes("payments")) {
      // Future: redirect to payments page
      // window.location.href = client.paymentsURL;
    }
  }

  private handleForbidden(skipRedirect: boolean): void {
    const { pathname } = window.location;
    const isArchived = pathname.includes("/rooms/archived");
    const isRooms = pathname.includes("/rooms/shared") || isArchived;

    if (isRooms && !skipRedirect && !window?.ClientConfig?.isFrame) {
      setTimeout(() => {
        window.DocSpace.navigate(isArchived ? "/archived" : "/");
      }, 1000);
    }
  }

  private createRateLimitError(error: TError): Error {
    const limitError = new Error("Request limit exceeded");
    return Object.assign(limitError, error);
  }

  private async performLogout(): Promise<void> {
    const loginURL = combineUrl(proxyURL, "/login");

    try {
      await client.request({ method: "POST", url: "/authentication/logout" });
      client.setWithCredentialsStatus(false);
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      window.location.href = `${loginURL}?authError=true`;
    }
  }

  private wrapError(error: TError): Error {
    if (error instanceof Error) return error;

    const wrappedError = new Error(error?.message || "Unknown error");
    return Object.assign(wrappedError, error);
  }
}

const enhancedRoomsApi = new ApiClient(RoomsApi);
const enhancedFilesApi = new ApiClient(FilesFilesApi);
const enhancedFoldersApi = new ApiClient(FilesFoldersApi);
const enhancedApiKeysApi = new ApiClient(ApiKeysApi);
const enhancedGroupApi = new ApiClient(GroupApi);
const enhancedOAuth2Api = new ApiClient(SecurityOAuth2Api);
const enhancedWebpluginsApi = new ApiClient(SettingsWebpluginsApi);
const enhancedPaymentApi = new ApiClient(PortalPaymentApi);
const enhancedQuotaApi = new ApiClient(PortalQuotaApi);
const enhancedUsersApi = new ApiClient(PortalUsersApi);
const enhancedSharingApi = new ApiClient(FilesSharingApi);
const enhancedFilesQuotaApi = new ApiClient(FilesQuotaApi);
const enhancedFilesSettingsApi = new ApiClient(FilesSettingsApi);

interface ApiOptions extends TReqOption, AxiosRequestConfig {
  skipRedirect?: boolean;
  isOAuth?: boolean;
  withRedirect?: boolean;
}

function createApiProxy<T extends BaseApiClass>(
  apiClient: ApiClient<T>,
): ApiClient<T> & T {
  const methodCache = new Map<string | symbol, Function>();

  return new Proxy(apiClient, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof ApiClient<T>];
      }

      if (methodCache.has(prop)) {
        return methodCache.get(prop);
      }

      const apiProperty = target.apiInstance[prop as keyof T];

      if (typeof apiProperty === "function" && prop !== "makeApiRequest") {
        const wrappedMethod = function (...args: unknown[]) {
          const lastArg = args[args.length - 1];
          const isOptions =
            lastArg &&
            typeof lastArg === "object" &&
            !Array.isArray(lastArg) &&
            lastArg.constructor === Object;

          const options: ApiOptions = isOptions
            ? (args.pop() as ApiOptions)
            : {};

          return target.makeApiRequest(
            prop as keyof T,
            args,
            options,
            options.skipRedirect ?? false,
            options.isOAuth ?? false,
          );
        };

        methodCache.set(prop, wrappedMethod);
        return wrappedMethod;
      }

      return apiProperty;
    },
  }) as ApiClient<T> & T;
}

export const roomsClient = createApiProxy(enhancedRoomsApi);
export const filesClient = createApiProxy(enhancedFilesApi);
export const foldersClient = createApiProxy(enhancedFoldersApi);
export const apiKeysClient = createApiProxy(enhancedApiKeysApi);
export const groupClient = createApiProxy(enhancedGroupApi);
export const oauth2Client = createApiProxy(enhancedOAuth2Api);
export const webpluginsClient = createApiProxy(enhancedWebpluginsApi);
export const paymentClient = createApiProxy(enhancedPaymentApi);
export const quotaClient = createApiProxy(enhancedQuotaApi);
export const usersClient = createApiProxy(enhancedUsersApi);
export const sharingClient = createApiProxy(enhancedSharingApi);
export const filesQuotaClient = createApiProxy(enhancedFilesQuotaApi);
export const filesSettingsClient = createApiProxy(enhancedFilesSettingsApi);

export const initSSR = (headers: Record<string, string>) => {
  client.initSSR(headers);
};

export const request = <T>(
  options: TReqOption & AxiosRequestConfig,
  skipRedirect = false,
  isOAuth = false,
): Promise<T> | undefined => {
  return client.request<T>(options, skipRedirect, isOAuth);
};

export const setWithCredentialsStatus = (state: boolean) => {
  return client.setWithCredentialsStatus(state);
};
