/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { DefaultEventsMap } from "@socket.io/component-emitter";
import io, { Socket } from "socket.io-client";

export type TOnCallback = {
  featureId: string;
  value: number;
};
let client: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;
let callbacks: { eventName: string; callback: (value: TOnCallback) => void }[] =
  [];

const subscribers = new Set<string>();

export type TOptSocket = {
  featureId: string;
  value: number;
  data?: string;
  type?: "folder" | "file";
  id?: string;
  cmd?: "create" | "update" | "delete";
};

export type TEmit = {
  command: string;
  data: { roomParts: string | []; individual?: boolean };
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
