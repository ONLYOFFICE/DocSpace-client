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
