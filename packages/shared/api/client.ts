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
import { RoomsApi, FilesFilesApi } from "@onlyoffice/docspace-api-typescript";

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

class EnhancedApiClient<T extends BaseApiClass> {
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
      return this.processSuccessResponse<R>(response, options, isOAuth);
    } catch (errorParam) {
      return this.handleApiError<R>(errorParam, options, skipRedirect);
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
    if (error) {
      throw new Error(error);
    }

    return response;
  }

  private handleRedirect(
    response: { headers?: Record<string, string | string[]> },
    options: ApiOptions,
  ): void {
    if (response.headers?.["x-redirect-uri"] && options.withRedirect) {
      const redirectUri = response.headers["x-redirect-uri"];
      if (typeof redirectUri === "string" && typeof window !== "undefined") {
        window.location.replace(redirectUri);
      }
    }
  }

  private processSuccessResponse<R>(
    response: any,
    options: ApiOptions,
    isOAuth: boolean,
  ): R {
    if (!response || !response.data || response.isAxiosError) {
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

    if (options.baseURL === "/apisystem" && !response.data.response) {
      return response.data;
    }

    if (isOAuth && !response.data.response) {
      return response.data;
    }

    return response.data.response;
  }

  private isPaginatedResponse(
    data: unknown,
  ): data is { total: unknown; response: unknown } {
    return Boolean(
      data &&
        typeof data !== "string" &&
        typeof data === "object" &&
        data !== null &&
        "total" in (data as Record<string, unknown>),
    );
  }

  private async handleApiError<R>(
    errorParam: unknown,
    options: ApiOptions,
    skipRedirect: boolean,
  ): Promise<R> {
    const error = errorParam as TError;
    console.log("Request Failed", { error });

    this.handleSSRUnauthorized(error);
    if (typeof window !== "undefined" && !client.isSSR) {
      return this.handleClientSideError<R>(error, options, skipRedirect);
    }

    return this.handleServerSideError<R>(error);
  }

  private handleSSRUnauthorized(error: TError): void {
    if (error?.response?.status === 401 && client.isSSR) {
      error.response.data = {
        ...error?.response?.data,
        error: { ...error?.response?.data?.error, message: 401 },
      };
    }
  }

  private async handleClientSideError<R>(
    error: TError,
    options: ApiOptions,
    skipRedirect: boolean,
  ): Promise<R> {
    const statusCode = error.response?.status;

    switch (statusCode) {
      case 401:
        return this.handleUnauthorizedError<R>(error, options);

      case 402:
        this.handlePaymentRequired();
        break;

      case 403:
        this.handleForbiddenError(skipRedirect);
        break;

      case 429:
        this.handleRateLimitError(error);
        break;
    }

    throw this.wrapError(error);
  }

  private async handleUnauthorizedError<R>(
    error: TError,
    options: ApiOptions,
  ): Promise<R> {
    if (options.skipUnauthorized) {
      return null as unknown as R;
    }

    if (options.skipLogout) {
      throw this.wrapError(error);
    }

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

  private handleForbiddenError(skipRedirect: boolean): void {
    const { pathname } = window.location;
    const isArchived = pathname.indexOf("/rooms/archived") !== -1;
    const isRooms = pathname.indexOf("/rooms/shared") !== -1 || isArchived;

    if (isRooms && !skipRedirect && !window?.ClientConfig?.isFrame) {
      setTimeout(() => {
        window.DocSpace.navigate(isArchived ? "/archived" : "/");
      }, 1000);
    }
  }

  private handleRateLimitError(error: TError): void {
    const limitError = new Error("Request limit exceeded");
    Object.assign(limitError, error);
    throw limitError;
  }

  private async performLogout(): Promise<void> {
    const loginURL = combineUrl(proxyURL, "/login");

    const logoutOptions: AxiosRequestConfig = {
      method: "POST",
      url: "/authentication/logout",
    };

    try {
      await client.request(logoutOptions);
      client.setWithCredentialsStatus(false);
      window.location.href = `${loginURL}?authError=true`;
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      window.location.href = `${loginURL}?authError=true`;
    }
  }

  private handleServerSideError<R>(error: TError): Promise<R> {
    if (error.response?.status === 401) {
      return Promise.resolve(null as unknown as R);
    }

    throw this.wrapError(error);
  }

  private wrapError(error: TError): Error {
    if (error instanceof Error) {
      return error;
    }

    const wrappedError = new Error(error?.message || "Unknown error");
    Object.assign(wrappedError, error);
    return wrappedError;
  }
}

const enhancedRoomsApi = new EnhancedApiClient(RoomsApi);
const enhancedFilesApi = new EnhancedApiClient(FilesFilesApi);

interface ApiOptions extends TReqOption, AxiosRequestConfig {
  skipRedirect?: boolean;
  isOAuth?: boolean;
  withRedirect?: boolean;
}

function createEnhancedApiProxy<T extends BaseApiClass>(
  enhancedApi: EnhancedApiClient<T>,
): EnhancedApiClient<T> & T {
  return new Proxy(enhancedApi, {
    get(target, prop: string | symbol) {
      const originalProperty = Reflect.get(target, prop);

      if (originalProperty !== undefined) {
        return originalProperty;
      }

      const apiProperty = Reflect.get(target.apiInstance, prop);

      if (typeof apiProperty === "function" && prop !== "makeApiRequest") {
        return function wrappedApiCall(...args: unknown[]) {
          const lastArg = args[args.length - 1];
          const isOptionsArg =
            lastArg && typeof lastArg === "object" && !Array.isArray(lastArg);

          const options: ApiOptions = isOptionsArg
            ? (args.pop() as ApiOptions)
            : {};
          const skipRedirect = options.skipRedirect || false;
          const isOAuth = options.isOAuth || false;

          return target.makeApiRequest(
            prop as keyof T,
            args,
            options,
            skipRedirect,
            isOAuth,
          );
        };
      }

      return apiProperty;
    },
  }) as EnhancedApiClient<T> & T;
}

export const roomsClient = createEnhancedApiProxy(enhancedRoomsApi);
export const filesClient = createEnhancedApiProxy(enhancedFilesApi);

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
