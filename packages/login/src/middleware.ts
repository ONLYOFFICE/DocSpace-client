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

  console.log("HOST", host);
  const proto = request.headers.get("x-forwarded-proto");
  console.log("PROTO", proto);

  const redirectUrl = `${proto}://${host}`;
  console.log("REDIRECT_URL", redirectUrl);

  if (request.nextUrl.pathname === "/health") {
    console.log("Get login health check for portal: ", redirectUrl);

    requestHeaders.set("x-health-check", "true");

    return NextResponse.json(
      { status: "healthy" },
      { status: 200, headers: requestHeaders },
    );
  }

  if (request.nextUrl.pathname.includes("confirm")) {
    console.log("CONFIRM PATHNAME", request.nextUrl.pathname);
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const queryType = searchParams.get("type") ?? "";
    const posSeparator = request.nextUrl.pathname.lastIndexOf("/");
    console.log("POS_SEPARATOR", posSeparator);
    const type = !!posSeparator
      ? request.nextUrl.pathname?.slice(posSeparator + 1)
      : queryType;
    console.log("TYPE", type);

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
    console.log("CONFIRM URL", confirmUrl);
    if (request.nextUrl.toString() == confirmUrl) {
      console.log("Rewrite to confirm");
      return NextResponse.rewrite(confirmUrl, { headers: requestHeaders });
    }

    console.log("Redirect to confirm");
    return NextResponse.redirect(
      `${request.nextUrl.origin}/confirm/${type}?${queryString}`,
    );
  }

  console.log("Check auth");
  const isAuth = !!request.cookies.get("asc_auth_key")?.value;
  console.log("IS_AUTH", isAuth);

  const isOAuth = request.nextUrl.searchParams.get("type") === "oauth2";
  console.log("IS_OAUTH", isOAuth);
  const oauthClientId =
    request.nextUrl.searchParams.get("client_id") ??
    request.nextUrl.searchParams.get("clientId");
  console.log("OAUTH_CLIENT_ID", oauthClientId);
  if (isOAuth || oauthClientId) {
    console.log("Check oauth");
    if (oauthClientId === "error")
      return NextResponse.redirect(`${redirectUrl}/login/error`);

    const error = request.nextUrl.searchParams.get("error");
    console.log("ERROR", error);
    if (error && error !== OAuth2ErrorKey.missing_asc_cookie_error) {
      return NextResponse.redirect(
        `${redirectUrl}/login/error?oauthMessageKey=${error}`,
      );
    }

    if (isAuth && !request.nextUrl.pathname.includes("consent")) {
      console.log("Redirect to consent");
      return NextResponse.redirect(
        `${redirectUrl}/login/consent${request.nextUrl.search}`,
      );
    }
  } else {
    console.log("Check redirect");
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);

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
