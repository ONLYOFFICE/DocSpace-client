export const enum PluginFileType {
  Files = "file",
  Folders = "folder",
  Rooms = "room",
  Image = "image",
  Video = "video",
}

export const enum PluginEvents {
  CREATE = "create",
  RENAME = "rename",
  ROOM_CREATE = "create_room",
  ROOM_EDIT = "edit_room",
  CHANGE_COLUMN = "change_column",
  CHANGE_USER_TYPE = "change_user_type",
  CREATE_PLUGIN_FILE = "create_plugin_file",
}

export const enum PluginScopes {
  API = "API",
  Settings = "Settings",
  ContextMenu = "ContextMenu",
  InfoPanel = "InfoPanel",
  MainButton = "MainButton",
  ProfileMenu = "ProfileMenu",
  EventListener = "EventListener",
  File = "File",
}

export const enum PluginStatus {
  active = "active",
  hide = "hide",
}

export const enum PluginActions {
  updateProps = "update-props",
  updateContext = "update-context",

  updateStatus = "update-status",

  showToast = "show-toast",

  // showSettingsModal= "show-settings-modal",
  // closeSettingsModal= "close-settings-modal",

  showCreateDialogModal = "show-create-dialog-modal",

  showModal = "show-modal",
  closeModal = "close-modal",

  updateContextMenuItems = "update-context-menu-items",
  updateInfoPanelItems = "update-info-panel-items",
  updateMainButtonItems = "update-main-button-items",
  updateProfileMenuItems = "update-profile-menu-items",
  updateFileItems = "update-file-items",
  updateEventListenerItems = "update-event-listener-items",

  sendPostMessage = "send-post-message",

  saveSettings = "save-settings",
}

export const enum PluginToastType {
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
}

export const enum PluginComponents {
  box = "box",
  button = "button",
  checkbox = "checkbox",
  input = "input",
  label = "label",
  text = "text",
  textArea = "textArea",
  toggleButton = "toggleButton",
  img = "img",
  iFrame = "iFrame",
  comboBox = "comboBox",
  skeleton = "skeleton",
}

export const enum PluginUsersType {
  owner = "Owner",
  docSpaceAdmin = "DocSpaceAdmin",
  roomAdmin = "RoomAdmin",
  collaborator = "Collaborator",
  user = "User",
}

export const enum PluginDevices {
  mobile = "mobile",
  tablet = "tablet",
  desktop = "desktop",
}
