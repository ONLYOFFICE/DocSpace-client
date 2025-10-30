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

import React from "react";
import { Trans, useTranslation } from "react-i18next";
import moment from "moment";

import {
  TFeedAction,
  FeedActionKeys,
  RoomMember,
  TFeedData,
} from "@docspace/shared/api/rooms/types";

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
        return t("InfoPanel:FileCreated");
      case FeedActionKeys.FileUploaded:
        if (hasRelatedItems)
          return t("InfoPanel:FileUploadedCount", {
            count,
          });
        return t("InfoPanel:FileUploaded");
      case FeedActionKeys.UserFileUpdated:
        return t("InfoPanel:UserFileUpdated");
      case FeedActionKeys.FileConverted:
        return t("InfoPanel:FileConverted");
      case FeedActionKeys.FileRenamed:
        return t("InfoPanel:FileRenamed");
      case FeedActionKeys.FileMoved:
        if ("fromParentTitle" in feed.data && feed.data.fromParentTitle) {
          return t("InfoPanel:FileMovedTo", {
            folderTitle: feed.data.parentTitle,
          });
        }
        if (hasRelatedItems)
          return t("InfoPanel:FileMovedCount", {
            count,
          });
        return t("InfoPanel:FileMoved");
      case FeedActionKeys.FileMovedToTrash:
        if (hasRelatedItems)
          return t("InfoPanel:FilesTrashMoveCompletedCount", {
            count,
            sectionName: t("Common:TrashSection"),
          });
        return t("InfoPanel:FilesTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FileCopied:
        if ("fromParentTitle" in feed.data && feed.data.fromParentTitle) {
          return t("InfoPanel:FileCopiedTo", {
            folderTitle: feed.data.parentTitle,
          });
        }
        if (hasRelatedItems)
          return t("InfoPanel:FileCopiedCount", {
            count,
          });
        return t("InfoPanel:FileCopied");
      case FeedActionKeys.FileDeleted:
        if (hasRelatedItems)
          return t("InfoPanel:FileDeletedCount", {
            count,
          });
        return t("InfoPanel:FileDeleted");
      case FeedActionKeys.FileLocked:
        return `${t("Translations:FileLocked")}.`;
      case FeedActionKeys.FileUnlocked:
        return `${t("Translations:FileUnlocked")}.`;
      case FeedActionKeys.FileVersionRemoved:
        if ("version" in feed.data && feed.data.version) {
          return t("InfoPanel:FileVersionRemoved", {
            version: feed.data.version,
          });
        }
      case FeedActionKeys.FileIndexChanged:
      case FeedActionKeys.FolderIndexChanged:
        return t("InfoPanel:IndexChanged");
      case FeedActionKeys.FolderIndexReordered:
        return t("InfoPanel:FolderIndexReordered");
      case FeedActionKeys.FolderCreated:
        return t("InfoPanel:FolderCreated");
      case FeedActionKeys.FolderRenamed:
        return t("InfoPanel:FolderRenamed");
      case FeedActionKeys.FolderMoved:
        if (hasRelatedItems)
          return t("InfoPanel:FolderMovedCount", {
            count,
          });
        return t("InfoPanel:FolderMoved");
      case FeedActionKeys.FolderMovedToTrash:
        if (hasRelatedItems)
          return t("InfoPanel:FoldersTrashMoveCompletedCount", {
            count,
            sectionName: t("Common:TrashSection"),
          });
        return t("InfoPanel:FoldersTrashMoveCompleted", {
          sectionName: t("Common:TrashSection"),
        });
      case FeedActionKeys.FolderCopied:
        if (hasRelatedItems)
          return t("InfoPanel:FolderCopiedCount", {
            count,
          });
        return t("InfoPanel:FolderCopied");
      case FeedActionKeys.FolderDeleted:
        if (hasRelatedItems)
          return t("InfoPanel:FolderDeletedCount", {
            count,
          });
        return t("InfoPanel:FolderDeleted");
      case FeedActionKeys.AgentCreated:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
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
            ns="InfoPanel"
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
            ns="InfoPanel"
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
            ns="InfoPanel"
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
            ns="InfoPanel"
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
        return t("InfoPanel:AddedRoomTags");
      case FeedActionKeys.DeletedRoomTags:
        return t("InfoPanel:DeletedRoomTags");
      case FeedActionKeys.RoomLogoCreated:
      case FeedActionKeys.RoomColorChanged:
      case FeedActionKeys.RoomCoverChanged:
        return t("InfoPanel:RoomLogoChanged");
      case FeedActionKeys.RoomLogoDeleted:
        return t("InfoPanel:RoomLogoChanged");
      case FeedActionKeys.RoomExternalLinkCreated:
        return t("InfoPanel:RoomExternalLinkCreated");
      case FeedActionKeys.RoomExternalLinkRenamed:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
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
            ns="InfoPanel"
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
            ns="InfoPanel"
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
        if (hasRelatedItems)
          return t("InfoPanel:RoomCreateUserCount", { count });
        return t("Common:RoomCreateUser");
      case FeedActionKeys.RoomUpdateAccessForUser:
        return t("InfoPanel:RoomUpdateAccess");
      case FeedActionKeys.RoomRemoveUser:
        return t("InfoPanel:RoomRemoveUser");
      case FeedActionKeys.RoomInviteResend:
        return t("InfoPanel:RoomInviteResend");
      case FeedActionKeys.RoomGroupAdded:
        if (hasRelatedItems)
          return t("InfoPanel:RoomGroupAddedCount", {
            count,
          });
        return t("InfoPanel:RoomGroupAdded");
      case FeedActionKeys.RoomUpdateAccessForGroup:
        return t("InfoPanel:RoomUpdateAccess");
      case FeedActionKeys.RoomGroupRemove:
        return t("InfoPanel:RoomGroupRemove");
      case FeedActionKeys.RoomWatermarkSet:
        return t("InfoPanel:RoomWatermarkSet");
      case FeedActionKeys.RoomWatermarkDisabled:
        return t("InfoPanel:RoomWatermarkDisabled");
      case FeedActionKeys.RoomIndexingEnabled:
        return t("InfoPanel:RoomIndexingEnabled");
      case FeedActionKeys.RoomIndexingDisabled:
        return t("InfoPanel:RoomIndexingDisabled");
      case FeedActionKeys.RoomLifeTimeSet: {
        const periodLifeTime = (feed.data as TFeedData).lifeTime?.period;
        const value = (feed.data as TFeedData).lifeTime?.value;
        const maxValue = 9999;
        const period =
          periodLifeTime === 0
            ? "days"
            : periodLifeTime === 1
              ? "months"
              : "years";

        const thresholds =
          periodLifeTime === 0
            ? { d: maxValue }
            : periodLifeTime === 1
              ? { M: maxValue }
              : { y: maxValue };

        const data = moment.duration(value, period).humanize(false, thresholds);

        return (
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="RoomLifeTimeSet"
            values={{ data }}
            components={{
              1: <strong key={data} />,
            }}
          />
        );
      }
      case FeedActionKeys.RoomLifeTimeDisabled:
        return t("InfoPanel:RoomLifeTimeDisabled");
      case FeedActionKeys.RoomDenyDownloadEnabled:
        return t("InfoPanel:RoomDenyDownloadEnabled");
      case FeedActionKeys.RoomDenyDownloadDisabled:
        return t("InfoPanel:RoomDenyDownloadDisabled");
      case FeedActionKeys.RoomArchived:
        return t("InfoPanel:RoomToArchiveMove", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.RoomUnarchived:
        return t("InfoPanel:RoomFromArchiveRestore", {
          sectionName: t("Common:Archive"),
        });
      case FeedActionKeys.RoomIndexExportSaved:
        return t("InfoPanel:RoomIndexExportLocation", {
          sectionName: t("Common:MyDocuments"),
        });
      case FeedActionKeys.FormSubmit:
        return t("InfoPanel:FilledOutForm");
      case FeedActionKeys.FormOpenedForFilling:
        return t("InfoPanel:StartedFillingItOut");
      case FeedActionKeys.FileCustomFilterEnabled:
        return t("InfoPanel:FileCustomFilterEnabled");
      case FeedActionKeys.FileCustomFilterDisabled:
        return t("InfoPanel:FileCustomFilterDisabled");

      case FeedActionKeys.FormStartedToFill:
        return t("InfoPanel:FormStartedToFill");

      case FeedActionKeys.FormPartiallyFilled:
        return t("InfoPanel:FormPartiallyFilled");

      case FeedActionKeys.FormCompletelyFilled:
        return t("InfoPanel:FormCompletelyFilled");

      case FeedActionKeys.FormStopped:
        return t("InfoPanel:FormStopped");

      default:
        return null;
    }
  };

  return { getFeedTranslation };
};
