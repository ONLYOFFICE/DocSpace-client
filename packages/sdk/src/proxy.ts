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

import { sanitizeStylesUrl } from "@docspace/shared/utils/customStyles";

import {
  FILTER_HEADER,
  LIBRARY_ID_HEADER,
  LOCALE_HEADER,
  OAUTH_FRAME_HEADER,
  PATHNAME_HEADER,
  ROOM_ID_HEADER,
  SHARE_KEY_HEADER,
  STYLES_URL_HEADER,
  THEME_HEADER,
} from "@/utils/constants";
import { handlePublicRoomValidation } from "@/utils/middleware/handlePublicRoomValidation";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto");

  const requestHeaders = new Headers(request.headers);

  const redirectUrl = `${proto}://${host}`;

  requestHeaders.set(PATHNAME_HEADER, request.nextUrl.pathname);

  if (request.nextUrl.searchParams.get("auth") === "oauth")
    requestHeaders.set(OAUTH_FRAME_HEADER, "1");

  if (request.nextUrl.pathname === "/health") {
    console.log("Get sdk health check for portal: ", redirectUrl);

    requestHeaders.set("x-health-check", "true");

    return NextResponse.json(
      { status: "healthy" },
      { status: 200, headers: requestHeaders },
    );
  }

  if (request.nextUrl.pathname.includes("sdk")) {
    return NextResponse.redirect(`${redirectUrl}/sdk${request.nextUrl.search}`);
  }

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);

  let theme = searchParams.get("theme");
  const locale = searchParams.get("locale");
  const shareKey = searchParams.get("key");

  if (theme) {
    const firstChar = theme[0].toUpperCase();
    const rest = theme.slice(1).toLowerCase();

    theme = `${firstChar}${rest}`;
  }

  requestHeaders.set(THEME_HEADER, theme ?? "");
  requestHeaders.set(LOCALE_HEADER, locale ?? "");
  requestHeaders.set(SHARE_KEY_HEADER, shareKey ?? "");
  requestHeaders.set(STYLES_URL_HEADER, searchParams.get("stylesUrl") ?? "");

  if (request.nextUrl.pathname.includes("forms")) {
    const roomId = searchParams.get("roomId") ?? "";
    const libraryId = searchParams.get("libraryId") ?? "";

    requestHeaders.set(ROOM_ID_HEADER, roomId);
    requestHeaders.set(LIBRARY_ID_HEADER, libraryId);
    requestHeaders.set(FILTER_HEADER, searchParams.toString());

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (request.nextUrl.pathname.includes("personal-files")) {
    requestHeaders.set(FILTER_HEADER, searchParams.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (
    request.nextUrl.pathname.includes("ai-agents") ||
    request.nextUrl.pathname.includes("rooms")
  ) {
    requestHeaders.set(FILTER_HEADER, searchParams.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/private")) {
    requestHeaders.set(FILTER_HEADER, searchParams.toString());

    // CSP applied to /sdk/private/* only. We deliberately use 'unsafe-inline'
    // instead of nonces in v1: Next 16's <Script strategy="beforeInteractive">
    // inlines its bootstrap with a server-side nonce that doesn't survive
    // rehydration cleanly (server prerender vs client mismatch). A nonce-CSP
    // is a pentest-recommended follow-up once the inline script story is
    // sorted (e.g. via Scripts.tsx rewrite using external src).
    const isDev = process.env.NODE_ENV !== "production";

    // 'wasm-unsafe-eval' is required for hash-wasm's Argon2 implementation.
    // 'unsafe-inline' for styles is needed by styled-components 5.
    // Dev additionally allows 'unsafe-eval' for React Refresh runtime.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'"
      : "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'";

    // connect-src in dev needs ws: for HMR.
    // Production allows https: to avoid blocking S3/CloudFront fetches for
    // encrypted files — the backend's CSP header (served alongside this one)
    // already restricts connect-src to specific storage domains, so the
    // effective policy is their intersection.
    const connectSrc = isDev
      ? "connect-src 'self' ws: wss: http: https:"
      : "connect-src 'self' https:";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "font-src 'self' data:",
      connectSrc,
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "frame-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set(
      "Permissions-Policy",
      "clipboard-read=(self), clipboard-write=(self), camera=(), microphone=(), geolocation=()",
    );
    if (!isDev) {
      // HSTS only in production — local dev runs over plain http and would
      // poison the browser cache for the dev hostname otherwise.
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  if (request.nextUrl.pathname.includes("public-room")) {
    const validationResult = await handlePublicRoomValidation(
      request,
      requestHeaders,
      shareKey || "",
    );

    if (validationResult?.redirect) {
      return NextResponse.rewrite(
        new URL(validationResult.redirect, request.url),
        {
          headers: requestHeaders,
        },
      );
    }

    if (validationResult?.anonymousSessionKeyCookie) {
      const cookieNameValue = validationResult.anonymousSessionKeyCookie
        .split(";")[0]
        ?.trim();

      if (cookieNameValue) {
        const existingCookies = requestHeaders.get("cookie") || "";

        if (!existingCookies.includes("anonymous_session_key=")) {
          requestHeaders.set(
            "cookie",
            existingCookies
              ? `${existingCookies}; ${cookieNameValue}`
              : cookieNameValue,
          );
        }
      }
    }

    requestHeaders.set(FILTER_HEADER, searchParams.toString());

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    if (validationResult?.anonymousSessionKeyCookie) {
      response.headers.append(
        "Set-Cookie",
        validationResult.anonymousSessionKeyCookie,
      );
    }

    return response;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/health",
    "/sdk",
    "/room-selector",
    "/file-selector",
    "/public-room",
    "/public-room/password",
    "/forms",
    "/forms/:path*",
    "/personal-files",
    "/personal-files/:path*",
    "/ai-agents",
    "/ai-agents/:path*",
    "/rooms",
    "/rooms/:path*",
    "/private",
    "/private/:path*",
  ],
};

