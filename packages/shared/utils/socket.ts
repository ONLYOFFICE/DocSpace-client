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
import { DefaultEventsMap } from "@socket.io/component-emitter";
import io, { Socket } from "socket.io-client";

export type TOnCallback = {
  featureId: string;
  value: number;
  usedSpace: number;
  quotaLimit: number;
  customQuotaFeature: string;
  enableQuota: boolean;
  quota: number;
};
let globalClient: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;
let globalCallbacks: TCallback[] = [];
let globalEmits: TEmit[] = [];

const subscribers = new Set<string>();

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

export type TEmit = {
  command: string;
  data: { roomParts: string | []; individual?: boolean };
  room?: null | boolean;
};

export type TCallback = {
  eventName: string;
  callback: (value: TOnCallback) => void;
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

class SocketIOHelper {
  private socketUrl: string | null = null;

  private isSocketReady: boolean = false;

  constructor(url: string, publicRoomKey: string) {
    if (!url) return;

    this.socketUrl = url;

    if (globalClient) return;

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

    globalClient = io(origin, config);

    globalClient.on("connect", () => {
      console.log("[WS] socket is connected");
    });
    globalClient.on("connect_error", (err) =>
      console.log("[WS] socket connect error", err),
    );
    globalClient.on("disconnect", () =>
      console.log("[WS] socket is disconnected"),
    );
    globalClient.on("connection-init", this.onConnectionInit());

    // DEV tests
    // window.socketHelper = this;
  }

  private onConnectionInit(): () => void {
    return () => {
      console.log("[WS] socket is ready (connection-init)");

      this.isSocketReady = true;

      if (globalCallbacks.length) {
        globalCallbacks.forEach(({ eventName, callback }: TCallback) => {
          this.on(eventName, callback);
        });
        globalCallbacks = [];
      }

      if (globalEmits.length) {
        globalEmits.forEach(({ command, data, room }) => {
          this.emit({ command, data, room });
        });
        globalEmits = [];
      }
    };
  }

  get isEnabled() {
    return this.socketUrl !== null;
  }

  get isReady() {
    return this.isSocketReady;
  }

  get socketSubscribers() {
    return subscribers;
  }

  get socket() {
    return globalClient;
  }

  emit = ({ command, data, room = null }: TEmit) => {
    if (!this.isEnabled || !this.isReady || !globalClient) {
      console.log("[WS] socket [emit] is not ready -> save in queue", {
        command,
        data,
        room,
      });
      globalEmits.push({ command, data, room });
      return;
    }

    console.log("[WS] emit", command, data, room);

    const ids =
      !data || !data.roomParts
        ? []
        : typeof data.roomParts === "object"
          ? data.roomParts
          : [data.roomParts];

    ids.forEach((id: string) => {
      if (command === "subscribe") {
        if (subscribers.has(id)) return;

        subscribers.add(id);
      }

      if (command === "unsubscribe") {
        subscribers.delete(id);
      }
    });

    return room
      ? globalClient.to(room).emit(command, data)
      : globalClient.emit(command, data);
  };

  on = (eventName: string, callback: (value: TOnCallback) => void) => {
    if (!this.isEnabled || !this.isReady || !globalClient) {
      console.log("[WS] socket [on] is not ready -> save in queue", {
        eventName,
        callback,
      });
      globalCallbacks.push({ eventName, callback });
      return;
    }

    console.log("[WS] on", eventName, callback);

    globalClient.on(eventName, callback);
  };
}

export default SocketIOHelper;
