const SocketEvents = {
  CREATE_FILE: "CREATE_FILE",
  DELETE_FILE: "DELETE_FILE",
  UPDATE_FILE: "UPDATE_FILE",
  MOVE_FILE: "MOVE_FILE",
  COPY_FILE: "COPY_FILE",
};

const SocketCommands = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  EMIT: "emit",
};

class SocketHelper {
  static emit = jest.fn();
  static subscribe = jest.fn();
  static unsubscribe = jest.fn();
}

const getCookie = jest.fn(() => "en");
const combineUrl = jest.fn((base, relative) => `${base}/${relative}`);
const getViewForCurrentRoom = jest.fn();
const updateTempContent = jest.fn();
const isPublicRoom = jest.fn(() => false);
const toCommunityHostname = jest.fn();

export {
  SocketEvents,
  SocketCommands,
  getCookie,
  combineUrl,
  getViewForCurrentRoom,
  updateTempContent,
  isPublicRoom,
  toCommunityHostname,
};
export default SocketHelper;
