/*! api-sample plugin — IApiPlugin demo (room creation) */
(()=>{
  "use strict";

  // ─── Minimal SDK constants ─────────────────────────────────────────────────

  const Actions     = { showToast: "show-toast" };
  const PluginStatus = { active: "active", hide: "hide" };
  const ToastType   = { success: "success", error: "error", info: "info" };

  // ─── Profile menu item: Create Room ───────────────────────────────────────
  //
  // POSTs to {apiURL}/files/rooms using same-origin session cookies
  // (credentials: "include").  No explicit Bearer token is required.

  const createRoomItem = {
    key: "api-sample-create-room",
    id:  "api-sample-create-room",
    label: "Sample: Create Room",
    icon: "docspace-icon.svg",
    onClick: async function () {
      try {
        const response = await fetch(plugin.apiURL + "/files/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: "Plugin-created Room", roomType: 2 }),
        });

        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }

        const data = await response.json();
        const title = (data && data.response && data.response.title) || "Room";

        return {
          actions: [Actions.showToast],
          toastProps: [
            { type: ToastType.success, title: "Room created: \"" + title + "\"" },
          ],
        };
      } catch (e) {
        return {
          actions: [Actions.showToast],
          toastProps: [{ type: ToastType.error, title: "Failed to create room" }],
        };
      }
    },
  };

  // ─── Plugin class ──────────────────────────────────────────────────────────

  var plugin = new (function () {
    var self = this;

    // IPlugin ────────────────────────────────────────────────────────────────

    this.status = PluginStatus.active;

    this.onLoadCallback = async function () {
      self.createAPIUrl();
      self.addProfileMenuItem(createRoomItem);
    };

    this.updateStatus    = function (s)  { self.status = s; };
    this.getStatus       = function ()   { return self.status; };
    this.setOnLoadCallback = function (cb) { self.onLoadCallback = cb; };

    // IApiPlugin ─────────────────────────────────────────────────────────────
    //
    // The host application calls setAPI(origin, proxy, prefix) before
    // onLoadCallback runs (plugin scope includes "API").
    // createAPIUrl() assembles the three parts into a single base URL.

    this.origin  = "";
    this.proxy   = "";
    this.prefix  = "";
    this.apiURL  = "";

    this.createAPIUrl = function () {
      var api = self.getAPI();
      self.apiURL = api.origin.replace(/\/+$/, "");

      [api.proxy, api.prefix].forEach(function (part) {
        if (!part) return;
        var trimmed = part.trim().replace(/^\/+/, "");
        self.apiURL += self.apiURL.endsWith("/") ? trimmed : "/" + trimmed;
      });
    };

    this.setOrigin  = function (o)  { self.origin  = o; };
    this.setProxy   = function (p)  { self.proxy   = p; };
    this.setPrefix  = function (p)  { self.prefix  = p; };
    this.getOrigin  = function ()   { return self.origin; };
    this.getProxy   = function ()   { return self.proxy; };
    this.getPrefix  = function ()   { return self.prefix; };

    this.setAPI = function (o, p, pf) {
      self.origin = o;
      self.proxy  = p;
      self.prefix = pf;
    };
    this.getAPI = function () {
      return { origin: self.origin, proxy: self.proxy, prefix: self.prefix };
    };

    // IProfileMenuPlugin ──────────────────────────────────────────────────────

    this.profileMenuItems = new Map();

    this.addProfileMenuItem    = function (item) { self.profileMenuItems.set(item.key, item); };
    this.getProfileMenuItems   = function ()     { return self.profileMenuItems; };
    this.updateProfileMenuItem = function (item) { self.profileMenuItems.set(item.key, item); };
  })();

  window.Plugins = window.Plugins || {};
  window.Plugins.Apiplugin = plugin;
})();
