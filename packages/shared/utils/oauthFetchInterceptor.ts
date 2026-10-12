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

import { resolveOAuthToken, refreshOAuthToken } from "../api/client";
import { isOAuthFrame } from "./oauthToken";

const API_PATH_PREFIX = "/api/2.0/";

let installed = false;

export const installOAuthFetchInterceptor = (): void => {
  if (installed || typeof window === "undefined") return;
  if (!isOAuthFrame()) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    if (input instanceof Request) return originalFetch(input, init);

    let url: URL;
    try {
      url = new URL(String(input), window.location.origin);
    } catch {
      return originalFetch(input, init);
    }
    if (
      url.origin !== window.location.origin ||
      !url.pathname.startsWith(API_PATH_PREFIX)
    )
      return originalFetch(input, init);

    const base = new Headers(init?.headers);
    if (base.has("Authorization") || base.has("Request-Token"))
      return originalFetch(input, init);

    const dispatch = async (token: string | null): Promise<Response> => {
      if (!token) return originalFetch(input, init);
      const headers = new Headers(base);
      headers.set("Authorization", `Bearer ${token}`);
      return originalFetch(input, { ...init, headers });
    };

    const token = await resolveOAuthToken();
    let response = await dispatch(token);

    const bodyReusable = !(
      typeof ReadableStream !== "undefined" &&
      init?.body instanceof ReadableStream
    );
    if (
      response.status === 401 &&
      token &&
      bodyReusable &&
      !init?.signal?.aborted
    ) {
      const fresh = await refreshOAuthToken();
      if (fresh && fresh !== token) response = await dispatch(fresh);
    }

    return response;
  };
};
