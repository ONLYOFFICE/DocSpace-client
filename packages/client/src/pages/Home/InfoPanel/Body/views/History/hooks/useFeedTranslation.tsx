/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { Trans, useTranslation } from "react-i18next";

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

import { HistoryText } from "../HistoryText";

export const useFeedTranslation = (
  feed: TFeedAction<TFeedData | RoomMember>,
  hasRelatedItems: boolean,
) => {
  const { t } = useTranslation(["InfoPanel", "Common", "Translations"]);

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
            folderTitle: feed.data.parentTitle,
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
            folderTitle: feed.data.parentTitle,
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
      case FeedActionKeys.AgentCreated:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="HistoryAgentCreated"
            values={{ roomTitle: (feed.data as TFeedData).title }}
            components={{
              1: (
                <HistoryText
                  key={(feed.data as TFeedData).title!}
                  title={(feed.data as TFeedData).title!}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.AgentRenamed:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="AgentRenamed"
            values={{
              oldRoomTitle: (feed.data as TFeedData).oldTitle,
              roomTitle: (feed.data as TFeedData).newTitle,
            }}
            components={{
              1: (
                <HistoryText
                  key={(feed.data as TFeedData).oldTitle!}
                  title={(feed.data as TFeedData).oldTitle!}
                />
              ),
              2: (
                <HistoryText
                  key={(feed.data as TFeedData).newTitle!}
                  title={(feed.data as TFeedData).newTitle!}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.RoomCreated:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="HistoryRoomCreated"
            values={{ roomTitle: (feed.data as TFeedData).title }}
            components={{
              1: (
                <HistoryText
                  key={(feed.data as TFeedData).title!}
                  title={(feed.data as TFeedData).title!}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.RoomCopied:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="HistoryRoomCopied"
            values={{ roomTitle: (feed.data as TFeedData).title }}
            components={{
              1: (
                <strong
                  key={(feed.data as TFeedData).title}
                  title={(feed.data as TFeedData).title}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.RoomRenamed:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="RoomRenamed"
            values={{
              oldRoomTitle: (feed.data as TFeedData).oldTitle,
              roomTitle: (feed.data as TFeedData).newTitle,
            }}
            components={{
              1: (
                <HistoryText
                  key={(feed.data as TFeedData).oldTitle!}
                  title={(feed.data as TFeedData).oldTitle!}
                />
              ),
              2: (
                <HistoryText
                  key={(feed.data as TFeedData).newTitle!}
                  title={(feed.data as TFeedData).newTitle!}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.AddedRoomTags:
        return t("Common:AddedRoomTags");
      case FeedActionKeys.DeletedRoomTags:
        return t("Common:DeletedRoomTags");
      case FeedActionKeys.RoomLogoCreated:
      case FeedActionKeys.RoomColorChanged:
      case FeedActionKeys.RoomCoverChanged:
        return t("Common:RoomLogoChanged");
      case FeedActionKeys.RoomLogoDeleted:
        return t("Common:RoomLogoChanged");
      case FeedActionKeys.RoomExternalLinkCreated:
        return t("Common:RoomExternalLinkCreated");
      case FeedActionKeys.RoomExternalLinkRenamed:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="RoomExternalLinkRenamed"
            values={{
              linkTitle: (feed.data as TFeedData).title,
              oldLinkTitle: (feed.data as TFeedData).oldTitle,
            }}
            components={{ 1: <strong key={(feed.data as TFeedData).title} /> }}
          />
        );
      case FeedActionKeys.RoomExternalLinkDeleted:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="RoomExternalLinkDeleted"
            values={{
              linkTitle: (feed.data as TFeedData).title,
            }}
            components={{
              1: (
                <strong
                  key={(feed.data as TFeedData).title}
                  title={(feed.data as TFeedData).title}
                />
              ),
            }}
          />
        );
      case FeedActionKeys.RoomExternalLinkRevoked:
        return (
          <Trans
            t={t}
            ns="Common"
            i18nKey="RoomExternalLinkRevoked"
            values={{
              linkTitle:
                (feed.data as TFeedData).title ||
                (feed.data as TFeedData).sharedTo?.title,
            }}
            components={{
              1: (
                <strong
                  key={
                    (feed.data as TFeedData).title ||
                    (feed.data as TFeedData).sharedTo?.title
                  }
                  title={
                    (feed.data as TFeedData).title ||
                    (feed.data as TFeedData).sharedTo?.title
                  }
                />
              ),
            }}
          />
        );
      case FeedActionKeys.RoomCreateUser:
        if (hasRelatedItems) return t("Common:RoomCreateUserCount", { count });
        return t("Common:RoomCreateUser");
      case FeedActionKeys.RoomUpdateAccessForUser:
        return t("Common:RoomUpdateAccess");
      case FeedActionKeys.RoomRemoveUser:
        return t("Common:RoomRemoveUser");
      case FeedActionKeys.RoomInviteResend:
        return t("Common:RoomInviteResend");
      case FeedActionKeys.RoomGroupAdded:
        if (hasRelatedItems)
          return t("Common:RoomGroupAddedCount", {
            count,
          });
        return t("Common:RoomGroupAdded");
      case FeedActionKeys.RoomUpdateAccessForGroup:
        return t("Common:RoomUpdateAccess");
      case FeedActionKeys.RoomGroupRemove:
        return t("Common:RoomGroupRemove");
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
            t={t}
            ns="Common"
            i18nKey="RoomLifeTimeSet"
            values={{ data }}
            components={{
              1: <strong key={data} />,
            }}
          />
        );
      }
      case FeedActionKeys.RoomLifeTimeDisabled:
        return t("Common:RoomLifeTimeDisabled");
      case FeedActionKeys.RoomDenyDownloadEnabled:
        return t("Common:RoomDenyDownloadEnabled");
      case FeedActionKeys.RoomDenyDownloadDisabled:
        return t("Common:RoomDenyDownloadDisabled");
      case FeedActionKeys.RoomArchived:
        return t("Common:RoomToArchiveMove", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.RoomUnarchived:
        return t("Common:RoomFromArchiveRestore", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.RoomIndexExportSaved:
        return t("Common:RoomIndexExportLocation", {
          sectionName: t("Common:Files"),
        });
      case FeedActionKeys.RoomChangeOwner:
        return t("Common:RoomChangeOwner");
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
        return null;
    }
  };

  return { getFeedTranslation };
};

