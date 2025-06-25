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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OAuth2ErrorKey } from "./utils/enums";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
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
      return NextResponse.rewrite(confirmUrl, { headers: requestHeaders });
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
