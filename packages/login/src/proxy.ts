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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OAuth2ErrorKey } from "./utils/enums";

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  const host = request.headers.get("x-forwarded-host");

  const proto = request.headers.get("x-forwarded-proto");

  const redirectUrl = `${proto}://${host}`;

  if (request.nextUrl.pathname === "/health") {
    requestHeaders.set("x-health-check", "true");

    return NextResponse.json(
      { status: "healthy" },
      { status: 200, headers: requestHeaders },
    );
  }

  if (request.nextUrl.pathname.includes("confirm")) {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const queryType = searchParams.get("type") ?? "";
    const posSeparator = request.nextUrl.pathname.lastIndexOf("/");
    const type = posSeparator
      ? request.nextUrl.pathname?.slice(posSeparator + 1)
      : queryType;

    let queryString: string;
    if (queryType) {
      searchParams.set("type", type);
      queryString = searchParams.toString();
    } else {
      queryString = `type=${type}&${searchParams.toString()}`;
    }

    requestHeaders.set("x-confirm-type", type);
    requestHeaders.set("x-confirm-query", searchParams.toString());

    const confirmUrl = `${request.nextUrl.origin}/login/confirm/${type}?${queryString}`;
    if (request.nextUrl.toString() == confirmUrl) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return NextResponse.redirect(
      `${request.nextUrl.origin}/confirm/${type}?${queryString}`,
    );
  }

  const isAuth = !!request.cookies.get("asc_auth_key")?.value;

  const isOAuth = request.nextUrl.searchParams.get("type") === "oauth2";
  const oauthClientId =
    request.nextUrl.searchParams.get("client_id") ??
    request.nextUrl.searchParams.get("clientId");
  if (isOAuth || oauthClientId) {
    if (oauthClientId === "error")
      return NextResponse.redirect(`${redirectUrl}/login/error`);

    const error = request.nextUrl.searchParams.get("error");
    if (error && error !== OAuth2ErrorKey.missing_asc_cookie_error) {
      return NextResponse.redirect(
        `${redirectUrl}/login/error?oauthMessageKey=${error}`,
      );
    }

    if (isAuth && !request.nextUrl.pathname.includes("consent")) {
      return NextResponse.redirect(
        `${redirectUrl}/login/consent${request.nextUrl.search}`,
      );
    }
  } else {
    const url = request.nextUrl.clone();
    url.pathname = "/";

    if (isAuth && redirectUrl) return NextResponse.redirect(redirectUrl);
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/health",
    "/",
    "/not-found",
    "/consent",
    "/login",
    "/confirm/:path*",
  ],
};
