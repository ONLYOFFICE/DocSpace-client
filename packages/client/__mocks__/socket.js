const SocketEvents = {
  CREATE_FILE: "CREATE_FILE",
  DELETE_FILE: "DELETE_FILE",
  UPDATE_FILE: "UPDATE_FILE",
  MOVE_FILE: "MOVE_FILE",
  COPY_FILE: "COPY_FILE"
};

const SocketCommands = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  EMIT: "emit"
};

class SocketHelper {
  static emit = jest.fn();
  static subscribe = jest.fn();
  static unsubscribe = jest.fn();
}

export { SocketEvents, SocketCommands };
export default SocketHelper;
