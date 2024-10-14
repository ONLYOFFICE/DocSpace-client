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
  Submitted = "submitted",
  StartedFilling = "startedFilling",
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
    key: "FormSubmit",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.Submitted}`,
  },
  {
    key: "FormOpenedForFilling",
    targetType: `${FeedTarget.File}`,
    actionType: `${FeedAction.StartedFilling}`,
  },
  //
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
    key: "FolderCopied",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Copy}`,
  },
  {
    key: "FolderDeleted",
    targetType: `${FeedTarget.Folder}`,
    actionType: `${FeedAction.Delete}`,
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
