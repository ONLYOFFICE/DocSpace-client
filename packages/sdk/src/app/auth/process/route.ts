// (c) Copyright Ascensio System SIA 2009-2026
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

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const callback = searchParams.get("callback");
  const redirectUrl = searchParams.get("redirectUrl");

  if (!callback) {
    return NextResponse.json(
      { error: "Missing callback parameter" },
      { status: 400 },
    );
  }

  try {
    const callbackUrl = new URL(callback);

    const res = await fetch(callbackUrl.toString());

    if (!res.ok) {
      return NextResponse.json(
        { error: "Callback request failed", status: res.status },
        { status: 502 },
      );
    }

    const data = await res.json();
    const { userId, portalToken, portalUrl } = data;

    if (portalUrl && redirectUrl) {
      const serverOrigin = new URL(redirectUrl).origin;
      const callbackOrigin = new URL(portalUrl).origin;

      if (serverOrigin !== callbackOrigin) {
        return NextResponse.json(
          { error: "portalUrl origin mismatch" },
          { status: 403 },
        );
      }
    }

    if (!portalToken) {
      return NextResponse.json(
        { error: "Missing portalToken in callback response" },
        { status: 502 },
      );
    }

    if (portalToken === "empty") {
      const loginUrl = new URL("/login", redirectUrl || request.nextUrl.origin);

      if (redirectUrl) {
        loginUrl.searchParams.set("referenceUrl", redirectUrl);
      }

      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.json({ userId, redirectUrl });

    response.cookies.set("asc_auth_key", portalToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "none",
      secure: true,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid callback URL or request failed" },
      { status: 400 },
    );
  }
}

