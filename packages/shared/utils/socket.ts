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

/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

import io, { Socket } from "socket.io-client";

import { DefaultEventsMap } from "@socket.io/component-emitter";

/**
 * Enum representing various socket events used in the application.
 * These events are used for communication between the client and server.
 *
 * @enum {string}
 * @readonly
 */
export const enum SocketEvents {
  RestoreBackup = "restore-backup",
  LogoutSession = "s:logout-session",
  ModifyFolder = "s:modify-folder",
  ModifyRoom = "s:modify-room",
  UpdateHistory = "s:update-history",
  RefreshFolder = "refresh-folder",
  MarkAsNewFolder = "s:markasnew-folder",
  MarkAsNewFile = "s:markasnew-file",
  StartEditFile = "s:start-edit-file",
  StopEditFile = "s:stop-edit-file",
  ChangedQuotaUsedValue = "s:change-quota-used-value",
  ChangedQuotaFeatureValue = "s:change-quota-feature-value",
  ChangedQuotaUserUsedValue = "s:change-user-quota-used-value",
}

/**
 * Enum representing the various commands that can be sent over a socket connection.
 *
 * @enum {string}
 * @readonly
 */
export const enum SocketCommands {
  Subscribe = "subscribe",
  Unsubscribe = "unsubscribe",
  RefreshFolder = "refresh-folder",
  RestoreBackup = "restore-backup",
}

/**
 * Represents the configuration for a socket connection.
 *
 * @typedef {Object} TSocketConnection
 * @property {string} url - The URL of the socket server.
 * @property {string} publicRoomKey - The key for the public room.
 */
export type TSocketConnection = {
  url: string;
  publicRoomKey: string;
};

/**
 * Configuration options for the socket connection.
 *
 * @typedef {Object} TConfig
 * @property {boolean} withCredentials - Indicates whether credentials such as cookies should be sent with the request.
 * @property {string[]} transports - List of transport mechanisms to be used (e.g., 'polling', 'websocket').
 * @property {number} eio - Engine.IO protocol version.
 * @property {string} path - Path to the socket endpoint.
 * @property {Object.<string, string>} [query] - Optional query parameters to be included in the connection URL.
 */
export type TConfig = {
  withCredentials: boolean;
  transports: string[];
  eio: number;
  path: string;
  query?: {
    [key: string]: string;
  };
};

/**
 * Represents the data to be emitted through a socket connection.
 *
 * @typedef {Object} TEmitData
 * @property {string | string[]} roomParts - The parts of the room to which the data is emitted.
 * @property {boolean} [individual] - Optional flag indicating if the emission is for an individual.
 */
export type TEmitData = { roomParts: string | []; individual?: boolean };

/**
 * Represents the structure of an emit event for a socket connection.
 *
 * @typedef {Object} TEmit
 * @property {SocketCommands} command - The command to be sent through the socket.
 * @property {TEmitData} [data] - Optional data associated with the command.
 */
export type TEmit = { command: SocketCommands; data?: TEmitData };

/**
 * Represents an optional quota configuration.
 *
 * This type can either define a custom quota feature with specific usage and limit,
 * or it can be left undefined to indicate no custom quota.
 *
 * @typedef {Object} TOptQuota
 * @property {string} [customQuotaFeature] - The name of the custom quota feature.
 * @property {number} [usedSpace] - The amount of space used under the custom quota.
 * @property {number} [quotaLimit] - The limit of the custom quota.
 */
type TOptQuota =
  | { customQuotaFeature: string; usedSpace: number; quotaLimit: number }
  | { customQuotaFeature?: never; usedSpace?: never; quotaLimit?: never };

/**
 * Represents the options for a socket operation.
 *
 * @typedef {Object} TOptSocket
 *
 * @property {string} featureId - The ID of the feature.
 * @property {number} value - The value associated with the operation.
 * @property {string} [data] - Optional data related to the operation.
 * @property {"folder" | "file"} [type] - Optional type of the item, either "folder" or "file".
 * @property {string} [id] - Optional ID of the item.
 * @property {"create" | "update" | "delete"} [cmd] - Optional command to be executed, either "create", "update", or "delete".
 *
 * @extends TOptQuota
 */
export type TOptSocket = {
  featureId: string;
  value: number;
  data?: string;
  type?: "folder" | "file";
  id?: string;
  cmd?: "create" | "update" | "delete";
} & TOptQuota;

/**
 * Represents the callback data structure for socket events.
 *
 * @typedef {Object} TOnCallback
 * @property {string} featureId - The unique identifier for the feature.
 * @property {number} value - The value associated with the feature.
 * @property {number} usedSpace - The amount of space used.
 * @property {number} quotaLimit - The limit of the quota.
 * @property {string} customQuotaFeature - The custom quota feature identifier.
 * @property {boolean} enableQuota - Flag indicating if the quota is enabled.
 * @property {number} quota - The quota value.
 */
export type TOnCallback = {
  featureId: string;
  value: number;
  usedSpace: number;
  quotaLimit: number;
  customQuotaFeature: string;
  enableQuota: boolean;
  quota: number;
};

/**
 * Represents a callback function to be used with socket events.
 *
 * @typedef {Object} TCallback
 * @property {SocketEvents} eventName - The name of the socket event.
 * @property {(value: TOnCallback) => void} callback - The function to be called when the event is triggered.
 */
export type TCallback = {
  eventName: SocketEvents;
  callback: (value: TOnCallback) => void;
};

/**
 * The `SocketHelper` class is a singleton that manages WebSocket connections and provides methods to interact with the WebSocket server.
 * It handles connection establishment, event registration, and message emission.
 *
 * @class
 * @example
 * // Retrieve the singleton instance
 * const socketHelper = SocketHelper.getInstance();
 *
 * // Establish a connection
 * socketHelper.connect('ws://example.com', 'publicRoomKey');
 *
 * // Emit a message
 * socketHelper.emit('message', { text: 'Hello, World!' });
 *
 * // Register an event listener
 * socketHelper.on('message', (data) => {
 *   console.log('Received message:', data);
 * });
 * // Remove the event listener
 * socketHelper.on('message', (data) => {
 *   console.log('Received message:', data);
 * });
 *
 * @property {SocketHelper} instance - The singleton instance of the SocketHelper class.
 * @property {TSocketConnection | null} connectionSettings - The settings used to establish the WebSocket connection.
 * @property {Socket<DefaultEventsMap, DefaultEventsMap> | null} client - The WebSocket client instance.
 * @property {boolean} isSocketReady - Indicates whether the socket is ready for communication.
 * @property {TCallback[]} callbacks - A queue of callbacks to be registered once the socket is ready.
 * @property {TEmit[]} emits - A queue of messages to be emitted once the socket is ready.
 * @property {Set<string>} subscribers - A set of current socket subscribers.
 *
 * @method static getInstance - Retrieves the singleton instance of the SocketHelper class.
 * @method private tryConnect - Attempts to establish a WebSocket connection using the provided connection settings.
 * @method get isEnabled - Checks if the socket connection is enabled.
 * @method get isReady - Checks if the socket is ready.
 * @method get socketSubscribers - Gets the list of current socket subscribers.
 * @method get socket - Getter for the socket property.
 * @method public connect - Establishes a WebSocket connection using the provided URL and public room key.
 * @method public emit - Emits a command with associated data to a specified room or globally.
 * @method public on - Registers an event listener for the specified event name.
 */
class SocketHelper {
  private static instance: SocketHelper;

  private connectionSettings?: TSocketConnection | null;

  private client: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

  private isSocketReady: boolean = false;

  private callbacks: TCallback[] = [];

  private emits: TEmit[] = [];

  private subscribers = new Set<string>();

  private constructor() {
    this.client = null;
    this.connectionSettings = null;
  }

  /**
   * Retrieves the singleton instance of the SocketHelper class.
   * If an instance already exists, it returns that instance.
   * Otherwise, it creates a new instance and returns it.
   *
   * @returns {SocketHelper} The singleton instance of the SocketHelper class.
   */
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new SocketHelper();
    return this.instance;
  }

  /**
   * Attempts to establish a WebSocket connection using the provided connection settings.
   *
   * - If `connectionSettings` is not defined, the method returns immediately.
   * - Extracts `url` and `publicRoomKey` from `connectionSettings`.
   * - Constructs the WebSocket configuration object with credentials, transport methods, engine version, and path.
   * - If `publicRoomKey` is provided, it adds it to the query parameters of the configuration.
   * - Initializes the WebSocket client with the constructed configuration.
   * - Sets up event listeners for connection events: `connect`, `connect_error`, `disconnect`, `connection-init`.
   */
  private tryConnect() {
    try {
      if (!this.connectionSettings || !this.connectionSettings.url) return;

      const { url, publicRoomKey } = this.connectionSettings;

      const origin = window.location.origin;

      const config: TConfig = {
        withCredentials: true,
        transports: ["websocket", "polling"],
        eio: 4,
        path: url,
      };

      if (publicRoomKey) {
        config.query = {
          share: publicRoomKey,
        };
      }

      this.client = io(origin, config);

      this.client.on("connect", () => {
        console.log("[WS] socket is connected");
      });

      this.client.on("connect_error", (err) =>
        console.log("[WS] socket connect error", err),
      );

      this.client.on("disconnect", () =>
        console.log("[WS] socket is disconnected"),
      );

      this.client.on("connection-init", () => {
        console.log("[WS] socket is ready (connection-init)");

        this.isSocketReady = true;

        if (this.callbacks.length) {
          this.callbacks.forEach(({ eventName, callback }: TCallback) => {
            this.on(eventName, callback);
          });
          this.callbacks = [];
        }

        if (this.emits.length) {
          this.emits.forEach(({ command, data }) => {
            this.emit(command, data);
          });
          this.emits = [];
        }
      });
    } catch (e) {
      console.error("[WS] try connect error", e);
    }
  }

  /**
   * Checks if the socket connection is enabled.
   *
   * @returns {boolean} `true` if the connection settings are not null, indicating that the socket connection is enabled; otherwise, `false`.
   */
  get isEnabled(): boolean {
    return this.connectionSettings !== null;
  }

  /**
   * Checks if the socket is ready.
   *
   * @returns {boolean} - Returns `true` if the socket is ready, otherwise `false`.
   */
  get isReady(): boolean {
    return this.isSocketReady;
  }

  /**
   * Gets the list of current socket subscribers.
   *
   * @returns {Set} A list of subscribers.
   */
  get socketSubscribers(): Set<string> {
    return this.subscribers;
  }

  /**
   * Getter for the socket property.
   *
   * @returns The client instance associated with the socket.
   */
  get socket() {
    return this.client;
  }

  /**
   * Establishes a WebSocket connection using the provided URL and public room key.
   * Logs the connection settings and attempts to connect.
   *
   * @param url - The WebSocket server URL to connect to.
   * @param publicRoomKey - The key for the public room to join.
   */
  public connect(url: string, publicRoomKey: string) {
    if (!url) return;

    console.log("[WS] connect", { url, publicRoomKey });

    this.connectionSettings = { url, publicRoomKey } as TSocketConnection;
    this.tryConnect();
  }

  /**
   * Emits a command with associated data to a specified room or globally.
   * If the socket is not ready, the command is saved in a queue for later emission.
   *
   * @param {SocketCommands} command - The command to emit.
   * @param {TEmitData} data - The parameters for the emit function.
   *
   * @returns {void}
   */
  public emit = (command: SocketCommands, data?: TEmitData) => {
    if (command === SocketCommands.Subscribe && !data?.roomParts) return;

    if (!this.isEnabled || !this.isReady || !this.client) {
      console.log("[WS] socket [emit] is not ready -> save in a queue", {
        command,
        data,
      });
      this.emits.push({ command, data });
      return;
    }

    console.log("[WS] emit", { command, data });

    const ids =
      !data || !data.roomParts
        ? []
        : typeof data.roomParts === "object"
          ? data.roomParts
          : [data.roomParts];

    ids.forEach((id: string) => {
      if (command === "subscribe") {
        if (this.subscribers.has(id)) return;

        this.subscribers.add(id);
      }

      if (command === "unsubscribe") {
        this.subscribers.delete(id);
      }
    });

    return this.client.emit(command, data);
  };

  /**
   * Registers an event listener for the specified event name.
   * If the socket is not enabled, not ready, or the client is not available,
   * the event listener is saved in a queue to be registered later.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be executed when the event is triggered.
   */
  public on = (
    eventName: SocketEvents,
    callback: (value: TOnCallback) => void,
  ) => {
    if (!this.isEnabled || !this.isReady || !this.client) {
      console.log("[WS] socket [on] is not ready -> save in a queue", {
        eventName,
        callback,
      });
      this.callbacks.push({ eventName, callback });
      return;
    }

    console.log("[WS] on", { eventName, callback });

    this.client.on(eventName, callback);
  };

  /**
   * Remove an event listener for the specified event name.
   * If the socket is not enabled, not ready, or the client is not available,
   * the event listener is removed from a queue.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be executed when the event is triggered.
   */
  public off = (
    eventName: SocketEvents,
    callback: (value: TOnCallback) => void,
  ) => {
    if (!this.isEnabled || !this.isReady || !this.client) {
      console.log("[WS] socket [off] is not ready -> remove from a queue", {
        eventName,
        callback,
      });

      this.callbacks = this.callbacks.filter(
        (c) => c.eventName !== eventName || c.callback !== callback,
      );

      return;
    }

    console.log("[WS] off", { eventName, callback });

    this.client.off(eventName, callback);
  };
}

export default SocketHelper.getInstance();
