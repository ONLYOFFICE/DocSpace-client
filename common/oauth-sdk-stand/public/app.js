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

const $ = (id) => document.getElementById(id);

const logEl = $("log");
const log = (msg, cls) => {
  const t = new Date().toISOString().substr(11, 12);
  const line = document.createElement("div");
  if (cls) line.className = cls;
  line.textContent = `[${t}] ${msg}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
};
const logJson = (label, obj) => {
  let s;
  try {
    s = JSON.stringify(obj);
  } catch {
    s = String(obj);
  }
  if (s && s.length > 600) s = `${s.slice(0, 600)}… (${s.length} chars)`;
  log(`${label} -> ${s}`);
};
$("log-clear").addEventListener("click", () => {
  logEl.innerHTML = "";
});

const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: opts.body ? { "content-type": "application/json" } : {},
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${path} -> ${res.status}`);
  return data;
};

const setBadge = (id, text, cls) => {
  const el = $(id);
  el.textContent = text;
  el.className = `badge${cls ? ` ${cls}` : ""}`;
};

const STEP_IDS = ["step-health", "step-login", "step-client", "step-auth", "step-demo"];
let manualStep = null;

const renderSteps = () => {
  const done = {
    "step-health": Boolean(health?.portal?.ok && health?.oauth?.ok && health?.sdk?.ok),
    "step-login": Boolean(session?.portal?.loggedIn),
    "step-client": Boolean(session?.client),
    "step-auth": Boolean(session?.oauth?.authenticated),
    "step-demo": false,
  };
  const unlocked = {
    "step-health": true,
    "step-login": done["step-health"],
    "step-client": done["step-login"],
    "step-auth": done["step-client"],
    "step-demo": done["step-auth"],
  };
  const open =
    manualStep && unlocked[manualStep]
      ? manualStep
      : STEP_IDS.find((id) => unlocked[id] && !done[id]) || "step-demo";
  for (const id of STEP_IDS) {
    $(id).classList.toggle("locked", !unlocked[id]);
    $(id).classList.toggle("open", id === open);
  }
};

for (const id of STEP_IDS)
  $(id).querySelector("h2").addEventListener("click", () => {
    manualStep = manualStep === id ? null : id;
    renderSteps();
  });

const decodeJwtPayload = (token) =>
  JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

let health = null;
let session = null;
let clients = [];
let scopes = [];
let sdkInstance = null;

const runHealth = async () => {
  setBadge("health-badge", "checking…");
  const list = $("health-list");
  list.innerHTML = "";
  try {
    health = await api("/api/health");
  } catch (e) {
    setBadge("health-badge", "stand error", "err");
    log(`health check failed: ${e.message}`, "err");
    return;
  }
  const item = (ok, text) => {
    const li = document.createElement("li");
    li.className = ok ? "ok-text" : "err-text";
    li.textContent = `${ok ? "✓" : "✗"} ${text}`;
    list.appendChild(li);
  };
  item(health.portal.ok, `portal ${health.stand.portalUrl} (api ${health.portal.status || "—"}${health.portal.version ? `, v${health.portal.version}` : ""})`);
  item(health.oauth.ok, `OAuth / identity (${health.oauth.authorizationEndpoint || "no discovery document"})`);
  item(health.sdk.ok, `SDK bundle ${health.sdk.ok ? `${health.sdk.version} (OAuth-capable) from the portal` : health.sdk.reason || "not found on the portal"}`);
  if (!health.stand.sameHost) {
    const li = document.createElement("li");
    li.className = "warn-text";
    li.textContent = "⚠ portal host is not \"localhost\" — the post-consent cookie wipe will not work";
    list.appendChild(li);
  }

  const ok = health.portal.ok && health.oauth.ok && health.sdk.ok;
  setBadge("health-badge", ok ? "ok" : "failed", ok ? "ok" : "err");
  log(`availability: portal=${health.portal.ok} oauth=${health.oauth.ok} sdk=${health.sdk.ok ? health.sdk.version : false}`, ok ? "ok" : "err");
  if (health.stand.defaultLogin && !$("login-email").value)
    $("login-email").value = health.stand.defaultLogin;
  renderSteps();
};
$("health-retry").addEventListener("click", runHealth);

const renderLogin = () => {
  const loggedIn = session?.portal?.loggedIn;
  $("login-form").hidden = Boolean(loggedIn);
  $("login-done").hidden = !loggedIn;
  if (loggedIn) {
    const u = session.portal.user || {};
    $("login-user").innerHTML =
      `<b>${u.displayName || "?"}</b> &lt;${u.email || "?"}&gt; ` +
      (u.isAdmin
        ? `<span class="tag">${u.isOwner ? "owner" : "admin"}</span>`
        : `<span class="warn-text small">not admin — CSP auto-config unavailable</span>`);
    setBadge("login-badge", "signed in", "ok");
  } else {
    setBadge("login-badge", "—");
  }
};

$("login-btn").addEventListener("click", async () => {
  try {
    $("login-btn").disabled = true;
    const { user, csp } = await api("/api/portal/login", {
      method: "POST",
      body: JSON.stringify({ email: $("login-email").value.trim(), password: $("login-password").value }),
    });
    log(`portal sign-in ok: ${user?.displayName} (admin=${Boolean(user?.isAdmin)})`, "ok");
    if (csp && csp !== "skipped") log(`CSP origins: ${csp}`, csp === "added" || csp === "present" ? "ok" : "err");
    manualStep = null;
    await refreshSession();
    await loadClients();
  } catch (e) {
    log(`portal sign-in failed: ${e.message}`, "err");
  } finally {
    $("login-btn").disabled = false;
  }
});

$("login-reset").addEventListener("click", async () => {
  await api("/api/portal/logout", { method: "POST" }).catch(() => {});
  log("portal session dropped");
  await refreshSession();
});

const useClient = async (clientId) => {
  const warnBox = $("client-warnings");
  warnBox.innerHTML = "";
  const { warnings, csp } = await api("/api/clients/select", {
    method: "POST",
    body: JSON.stringify({ clientId }),
  });
  log(`client selected: ${clientId}; CSP: ${csp}`, "ok");
  for (const w of warnings || []) {
    log(`warning: ${w}`, "err");
    warnBox.innerHTML += `<div class="warn-text">⚠ ${w}</div>`;
  }
  manualStep = null;
  await refreshSession();
};

const renderClientList = () => {
  const box = $("client-list");
  box.innerHTML = "";
  $("client-mine").hidden = clients.length === 0;

  for (const c of clients) {
    const active = session?.client?.clientId === c.clientId;
    const div = document.createElement("div");
    div.className = `client${active ? " selected" : ""}`;
    const marks = [
      active ? `<span class="tag">active</span>` : "",
      c.enabled ? "" : `<span class="tag" style="background:#fde3e3;color:#b42323">disabled</span>`,
    ].join("");
    div.innerHTML = `<div class="info"><div class="name">${c.name}${marks}</div><code>${c.clientId}</code><div class="muted small">[${(c.scopes || []).join(", ")}]</div></div>`;

    const use = document.createElement("button");
    use.textContent = "Use";
    use.disabled = active;
    use.addEventListener("click", () =>
      useClient(c.clientId).catch((e) => log(`client select failed: ${e.message}`, "err")),
    );

    const del = document.createElement("button");
    del.className = "danger";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      if (!confirm(`Delete OAuth client "${c.name}" on the portal?`)) return;
      try {
        const r = await api(`/api/clients/${encodeURIComponent(c.clientId)}`, { method: "DELETE" });
        log(`client ${c.clientId} deleted${r.cspRemoved ? " (stand origin removed from CSP)" : ""}`, "ok");
        await refreshSession();
        await loadClients();
      } catch (e) {
        log(`delete failed: ${e.message}`, "err");
      }
    });

    div.append(use, del);
    box.appendChild(div);
  }
};

const loadClients = async () => {
  try {
    const [cl, sc] = await Promise.all([api("/api/clients"), api("/api/scopes")]);
    clients = cl.clients;
    scopes = sc.scopes || [];
    const box = $("client-scopes");
    box.innerHTML = "";
    for (const s of scopes) {
      const lbl = document.createElement("label");
      const checked = s.type !== "write" && s.name !== "openid";
      lbl.innerHTML = `<input type="checkbox" value="${s.name}" ${checked ? "checked" : ""}/> ${s.name}`;
      box.appendChild(lbl);
    }
    renderClientList();
    log(`stand clients: ${clients.length}; portal scopes: ${scopes.map((s) => s.name).join(" ")}`);
  } catch (e) {
    log(`loading clients failed: ${e.message}`, "err");
  }
};

$("client-create-btn").addEventListener("click", async () => {
  const warnBox = $("client-warnings");
  warnBox.innerHTML = "";
  try {
    $("client-create-btn").disabled = true;
    const picked = [...$("client-scopes").querySelectorAll("input:checked")].map((i) => i.value);
    const { client, csp } = await api("/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: $("client-name").value, scopes: picked }),
    });
    log(`client created: ${client.name} (${client.clientId}); CSP: ${csp}`, "ok");
    manualStep = null;
    await refreshSession();
    await loadClients();
  } catch (e) {
    log(`client creation failed: ${e.message}`, "err");
  } finally {
    $("client-create-btn").disabled = false;
  }
});

$("auth-login").addEventListener("click", () => {
  log("starting the authorization-code flow (portal sign-in + consent screen)…");
  location.href = "/auth/login";
});
$("auth-logout").addEventListener("click", () => {
  location.href = "/auth/logout";
});

$("auth-probe").addEventListener("click", async () => {
  try {
    const { access_token: token } = await api("/api/token");
    const p = decodeJwtPayload(token);
    log(`access token ${token.slice(0, 18)}… (len ${token.length})`, "ok");
    log(`  iss=${p.iss} aud=${p.aud} sub=${p.sub || "?"} scope=${p.scope || p.scopes || "?"} exp=${p.exp ? new Date(p.exp * 1000).toISOString() : "?"}`);
  } catch (e) {
    log(`probe failed: ${e.message}`, "err");
  }
});

$("auth-introspect").addEventListener("click", async () => {
  try {
    logJson("introspect", await api("/api/token/info"));
  } catch (e) {
    log(`introspect failed: ${e.message}`, "err");
  }
});

const getToken = async () => {
  const r = await fetch("/api/token");
  if (!r.ok) {
    log(`getToken() -> /api/token ${r.status} (not authenticated?)`, "err");
    throw new Error("token_unavailable");
  }
  const { access_token: token } = await r.json();
  log(`getToken() -> ${token.slice(0, 18)}… (len ${token.length})`, "ok");
  return token;
};

const events = Object.fromEntries(
  [
    "onAppReady",
    "onAppError",
    "onAuthError",
    "onAuthSuccess",
    "onContentReady",
    "onSignOut",
    "onSelectCallback",
    "onCloseCallback",
    "onNoAccess",
    "onNotFound",
    "onDownload",
    "onEditorOpen",
    "onEditorCloseCallback",
    "onUploadSuccess",
    "onUploadError",
    "onNavigate",
    "onTokenExpired",
  ].map((name) => [
    name,
    (payload) => {
      const bad = /Error|NoAccess|NotFound/.test(name);
      log(`event: ${name}${payload !== undefined ? ` -> ${JSON.stringify(payload)}` : ""}`, bad ? "err" : "ok");
    },
  ]),
);

const INIT_BY_MODE = {
  manager: "initManager",
  personal: "initPersonal",
  "room-selector": "initRoomSelector",
  "file-selector": "initFileSelector",
  editor: "initEditor",
  viewer: "initViewer",
  uploader: "initUploader",
  forms: "initForms",
  chat: "initChat",
  "public-room": "initPublicRoom",
  system: "initSystem",
};

$("demo-init").addEventListener("click", () => {
  if (!window.DocSpace?.SDK) {
    log("DocSpace.SDK is not loaded (/api.js proxy failed?)", "err");
    return;
  }
  const mode = $("demo-mode").value;
  const config = {
    frameId: "ds-frame",
    src: health?.stand?.portalUrl || "",
    width: "100%",
    height: "100%",
    theme: $("demo-theme").value,
    checkCSP: $("demo-csp").checked,
    showMenu: $("demo-menu").checked,
    showFilter: $("demo-filter").checked,
    getToken,
    events,
  };
  const id = $("demo-id").value.trim();
  const agentId = $("demo-agent").value.trim();
  const requestToken = $("demo-request-token").value.trim();

  if (["editor", "viewer", "uploader", "forms"].includes(mode)) {
    if (!id) return log(`${mode} requires an entity id`, "err");
    config.id = id;
  }
  if (mode === "chat") {
    if (!agentId) return log("chat requires an agent id", "err");
    config.agentId = agentId;
  }
  if (mode === "public-room") {
    if (!requestToken) return log("public-room requires a request token", "err");
    config.requestToken = requestToken;
  }

  try {
    sdkInstance?.destroyFrame?.();
    log(`${INIT_BY_MODE[mode]}(src=${config.src}, checkCSP=${config.checkCSP})`);
    sdkInstance = window.DocSpace.SDK[INIT_BY_MODE[mode]](config);
    setBadge("demo-badge", mode, "ok");
  } catch (e) {
    log(`init threw: ${e.message || e}`, "err");
  }
});

$("demo-destroy").addEventListener("click", () => {
  try {
    sdkInstance?.destroyFrame?.();
    sdkInstance = null;
    setBadge("demo-badge", "—");
    log("destroyFrame()");
  } catch (e) {
    log(`destroy threw: ${e.message || e}`, "err");
  }
});

const callMethod = async (name, ...args) => {
  if (!sdkInstance) return log("init a frame first", "err");
  if (typeof sdkInstance[name] !== "function")
    return log(`instance has no method ${name}()`, "err");
  try {
    logJson(`${name}(${args.map((a) => JSON.stringify(a)).join(", ")})`, await sdkInstance[name](...args));
  } catch (e) {
    log(`${name}() failed: ${e?.message || JSON.stringify(e)}`, "err");
  }
};

const GETTERS = [
  "getUserInfo",
  "getConfig",
  "getFolderInfo",
  "getFiles",
  "getFolders",
  "getList",
  "getSelection",
  "getRooms",
  "getHashSettings",
];
for (const name of GETTERS) {
  const b = document.createElement("button");
  b.textContent = name;
  b.addEventListener("click", () =>
    name === "getRooms" ? callMethod(name, {}) : callMethod(name),
  );
  $("demo-getters").appendChild(b);
}

document.querySelectorAll("[data-create]").forEach((b) =>
  b.addEventListener("click", async () => {
    const kind = b.dataset.create;
    const title = $("demo-title").value.trim() || `stand-${kind}-${Date.now() % 1e5}`;
    if (kind === "room") return callMethod("createRoom", title, 5);
    if (!sdkInstance) return log("init a frame first", "err");
    try {
      const folder = await sdkInstance.getFolderInfo();
      const folderId = folder?.id ?? folder?.current?.id;
      if (folderId === undefined) return log("cannot resolve the current folder id (open manager/personal mode)", "err");
      if (kind === "folder") return callMethod("createFolder", folderId, title);
      return callMethod("createFile", folderId, title);
    } catch (e) {
      log(`getFolderInfo() failed: ${e?.message || e}`, "err");
    }
  }),
);

$("demo-setview").addEventListener("click", () => callMethod("setListView", $("demo-view").value));

const refreshSession = async () => {
  try {
    session = await api("/api/session");
  } catch (e) {
    log(`session check failed: ${e.message}`, "err");
    return;
  }
  renderLogin();

  const c = session.client;
  if (c) setBadge("client-badge", c.name, "ok");
  else setBadge("client-badge", "—");
  renderClientList();

  const authed = session.oauth?.authenticated;
  if (authed) {
    const exp = session.oauth.expiresAt ? new Date(session.oauth.expiresAt).toISOString().substr(11, 8) : "?";
    setBadge("auth-badge", `token ok (exp ${exp})`, "ok");
  } else setBadge("auth-badge", c ? "not authorized" : "—", c ? "warn" : "");
  $("auth-login").disabled = Boolean(authed);
  $("auth-logout").disabled = !authed;
  renderSteps();
};

const boot = async () => {
  log(`stand ready at ${location.origin}; DocSpace.SDK = ${window.DocSpace?.SDK ? "loaded" : "MISSING"}`, window.DocSpace?.SDK ? "ok" : "err");
  if (new URLSearchParams(location.search).get("authorized") === "1") {
    history.replaceState(null, "", "/");
    log("consent passed, tokens exchanged — portal cookies for localhost were WIPED; the SDK below runs on the Bearer token only", "ok");
  }
  await runHealth();
  await refreshSession();
  if (session?.portal?.loggedIn) await loadClients();
};

boot();
