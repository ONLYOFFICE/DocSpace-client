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

export enum FeedAction {
  Create = "create",
  Upload = "upload",
  Update = "update",
  Convert = "convert",
  Delete = "delete",
  Rename = "rename",
  Move = "move",
  Copy = "copy",
  Revoke = "revoke",
  Change = "changeIndex",
  Reorder = "reorderIndex",
  Submitted = "submitted",
  StartedFilling = "startedFilling",
  Locked = "locked",
  Unlocked = "unlocked",
  Archived = "archived",
  Unarchived = "unarchived",
  Export = "export",
  Invite = "invite",
  CHANGE_COLOR = "changeColor",
  CHANGE_COVER = "changeCover",
  DeleteVersion = "deleteVersion",
  FormStartedToFill = "formStartedToFill",
  FormPartiallyFilled = "formPartiallyFilled",
  FormCompletelyFilled = "formCompletelyFilled",
  FormStopped = "formStopped",
  CustomFilterDisabled = "customFilterDisabled",
  CustomFilterEnabled = "customFilterEnabled",
}

enum FeedTarget {
  File = "file",
  Folder = "folder",
  Room = "room",
  RoomTag = "roomTag",
  RoomLogo = "roomLogo",
  RoomExternalLink = "roomExternalLink",
  User = "user",
  Group = "group",
}

export type AnyFeedInfo = {
  key: string;
  actionType: FeedAction;
  targetType: FeedTarget;
};

export type ActionByTarget<T extends `${FeedTarget}`> = Extract<
  AnyFeedInfo,
  { targetType: T }
>["actionType"];

export const feedInfo = [
  //
  // FILE
  {
    key: "FileCreated",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "FileUploaded",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Upload}`,
  },
  {
    key: "UserFileUpdated",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Update}`,
  },
  {
    key: "FileConverted",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Convert}`,
  },
  {
    key: "FileRenamed",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Rename}`,
  },
  {
    key: "FileMoved",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Move}`,
  },
  {
    key: "FileMovedToTrash",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Move}`,
  },
  {
    key: "FileCopied",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Copy}`,
  },
  {
    key: "FileDeleted",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "FileIndexChanged",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Change}`,
  },
  {
    key: "FormSubmit",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Submitted}`,
  },
  {
    key: "FormOpenedForFilling",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.StartedFilling}`,
  },
  {
    key: "FileLocked",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Locked}`,
  },
  {
    key: "FileUnlocked",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Unlocked}`,
  },
  {
    key: "FileVersionRemoved",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.DeleteVersion}`,
  },
  {
    key: "FormStartedToFill",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.FormStartedToFill}`,
  },
  {
    key: "FormPartiallyFilled",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.FormPartiallyFilled}`,
  },
  {
    key: "FormCompletelyFilled",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.FormCompletelyFilled}`,
  },
  {
    key: "FormStopped",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.FormStopped}`,
  },

  // MessageAction.FormStartedToFill,
  //         MessageAction.FormPartiallyFilled,
  //         MessageAction.FormCompletelyFilled,
  //         MessageAction.FormStopped

  {
    key: "FileCustomFilterDisabled",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.CustomFilterDisabled}`,
  },
  {
    key: "FileCustomFilterEnabled",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.CustomFilterEnabled}`,
  },
  // FOLDER
  {
    key: "FolderCreated",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "FolderRenamed",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Rename}`,
  },
  {
    key: "FolderMoved",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Move}`,
  },
  {
    key: "FolderMovedToTrash",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Move}`,
  },
  {
    key: "FolderCopied",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Copy}`,
  },
  {
    key: "FolderDeleted",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "FolderIndexChanged",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Change}`,
  },
  {
    key: "FolderIndexReordered",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Reorder}`,
  },
  //
  // ROOM
  {
    key: "RoomCreated",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomRenamed",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Rename}`,
  },
  {
    key: "RoomCopied",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Copy}`,
  },
  {
    key: "RoomWatermarkSet",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomWatermarkDisabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomIndexingEnabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomIndexingDisabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomLifeTimeSet",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomLifeTimeDisabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomDenyDownloadEnabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomDenyDownloadDisabled",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomArchived",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Archived}`,
  },
  {
    key: "RoomUnarchived",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Unarchived}`,
  },
  {
    key: "RoomIndexExportSaved",
    targetType: `${FeedTarget.Room}`,
    actionType: `${FeedAction.Export}`,
  },
  // ROOM TAGS
  {
    key: "AddedRoomTags",
    targetType: `${FeedTarget.RoomTag}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "DeletedRoomTags",
    targetType: `${FeedTarget.RoomTag}`,
    actionType: `${FeedAction.Delete}`,
  },
  // ROOM LOGO
  {
    key: "RoomLogoCreated",
    targetType: `${FeedTarget.RoomLogo}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomLogoDeleted",
    targetType: `${FeedTarget.RoomLogo}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomColorChanged",
    targetType: `${FeedTarget.RoomLogo}`,
    actionType: `${FeedAction.CHANGE_COLOR}`,
  },
  {
    key: "RoomCoverChanged",
    targetType: `${FeedTarget.RoomLogo}`,
    actionType: `${FeedAction.CHANGE_COVER}`,
  },
  // ROOM EXTERNAL LINK
  {
    key: "RoomExternalLinkCreated",
    targetType: `${FeedTarget.RoomExternalLink}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomExternalLinkRenamed",
    targetType: `${FeedTarget.RoomExternalLink}`,
    actionType: `${FeedAction.Rename}`,
  },
  {
    key: "RoomExternalLinkDeleted",
    targetType: `${FeedTarget.RoomExternalLink}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomExternalLinkRevoked",
    targetType: `${FeedTarget.RoomExternalLink}`,
    actionType: `${FeedAction.Revoke}`,
  },
  //
  // USER
  {
    key: "RoomCreateUser",
    targetType: `${FeedTarget.User}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomUpdateAccessForUser",
    targetType: `${FeedTarget.User}`,
    actionType: `${FeedAction.Update}`,
  },
  {
    key: "RoomRemoveUser",
    targetType: `${FeedTarget.User}`,
    actionType: `${FeedAction.Delete}`,
  },
  {
    key: "RoomInviteResend",
    targetType: `${FeedTarget.User}`,
    actionType: `${FeedAction.Invite}`,
  },
  //
  // GROUP
  {
    key: "RoomGroupAdded",
    targetType: `${FeedTarget.Group}`,
    actionType: `${FeedAction.Create}`,
  },
  {
    key: "RoomUpdateAccessForGroup",
    targetType: `${FeedTarget.Group}`,
    actionType: `${FeedAction.Update}`,
  },
  {
    key: "RoomGroupRemove",
    targetType: `${FeedTarget.Group}`,
    actionType: `${FeedAction.Delete}`,
  },
] as const;

export const getFeedInfo = (feed: { action: { key: AnyFeedInfo["key"] } }) => {
  return feedInfo.find((info) => info.key === feed.action.key)! || {};
};
