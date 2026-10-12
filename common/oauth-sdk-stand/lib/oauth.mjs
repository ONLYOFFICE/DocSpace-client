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

import crypto from "node:crypto";
import { formRequest } from "./http.mjs";
import { PORTAL_URL, REDIRECT_URI } from "./config.mjs";

const STATE_TTL_MS = 10 * 60 * 1000;

let activeClient = null;

const sessions = new Map();
const pendingStates = new Map();

export const setActiveClient = (client) => {
  activeClient = client;
  sessions.clear();
};

export const getActiveClient = () => activeClient;

export const clearIfActive = (clientId) => {
  if (activeClient?.clientId === clientId) setActiveClient(null);
};

const requireClient = () => {
  if (!activeClient) throw new Error("no OAuth client selected");
  return activeClient;
};

const postToken = async (params) => {
  const { clientId, clientSecret } = requireClient();
  const res = await formRequest({
    url: `${PORTAL_URL}/oauth2/token`,
    params: { ...params, client_id: clientId, client_secret: clientSecret },
  });
  if (res.status < 200 || res.status >= 300 || !res.json?.access_token)
    throw new Error(
      `token endpoint ${res.status}: ${res.json?.error_description || res.json?.error || res.text.slice(0, 300)}`,
    );
  return res.json;
};

export const buildAuthorizeUrl = () => {
  const { clientId, scopes } = requireClient();
  for (const [s, at] of pendingStates)
    if (Date.now() - at > STATE_TTL_MS) pendingStates.delete(s);
  const state = crypto.randomBytes(16).toString("hex");
  pendingStates.set(state, Date.now());
  const q = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(" "),
    state,
  });
  return `${PORTAL_URL}/oauth2/authorize?${q}`;
};

export const consumeState = (state) => {
  if (!state || !pendingStates.has(state)) return false;
  const fresh = Date.now() - pendingStates.get(state) <= STATE_TTL_MS;
  pendingStates.delete(state);
  return fresh;
};

const store = (sid, t) => {
  const expiresIn = Number(t.expires_in);
  const ttlSec = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600;
  sessions.set(sid, {
    accessToken: t.access_token,
    refreshToken: t.refresh_token || sessions.get(sid)?.refreshToken,
    expiresAt: Date.now() + ttlSec * 1000,
    scope: t.scope || requireClient().scopes.join(" "),
  });
};

export const exchangeCode = async (code) => {
  const t = await postToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });
  const sid = crypto.randomBytes(24).toString("hex");
  store(sid, t);
  return sid;
};

export const getAccessToken = async (sid) => {
  const s = sessions.get(sid);
  if (!s) return null;
  if (Date.now() < s.expiresAt - 30_000) return s.accessToken;
  if (!s.refreshToken) return null;
  store(sid, await postToken({ grant_type: "refresh_token", refresh_token: s.refreshToken }));
  return sessions.get(sid).accessToken;
};

export const sessionInfo = (sid) => {
  const s = sid ? sessions.get(sid) : null;
  return s
    ? { authenticated: true, expiresAt: s.expiresAt, scope: s.scope }
    : { authenticated: false };
};

export const introspect = async (sid) => {
  const token = await getAccessToken(sid);
  if (!token) return null;
  const { clientId, clientSecret } = requireClient();
  const res = await formRequest({
    url: `${PORTAL_URL}/oauth2/introspect`,
    params: { token, client_id: clientId, client_secret: clientSecret },
  });
  return res.json;
};

export const dropSession = async (sid) => {
  const s = sessions.get(sid);
  sessions.delete(sid);
  if (!s || !activeClient) return;
  const { clientId, clientSecret } = activeClient;
  for (const token of [s.accessToken, s.refreshToken].filter(Boolean))
    await formRequest({
      url: `${PORTAL_URL}/oauth2/revoke`,
      params: { token, client_id: clientId, client_secret: clientSecret },
    }).catch(() => {});
};
