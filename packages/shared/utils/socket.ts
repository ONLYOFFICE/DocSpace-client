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

/* eslint-disable @typescript-eslint/ban-ts-comment */

import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

import { TUser } from "../api/people/types";
import { TGroup } from "../api/groups/types";

import { addLog } from ".";

/**
 * Enum representing various socket events used in the application.
 * These events are used for communication between the client and server.
 *
 * @enum {string}
 * @readonly
 */
export const enum SocketEvents {
  Restore = "restore",
  Backup = "backup",
  RestoreBackup = "restore-backup",
  StorageEncryption = "storage-encryption",
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
  AddUser = "s:add-user",
  UpdateUser = "s:update-user",
  DeleteUser = "s:delete-user",
  AddGroup = "s:add-group",
  UpdateGroup = "s:update-group",
  DeleteGroup = "s:delete-group",
  AddGuest = "s:add-guest",
  UpdateGuest = "s:update-guest",
  DeleteGuest = "s:delete-guest",
  BackupProgress = "s:backup-progress",
  RestoreProgress = "s:restore-progress",
  EncryptionProgress = "s:encryption-progress",
  ChangeMyType = "s:change-my-type",
  ChatMessageId = "s:commit-chat-message",
  UpdateChat = "s:update-chat",
  UpdateTelegram = "s:update-telegram",
  SelfRestrictionFile = "s:self-restriction-file",
  SelfRestrictionFolder = "s:self-restriction-folder",
  ChaneFolderAccessRights = "s:change-access-rights-folder",
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
  StorageEncryption = "storage-encryption",
  SubscribeInSpaces = "subscribeInSpaces",
  UnsubscribeInSpaces = "unsubscribeInSpaces",
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
 * Represents the data to be emitted through a socket connection with subscribe and unsubscribe commands.
 *
 * @typedef {Object} TSubscribeEmitData
 * @property {string | string[]} roomParts - The parts of the room to which the data is emitted.
 * @property {boolean} [individual] - Optional flag indicating if the emission is for an individual.
 */
export type TSubscribeEmitData = {
  roomParts: string | string[];
  individual?: boolean;
};

/**
 * Represents the data to be emitted through a socket connection with restore backup command.
 *
 * @typedef {Object} TRestoreBackupEmitData
 * @property {boolean} dump - Flag indicating if it's a dump operation
 * @property {boolean} [individual] - Optional flag indicating if the emission is for an individual
 */
export type TRestoreBackupEmitData = {
  dump: boolean;
  individual?: boolean;
};

/**
 * A mapping between socket commands and their respective data types.
 * Each key corresponds to a command from the `SocketCommands` enum,
 */
export type TEmitEventsDataMap = {
  [SocketCommands.Subscribe]: TSubscribeEmitData;
  [SocketCommands.Unsubscribe]: TSubscribeEmitData;
  [SocketCommands.SubscribeInSpaces]: TSubscribeEmitData;
  [SocketCommands.UnsubscribeInSpaces]: TSubscribeEmitData;
  [SocketCommands.RefreshFolder]: string;
  [SocketCommands.RestoreBackup]: TRestoreBackupEmitData;
  [SocketCommands.StorageEncryption]: string;
};

/**
 * Resolves the associated data type for a given socket command.
 * If the provided command exists in `TEmitEventsDataMap`, it returns the associated data type.
 * Otherwise, it resolves to `never`.
 *
 * @template T - A specific socket command from the `SocketCommands` enum.
 * @typedef {any} TEmitData<T>
 */
export type TEmitData<T extends SocketCommands> =
  T extends keyof TEmitEventsDataMap ? TEmitEventsDataMap[T] : never;

/**
 * Represents the structure of an emit event for a socket connection.
 *
 * @typedef {Object} TEmit
 * @property {SocketCommands} command - The command to be sent through the socket.
 * @property {TEmitData<SocketCommands>} [data] - Optional data associated with the command.
 */
export type TEmit = {
  command: SocketCommands;
  data?: TEmitData<SocketCommands>;
};

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
 * A type defining the mapping between socket events and their respective listener callbacks.
 * The keys represent events from the `SocketEvents` enum, and the values define the types of
 * callbacks associated with those events.
 *
 * Each callback can have specific parameters and a return type, which are defined for each event.
 */
export type TListenEventCallbackMap = {
  [SocketEvents.LogoutSession]: (data: {
    loginEventId: unknown;
    redirectUrl: string | null;
  }) => void;
  [SocketEvents.ModifyFolder]: (data?: TOptSocket) => void;
  [SocketEvents.ModifyRoom]: (data: TOptSocket) => void;
  [SocketEvents.UpdateHistory]: (data: {
    id: number | string;
    type: string;
  }) => void;
  [SocketEvents.RefreshFolder]: (id: number) => void;
  [SocketEvents.MarkAsNewFolder]: (data: {
    folderId: number | string;
    count: number;
  }) => void;
  [SocketEvents.MarkAsNewFile]: (data: {
    fileId: number | string;
    count: number;
  }) => void;
  [SocketEvents.StartEditFile]: (id: number | string) => void;
  [SocketEvents.StopEditFile]: (id: number | string) => void;
  [SocketEvents.ChangedQuotaUsedValue]: (data: TOptSocket) => void;
  [SocketEvents.ChangedQuotaFeatureValue]: (data: TOptSocket) => void;
  [SocketEvents.ChangedQuotaUserUsedValue]: (data: TOptSocket) => void;
  [SocketEvents.AddUser]: (data: { id: string; data: TUser }) => void;
  [SocketEvents.UpdateUser]: (data: { id: string; data: TUser }) => void;
  [SocketEvents.DeleteUser]: (data: string) => void;
  [SocketEvents.AddGroup]: (data: { id: string; data: TGroup }) => void;
  [SocketEvents.UpdateGroup]: (data: { id: string; data: TGroup }) => void;
  [SocketEvents.AddGuest]: (data: { id: string; data: TUser }) => void;
  [SocketEvents.UpdateGuest]: (data: { id: string; data: TUser }) => void;
  [SocketEvents.DeleteGuest]: (data: string) => void;
  [SocketEvents.DeleteGroup]: (data: string) => void;
  [SocketEvents.RestoreProgress]: (opt: {
    progress: number;
    isCompleted: boolean;
    error: string;
  }) => void;
  [SocketEvents.BackupProgress]: (opt: {
    progress: number;
    isCompleted?: boolean;
    link?: string;
    error?: string;
  }) => void;
  [SocketEvents.EncryptionProgress]: (opt: {
    percentage: number;
    error: string;
  }) => void;
  [SocketEvents.ChangeMyType]: (data: {
    id: string;
    data: TUser;
    admin: string;
    hasPersonalFolder: boolean;
  }) => void;
  [SocketEvents.ChatMessageId]: (data: { messageId: number }) => void;
  [SocketEvents.UpdateChat]: (data: {
    chatId: string;
    chatTitle: string;
  }) => void;
  [SocketEvents.UpdateTelegram]: (data: { username: string }) => void;
  [SocketEvents.SelfRestrictionFile]: (data: {
    id: number;
    data: string;
  }) => void;
  [SocketEvents.SelfRestrictionFolder]: (data: {
    id: number;
    data: string;
  }) => void;
};

/**
 * A type representing a default listener for socket events not explicitly defined in `TListenEventCallbackMap`.
 */
export type TUnmappedSocketListener = () => void;

/**
 * A type that resolves the appropriate listener type for a given socket event.
 *
 * If the event is mapped in `TListenEventCallbackMap`, it resolves to the corresponding callback type.
 * Otherwise, it defaults to `TUnmappedSocketListener`.
 */
export type TSocketListener<T extends SocketEvents> =
  T extends keyof TListenEventCallbackMap
    ? TListenEventCallbackMap[T]
    : TUnmappedSocketListener;

/**
 * Represents a callback function to be used with socket events.
 *
 * @typedef {Object} TCallback
 * @property {SocketEvents} eventName - The name of the socket event.
 * @property {TSocketListener<SocketEvents>} callback - The function to be called when the event is triggered.
 */
export type TCallback = {
  eventName: SocketEvents;
  callback: TSocketListener<SocketEvents>;
};

declare global {
  interface Window {
    SOCKET_INSTANCE: SocketHelper | undefined;
  }

  // Extend the globalThis type to include SOCKET_INSTANCE
  var SOCKET_INSTANCE: SocketHelper | undefined;

  // @ts-ignore

  interface globalThis {
    SOCKET_INSTANCE: typeof SOCKET_INSTANCE;
  }
}

const isEmitDataValid = (
  command: SocketCommands,
  data?: TEmitData<SocketCommands>,
) => {
  if (
    command !== SocketCommands.Subscribe &&
    command !== SocketCommands.Unsubscribe &&
    command !== SocketCommands.SubscribeInSpaces &&
    command !== SocketCommands.UnsubscribeInSpaces
  ) {
    return true;
  }

  if (
    data &&
    typeof data === "object" &&
    "roomParts" in data &&
    data.roomParts?.length
  ) {
    return true;
  }

  return false;
};

/**
 * The `SocketHelper` class is a singleton that manages WebSocket connections and provides methods to interact with the WebSocket server.
 * It handles connection establishment, event registration, and message emission.
 *
 * @class
 * @example
 * // Retrieve the singleton instance
 * const socketHelper = SocketHelper?.getInstance();
 *
 * // Establish a connection
 * SocketHelper?.connect('ws://example.com', 'publicRoomKey');
 *
 * // Emit a message
 * SocketHelper?.emit('message', { text: 'Hello, World!' });
 *
 * // Register an event listener
 * SocketHelper?.on('message', (data) => {
 *   console.log('Received message:', data);
 * });
 * // Remove the event listener
 * SocketHelper?.on('message', (data) => {
 *   console.log('Received message:', data);
 * });
 *
 * @property {SocketHelper} instance - The singleton instance of the SocketHelper class.
 * @property {TSocketConnection | null} connectionSettings - The settings used to establish the WebSocket connection.
 * @property {Socket<DefaultEventsMap, DefaultEventsMap> | null} client - The WebSocket client instance.
 * @property {boolean} isSocketReady - Indicates whether the socket is ready for communication.
 * @property {TCallback[]} callbacks - A queue of callbacks to be registered once the socket is ready.
 * @property {TEmit[]} emits - A queue of messages to be emitted once the socket is ready.
 * @property {Map<string, boolean | undefined>} subscribeEmits - All subscribed items as keys and individuals as value.
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

  private reconnectIntervalId: NodeJS.Timeout | undefined = undefined;

  private maxReconnectRetries: number = 5;

  private currentReconnectRetries: number = 0;

  private isSocketReady: boolean = false;

  private callbacks: TCallback[] = [];

  private emits: TEmit[] = [];

  private subscribeEmits = new Map<string, boolean | undefined>();

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
    // if (this.instance) return this.instance;

    // this.instance = new SocketHelper();
    // return this.instance;
    if (
      typeof globalThis !== "undefined" &&
      (globalThis as unknown as { SOCKET_INSTANCE?: SocketHelper })
        .SOCKET_INSTANCE
    ) {
      // [WS] Returning existing global socket instance
      return (globalThis as unknown as { SOCKET_INSTANCE?: SocketHelper })
        .SOCKET_INSTANCE;
    }

    if (!this.instance) {
      // [WS] Creating new socket instance
      this.instance = new SocketHelper();
      if (typeof globalThis !== "undefined")
        (
          globalThis as unknown as { SOCKET_INSTANCE?: SocketHelper }
        ).SOCKET_INSTANCE = this.instance;
    }
    // [WS] Returning existing socket instance
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
      if (
        !this.connectionSettings ||
        !this.connectionSettings.url ||
        (this.client && this.client.connected)
      )
        return;

      const { url, publicRoomKey } = this.connectionSettings;

      const { origin } = window.location;

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
        clearInterval(this.reconnectIntervalId);
        this.currentReconnectRetries = 0;
        addLog("[WS] socket is connected", "socket");
        this.subscribeEmits.forEach((individual, roomParts) => {
          this.client?.emit(SocketCommands.Subscribe, {
            roomParts,
            individual,
          });
        });
      });

      this.client.on("connect_error", (err) =>
        addLog(`[WS] socket connect error: ${err}`, "socket"),
      );

      this.client.on("disconnect", () => {
        this.reconnectIntervalId = setInterval(() => {
          if (this.currentReconnectRetries === this.maxReconnectRetries) {
            clearInterval(this.reconnectIntervalId);
            return;
          }

          if (this.client !== null && this.client.connected === false) {
            this.currentReconnectRetries += 1;
            addLog(
              `[WS] socket reconnect attempt: ${this.currentReconnectRetries}`,
              "socket",
            );
            this.client.connect();
          }
        }, 1000);
        addLog("[WS] socket is disconnected", "socket");
      });

      this.client.on("connection-init", () => {
        addLog("[WS] socket is ready (connection-init)", "socket");

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
    return new Set(this.subscribeEmits.keys());
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

    addLog(
      `[WS] connect. Url: ${url}; publicRoomKey: ${publicRoomKey}`,
      "socket",
    );

    this.connectionSettings = { url, publicRoomKey } as TSocketConnection;
    this.tryConnect();
  }

  /**
   * Emits a command with associated data to a specified room or globally.
   * If the socket is not ready, the command is saved in a queue for later emission.
   *
   * @param {T} command - The socket command to be emitted.
   * @param {TEmitData<T>} [data] - Optional data associated with the command. The type of data is resolved based on the command.
   *
   * @returns {void}
   */
  public emit = <T extends SocketCommands>(command: T, data?: TEmitData<T>) => {
    if (!isEmitDataValid(command, data)) return;

    if (!this.isEnabled || !this.isReady || !this.client) {
      addLog(
        `[WS] socket [emit] is not ready -> save in a queue. Command: ${command}, data: ${data}`,
        "socket",
      );
      this.emits.push({ command, data });
      return;
    }

    addLog(`[WS] emit.  Command: ${command}, data: ${data}`, "socket");

    const dataHasRoomParts =
      typeof data === "object" && "roomParts" in data && data.roomParts;

    const ids = !dataHasRoomParts
      ? []
      : typeof data.roomParts === "object"
        ? data.roomParts
        : [data.roomParts];

    ids.forEach((id: string) => {
      if (command === "subscribe") {
        if (this.subscribeEmits.has(id)) return;

        this.subscribeEmits.set(
          id,
          typeof data === "object" && data?.individual,
        );
      }

      if (command === "unsubscribe") {
        this.subscribeEmits.delete(id);
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
  public on = <T extends SocketEvents>(
    eventName: T,
    callback: TSocketListener<T>,
  ) => {
    if (!this.isEnabled || !this.isReady || !this.client) {
      addLog(
        `[WS] socket [on] is not ready -> save in a queue. Event name: ${eventName}`,
        "socket",
      );
      this.callbacks.push({ eventName, callback });
      return;
    }

    addLog(`[WS] on event: ${eventName}`, "socket");

    this.client.on(eventName satisfies string, callback);
  };

  /**
   * Remove an event listener for the specified event name.
   * If the socket is not enabled, not ready, or the client is not available,
   * the event listener is removed from a queue.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be executed when the event is triggered.
   */
  public off = <T extends SocketEvents>(
    eventName: T,
    callback?: TSocketListener<T>,
  ) => {
    if (!this.isEnabled || !this.isReady || !this.client) {
      addLog(
        `[WS] socket [off] is not ready -> remove from a queue. Event name: ${eventName}`,
        "socket",
      );

      this.callbacks = this.callbacks.filter(
        (c) => c.eventName !== eventName || c.callback !== callback,
      );

      return;
    }

    addLog(`[WS] off event: ${eventName}`, "socket");

    this.client.off(eventName satisfies string, callback);
  };
}

export default SocketHelper?.getInstance();
