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

// Goes through the client's own `request`, not a second axios: that is what
// carries auth, the public-room token, the unwrapped envelope and 401 handling.

import { request } from "@docspace/shared/api/client";

import type {
  PluginAPIClient,
  PluginApiError,
  PluginApiMethod,
  PluginApiOptions,
  PluginApiRequest,
} from "@onlyoffice/docspace-plugin-sdk/react";

// `api` is the portal: an absolute URL (axios honours it over the base URL) or a
// traversal is refused. Only the route is judged, never the query string.
const isPortalPath = (path: string) => {
  const [route] = path.split("?");

  return (
    route.startsWith("/") &&
    !route.startsWith("//") &&
    !route.includes("..") &&
    !/^\/[a-z][a-z\d+.-]*:/i.test(route)
  );
};

const buildError = (
  method: PluginApiMethod,
  path: string,
  message: string,
  status: number,
  code?: PluginApiError["code"],
  details?: unknown,
): PluginApiError => {
  const error = new Error(message) as Error & Partial<PluginApiError>;

  error.name = "PluginApiError";
  error.status = status;
  error.request = `${method} ${path}`;
  if (code) error.code = code;
  if (details !== undefined) error.details = details;

  return error as PluginApiError;
};

type TAxiosLikeError = {
  name?: string;
  code?: string;
  message?: string;
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
};

// The portal names the locked file or the full quota in the body; losing it
// turns every failure into the same unhelpful toast.
const messageFromBody = (data: unknown): string => {
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    const body = data as {
      error?: { message?: unknown };
      message?: unknown;
    };
    const message = body.error?.message ?? body.message;

    if (typeof message === "string") return message;
  }

  return "";
};

const normalizeError = (
  cause: unknown,
  method: PluginApiMethod,
  path: string,
): PluginApiError => {
  const error = (cause ?? {}) as TAxiosLikeError;

  if (error.code === "ERR_CANCELED" || error.name === "CanceledError")
    return buildError(method, path, "Request aborted", 0, "ABORTED");

  const { response } = error;

  if (!response)
    return buildError(
      method,
      path,
      error.message || "Request failed",
      0,
      "NETWORK",
    );

  const status = response.status ?? 0;
  const message =
    messageFromBody(response.data) ||
    error.message ||
    response.statusText ||
    `Request failed with status ${status}`;

  return buildError(method, path, message, status, undefined, response.data);
};

/**
 * Builds the API client handed to a React plugin through the runtime.
 */
export const createPluginApi = (): PluginAPIClient => {
  const send = async <T>({
    path,
    method = "GET",
    params,
    data,
    headers,
    signal,
  }: PluginApiRequest): Promise<T> => {
    if (!path || !isPortalPath(path))
      throw buildError(
        method,
        path,
        `"${path}" is not a portal API path. Paths are relative to the API base URL, e.g. "/files/@my".`,
        0,
        "INVALID_PATH",
      );

    try {
      const result = await request<T>(
        {
          method,
          url: path,
          params,
          data,
          headers,
          signal,
          // A refused plugin request is the plugin's to report, not a reason to
          // navigate the user out of the folder.
          skipForbidden: true,
        },
        true,
      );

      return result as T;
    } catch (cause) {
      throw normalizeError(cause, method, path);
    }
  };

  const withBody =
    (method: PluginApiMethod) =>
    <T>(path: string, data?: unknown, options?: PluginApiOptions) =>
      send<T>({ ...options, method, path, data });

  return {
    request: send,

    get: <T>(
      path: string,
      params?: Record<string, unknown>,
      options?: PluginApiOptions,
    ) =>
      send<T>({
        ...options,
        method: "GET",
        path,
        params: { ...options?.params, ...params },
      }),

    post: withBody("POST"),
    put: withBody("PUT"),
    patch: withBody("PATCH"),
    delete: withBody("DELETE"),
  };
};
