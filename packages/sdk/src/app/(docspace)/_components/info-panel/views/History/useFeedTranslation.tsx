// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import {
  TFeedAction,
  FeedActionKeys,
  RoomMember,
  TFeedData,
} from "@docspace/shared/api/rooms/types";

import { HistoryText } from "./HistoryText";

export const useFeedTranslation = (
  feed: TFeedAction<TFeedData | RoomMember>,
  hasRelatedItems: boolean,
) => {
  const { t } = useTranslation(["Common"]);
  const count = feed.related.length + 1;

  const getFeedTranslation = (): React.ReactNode => {
    switch (feed.action.key) {
      case FeedActionKeys.FileCreated:
        return t("Common:FileCreatedNotify");
      case FeedActionKeys.FileUploaded:
        return t("Common:FilesAddedNotify");
      case FeedActionKeys.UserFileUpdated:
        return t("Common:UserFileUpdated");
      case FeedActionKeys.FileConverted:
        return t("Common:FileConverted");
      case FeedActionKeys.FileRenamed:
        return t("Common:FileRenamedNotify");
      case FeedActionKeys.FileMoved:
        if ("fromParentTitle" in feed.data && feed.data.fromParentTitle) {
          return t("Common:FileMovedTo", {
            folderTitle: (feed.data as TFeedData).parentTitle,
          });
        }
        return t("Common:FilesMovedNotify");
      case FeedActionKeys.FileMovedToTrash:
        return t("Common:FilesTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FileCopied:
        if ("fromParentTitle" in feed.data && feed.data.fromParentTitle) {
          return t("Common:FileCopiedTo", {
            folderTitle: (feed.data as TFeedData).parentTitle,
          });
        }
        return t("Common:FilesCopiedNotify");
      case FeedActionKeys.FileDeleted:
        return t("Common:FilesRemovedNotify");
      case FeedActionKeys.FolderCreated:
        return t("Common:FolderCreatedNotify");
      case FeedActionKeys.FolderRenamed:
        return t("Common:FolderRenamedNotify");
      case FeedActionKeys.FolderMoved:
        return t("Common:FoldersMovedNotify");
      case FeedActionKeys.FolderMovedToTrash:
        return t("Common:FoldersTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FolderCopied:
        return t("Common:FoldersCopiedNotify");
      case FeedActionKeys.FolderDeleted:
        return t("Common:FoldersRemovedNotify");
      case FeedActionKeys.RoomCreated: {
        const title = (feed.data as TFeedData).title;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="HistoryRoomCreated"
            values={{ roomTitle: title }}
            components={{ 1: <HistoryText key="1" title={title ?? ""} /> }}
          />
        );
      }
      case FeedActionKeys.RoomRenamed: {
        const oldTitle = (feed.data as TFeedData).oldTitle;
        const newTitle = (feed.data as TFeedData).newTitle;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="RoomRenamed"
            values={{ oldRoomTitle: oldTitle, roomTitle: newTitle }}
            components={{
              1: <HistoryText key="1" title={oldTitle ?? ""} />,
              2: <HistoryText key="2" title={newTitle ?? ""} />,
            }}
          />
        );
      }
      case FeedActionKeys.RoomArchived:
        return t("Common:RoomToArchiveMove", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.RoomUnarchived:
        return t("Common:RoomFromArchiveRestore", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.AddedRoomTags:
        return t("Common:AddedRoomTags");
      case FeedActionKeys.DeletedRoomTags:
        return t("Common:DeletedRoomTags");
      case FeedActionKeys.RoomLogoCreated:
      case FeedActionKeys.RoomColorChanged:
      case FeedActionKeys.RoomCoverChanged:
      case FeedActionKeys.RoomLogoDeleted:
        return t("Common:RoomLogoChanged");
      case FeedActionKeys.RoomChangeOwner:
        return t("Common:RoomChangeOwner");
      default:
        return feed.action.key ?? "";
    }
  };

  return { getFeedTranslation, count, hasRelatedItems };
};

