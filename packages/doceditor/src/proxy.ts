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

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto");

  const requestHeaders = new Headers(request.headers);

  const redirectUrl = `${proto}://${host}`;

  if (request.nextUrl.pathname === "/health") {
    console.log("Get doceditor health check for portal: ", redirectUrl);

    requestHeaders.set("x-health-check", "true");

    return NextResponse.json(
      { status: "healthy" },
      { status: 200, headers: requestHeaders },
    );
  }

  if (request.nextUrl.pathname.includes("doceditor")) {
    return NextResponse.redirect(
      `${redirectUrl}/doceditor${request.nextUrl.search}`,
    );
  }

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);

  let theme = searchParams.get("theme");
  const locale = searchParams.get("locale");
  const shareKey = searchParams.get("share");
  const stylesUrl = sanitizeStylesUrl(searchParams.get("stylesUrl"));

  if (theme) {
    const firstChar = theme[0].toUpperCase();
    const rest = theme.slice(1).toLowerCase();
    theme = `${firstChar}${rest}`;
  }

  const headers = {
    "x-sdk-config-theme": theme ?? "",
    "x-sdk-config-locale": locale ?? "",
    "x-sdk-config-share-key": shareKey ?? "",
    "x-sdk-config-styles-url": stylesUrl,
  };

  Object.entries(headers).forEach(([key, value]) => {
    requestHeaders.set(key, value);
  });

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/health", "/doceditor"],
};
