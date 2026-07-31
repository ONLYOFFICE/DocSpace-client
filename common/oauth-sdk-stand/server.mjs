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

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  PORT,
  PORTAL_URL,
  STAND_ORIGIN,
  REDIRECT_URI,
  SAME_HOST,
  DEFAULT_LOGIN,
  PORTAL_COOKIES,
  rootDir,
} from "./lib/config.mjs";
import { portal } from "./lib/portal.mjs";
import * as oauth from "./lib/oauth.mjs";
import * as state from "./lib/state.mjs";

const PUBLIC = path.resolve(rootDir, "public");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

const safeDecode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const parseCookies = (req) => {
  const out = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = safeDecode(part.slice(i + 1).trim());
  }
  return out;
};

const send = (res, status, type, body, headers = {}) => {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    ...headers,
  });
  res.end(body);
};
const json = (res, status, obj, headers = {}) =>
  send(res, status, "application/json; charset=utf-8", JSON.stringify(obj), headers);

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });

const wipePortalCookies = () =>
  PORTAL_COOKIES.map((n) => `${n}=; Path=/; Max-Age=0`);

const clientView = (c) => ({
  clientId: c.client_id,
  name: c.name,
  enabled: c.enabled !== false,
  scopes: c.scopes || [],
});

const handler = async (req, res) => {
  const url = new URL(req.url || "/", STAND_ORIGIN);
  const p = url.pathname;
  const cookies = parseCookies(req);
  const sid = cookies.sid || null;

  try {
    if (req.method === "GET" && (p === "/" || p === "/index.html"))
      return send(res, 200, MIME[".html"], await readFile(path.join(PUBLIC, "index.html")));
    if (req.method === "GET" && (p === "/app.js" || p === "/styles.css")) {
      const f = path.join(PUBLIC, p);
      return send(res, 200, MIME[path.extname(p)], await readFile(f));
    }

    if (req.method === "GET" && (p === "/terms" || p === "/policy"))
      return send(
        res,
        200,
        "text/plain; charset=utf-8",
        `SDK OAuth stand — placeholder ${p.slice(1)} page (the client registration requires a valid URL).`,
      );

    if (req.method === "GET" && p === "/api.js") {
      const sdk = await portal.sdkScript(true);
      if (!sdk.ok)
        return send(res, 502, "text/plain", "SDK bundle not found on the portal");
      return send(res, 200, MIME[".js"], sdk.body, { "x-sdk-version": sdk.version });
    }

    if (req.method === "GET" && p === "/api/health") {
      const [portalCheck, discovery, sdk] = await Promise.all([
        portal.checkPortal(),
        portal.discovery(),
        portal.sdkScript(),
      ]);
      return json(res, 200, {
        stand: {
          origin: STAND_ORIGIN,
          redirectUri: REDIRECT_URI,
          portalUrl: PORTAL_URL,
          sameHost: SAME_HOST,
          defaultLogin: DEFAULT_LOGIN,
        },
        portal: portalCheck,
        oauth: {
          ok: discovery.ok,
          status: discovery.status ?? null,
          error: discovery.error || null,
          authorizationEndpoint: discovery.document?.authorization_endpoint || null,
          tokenEndpoint: discovery.document?.token_endpoint || null,
          scopesSupported: discovery.document?.scopes_supported || [],
        },
        sdk: { ok: sdk.ok, version: sdk.version, url: sdk.url, reason: sdk.reason || null },
      });
    }

    if (req.method === "GET" && p === "/api/session") {
      const client = oauth.getActiveClient();
      return json(res, 200, {
        portal: { url: PORTAL_URL, loggedIn: portal.loggedIn, user: portal.user },
        client: client
          ? {
              clientId: client.clientId,
              name: client.name,
              scopes: client.scopes,
              mine: client.mine,
            }
          : null,
        oauth: oauth.sessionInfo(sid),
      });
    }

    if (req.method === "POST" && p === "/api/portal/login") {
      const { email, password } = await readBody(req);
      if (!email || !password)
        return json(res, 400, { error: "email and password are required" });
      const user = await portal.login(email, password);
      let csp = "skipped";
      if (user?.isAdmin) {
        try {
          csp = await portal.ensureCspOrigin();
          if (csp === "added") state.setCspOriginAdded(true);
        } catch (e) {
          csp = `error: ${e.message}`;
        }
      }
      return json(res, 200, { user, csp });
    }

    if (req.method === "POST" && p === "/api/portal/logout") {
      portal.logout();
      oauth.setActiveClient(null);
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && p === "/api/scopes")
      return json(res, 200, { scopes: await portal.listScopes() });

    if (req.method === "GET" && p === "/api/csp")
      return json(res, 200, { domains: await portal.getCsp() });

    if (req.method === "POST" && p === "/api/csp") {
      const { origin } = await readBody(req);
      if (!origin) return json(res, 400, { error: "origin is required" });
      if (!portal.user?.isAdmin)
        return json(res, 403, { error: "portal admin sign-in required" });
      const domains = await portal.getCsp();
      if (domains.includes(origin))
        return json(res, 200, { domains, added: false });
      const updated = await portal.setCsp([...domains, origin]);
      return json(res, 200, { domains: updated, added: true });
    }

    if (req.method === "GET" && p === "/api/clients") {
      const portalClients = await portal.listClients();
      const clients = [];
      for (const mine of state.createdClients()) {
        const dto = portalClients.find((c) => c.client_id === mine.clientId);
        if (!dto) {
          state.forgetClient(mine.clientId);
          oauth.clearIfActive(mine.clientId);
          continue;
        }
        clients.push(clientView(dto));
      }
      return json(res, 200, { clients });
    }

    if (req.method === "POST" && p === "/api/clients") {
      const { name, scopes } = await readBody(req);
      if (!Array.isArray(scopes) || scopes.length === 0)
        return json(res, 400, { error: "pick at least one scope" });
      const created = await portal.createClient({
        name: (name || "").trim() || "SDK OAuth Stand",
        scopes,
      });
      state.rememberClient({
        clientId: created.client_id,
        clientSecret: created.client_secret,
        name: created.name,
      });
      let csp = "skipped";
      try {
        csp = await portal.ensureCspOrigin();
        if (csp === "added") state.setCspOriginAdded(true);
      } catch (e) {
        csp = `error: ${e.message}`;
      }
      oauth.setActiveClient({
        clientId: created.client_id,
        clientSecret: created.client_secret,
        name: created.name,
        scopes: created.scopes || scopes,
        mine: true,
      });
      return json(res, 201, { client: clientView(created), csp });
    }

    if (req.method === "POST" && p === "/api/clients/select") {
      const { clientId } = await readBody(req);
      if (!clientId) return json(res, 400, { error: "clientId is required" });
      const mine = state.findCreated(clientId);
      if (!mine)
        return json(res, 403, {
          error: "only stand-created clients can be selected",
        });
      const dto = await portal.getClient(clientId);
      const view = clientView(dto);
      const warnings = [];
      let csp = "skipped";
      try {
        csp = await portal.ensureCspOrigin();
        if (csp === "added") state.setCspOriginAdded(true);
        if (csp === "forbidden")
          warnings.push(
            `stand origin is missing from the portal CSP list and the signed-in user is not an admin — the SDK frame will be blocked unless checkCSP is off or an admin adds ${STAND_ORIGIN} in DevTools -> JavaScript SDK`,
          );
      } catch (e) {
        warnings.push(`CSP check failed: ${e.message}`);
      }
      oauth.setActiveClient({
        clientId,
        clientSecret: mine.clientSecret,
        name: view.name,
        scopes: view.scopes,
        mine: true,
      });
      return json(res, 200, { client: view, warnings, csp });
    }

    if (req.method === "DELETE" && p.startsWith("/api/clients/")) {
      const clientId = decodeURIComponent(p.slice("/api/clients/".length));
      if (!state.findCreated(clientId))
        return json(res, 403, {
          error: "refusing to delete a client the stand did not create",
        });
      await portal.deleteClient(clientId);
      state.forgetClient(clientId);
      oauth.clearIfActive(clientId);
      let cspRemoved = false;
      if (state.createdClients().length === 0 && state.cspOriginAdded()) {
        cspRemoved = await portal.removeCspOrigin().catch(() => false);
        if (cspRemoved) state.setCspOriginAdded(false);
      }
      return json(res, 200, { ok: true, cspRemoved });
    }

    if (req.method === "GET" && p === "/auth/login") {
      const authorize = oauth.buildAuthorizeUrl();
      res.writeHead(302, { location: authorize });
      return res.end();
    }

    if (req.method === "GET" && p === "/auth/callback") {
      const err = url.searchParams.get("error");
      if (err)
        return send(
          res,
          400,
          "text/html; charset=utf-8",
          `<pre>authorize error: ${err}\n${url.searchParams.get("error_description") || ""}</pre><a href="/">back to the stand</a>`,
        );
      const code = url.searchParams.get("code");
      if (!code) return send(res, 400, "text/plain", "missing code");
      if (!oauth.consumeState(url.searchParams.get("state")))
        return send(res, 400, "text/plain", "state mismatch (CSRF check failed) — restart the flow from the stand");

      const newSid = await oauth.exchangeCode(code);
      res.writeHead(302, {
        location: "/?authorized=1",
        "set-cookie": [
          `sid=${newSid}; Path=/; HttpOnly; SameSite=Lax`,
          ...wipePortalCookies(),
        ],
      });
      return res.end();
    }

    if (req.method === "GET" && p === "/api/token") {
      const token = sid ? await oauth.getAccessToken(sid).catch(() => null) : null;
      if (!token) return json(res, 401, { error: "not_authenticated" });
      return json(res, 200, { access_token: token });
    }

    if (req.method === "GET" && p === "/api/token/info") {
      const info = sid ? await oauth.introspect(sid) : null;
      if (!info) return json(res, 401, { error: "not_authenticated" });
      return json(res, 200, info);
    }

    if (req.method === "GET" && p === "/auth/logout") {
      if (sid) await oauth.dropSession(sid);
      res.writeHead(302, {
        location: "/",
        "set-cookie": ["sid=; Path=/; Max-Age=0", ...wipePortalCookies()],
      });
      return res.end();
    }

    send(res, 404, "text/plain", "not found");
  } catch (e) {
    json(res, 500, { error: String(e?.message || e) });
  }
};

http.createServer(handler).listen(PORT, () => {
  console.log(`\n  SDK OAuth stand:  ${STAND_ORIGIN}`);
  console.log(`  Portal:           ${PORTAL_URL}`);
  console.log(`  Redirect URI:     ${REDIRECT_URI}`);
  if (!SAME_HOST)
    console.log(
      `  WARNING: the portal is not on "localhost" — the post-consent cookie wipe will have no effect`,
    );
  console.log();
});
