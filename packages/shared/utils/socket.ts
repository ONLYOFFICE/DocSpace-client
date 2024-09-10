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
let client: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;
let callbacks: { eventName: string; callback: (value: TOnCallback) => void }[] =
  [];

const subscribers = new Set<string>();

type TOptQuota =
  | { customQuotaFeature: string; usedSpace: number; quotaLimit: number }
  | { customQuotaFeature?: never; usedSpace?: never; quotaLimit?: never };

export type TStatus = "online" | "offline";

export type TSession = {
  id: number;
  platform: string;
  browser: string;
  ip: string;
};

export type TLeaveInRoomData = {
  userId: string;
  date: string;
};

export type TStatusInRoomBase = {
  page: string;
  userId: string;
  sessions: TSession[];
};

export type TStatusInRoomOnline = TStatusInRoomBase & {
  status: Extract<TStatus, "online">;
};

export type TStatusInRoomOffline = TStatusInRoomBase & {
  status: Extract<TStatus, "offline">;
  date: string;
};

export type TStatusInRoom = TStatusInRoomOnline | TStatusInRoomOffline;

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
  data: { roomParts?: string | []; roomPart?: number; individual?: boolean };
  room?: null | boolean;
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

const getOpenFileId = () => {
  const isEditor = window.location.pathname.includes("/doceditor");
  const queryParams = new URLSearchParams(window.location.search);
  const fileId = queryParams.get("fileId");

  if (isEditor && fileId) {
    return fileId;
  }

  return null;
};

class SocketIOHelper {
  socketUrl: string | null = null;

  constructor(url: string, publicRoomKey: string) {
    if (!url) return;

    this.socketUrl = url;

    if (client) return;

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

    const openFileId = getOpenFileId();

    if (openFileId) {
      config.query = { ...config.query, openFileId };
    }

    client = io(origin, config);

    client.on("connect", () => {
      console.log("socket is connected");
      if (callbacks?.length > 0) {
        callbacks.forEach(({ eventName, callback }) => {
          if (!client) return;
          client.on(eventName, callback);
        });
        callbacks = [];
      }
    });
    client.on("connect_error", (err) =>
      console.log("socket connect error", err),
    );
    client.on("disconnect", () => console.log("socket is disconnected"));

    // DEV tests
    // window.socketHelper = this;
  }

  get isEnabled() {
    return this.socketUrl !== null;
  }

  get socketSubscribers() {
    return subscribers;
  }

  emit = ({ command, data, room = null }: TEmit) => {
    if (!this.isEnabled) return;

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

    if (!client) return;

    if (!client.connected) {
      client.on("connect", () => {
        if (room !== null) {
          if (!client) return;
          // @ts-expect-error need refactoring
          client.to(room).emit(command, data);
        } else {
          if (!client) return;
          client.emit(command, data);
        }
      });
    } else if (room) {
      // @ts-expect-error need refactoring
      client.to(room).emit(command, data);
    } else {
      client.emit(command, data);
    }
  };

  on = (eventName: string, callback: (value: TOptSocket) => void) => {
    if (!this.isEnabled) {
      callbacks.push({ eventName, callback });
      return;
    }

    if (!client) return;

    if (!client.connected) {
      client.on("connect", () => {
        if (!client) return;
        client.on(eventName, callback);
      });
    } else {
      client.on(eventName, callback);
    }
  };
}

export default SocketIOHelper;
