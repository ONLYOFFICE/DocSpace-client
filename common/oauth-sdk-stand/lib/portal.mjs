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

import { jsonRequest, rawRequest } from "./http.mjs";
import {
  EXTRA_CSP_ORIGINS,
  PORTAL_URL,
  REDIRECT_URI,
  STAND_ORIGIN,
} from "./config.mjs";

const SDK_VERSION = "2.2.0";
const JWT_TTL_MS = 4 * 60 * 1000;

export const STAND_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR4nGNgkPwPAADuAOMB0LvpAAAAAElFTkSuQmCC";

const api = (p) => `${PORTAL_URL}/api/2.0${p}`;

const errorOf = (res, fallback) =>
  res.json?.error?.message ||
  res.json?.message ||
  res.json?.reason ||
  (res.text || "").slice(0, 300) ||
  fallback;

class PortalClient {
  ascToken = null;
  ascExpires = null;
  user = null;
  #jwt = null;
  #jwtFetchedAt = 0;
  #sdkCache = null;

  get loggedIn() {
    return Boolean(this.ascToken);
  }

  #authHeaders() {
    if (!this.ascToken) throw new Error("not signed in to the portal");
    return {
      authorization: this.ascToken,
      cookie: `asc_auth_key=${this.ascToken}`,
    };
  }

  async checkPortal() {
    try {
      const res = await jsonRequest({
        url: api("/settings?withPassword=false"),
      });
      const s = res.json?.response;
      return {
        ok: res.status === 200 && Boolean(s),
        status: res.status,
        version: s?.version || null,
        timezone: s?.timezone || null,
      };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  }

  async discovery() {
    try {
      const res = await jsonRequest({
        url: `${PORTAL_URL}/.well-known/openid-configuration`,
      });
      const d = res.json;
      return {
        ok: res.status === 200 && Boolean(d?.authorization_endpoint),
        status: res.status,
        document: d || null,
      };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  }

  async sdkScript(force = false) {
    if (
      !force &&
      this.#sdkCache &&
      Date.now() - this.#sdkCache.fetchedAt < 5 * 60 * 1000
    )
      return this.#sdkCache;

    const url = `${PORTAL_URL}/static/scripts/sdk/${SDK_VERSION}/api.js`;
    const fail = (reason) => ({
      ok: false,
      version: null,
      url: null,
      body: null,
      reason,
    });
    try {
      const res = await rawRequest({ url });
      if (res.status !== 200 || res.body.length === 0)
        return fail(
          `no SDK ${SDK_VERSION} bundle on the portal (${url} -> ${res.status}) — if the portal ships a newer SDK, bump SDK_VERSION in lib/portal.mjs`,
        );
      if (!res.body.includes("getToken"))
        return fail(
          `the portal's SDK ${SDK_VERSION} bundle predates OAuth support (no getToken/accessToken) — rebuild/redeploy the portal with a newer SDK`,
        );
      this.#sdkCache = {
        ok: true,
        version: SDK_VERSION,
        url,
        body: res.body,
        fetchedAt: Date.now(),
      };
      return this.#sdkCache;
    } catch (e) {
      return fail(`SDK bundle request failed: ${e?.message || e}`);
    }
  }

  async login(userName, password) {
    const res = await jsonRequest({
      url: api("/authentication"),
      method: "POST",
      data: { UserName: userName, Password: password },
    });
    const r = res.json?.response;
    if (res.status !== 200 || !r?.token) {
      if (r?.sms || r?.tfa)
        throw new Error(
          "the account has SMS/TFA enabled — use an account without a second factor",
        );
      throw new Error(errorOf(res, `authentication failed (${res.status})`));
    }
    this.ascToken = r.token;
    this.ascExpires = r.expires || null;
    this.#jwt = null;

    const me = await jsonRequest({
      url: api("/people/@self"),
      headers: this.#authHeaders(),
    });
    const u = me.json?.response;
    this.user = u
      ? {
          displayName: u.displayName,
          email: u.email,
          isOwner: Boolean(u.isOwner),
          isAdmin: Boolean(u.isAdmin || u.isOwner),
        }
      : null;
    return this.user;
  }

  logout() {
    this.ascToken = null;
    this.ascExpires = null;
    this.user = null;
    this.#jwt = null;
  }

  async #jwtHeader() {
    if (!this.#jwt || Date.now() - this.#jwtFetchedAt > JWT_TTL_MS) {
      const res = await jsonRequest({
        url: api("/security/oauth2/token"),
        headers: this.#authHeaders(),
      });
      const token = res.json?.response;
      if (res.status !== 200 || !token)
        throw new Error(errorOf(res, `x-signature JWT request failed (${res.status})`));
      this.#jwt = token;
      this.#jwtFetchedAt = Date.now();
    }
    return { "x-signature": this.#jwt };
  }

  async #identity(method, path, data) {
    const res = await jsonRequest({
      url: api(`/oauth2${path}`),
      method,
      headers: await this.#jwtHeader(),
      data,
    });
    if (res.status < 200 || res.status >= 300)
      throw new Error(errorOf(res, `${method} /oauth2${path} -> ${res.status}`));
    return res.json;
  }

  listScopes() {
    return this.#identity("GET", "/scopes");
  }

  async listClients() {
    const page = await this.#identity("GET", "/clients?page=0&limit=50");
    return page?.data || [];
  }

  getClient(clientId) {
    return this.#identity("GET", `/clients/${clientId}`);
  }

  createClient({ name, scopes }) {
    const displayOrigin = STAND_ORIGIN.replace("//localhost", "//127.0.0.1");
    return this.#identity("POST", "/clients", {
      name,
      description: `Created by the SDK OAuth stand (${STAND_ORIGIN}) — safe to delete`,
      logo: STAND_LOGO,
      website_url: displayOrigin,
      terms_url: `${displayOrigin}/terms`,
      policy_url: `${displayOrigin}/policy`,
      redirect_uris: [REDIRECT_URI],
      allowed_origins: [STAND_ORIGIN],
      logout_redirect_uri: displayOrigin,
      scopes,
      allow_pkce: false,
      is_public: true,
    });
  }

  deleteClient(clientId) {
    return this.#identity("DELETE", `/clients/${clientId}`);
  }

  async getCsp() {
    const res = await jsonRequest({
      url: api("/security/csp"),
      headers: this.#authHeaders(),
    });
    if (res.status !== 200)
      throw new Error(errorOf(res, `GET /security/csp -> ${res.status}`));
    return res.json?.response?.domains || [];
  }

  async setCsp(domains) {
    const res = await jsonRequest({
      url: api("/security/csp"),
      method: "POST",
      headers: this.#authHeaders(),
      data: { domains },
    });
    if (res.status !== 200)
      throw new Error(errorOf(res, `POST /security/csp -> ${res.status}`));
    return res.json?.response?.domains || [];
  }

  async ensureCspOrigin() {
    const domains = await this.getCsp();
    const missing = [STAND_ORIGIN, ...EXTRA_CSP_ORIGINS].filter(
      (origin) => !domains.includes(origin),
    );
    if (missing.length === 0) return "present";
    if (!this.user?.isAdmin) return "forbidden";
    await this.setCsp([...domains, ...missing]);
    return "added";
  }

  async removeCspOrigin() {
    if (!this.user?.isAdmin) return false;
    const domains = await this.getCsp();
    if (!domains.includes(STAND_ORIGIN)) return false;
    await this.setCsp(domains.filter((d) => d !== STAND_ORIGIN));
    return true;
  }
}

export const portal = new PortalClient();
