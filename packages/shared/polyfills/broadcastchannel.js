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
