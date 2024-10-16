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

export type ConnectionSettings = {
  url: string;
  publicRoomKey: string;
};

export type TConfig = {
  withCredentials: boolean;
  transports: string[];
  eio: number;
  path: string;
  query?: {
    [key: string]: string;
  };
};

export type TEmit = {
  command: string;
  data: { roomParts: string | []; individual?: boolean };
  room?: null | boolean;
};

type TOptQuota =
  | { customQuotaFeature: string; usedSpace: number; quotaLimit: number }
  | { customQuotaFeature?: never; usedSpace?: never; quotaLimit?: never };

export type TOptSocket = {
  featureId: string;
  value: number;
  data?: string;
  type?: "folder" | "file";
  id?: string;
  cmd?: "create" | "update" | "delete";
} & TOptQuota;

export type TOnCallback = {
  featureId: string;
  value: number;
  usedSpace: number;
  quotaLimit: number;
  customQuotaFeature: string;
  enableQuota: boolean;
  quota: number;
};

export type TCallback = {
  eventName: string;
  callback: (value: TOnCallback) => void;
};

/**
 * A singleton helper class for managing socket connections and interactions.
 *
 * @class SocketHelper
 *
 * @example
 * // Get the singleton instance
 * const socketHelper = SocketHelper.getInstance();
 *
 * // Update connection settings
 * socketHelper.updateSettings('http://example.com', 'publicRoomKey');
 *
 * // Emit an event
 * socketHelper.emit({ command: 'subscribe', data: { roomParts: 'roomId' } });
 *
 * // Listen for an event
 * socketHelper.on('eventName', (value) => {
 *   console.log('Event received:', value);
 * });
 *
 * @property {boolean} isEnabled - Indicates if the connection settings are set.
 * @property {boolean} isReady - Indicates if the socket is ready for communication.
 * @property {Set<string>} socketSubscribers - A set of current socket subscribers.
 * @property {Socket<DefaultEventsMap, DefaultEventsMap> | null} socket - The socket client instance.
 *
 * @method getInstance - Returns the singleton instance of the SocketHelper.
 * @method updateSettings - Updates the connection settings and attempts to connect.
 * @method emit - Emits an event to the socket server.
 * @method on - Registers an event listener on the socket client.
 */
class SocketHelper {
  private static instance: SocketHelper;

  private connectionSettings?: ConnectionSettings | null;

  private client?: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

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
          this.emits.forEach(({ command, data, room }) => {
            this.emit({ command, data, room });
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

    this.connectionSettings = { url, publicRoomKey } as ConnectionSettings;
    this.tryConnect();
  }

  /**
   * Emits a command with associated data to a specified room or globally.
   * If the socket is not ready, the command is saved in a queue for later emission.
   *
   * @param {Object} param - The parameters for the emit function.
   * @param {string} param.command - The command to emit.
   * @param {any} param.data - The data to emit with the command.
   * @param {string | null} [param.room=null] - The room to emit the command to. If null, the command is emitted globally.
   *
   * @returns {void}
   */
  public emit = ({ command, data, room = null }: TEmit) => {
    if (!this.isEnabled || !this.isReady || !this.client) {
      console.log("[WS] socket [emit] is not ready -> save in a queue", {
        command,
        data,
        room,
      });
      this.emits.push({ command, data, room });
      return;
    }

    console.log("[WS] emit", { command, data, room });

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

    return room
      ? this.client.to(room).emit(command, data)
      : this.client.emit(command, data);
  };

  /**
   * Registers an event listener for the specified event name.
   * If the socket is not enabled, not ready, or the client is not available,
   * the event listener is saved in a queue to be registered later.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be executed when the event is triggered.
   */
  public on = (eventName: string, callback: (value: TOnCallback) => void) => {
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
}

export default SocketHelper;
