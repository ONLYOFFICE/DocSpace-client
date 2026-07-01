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
import {
  humanizeDuration,
  type DurationUnit,
} from "@docspace/ui-kit/utils/date";

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
        if (hasRelatedItems)
          return t("Common:FileUploadedCount", {
            count,
          });
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
        if (hasRelatedItems)
          return t("Common:FileMovedCount", {
            count,
          });
        return t("Common:FilesMovedNotify");
      case FeedActionKeys.FileMovedToTrash:
        if (hasRelatedItems)
          return t("Common:FilesTrashMoveCompletedCount", {
            count,
            sectionName: t("Common:TrashSection"),
          });
        return t("Common:FilesTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FileCopied:
        if ("fromParentTitle" in feed.data && feed.data.fromParentTitle) {
          return t("Common:FileCopiedTo", {
            folderTitle: (feed.data as TFeedData).parentTitle,
          });
        }
        if (hasRelatedItems)
          return t("Common:FileCopiedCount", {
            count,
          });
        return t("Common:FilesCopiedNotify");
      case FeedActionKeys.FileDeleted:
        if (hasRelatedItems)
          return t("Common:FileDeletedCount", {
            count,
          });
        return t("Common:FilesRemovedNotify");
      case FeedActionKeys.FileLocked:
        return `${t("Common:FileLocked")}.`;
      case FeedActionKeys.FileUnlocked:
        return `${t("Common:FileUnlocked")}.`;
      case FeedActionKeys.FileVersionRemoved:
        if ("version" in feed.data && feed.data.version) {
          return t("Common:FileVersionRemoved", {
            version: feed.data.version,
          });
        }
        return t("Common:IndexChanged");
      case FeedActionKeys.FileIndexChanged:
      case FeedActionKeys.FolderIndexChanged:
        return t("Common:IndexChanged");
      case FeedActionKeys.FolderIndexReordered:
        return t("Common:FolderIndexReordered");
      case FeedActionKeys.FolderCreated:
        return t("Common:FolderCreatedNotify");
      case FeedActionKeys.FolderRenamed:
        return t("Common:FolderRenamedNotify");
      case FeedActionKeys.FolderMoved:
        if (hasRelatedItems)
          return t("Common:FolderMovedCount", {
            count,
          });
        return t("Common:FoldersMovedNotify");
      case FeedActionKeys.FolderMovedToTrash:
        if (hasRelatedItems)
          return t("Common:FoldersTrashMoveCompletedCount", {
            count,
            sectionName: t("Common:TrashSection"),
          });
        return t("Common:FoldersTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FolderCopied:
        if (hasRelatedItems)
          return t("Common:FolderCopiedCount", {
            count,
          });
        return t("Common:FoldersCopiedNotify");
      case FeedActionKeys.FolderDeleted:
        if (hasRelatedItems)
          return t("Common:FolderDeletedCount", {
            count,
          });
        return t("Common:FoldersRemovedNotify");
      case FeedActionKeys.AgentCreated: {
        const title = (feed.data as TFeedData).title;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="HistoryAgentCreated"
            values={{ roomTitle: title }}
            components={{ 1: <HistoryText key="1" title={title ?? ""} /> }}
          />
        );
      }
      case FeedActionKeys.AgentRenamed: {
        const oldTitle = (feed.data as TFeedData).oldTitle;
        const newTitle = (feed.data as TFeedData).newTitle;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="AgentRenamed"
            values={{ oldRoomTitle: oldTitle, roomTitle: newTitle }}
            components={{
              1: <HistoryText key="1" title={oldTitle ?? ""} />,
              2: <HistoryText key="2" title={newTitle ?? ""} />,
            }}
          />
        );
      }
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
      case FeedActionKeys.RoomCopied: {
        const title = (feed.data as TFeedData).title;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="HistoryRoomCopied"
            values={{ roomTitle: title }}
            components={{ 1: <strong key="1" title={title} /> }}
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
      case FeedActionKeys.RoomCreateUser:
        if (hasRelatedItems) return t("Common:RoomCreateUserCount", { count });
        return t("Common:RoomCreateUser");
      case FeedActionKeys.RoomRemoveUser:
        return t("Common:RoomRemoveUser");
      case FeedActionKeys.RoomGroupAdded:
        if (hasRelatedItems) return t("Common:RoomGroupAddedCount", { count });
        return t("Common:RoomGroupAdded");
      case FeedActionKeys.RoomUpdateAccessForUser:
      case FeedActionKeys.RoomUpdateAccessForGroup:
        return t("Common:RoomUpdateAccess");
      case FeedActionKeys.RoomInviteResend:
        return t("Common:RoomInviteResend");
      case FeedActionKeys.RoomGroupRemove:
        return t("Common:RoomGroupRemove");
      case FeedActionKeys.RoomExternalLinkCreated:
        return t("Common:RoomExternalLinkCreated");
      case FeedActionKeys.RoomExternalLinkRenamed: {
        const title = (feed.data as TFeedData).title;
        const oldTitle = (feed.data as TFeedData).oldTitle;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="RoomExternalLinkRenamed"
            values={{ linkTitle: title, oldLinkTitle: oldTitle }}
            components={{ 1: <strong key="1" /> }}
          />
        );
      }
      case FeedActionKeys.RoomExternalLinkDeleted: {
        const title = (feed.data as TFeedData).title;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="RoomExternalLinkDeleted"
            values={{ linkTitle: title }}
            components={{ 1: <strong key="1" title={title} /> }}
          />
        );
      }
      case FeedActionKeys.RoomExternalLinkRevoked: {
        const linkTitle =
          (feed.data as TFeedData).title ||
          (feed.data as TFeedData).sharedTo?.title;
        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="RoomExternalLinkRevoked"
            values={{ linkTitle }}
            components={{ 1: <strong key="1" title={linkTitle} /> }}
          />
        );
      }
      case FeedActionKeys.RoomWatermarkSet:
        return t("Common:RoomWatermarkSet");
      case FeedActionKeys.RoomWatermarkDisabled:
        return t("Common:RoomWatermarkDisabled");
      case FeedActionKeys.RoomIndexingEnabled:
        return t("Common:RoomIndexingEnabled");
      case FeedActionKeys.RoomIndexingDisabled:
        return t("Common:RoomIndexingDisabled");
      case FeedActionKeys.RoomLifeTimeSet: {
        const periodLifeTime = (feed.data as TFeedData).lifeTime?.period;
        const value = (feed.data as TFeedData).lifeTime?.value ?? 0;
        const period: DurationUnit =
          periodLifeTime === 0
            ? "days"
            : periodLifeTime === 1
              ? "months"
              : "years";

        const data = humanizeDuration(value, period);

        return (
          <Trans
            t={t as TFunction}
            ns="Common"
            i18nKey="RoomLifeTimeSet"
            values={{ data }}
            components={{ 1: <strong key="1" /> }}
          />
        );
      }
      case FeedActionKeys.RoomLifeTimeDisabled:
        return t("Common:RoomLifeTimeDisabled");
      case FeedActionKeys.RoomDenyDownloadEnabled:
        return t("Common:RoomDenyDownloadEnabled");
      case FeedActionKeys.RoomDenyDownloadDisabled:
        return t("Common:RoomDenyDownloadDisabled");
      case FeedActionKeys.RoomIndexExportSaved:
        return t("Common:RoomIndexExportLocation", {
          sectionName: t("Common:Files"),
        });
      case FeedActionKeys.FormSubmit:
        return t("Common:FilledOutForm");
      case FeedActionKeys.FormOpenedForFilling:
        return t("Common:StartedFillingItOut");
      case FeedActionKeys.FileCustomFilterEnabled:
        return t("Common:FileCustomFilterEnabled");
      case FeedActionKeys.FileCustomFilterDisabled:
        return t("Common:FileCustomFilterDisabled");
      case FeedActionKeys.FormStartedToFill:
        return t("Common:FormStartedToFill");
      case FeedActionKeys.FormPartiallyFilled:
        return t("Common:FormPartiallyFilled");
      case FeedActionKeys.FormCompletelyFilled:
        return t("Common:FormCompletelyFilled");
      case FeedActionKeys.FormStopped:
        return t("Common:FormStoppedNotify");
      default:
        return feed.action.key ?? "";
    }
  };

  return { getFeedTranslation, count, hasRelatedItems };
};

