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
import { RoomsApi } from "@onlyoffice/docspace-api-typescript";

import AxiosClient, {
  TReqOption,
  dsApiConfiguration,
  TError,
} from "../utils/axiosClient";
import { combineUrl } from "../utils/combineUrl";

const { proxy: proxyConf } = defaultConfig;
const { url: proxyURL } = proxyConf;

const client = new AxiosClient();

class EnhancedRoomsApi extends RoomsApi {
  constructor() {
    super(dsApiConfiguration);
  }

  async makeApiRequest<T>(
    apiMethod: keyof RoomsApi,
    args: unknown[] = [],
    options: ApiOptions = {},
    skipRedirect = false,
    isOAuth = false,
  ): Promise<T> {
    try {
      const response = await (this[apiMethod] as Function)(...args, options);

      const error = client.getResponseError(response);
      if (error) throw new Error(error);

      if (response.headers?.["x-redirect-uri"] && options.withRedirect) {
        const redirectUri = response.headers["x-redirect-uri"];
        if (typeof redirectUri === "string" && typeof window !== "undefined") {
          return window.location.replace(redirectUri) as unknown as T;
        }
      }

      if (!response || !response.data || response.isAxiosError)
        return null as unknown as T;

      if (
        response.data &&
        typeof response.data !== "string" &&
        typeof response.data === "object" &&
        "total" in response.data
      ) {
        return {
          total: response.data.total ? +response.data.total : 0,
          items: response.data.response,
        } as unknown as T;
      }

      if (response.request?.responseType === "text") return response.data;

      if (options.baseURL === "/apisystem" && !response.data.response) {
        return response.data;
      }

      if (isOAuth && !response.data.response) return response.data;

      return response.data.response;
    } catch (errorParam) {
      const error = errorParam as TError;
      console.log("Request Failed:", { error });

      if (error?.response?.status === 401 && client.isSSR) {
        error.response.data = {
          ...error?.response?.data,
          error: { ...error?.response?.data?.error, message: 401 },
        };
      }

      const loginURL = combineUrl(proxyURL, "/login");

      if (typeof window !== "undefined" && !client.isSSR) {
        switch (error.response?.status) {
          case 401: {
            if (options.skipUnauthorized)
              return Promise.resolve() as unknown as T;

            if (options.skipLogout) {
              if (error instanceof Error) {
                throw error;
              } else {
                const wrappedError = new Error(
                  error?.message || "Unknown error",
                );
                Object.assign(wrappedError, error);
                throw wrappedError;
              }
            }

            console.log("Debug is SDK frame", window?.ClientConfig?.isFrame);

            if (window?.ClientConfig?.isFrame) {
              break;
            }

            const opt: AxiosRequestConfig = {
              method: "POST",
              url: "/authentication/logout",
            };

            client.request(opt)?.then(() => {
              client.setWithCredentialsStatus(false);
              window.location.href = `${loginURL}?authError=true`;
            });
            break;
          }
          case 402:
            if (!window.location.pathname.includes("payments")) {
              // window.location.href = client.paymentsURL;
            }
            break;
          case 403: {
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
          case 429: {
            const limitError = new Error("Request limit exceeded");
            Object.assign(limitError, error);
            throw limitError;
          }
          default:
            break;
        }

        if (error instanceof Error) {
          throw error;
        } else {
          const wrappedError = new Error(error?.message || "Unknown error");
          Object.assign(wrappedError, error);
          throw wrappedError;
        }
      }

      if (error.response?.status === 401) {
        return Promise.resolve() as unknown as T;
      }

      if (error instanceof Error) {
        throw error;
      } else {
        const wrappedError = new Error(error?.message || "Unknown error");
        Object.assign(wrappedError, error);
        throw wrappedError;
      }
    }
  }
}

const enhancedRoomsApi = new EnhancedRoomsApi();

// Define a more specific interface for the options
interface ApiOptions extends TReqOption, AxiosRequestConfig {
  skipRedirect?: boolean;
  isOAuth?: boolean;
  withRedirect?: boolean;
}

export const roomsClient = new Proxy(enhancedRoomsApi, {
  get(target, prop: string | symbol) {
    const originalProperty = Reflect.get(target, prop);

    if (typeof originalProperty === "function" && prop !== "makeApiRequest") {
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
          prop as keyof RoomsApi,
          args,
          options,
          skipRedirect,
          isOAuth,
        );
      };
    }

    return originalProperty;
  },
});

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
