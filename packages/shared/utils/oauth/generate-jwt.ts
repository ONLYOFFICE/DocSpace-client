// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable new-cap */

import sjcl from "sjcl";

export default function generateJwt(
  user_id: string,
  user_name: string,
  user_email: string,
  tenant_id: number,
  tenant_url: string,
  is_admin: boolean,
  secret?: string,
) {
  const curSecret = secret || window.ClientConfig?.oauth2.secret;
  if (!curSecret) throw new Error("OAuth2 secret is not configured");

  // Create JWT header
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user_id,
    aud: user_id,
    user_id,
    user_name,
    user_email,
    tenant_id,
    tenant_url,
    is_admin,
    iat: now,
    exp: now + 36000, // Token expires in 1 hour
  };

  // Base64Url encode header and payload
  const base64UrlEncode = (obj: object) => {
    const str = JSON.stringify(obj);
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array(data))),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const base64UrlHeader = base64UrlEncode(header);
  const base64UrlPayload = base64UrlEncode(payload);

  // Create signature
  const input = `${base64UrlHeader}.${base64UrlPayload}`;
  const hmac = new sjcl.misc.hmac(
    sjcl.codec.utf8String.toBits(curSecret),
    sjcl.hash.sha256,
  );
  const signature = sjcl.codec.base64.fromBits(hmac.mac(input));

  // Convert signature to base64url
  const base64UrlSignature = signature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Combine all parts to create the JWT token
  return `${base64UrlHeader}.${base64UrlPayload}.${base64UrlSignature}`;
}
