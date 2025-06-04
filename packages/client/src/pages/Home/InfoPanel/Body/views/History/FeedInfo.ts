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

import {
  TFeedAction,
  FeedAction,
  FeedInfoKey,
  FeedTarget,
  RoomMember,
  TFeedData,
} from "@docspace/shared/api/rooms/types";

export const feedInfo = [
  //
  // FILE
  {
    key: FeedInfoKey.FileCreated,
    targetType: FeedTarget.File,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.FileUploaded,
    targetType: FeedTarget.File,
    actionType: FeedAction.Upload,
  },
  {
    key: FeedInfoKey.UserFileUpdated,
    targetType: FeedTarget.File,
    actionType: FeedAction.Update,
  },
  {
    key: FeedInfoKey.FileConverted,
    targetType: FeedTarget.File,
    actionType: FeedAction.Convert,
  },
  {
    key: FeedInfoKey.FileRenamed,
    targetType: FeedTarget.File,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedInfoKey.FileMoved,
    targetType: FeedTarget.File,
    actionType: FeedAction.Move,
  },
  {
    key: FeedInfoKey.FileMovedToTrash,
    targetType: FeedTarget.File,
    actionType: FeedAction.Move,
  },
  {
    key: FeedInfoKey.FileCopied,
    targetType: FeedTarget.File,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedInfoKey.FileDeleted,
    targetType: FeedTarget.File,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.FileIndexChanged,
    targetType: FeedTarget.File,
    actionType: FeedAction.Change,
  },
  {
    key: FeedInfoKey.FormSubmit,
    targetType: FeedTarget.File,
    actionType: FeedAction.Submitted,
  },
  {
    key: FeedInfoKey.FormOpenedForFilling,
    targetType: FeedTarget.File,
    actionType: FeedAction.StartedFilling,
  },
  {
    key: FeedInfoKey.FileLocked,
    targetType: FeedTarget.File,
    actionType: FeedAction.Locked,
  },
  {
    key: FeedInfoKey.FileUnlocked,
    targetType: FeedTarget.File,
    actionType: FeedAction.Unlocked,
  },
  {
    key: FeedInfoKey.FileVersionRemoved,
    targetType: FeedTarget.File,
    actionType: FeedAction.DeleteVersion,
  },
  {
    key: FeedInfoKey.FormStartedToFill,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormStartedToFill,
  },
  {
    key: FeedInfoKey.FormPartiallyFilled,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormPartiallyFilled,
  },
  {
    key: FeedInfoKey.FormCompletelyFilled,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormCompletelyFilled,
  },
  {
    key: FeedInfoKey.FormStopped,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormStopped,
  },
  {
    key: FeedInfoKey.FileCustomFilterDisabled,
    targetType: FeedTarget.File,
    actionType: FeedAction.CustomFilterDisabled,
  },
  {
    key: FeedInfoKey.FileCustomFilterEnabled,
    targetType: FeedTarget.File,
    actionType: FeedAction.CustomFilterEnabled,
  },
  // FOLDER
  {
    key: FeedInfoKey.FolderCreated,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.FolderRenamed,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedInfoKey.FolderMoved,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Move,
  },
  {
    key: FeedInfoKey.FolderMovedToTrash,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Move,
  },
  {
    key: FeedInfoKey.FolderCopied,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedInfoKey.FolderDeleted,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.FolderIndexChanged,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Change,
  },
  {
    key: FeedInfoKey.FolderIndexReordered,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Reorder,
  },
  //
  // ROOM
  {
    key: FeedInfoKey.RoomCreated,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomRenamed,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedInfoKey.RoomCopied,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedInfoKey.RoomWatermarkSet,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomWatermarkDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomIndexingEnabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomIndexingDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomLifeTimeSet,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomLifeTimeDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomDenyDownloadEnabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomDenyDownloadDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomArchived,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Archived,
  },
  {
    key: FeedInfoKey.RoomUnarchived,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Unarchived,
  },
  {
    key: FeedInfoKey.RoomIndexExportLocation,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Export,
  },
  // ROOM TAGS
  {
    key: FeedInfoKey.AddedRoomTags,
    targetType: FeedTarget.RoomTag,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.DeletedRoomTags,
    targetType: FeedTarget.RoomTag,
    actionType: FeedAction.Delete,
  },
  // ROOM LOGO
  {
    key: FeedInfoKey.RoomLogoCreated,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomLogoDeleted,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomColorChanged,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.CHANGE_COLOR,
  },
  {
    key: FeedInfoKey.RoomCoverChanged,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.CHANGE_COVER,
  },
  // ROOM EXTERNAL LINK
  {
    key: FeedInfoKey.RoomExternalLinkCreated,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomExternalLinkRenamed,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedInfoKey.RoomExternalLinkDeleted,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomExternalLinkRevoked,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Revoke,
  },
  //
  // USER
  {
    key: FeedInfoKey.RoomCreateUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomUpdateAccessForUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Update,
  },
  {
    key: FeedInfoKey.RoomRemoveUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedInfoKey.RoomInviteResend,
    targetType: FeedTarget.User,
    actionType: FeedAction.Invite,
  },
  //
  // GROUP
  {
    key: FeedInfoKey.RoomGroupAdded,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Create,
  },
  {
    key: FeedInfoKey.RoomUpdateAccessForGroup,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Update,
  },
  {
    key: FeedInfoKey.RoomGroupRemove,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Delete,
  },
] as const;

export const getFeedInfo = (feed: TFeedAction<TFeedData | RoomMember>) => {
  return feedInfo.find((info) => info.key === feed.action.key)!;
};
