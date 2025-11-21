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

((globalScope) => {
  const channels = [];
  const global = globalScope;

  function BroadcastChannel(channelParam) {
    // biome-ignore lint/complexity/noUselessThisAlias: TODO fix
    const $this = this;
    const channel = String(channelParam);

    const id = `$BroadcastChannel$${channel}$`;

    channels[id] = channels[id] || [];
    channels[id].push(this);

    this._name = channel;
    this._id = id;
    this._closed = false;
    this._mc = new MessageChannel();
    this._mc.port1.start();
    this._mc.port2.start();

    globalScope.addEventListener("storage", (e) => {
      if (e.storageArea !== globalScope.localStorage) return;
      if (e.newValue == null || e.newValue === "") return;
      if (e.key.substring(0, id.length) !== id) return;
      const data = JSON.parse(e.newValue);
      $this._mc.port2.postMessage(data);
    });
  }

  BroadcastChannel.prototype = {
    // BroadcastChannel API
    get name() {
      return this._name;
    },
    postMessage(message) {
      // biome-ignore lint/complexity/noUselessThisAlias: TODO fix
      const $this = this;
      if (this._closed) {
        const e = new Error();
        e.name = "InvalidStateError";
        throw e;
      }
      const value = JSON.stringify(message);

      // Broadcast to other contexts via storage events...
      const key = `${this._id + String(Date.now())}$${String(Math.random())}`;
      globalScope.localStorage.setItem(key, value);
      setTimeout(() => {
        globalScope.localStorage.removeItem(key);
      }, 500);

      // Broadcast to current context via ports
      channels[this._id].forEach((bc) => {
        if (bc === $this) return;
        bc._mc.port2.postMessage(JSON.parse(value));
      });
    },
    close() {
      if (this._closed) return;
      this._closed = true;
      this._mc.port1.close();
      this._mc.port2.close();

      const index = channels[this._id].indexOf(this);
      channels[this._id].splice(index, 1);
    },

    // EventTarget API
    get onmessage() {
      return this._mc.port1.onmessage;
    },
    set onmessage(value) {
      this._mc.port1.onmessage = value;
    },
    addEventListener(/* type, listener , useCapture */) {
      return this._mc.port1.addEventListener.apply(this._mc.port1, arguments);
    },
    removeEventListener(/* type, listener , useCapture */) {
      return this._mc.port1.removeEventListener.apply(
        this._mc.port1,
        arguments,
      );
    },
    dispatchEvent(/* event */) {
      return this._mc.port1.dispatchEvent.apply(this._mc.port1, arguments);
    },
  };

  global.BroadcastChannel = global.BroadcastChannel || BroadcastChannel;
})(self);
