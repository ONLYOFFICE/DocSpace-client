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

import axios, {
  type InternalAxiosRequestConfig,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import defaultConfig from "PUBLIC_DIR/scripts/config.json";

import { combineUrl } from "./combineUrl";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { isOAuthFrame, requestAuthToken } from "./oauthToken";
import { frameCallEvent } from "./common";
import { isPortalNotFoundRedirectClaimed } from "./portalNotFound";

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

/**
 * A request the client handles itself rather than passing straight through —
 * the same idea as Playwright's `page.route`, and the same two ways of doing
 * it: answer in place of the server, or let the request go and rewrite what
 * comes back.
 *
 * Both work on the raw payload, i.e. what sits in `data`, so they deal in the
 * envelope the real endpoint uses (`{ response }`, plus `total` for the list
 * endpoints) — `request` unwraps the result exactly as it unwraps a real one.
 *
 * Prefer `transform` whenever the real answer is worth having: rewriting one
 * field of a genuine response cannot get the other fields wrong, and a
 * fabricated payload always can.
 */
export type TRouteMock = {
  match: (config: InternalAxiosRequestConfig) => boolean;
  /** Answer without sending anything. */
  fulfill?: (config: InternalAxiosRequestConfig) => unknown | Promise<unknown>;
  /** Send as usual, then rewrite the payload that came back. */
  transform?: (data: unknown, config: InternalAxiosRequestConfig) => unknown;
};

class AxiosClient {
  isSSR = false;

  paymentsURL = "";

  client: AxiosInstance | null = null;

  authToken: string | null = null;

  private routeMocks: TRouteMock[] = [];

  private oauthReady: Promise<void> | null = null;

  private oauthRefreshing: Promise<string | null> | null = null;

  private oauthGeneration = 0;

  private oauthUnavailable = false;

  constructor() {
    if (typeof window !== "undefined") this.initCSR();
  }

  /**
   * Take over the requests `mock.match` claims, for as long as the returned
   * function has not been called. Nothing is intercepted until something
   * registers, so the cost of this when no mock is up is one empty-array check
   * per request.
   */
  interceptRoute = (mock: TRouteMock) => {
    this.routeMocks.push(mock);

    return () => {
      this.routeMocks = this.routeMocks.filter((item) => item !== mock);
    };
  };

  /**
   * Answers the request from a registered mock by swapping in an adapter — the
   * one place axios lets a request be resolved without going to the network,
   * and the reason this hangs off the request interceptor rather than the
   * response one (by then the request has already been sent).
   */
  private applyRouteMock = (config: InternalAxiosRequestConfig) => {
    if (!this.routeMocks.length) return false;

    const mock = this.routeMocks.find(
      (item) => item.fulfill && item.match(config),
    );
    if (!mock?.fulfill) return false;

    const { fulfill } = mock;

    config.adapter = async () =>
      ({
        data: await fulfill(config),
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }) as AxiosResponse;

    return true;
  };

  /**
   * Hands a real response to the mock that claimed it, so it can rewrite the
   * payload. Runs on the way back, which is the whole point: everything the
   * mock does not touch is what the server actually said.
   */
  private applyRouteTransform = (response: AxiosResponse) => {
    if (!this.routeMocks.length) return response;

    const mock = this.routeMocks.find(
      (item) =>
        item.transform &&
        item.match(response.config as InternalAxiosRequestConfig),
    );
    if (!mock?.transform) return response;

    response.data = mock.transform(
      response.data,
      response.config as InternalAxiosRequestConfig,
    );

    return response;
  };

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

        // A mocked request never leaves the browser, so it needs none of the
        // auth work below — and must not wait on an OAuth token to be issued.
        if (this.applyRouteMock(config)) return config;

        const urlParams = new URLSearchParams(window.location.search);
        const publicRoomKey = urlParams.get("key") || urlParams.get("share");

        if (isOAuthFrame()) {
          config.withCredentials = false;
          return this.ensureOAuthToken().then(() => {
            if (this.authToken) {
              config.headers = config.headers || {};
              config.headers["Authorization"] = `Bearer ${this.authToken}`;
            }
            return config;
          });
        }

        if (publicRoomKey) {
          config.headers = config.headers || {};
          config.headers["Request-Token"] = publicRoomKey;
        } else {
          const cookie = getCookie("asc_auth_key");
          const token = cookie || this.authToken;
          if (token) {
            config.headers = config.headers || {};
            config.headers["Authorization"] = token;
          }
        }

        return config;
      },
    );

    this.client.interceptors.response.use(this.applyRouteTransform);
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

  setAuthToken = (token: string | null) => {
    this.authToken = token;
    this.oauthGeneration += 1;
    if (token) this.oauthUnavailable = false;
  };

  getOAuthToken = async (): Promise<string | null> => {
    if (typeof window !== "undefined" && isOAuthFrame())
      await this.ensureOAuthToken();
    return this.authToken;
  };

  refreshOAuthToken = (): Promise<string | null> => {
    if (typeof window === "undefined" || !isOAuthFrame())
      return Promise.resolve(null);
    if (this.oauthRefreshing !== null) return this.oauthRefreshing;

    this.oauthGeneration += 1;
    this.oauthRefreshing = requestAuthToken()
      .then((token) => {
        if (token) {
          this.authToken = token;
          this.oauthUnavailable = false;
        } else {
          frameCallEvent({
            event: "onAuthError",
            data: { code: "TOKEN_REFRESH_FAILED", message: "unauthorized" },
          });
        }
        return token;
      })
      .finally(() => {
        this.oauthRefreshing = null;
      });

    return this.oauthRefreshing;
  };

  private ensureOAuthToken = (): Promise<void> => {
    if (this.authToken) return Promise.resolve();
    if (this.oauthUnavailable) return Promise.resolve();
    if (this.oauthReady !== null) return this.oauthReady;

    const generation = this.oauthGeneration;
    const ready = requestAuthToken()
      .then((token) => {
        if (generation !== this.oauthGeneration) return;
        if (token) {
          this.authToken = token;
          this.oauthUnavailable = false;
        } else {
          this.oauthUnavailable = true;
          frameCallEvent({
            event: "onAuthError",
            data: { code: "TOKEN_UNAVAILABLE", message: "unauthorized" },
          });
        }
      })
      .finally(() => {
        if (this.oauthReady === ready) this.oauthReady = null;
      });

    this.oauthReady = ready;
    return ready;
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
        const w = window as unknown as { __redirectToLogin?: boolean };
        if (w.__redirectToLogin || isPortalNotFoundRedirectClaimed())
          return Promise.resolve();

        switch (error.response?.status) {
          case 401: {
            if (options.skipUnauthorized) return Promise.resolve();

            if (options.skipLogout) return Promise.reject(error);

            if (isOAuthFrame()) {
              const opts = options as TReqOption &
                AxiosRequestConfig & { _oauthRetried?: boolean };

              const signalAuthError = (): Promise<void> => {
                frameCallEvent({
                  event: "onAuthError",
                  data: { code: "UNAUTHORIZED", message: "unauthorized" },
                });
                return Promise.reject(error);
              };

              if (opts._oauthRetried) return signalAuthError();

              opts._oauthRetried = true;

              return this.refreshOAuthToken().then((token) => {
                if (token)
                  return this.request<T>(
                    opts,
                    skipRedirect,
                    isOAuth,
                  ) as unknown as Promise<void>;

                return Promise.reject(error);
              });
            }

            console.log("debug is SDK frame", window?.ClientConfig?.isFrame);

            if (window?.ClientConfig?.isFrame) {
              break;
            }

            const opt: AxiosRequestConfig = {
              method: "POST",
              url: "/authentication/logout",
            };

            w.__redirectToLogin = true;
            this.request(opt)?.then(() => {
              // Re-check: the guard at the top of onError ran before the
              // logout roundtrip, and /settings may have answered 404 in the
              // meantime. The wrong-portal-name navigation started by that
              // 404 must not be cancelled with a trip to the login page.
              if (isPortalNotFoundRedirectClaimed()) return;

              this.setWithCredentialsStatus(false);
              window.location.href = `${loginURL}?authError=true`;
            });
            return Promise.resolve();
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
      Promise<T> | undefined;
  };
}

export default AxiosClient;
