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

import axios, {
  type InternalAxiosRequestConfig,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import defaultConfig from "PUBLIC_DIR/scripts/config.json";

import { combineUrl } from "./combineUrl";

const { api: apiConf, proxy: proxyConf } = defaultConfig;
const { origin: apiOrigin, prefix: apiPrefix, timeout: apiTimeout } = apiConf;
const { url: proxyURL } = proxyConf;

export type TError = {
  response?: {
    status: number;
    data?: {
      error: { message: number | string };
    };
  };
  message?: string;
};

export type TRes = {
  data?: {
    error?: {
      message?: string;
    };
    response: unknown;
    total?: number;
  };
  isAxiosError?: boolean;
  message?: string;
  request?: {
    responseType: string;
  };
  headers: { [key: string]: boolean | string };
};

export type TReqOption = {
  skipUnauthorized?: boolean;
  skipLogout?: boolean;
  withRedirect?: boolean;
  skipForbidden?: boolean;
};

class AxiosClient {
  isSSR = false;

  paymentsURL = "";

  client: AxiosInstance | null = null;

  constructor() {
    if (typeof window !== "undefined") this.initCSR();
  }

  initCSR = () => {
    this.isSSR = false;
    const origin =
      window.ClientConfig?.api?.origin || apiOrigin || window.location.origin;
    const proxy = window.ClientConfig?.proxy?.url || proxyURL;
    const prefix = window.ClientConfig?.api?.prefix || apiPrefix;

    let headers = null;

    if (apiOrigin !== "") {
      headers = {
        "Access-Control-Allow-Credentials": "true",
      };
    }

    const apiBaseURL = combineUrl(origin, proxy, prefix);
    const paymentsURL = combineUrl(
      proxy,
      "/portal-settings/payments/portal-payments",
    );
    this.paymentsURL = paymentsURL;

    const apxiosConfig: AxiosRequestConfig = {
      baseURL: apiBaseURL,
      responseType: "json",
      timeout: apiTimeout, // default is `0` (no timeout)
      withCredentials: true,
      headers: {},
    };

    if (headers) {
      apxiosConfig.headers = headers;
    }

    console.log("initCSR", {
      defaultConfig,
      apxiosConfig,
      ClientConfig: window.ClientConfig,
      paymentsURL,
    });

    this.client = axios.create(apxiosConfig);

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window === "undefined") return config;

        const urlParams = new URLSearchParams(window.location.search);
        const publicRoomKey = urlParams.get("key") || urlParams.get("share");

        if (publicRoomKey) {
          config.headers = config.headers || {};
          config.headers["Request-Token"] = publicRoomKey;
        }

        return config;
      },
    );
  };

  initSSR = (headersParam: Record<string, string>) => {
    const headers = headersParam;
    this.isSSR = true;

    const proto = headers["x-forwarded-proto"]?.split(",").shift();
    const host = headers["x-forwarded-host"]?.split(",").shift();

    const origin = apiOrigin || `${proto}://${host}`;

    const apiBaseURL = combineUrl(origin, proxyURL, apiPrefix);

    if (!headers.cookie.includes(origin))
      headers.cookie = `${headers.cookie};x-docspace-address=${origin}`;

    const axiosConfig: AxiosRequestConfig = {
      baseURL: apiBaseURL,
      responseType: "json",
      timeout: apiTimeout,
      headers,
    };

    console.log("initSSR", {
      defaultConfig,
      axiosConfig,
    });

    this.client = axios.create(axiosConfig);
  };

  setWithCredentialsStatus = (state: boolean) => {
    if (this.client) this.client.defaults.withCredentials = state;
  };

  setClientBasePath = (path: string) => {
    if (!path || !this.client) return;

    this.client.defaults.baseURL = path;
  };

  getResponseError = (res: AxiosResponse | TRes) => {
    if (!res) return;

    if (res.data && res.data.error) {
      return res.data.error.message;
    }

    if (
      "isAxiosError" in res &&
      res.isAxiosError &&
      "message" in res &&
      res.message
    ) {
      // console.error(res.message);
      return res.message;
    }
  };

  request = <T>(
    options: TReqOption & AxiosRequestConfig,
    skipRedirect = false,
    isOAuth = false,
  ): Promise<T> | undefined => {
    const onSuccess = (response: AxiosResponse) => {
      const error = this.getResponseError(response);

      if (error) throw new Error(error);

      if (response.headers["x-redirect-uri"] && options.withRedirect) {
        const redirectUri = response.headers["x-redirect-uri"];

        if (typeof redirectUri === "string")
          return window.location.replace(redirectUri);
      }

      if (
        !response ||
        !response.data ||
        ("isAxiosError" in response && response.isAxiosError)
      )
        return null;

      if (
        response.data &&
        typeof response.data !== "string" &&
        typeof response.data === "object" &&
        "total" in response.data
      )
        return {
          total: response.data.total ? +response.data.total : 0,
          items: response.data.response,
        };

      if (response.request?.responseType === "text") return response.data;

      if (options.baseURL === "/apisystem" && !response.data.response)
        return response.data;

      if (isOAuth && !response.data.response) return response.data;

      return response.data.response;
    };

    const onError = (errorParam: TError) => {
      let error = errorParam;
      console.log("Request Failed:", { error });

      // let errorText = error.response
      //   ? this.getResponseError(error.response)
      //   : error.message;

      if (error?.response?.status === 401 && this.isSSR) {
        error.response.data = {
          ...error?.response?.data,
          error: { ...error?.response?.data?.error, message: 401 },
        };
      }

      const loginURL = combineUrl(proxyURL, "/login");

      if (!this.isSSR) {
        switch (error.response?.status) {
          case 401: {
            if (options.skipUnauthorized) return Promise.resolve();

            if (options.skipLogout) return Promise.reject(error);

            console.log("debug is SDK frame", window?.ClientConfig?.isFrame);

            if (window?.ClientConfig?.isFrame) {
              break;
            }

            const opt: AxiosRequestConfig = {
              method: "POST",
              url: "/authentication/logout",
            };

            this.request(opt)?.then(() => {
              this.setWithCredentialsStatus(false);
              window.location.href = `${loginURL}?authError=true`;
            });
            break;
          }
          case 402:
            if (!window.location.pathname.includes("payments")) {
              // window.location.href = this.paymentsURL;
            }
            break;
          case 403: {
            if (options.skipForbidden) break;
            const { pathname } = window.location;

            const isArchived = pathname.indexOf("/rooms/archived") !== -1;

            const isRooms =
              pathname.indexOf("/rooms/shared") !== -1 || isArchived;

            if (isRooms && !skipRedirect && !window?.ClientConfig?.isFrame) {
              setTimeout(() => {
                window.DocSpace.navigate(isArchived ? "/archived" : "/");
              }, 1000);
            }

            break;
          }
          case 429:
            error = { ...error, message: "Request limit exceeded" };
            break;
          default:
            break;
        }

        return Promise.reject(error);
      }

      switch (error.response?.status) {
        case 401:
          return Promise.resolve();

        default:
          break;
      }

      return Promise.reject(error);
    };
    return this.client?.(options).then(onSuccess).catch(onError) as
      | Promise<T>
      | undefined;
  };
}

export default AxiosClient;
