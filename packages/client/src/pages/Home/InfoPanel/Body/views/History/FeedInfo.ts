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
  FeedActionKeys,
  FeedTarget,
  RoomMember,
  TFeedData,
} from "@docspace/shared/api/rooms/types";

export const feedInfo = [
  //
  // FILE
  {
    key: FeedActionKeys.FileCreated,
    targetType: FeedTarget.File,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.FileUploaded,
    targetType: FeedTarget.File,
    actionType: FeedAction.Upload,
  },
  {
    key: FeedActionKeys.UserFileUpdated,
    targetType: FeedTarget.File,
    actionType: FeedAction.Update,
  },
  {
    key: FeedActionKeys.FileConverted,
    targetType: FeedTarget.File,
    actionType: FeedAction.Convert,
  },
  {
    key: FeedActionKeys.FileRenamed,
    targetType: FeedTarget.File,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedActionKeys.FileMoved,
    targetType: FeedTarget.File,
    actionType: FeedAction.Move,
  },
  {
    key: FeedActionKeys.FileMovedToTrash,
    targetType: FeedTarget.File,
    actionType: FeedAction.Move,
  },
  {
    key: FeedActionKeys.FileCopied,
    targetType: FeedTarget.File,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedActionKeys.FileDeleted,
    targetType: FeedTarget.File,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.FileIndexChanged,
    targetType: FeedTarget.File,
    actionType: FeedAction.Change,
  },
  {
    key: FeedActionKeys.FormSubmit,
    targetType: FeedTarget.File,
    actionType: FeedAction.Submitted,
  },
  {
    key: FeedActionKeys.FormOpenedForFilling,
    targetType: FeedTarget.File,
    actionType: FeedAction.StartedFilling,
  },
  {
    key: FeedActionKeys.FileLocked,
    targetType: FeedTarget.File,
    actionType: FeedAction.Locked,
  },
  {
    key: FeedActionKeys.FileUnlocked,
    targetType: FeedTarget.File,
    actionType: FeedAction.Unlocked,
  },
  {
    key: FeedActionKeys.FileVersionRemoved,
    targetType: FeedTarget.File,
    actionType: FeedAction.DeleteVersion,
  },
  {
    key: FeedActionKeys.FormStartedToFill,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormStartedToFill,
  },
  {
    key: FeedActionKeys.FormPartiallyFilled,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormPartiallyFilled,
  },
  {
    key: FeedActionKeys.FormCompletelyFilled,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormCompletelyFilled,
  },
  {
    key: FeedActionKeys.FormStopped,
    targetType: FeedTarget.File,
    actionType: FeedAction.FormStopped,
  },

  // MessageAction.FormStartedToFill,
  //         MessageAction.FormPartiallyFilled,
  //         MessageAction.FormCompletelyFilled,
  //         MessageAction.FormStopped

  {
    key: FeedActionKeys.FileCustomFilterDisabled,
    targetType: FeedTarget.File,
    actionType: FeedAction.CustomFilterDisabled,
  },
  {
    key: FeedActionKeys.FileCustomFilterEnabled,
    targetType: FeedTarget.File,
    actionType: FeedAction.CustomFilterEnabled,
  },
  // FOLDER
  {
    key: FeedActionKeys.FolderCreated,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.FolderRenamed,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedActionKeys.FolderMoved,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Move,
  },
  {
    key: FeedActionKeys.FolderMovedToTrash,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Move,
  },
  {
    key: FeedActionKeys.FolderCopied,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedActionKeys.FolderDeleted,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.FolderIndexChanged,
    targetType: FeedTarget.Folder,
    actionType: FeedAction.Change,
  },
  {
    key: FeedActionKeys.FolderIndexReordered,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Reorder,
  },
  //
  // AGENTS
  {
    key: FeedActionKeys.AgentCreated,
    targetType: FeedTarget.Agent,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.AgentRenamed,
    targetType: FeedTarget.Agent,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedActionKeys.AddedAgentTags,
    targetType: FeedTarget.AgentTag,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.DeletedAgentTags,
    targetType: FeedTarget.AgentTag,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.AgentLogoCreated,
    targetType: FeedTarget.AgentLogo,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.AgentLogoDeleted,
    targetType: FeedTarget.AgentLogo,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.AgentColorChanged,
    targetType: FeedTarget.AgentLogo,
    actionType: FeedAction.CHANGE_COLOR,
  },
  {
    key: FeedActionKeys.AgentCoverChanged,
    targetType: FeedTarget.AgentLogo,
    actionType: FeedAction.CHANGE_COVER,
  },
  {
    key: FeedActionKeys.AgentCreateUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.AgentUpdateAccessForUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Update,
  },
  {
    key: FeedActionKeys.AgentRemoveUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.AgentInviteResend,
    targetType: FeedTarget.User,
    actionType: FeedAction.Invite,
  },
  {
    key: FeedActionKeys.AgentGroupAdded,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.AgentUpdateAccessForGroup,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Update,
  },
  {
    key: FeedActionKeys.AgentGroupRemove,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Delete,
  },
  //
  // ROOM
  {
    key: FeedActionKeys.RoomCreated,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomRenamed,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedActionKeys.RoomCopied,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Copy,
  },
  {
    key: FeedActionKeys.RoomWatermarkSet,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomWatermarkDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomIndexingEnabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomIndexingDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomLifeTimeSet,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomLifeTimeDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomDenyDownloadEnabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomDenyDownloadDisabled,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomArchived,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Archived,
  },
  {
    key: FeedActionKeys.RoomUnarchived,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Unarchived,
  },
  {
    key: FeedActionKeys.RoomIndexExportSaved,
    targetType: FeedTarget.Room,
    actionType: FeedAction.Export,
  },
  // ROOM TAGS
  {
    key: FeedActionKeys.AddedRoomTags,
    targetType: FeedTarget.RoomTag,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.DeletedRoomTags,
    targetType: FeedTarget.RoomTag,
    actionType: FeedAction.Delete,
  },
  // ROOM LOGO
  {
    key: FeedActionKeys.RoomLogoCreated,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomLogoDeleted,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomColorChanged,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.CHANGE_COLOR,
  },
  {
    key: FeedActionKeys.RoomCoverChanged,
    targetType: FeedTarget.RoomLogo,
    actionType: FeedAction.CHANGE_COVER,
  },
  // ROOM EXTERNAL LINK
  {
    key: FeedActionKeys.RoomExternalLinkCreated,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomExternalLinkRenamed,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Rename,
  },
  {
    key: FeedActionKeys.RoomExternalLinkDeleted,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomExternalLinkRevoked,
    targetType: FeedTarget.RoomExternalLink,
    actionType: FeedAction.Revoke,
  },
  //
  // USER
  {
    key: FeedActionKeys.RoomCreateUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomUpdateAccessForUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Update,
  },
  {
    key: FeedActionKeys.RoomRemoveUser,
    targetType: FeedTarget.User,
    actionType: FeedAction.Delete,
  },
  {
    key: FeedActionKeys.RoomInviteResend,
    targetType: FeedTarget.User,
    actionType: FeedAction.Invite,
  },
  //
  // GROUP
  {
    key: FeedActionKeys.RoomGroupAdded,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Create,
  },
  {
    key: FeedActionKeys.RoomUpdateAccessForGroup,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Update,
  },
  {
    key: FeedActionKeys.RoomGroupRemove,
    targetType: FeedTarget.Group,
    actionType: FeedAction.Delete,
  },
] as const;

export const getFeedInfo = (feed: TFeedAction<TFeedData | RoomMember>) => {
  return feedInfo.find((info) => info.key === feed.action.key)!;
};
