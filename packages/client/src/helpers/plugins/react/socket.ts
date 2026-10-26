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

// Integration modules (mail, chat, tasks… behind a plugin) send events to DocSpace over HTTP
// (`POST api/2.0/portal/moduleEvents`); the socket service delivers them as "plugin:{module}:{event}" — to the
// user's own private room, or to "plugin-{module}-{room}" rooms a client subscribes to. A plugin listens on the
// portal's one socket connection through the object the host hands it in `setModuleEvents`, never through a
// connection of its own.
//
// The object is made per plugin: the host binds it to the plugin's name, so a handler's returned message runs
// on behalf of that plugin and no other, and the host can drop all of a plugin's subscriptions when it is
// disabled. A portal without this module never calls `setModuleEvents`, so a plugin that defines it can tell
// the two apart and fall back to polling — nothing to import, nothing that fails to load.

import SocketHelper, {
  SocketCommands,
  type SocketEvents,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import type { IMessage } from "@onlyoffice/docspace-plugin-sdk";

type TDispatch = (args: { message: IMessage; pluginName: string }) => void;

/**
 * What a plugin's handler returns is handled like a message from any class-side callback:
 * `{ actions: [Actions.updateArticleNavigationItems] }` redraws its sidebar entry.
 */
export type TModuleEventHandler = (
  message: string,
) => IMessage | void | Promise<IMessage | void>;

/** What `setModuleEvents` receives. Every function returns the one that undoes it. */
export type TModuleEvents = {
  /**
   * Listens for `plugin:{module}:{event}`. Personal events (sent to the user) arrive without any
   * subscription; room events need `subscribeRoom`.
   */
  on: (module: string, event: string, handler: TModuleEventHandler) => () => void;
  /** Joins the module room `plugin-{module}-{room}` of the current portal; it is re-joined after a reconnect. */
  subscribeRoom: (module: string, room: string) => () => void;
};

// the same rules the server applies; a name it would never send is a plugin bug worth a loud error
const MODULE_NAME = /^[A-Za-z0-9_.-]{1,64}$/;
const EVENT_OR_ROOM_NAME = /^[A-Za-z0-9_.:-]{1,128}$/;

let dispatch: TDispatch | undefined;

// pluginName → the undo functions of everything that plugin subscribed to
const subscriptions = new Map<string, Set<() => void>>();

/** Host side only: PluginStore hands over its dispatcher so handlers' messages reach the right plugin. */
export const setModuleEventDispatcher = (value: TDispatch) => {
  dispatch = value;
};

const assertName = (kind: string, value: string, rule: RegExp) => {
  if (!rule.test(value)) {
    throw new Error(`Invalid ${kind} "${value}": expected ${rule.source}`);
  }
};

const listen = (
  pluginName: string,
  module: string,
  event: string,
  handler: TModuleEventHandler,
) => {
  assertName("module", module, MODULE_NAME);
  assertName("event", event, EVENT_OR_ROOM_NAME);

  const eventName = `plugin:${module}:${event}` as SocketEvents;

  const listener = async (data?: { message?: string }) => {
    try {
      const message = await handler(data?.message ?? "");

      if (message) dispatch?.({ message, pluginName });
    } catch (error) {
      // a plugin's handler must not break the socket's other listeners
      console.error(`[Plugin: ${pluginName}] handler for ${eventName} failed:`, error);
    }
  };

  // the helper queues listeners until the connection is ready and keeps them across reconnects
  SocketHelper?.on(eventName, listener as never);

  return () => SocketHelper?.off(eventName, listener as never);
};

// roomParts → how many holders it has: a room belongs to the page's one socket connection, not to a plugin, so it is
// left only when its last holder (two plugins, or one plugin twice) lets it go
const roomHolders = new Map<string, number>();

const joinRoom = (module: string, room: string) => {
  assertName("module", module, MODULE_NAME);
  assertName("room", room, EVENT_OR_ROOM_NAME);

  const roomParts = `plugin-${module}-${room}`;
  const holders = roomHolders.get(roomParts) ?? 0;

  roomHolders.set(roomParts, holders + 1);
  if (holders === 0) SocketHelper?.emit(SocketCommands.Subscribe, { roomParts });

  return () => {
    const left = (roomHolders.get(roomParts) ?? 1) - 1;

    if (left > 0) {
      roomHolders.set(roomParts, left);
      return;
    }

    roomHolders.delete(roomParts);
    SocketHelper?.emit(SocketCommands.Unsubscribe, { roomParts });
  };
};

/** Host side only: drops every subscription the plugin made (it was disabled or is loaded again). */
export const releaseModuleEvents = (pluginName: string) => {
  const own = subscriptions.get(pluginName);
  if (!own) return;

  subscriptions.delete(pluginName);
  Array.from(own).forEach((undo) => undo());
};

/** Host side only: the object handed to one plugin's `setModuleEvents`, bound to that plugin's name. */
export const createModuleEvents = (pluginName: string): TModuleEvents => {
  // a fresh load replaces whatever the previous one subscribed to
  releaseModuleEvents(pluginName);

  const own = new Set<() => void>();
  subscriptions.set(pluginName, own);

  // the plugin's own undo and the host's release may both run: whichever comes first does the work
  const track = (undo: () => void) => {
    const once = () => {
      if (own.delete(once)) undo();
    };
    own.add(once);
    return once;
  };

  return {
    on: (module, event, handler) => track(listen(pluginName, module, event, handler)),
    subscribeRoom: (module, room) => track(joinRoom(module, room)),
  };
};
