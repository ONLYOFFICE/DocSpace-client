import io from "socket.io-client";

let client = null;
let callbacks = [];
const subscribers = new Set();

class SocketIOHelper {
  socketUrl = null;

  constructor(url, publicRoomKey) {
    if (!url) return;

    this.socketUrl = url;

    if (client) return;

    const origin = window.location.origin;

    const config = {
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
        callbacks.forEach(({ eventName, callback }) =>
          client.on(eventName, callback)
        );
        callbacks = [];
      }
    });
    client.on("connect_error", (err) =>
      console.log("socket connect error", err)
    );
    client.on("disconnect", () => console.log("socket is disconnected"));
  }

  get isEnabled() {
    return this.socketUrl !== null;
  }

  get socketSubscribers() {
    return subscribers;
  }

  emit = ({ command, data, room = null }) => {
    if (!this.isEnabled) return;

    const ids =
      !data || !data.roomParts
        ? []
        : typeof data.roomParts === "object"
        ? data.roomParts
        : [data.roomParts];

    ids.forEach((id) => {
      if (command === "subscribe") {
        if (subscribers.has(id)) return;

        subscribers.add(id);
      }

      if (command === "unsubscribe") {
        subscribers.delete(id);
      }
    });

    if (!client.connected) {
      client.on("connect", () => {
        if (room !== null) {
          client.to(room).emit(command, data);
        } else {
          client.emit(command, data);
        }
      });
    } else {
      room ? client.to(room).emit(command, data) : client.emit(command, data);
    }
  };

  on = (eventName, callback) => {
    if (!this.isEnabled) {
      callbacks.push({ eventName, callback });
      return;
    }

    if (!client.connected) {
      client.on("connect", () => {
        client.on(eventName, callback);
      });
    } else {
      client.on(eventName, callback);
    }
  };
}

export default SocketIOHelper;
