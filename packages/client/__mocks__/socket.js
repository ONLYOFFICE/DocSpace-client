const SocketEvents = {
  ModifyFolder: "s:modify-folder",
  UpdateHistory: "s:update-history",
  RefreshFolder: "s:refresh-folder",
  MarkAsNewFolder: "s:markasnew-folder",
  MarkAsNewFile: "s:markasnew-file",
  StartEditFile: "s:start-edit-file",
  StopEditFile: "s:stop-edit-file",
  ModifyRoom: "s:modify-room",
  CREATE_FILE: "s:create-file",
  DELETE_FILE: "s:delete-file",
  UPDATE_FILE: "s:update-file",
  MOVE_FILE: "s:move-file",
  COPY_FILE: "s:copy-file"
};

const SocketCommands = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe"
};

const SocketHelper = {
  on: jest.fn(),
  emit: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  socketSubscribers: new Map()
};

module.exports = {
  SocketEvents,
  SocketCommands,
  default: SocketHelper
};
