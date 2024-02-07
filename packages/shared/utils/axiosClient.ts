/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

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
      window.DocSpaceConfig?.api?.origin || apiOrigin || window.location.origin;
    const proxy = window.DocSpaceConfig?.proxy?.url || proxyURL;
    const prefix = window.DocSpaceConfig?.api?.prefix || apiPrefix;

    let headers = null;

    if (apiOrigin !== "") {
      headers = {
        "Access-Control-Allow-Credentials": "true",
      };
    }

    const shareIndex = window.location.pathname.indexOf("share");
    const sharedIndex = window.location.pathname.indexOf("shared");

    const lastKeySymbol = window.location.search.indexOf("&");
    const lastIndex =
      lastKeySymbol === -1 ? window.location.search.length : lastKeySymbol;
    const publicRoomKey =
      shareIndex > -1 && sharedIndex === -1
        ? window.location.search.substring(5, lastIndex)
        : null;

    if (publicRoomKey) {
      headers = { ...headers, "Request-Token": publicRoomKey };
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
      DocSpaceConfig: window.DocSpaceConfig,
      paymentsURL,
    });

    this.client = axios.create(apxiosConfig);
  };

  initSSR = (headers: Record<string, string>) => {
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

  getResponseError = (res: TRes) => {
    if (!res) return;

    if (res.data && res.data.error) {
      return res.data.error.message;
    }

    if (res.isAxiosError && res.message) {
      // console.error(res.message);
      return res.message;
    }
  };

  request = (
    options: TReqOption & AxiosRequestConfig,
    skipRedirect = false,
  ) => {
    const onSuccess = (response: TRes) => {
      const error = this.getResponseError(response);

      if (error) throw new Error(error);

      if (response.headers["x-redirect-uri"] && options.withRedirect) {
        const redirectUri = response.headers["x-redirect-uri"];

        if (typeof redirectUri === "string")
          return window.location.replace(redirectUri);
      }

      if (!response || !response.data || response.isAxiosError) return null;

      if (
        response.data &&
        typeof response.data !== "string" &&
        "total" in response.data
      )
        return {
          total: response.data.total ? +response.data.total : 0,
          items: response.data.response,
        };

      if (response.request?.responseType === "text") return response.data;

      if (options.baseURL === "/apisystem" && !response.data.response)
        return response.data;

      return typeof response.data.response !== "undefined"
        ? response.data.response
        : response.data;
    };

    const onError = (error: TError) => {
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
            const pathname = window.location.pathname;
            const isArchived = pathname.indexOf("/rooms/archived") !== -1;

            const isRooms =
              pathname.indexOf("/rooms/shared") !== -1 || isArchived;

            if (isRooms && !skipRedirect) {
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
    return this.client?.(options).then(onSuccess).catch(onError);
  };
}

export default AxiosClient;
