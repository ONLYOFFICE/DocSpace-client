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
  FeedInfoKey,
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
      case FeedInfoKey.FileCreated:
        return t("InfoPanel:FileCreated");
      case FeedInfoKey.FileUploaded:
        if (hasRelatedItems)
          return t("InfoPanel:FileUploadedCount", {
            count,
          });
        return t("InfoPanel:FileUploaded");
      case FeedInfoKey.UserFileUpdated:
        return t("InfoPanel:UserFileUpdated");
      case FeedInfoKey.FileConverted:
        return t("InfoPanel:FileConverted");
      case FeedInfoKey.FileRenamed:
        return t("InfoPanel:FileRenamed");
      case FeedInfoKey.FileMoved:
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
      case FeedInfoKey.FileMovedToTrash:
        if (hasRelatedItems)
          return t("InfoPanel:FileMovedToTrashCount", {
            count,
          });
        return t("InfoPanel:FileMovedToTrash");
      case FeedInfoKey.FileCopied:
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
      case FeedInfoKey.FileDeleted:
        if (hasRelatedItems)
          return t("InfoPanel:FileDeletedCount", {
            count,
          });
        return t("InfoPanel:FileDeleted");
      case FeedInfoKey.FileLocked:
        return `${t("Translations:FileLocked")}.`;
      case FeedInfoKey.FileUnlocked:
        return `${t("Translations:FileUnlocked")}.`;
      case FeedInfoKey.FileVersionRemoved:
        if ("version" in feed.data && feed.data.version) {
          return t("InfoPanel:FileVersionRemoved", {
            version: feed.data.version,
          });
        }
      case FeedInfoKey.FileIndexChanged:
      case FeedInfoKey.FolderIndexChanged:
        return t("InfoPanel:IndexChanged");
      case FeedInfoKey.FolderIndexReordered:
        return t("InfoPanel:FolderIndexReordered");
      case FeedInfoKey.FolderCreated:
        return t("InfoPanel:FolderCreated");
      case FeedInfoKey.FolderRenamed:
        return t("InfoPanel:FolderRenamed");
      case FeedInfoKey.FolderMoved:
        if (hasRelatedItems)
          return t("InfoPanel:FolderMovedCount", {
            count,
          });
        return t("InfoPanel:FolderMoved");
      case FeedInfoKey.FolderMovedToTrash:
        if (hasRelatedItems)
          return t("InfoPanel:FolderMovedToTrashCount", {
            count,
          });
        return t("InfoPanel:FolderMovedToTrash");
      case FeedInfoKey.FolderCopied:
        if (hasRelatedItems)
          return t("InfoPanel:FolderCopiedCount", {
            count,
          });
        return t("InfoPanel:FolderCopied");
      case FeedInfoKey.FolderDeleted:
        if (hasRelatedItems)
          return t("InfoPanel:FolderDeletedCount", {
            count,
          });
        return t("InfoPanel:FolderDeleted");
      case FeedInfoKey.RoomCreated:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="HistoryRoomCreated"
            values={{ roomTitle: (feed.data as TFeedData).title }}
            components={{
              1: <HistoryText title={(feed.data as TFeedData).title!} />,
            }}
          />
        );
      case FeedInfoKey.RoomCopied:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="HistoryRoomCopied"
            values={{ roomTitle: (feed.data as TFeedData).title }}
            components={{
              1: <strong title={(feed.data as TFeedData).title} />,
            }}
          />
        );
      case FeedInfoKey.RoomRenamed:
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
              1: <HistoryText title={(feed.data as TFeedData).oldTitle!} />,
              2: <HistoryText title={(feed.data as TFeedData).newTitle!} />,
            }}
          />
        );
      case FeedInfoKey.AddedRoomTags:
        return t("InfoPanel:AddedRoomTags");
      case FeedInfoKey.DeletedRoomTags:
        return t("InfoPanel:DeletedRoomTags");
      case FeedInfoKey.RoomLogoCreated:
      case FeedInfoKey.RoomColorChanged:
      case FeedInfoKey.RoomCoverChanged:
        return t("InfoPanel:RoomLogoChanged");
      case FeedInfoKey.RoomLogoDeleted:
        return t("InfoPanel:RoomLogoChanged");
      case FeedInfoKey.RoomExternalLinkCreated:
        return t("InfoPanel:RoomExternalLinkCreated");
      case FeedInfoKey.RoomExternalLinkRenamed:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="RoomExternalLinkRenamed"
            values={{
              linkTitle: (feed.data as TFeedData).title,
              oldLinkTitle: (feed.data as TFeedData).oldTitle,
            }}
            components={{ 1: <strong /> }}
          />
        );
      case FeedInfoKey.RoomExternalLinkDeleted:
        return (
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="RoomExternalLinkDeleted"
            values={{
              linkTitle: (feed.data as TFeedData).title,
            }}
            components={{
              1: <strong title={(feed.data as TFeedData).title} />,
            }}
          />
        );
      case FeedInfoKey.RoomExternalLinkRevoked:
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
                  title={
                    (feed.data as TFeedData).title ||
                    (feed.data as TFeedData).sharedTo?.title
                  }
                />
              ),
            }}
          />
        );
      case FeedInfoKey.RoomCreateUser:
        if (hasRelatedItems)
          return t("InfoPanel:RoomCreateUserCount", { count });
        return t("InfoPanel:RoomCreateUser");
      case FeedInfoKey.RoomUpdateAccessForUser:
        return t("InfoPanel:RoomUpdateAccess");
      case FeedInfoKey.RoomRemoveUser:
        return t("InfoPanel:RoomRemoveUser");
      case FeedInfoKey.RoomInviteResend:
        return t("InfoPanel:RoomInviteResend");
      case FeedInfoKey.RoomGroupAdded:
        if (hasRelatedItems)
          return t("InfoPanel:RoomGroupAddedCount", {
            count,
          });
        return t("InfoPanel:RoomGroupAdded");
      case FeedInfoKey.RoomUpdateAccessForGroup:
        return t("InfoPanel:RoomUpdateAccess");
      case FeedInfoKey.RoomGroupRemove:
        return t("InfoPanel:RoomGroupRemove");
      case FeedInfoKey.RoomWatermarkSet:
        return t("InfoPanel:RoomWatermarkSet");
      case FeedInfoKey.RoomWatermarkDisabled:
        return t("InfoPanel:RoomWatermarkDisabled");
      case FeedInfoKey.RoomIndexingEnabled:
        return t("InfoPanel:RoomIndexingEnabled");
      case FeedInfoKey.RoomIndexingDisabled:
        return t("InfoPanel:RoomIndexingDisabled");
      case FeedInfoKey.RoomLifeTimeSet: {
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
              1: <strong />,
            }}
          />
        );
      }
      case FeedInfoKey.RoomLifeTimeDisabled:
        return t("InfoPanel:RoomLifeTimeDisabled");
      case FeedInfoKey.RoomDenyDownloadEnabled:
        return t("InfoPanel:RoomDenyDownloadEnabled");
      case FeedInfoKey.RoomDenyDownloadDisabled:
        return t("InfoPanel:RoomDenyDownloadDisabled");
      case FeedInfoKey.RoomArchived:
        return t("InfoPanel:RoomArchived");
      case FeedInfoKey.RoomUnarchived:
        return t("InfoPanel:RoomUnarchived");
      case FeedInfoKey.RoomIndexExportLocation:
        return t("InfoPanel:RoomIndexExportLocation", {
          sectionName: t("Common:MyFilesSection"),
        });
      case FeedInfoKey.FormSubmit:
        return t("InfoPanel:FilledOutForm");
      case FeedInfoKey.FormOpenedForFilling:
        return t("InfoPanel:StartedFillingItOut");
      case FeedInfoKey.FileCustomFilterEnabled:
        return t("InfoPanel:FileCustomFilterEnabled");
      case FeedInfoKey.FileCustomFilterDisabled:
        return t("InfoPanel:FileCustomFilterDisabled");

      case FeedInfoKey.FormStartedToFill:
        return t("InfoPanel:FormStartedToFill");

      case FeedInfoKey.FormPartiallyFilled:
        return t("InfoPanel:FormPartiallyFilled");

      case FeedInfoKey.FormCompletelyFilled:
        return t("InfoPanel:FormCompletelyFilled");

      case FeedInfoKey.FormStopped:
        return t("InfoPanel:FormStopped");

      default:
        return null;
    }
  };

  return { getFeedTranslation };
};
