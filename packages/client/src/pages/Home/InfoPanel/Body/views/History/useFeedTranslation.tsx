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

import { TTranslation } from "@docspace/shared/types";
import { Trans } from "react-i18next";
import moment from "moment";
import { AnyFeedInfo } from "./FeedInfo";
import { HistoryText } from "./HistoryText";

export const useFeedTranslation = (
  t: TTranslation,
  feed: { action: { key: AnyFeedInfo["key"] }; data: any },
  hasRelatedItems: boolean,
) => {
  const count = feed.related.length + 1;

  switch (feed.action.key) {
    case "FileCreated":
      return t("InfoPanel:FileCreated");
    case "FileUploaded":
      if (hasRelatedItems)
        return t("InfoPanel:FileUploadedCount", {
          count,
        });
      return t("InfoPanel:FileUploaded");
    case "UserFileUpdated":
      return t("InfoPanel:UserFileUpdated");
    case "FileConverted":
      return t("InfoPanel:FileConverted");
    case "FileRenamed":
      return t("InfoPanel:FileRenamed");
    case "FileMoved":
      if (feed.data.fromParentTitle) {
        return t("InfoPanel:FileMovedTo", {
          folderTitle: feed.data.parentTitle,
        });
      }
      if (hasRelatedItems)
        return t("InfoPanel:FileMovedCount", {
          count,
        });
      return t("InfoPanel:FileMoved");
    case "FileMovedToTrash":
      if (hasRelatedItems)
        return t("InfoPanel:FileMovedToTrashCount", {
          count,
        });
      return t("InfoPanel:FileMovedToTrash");
    case "FileCopied":
      if (feed.data.fromParentTitle) {
        return t("InfoPanel:FileCopiedTo", {
          folderTitle: feed.data.parentTitle,
        });
      }
      if (hasRelatedItems)
        return t("InfoPanel:FileCopiedCount", {
          count,
        });
      return t("InfoPanel:FileCopied");
    case "FileDeleted":
      if (hasRelatedItems)
        return t("InfoPanel:FileDeletedCount", {
          count,
        });
      return t("InfoPanel:FileDeleted");
    case "FileLocked":
      return `${t("Translations:FileLocked")}.`;
    case "FileUnlocked":
      return `${t("Translations:FileUnlocked")}.`;
    case "FileVersionRemoved":
      if (feed.data.version) {
        return t("InfoPanel:FileVersionRemoved", {
          version: feed.data.version,
        });
      }
    case "FileIndexChanged":
    case "FolderIndexChanged":
      return t("InfoPanel:IndexChanged");
    case "FolderIndexReordered":
      return t("InfoPanel:FolderIndexReordered");
    case "FolderCreated":
      return t("InfoPanel:FolderCreated");
    case "FolderRenamed":
      return t("InfoPanel:FolderRenamed");
    case "FolderMoved":
      if (hasRelatedItems)
        return t("InfoPanel:FolderMovedCount", {
          count,
        });
      return t("InfoPanel:FolderMoved");
    case "FolderMovedToTrash":
      if (hasRelatedItems)
        return t("InfoPanel:FolderMovedToTrashCount", {
          count,
        });
      return t("InfoPanel:FolderMovedToTrash");
    case "FolderCopied":
      if (hasRelatedItems)
        return t("InfoPanel:FolderCopiedCount", {
          count,
        });
      return t("InfoPanel:FolderCopied");
    case "FolderDeleted":
      if (hasRelatedItems)
        return t("InfoPanel:FolderDeletedCount", {
          count,
        });
      return t("InfoPanel:FolderDeleted");
    case "RoomCreated":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="HistoryRoomCreated"
          values={{ roomTitle: feed.data.title }}
          components={{ 1: <HistoryText title={feed.data.title} /> }}
        />
      );
    case "RoomCopied":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="HistoryRoomCopied"
          values={{ roomTitle: feed.data.title }}
          components={{ 1: <strong title={feed.data.title} /> }}
        />
      );
    case "RoomRenamed":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="RoomRenamed"
          values={{
            oldRoomTitle: feed.data.oldTitle,
            roomTitle: feed.data.newTitle,
          }}
          components={{
            1: <HistoryText title={feed.data.oldTitle} />,
            2: <HistoryText title={feed.data.newTitle} />,
          }}
        />
      );
    case "AddedRoomTags":
      return t("InfoPanel:AddedRoomTags");
    case "DeletedRoomTags":
      return t("InfoPanel:DeletedRoomTags");
    case "RoomLogoCreated":
    case "RoomColorChanged":
    case "RoomCoverChanged":
      return t("InfoPanel:RoomLogoChanged");
    case "RoomLogoDeleted":
      return t("InfoPanel:RoomLogoChanged");
    case "RoomExternalLinkCreated":
      return t("InfoPanel:RoomExternalLinkCreated");
    case "RoomExternalLinkRenamed":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="RoomExternalLinkRenamed"
          values={{
            linkTitle: feed.data.title,
            oldLinkTitle: feed.data.oldTitle,
          }}
          components={{ 1: <strong /> }}
        />
      );
    case "RoomExternalLinkDeleted":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="RoomExternalLinkDeleted"
          values={{
            linkTitle: feed.data.title,
          }}
          components={{ 1: <strong title={feed.data.title} /> }}
        />
      );
    case "RoomExternalLinkRevoked":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="RoomExternalLinkRevoked"
          values={{
            linkTitle: feed.data.title || feed.data.sharedTo?.title,
          }}
          components={{
            1: <strong title={feed.data.title || feed.data.sharedTo?.title} />,
          }}
        />
      );
    case "RoomCreateUser":
      if (hasRelatedItems) return t("InfoPanel:RoomCreateUserCount", { count });
      return t("InfoPanel:RoomCreateUser");
    case "RoomUpdateAccessForUser":
      return t("InfoPanel:RoomUpdateAccess");
    case "RoomRemoveUser":
      return t("InfoPanel:RoomRemoveUser");
    case "RoomInviteResend":
      return t("InfoPanel:RoomInviteResend");
    case "RoomGroupAdded":
      if (hasRelatedItems)
        return t("InfoPanel:RoomGroupAddedCount", {
          count,
        });
      return t("InfoPanel:RoomGroupAdded");
    case "RoomUpdateAccessForGroup":
      return t("InfoPanel:RoomUpdateAccess");
    case "RoomGroupRemove":
      return t("InfoPanel:RoomGroupRemove");
    case "RoomWatermarkSet":
      return t("InfoPanel:RoomWatermarkSet");
    case "RoomWatermarkDisabled":
      return t("InfoPanel:RoomWatermarkDisabled");
    case "RoomIndexingEnabled":
      return t("InfoPanel:RoomIndexingEnabled");
    case "RoomIndexingDisabled":
      return t("InfoPanel:RoomIndexingDisabled");
    case "RoomLifeTimeSet": {
      const periodLifeTime = feed.data.lifeTime.period;
      const value = feed.data.lifeTime.value;
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
    case "RoomLifeTimeDisabled":
      return t("InfoPanel:RoomLifeTimeDisabled");
    case "RoomDenyDownloadEnabled":
      return t("InfoPanel:RoomDenyDownloadEnabled");
    case "RoomDenyDownloadDisabled":
      return t("InfoPanel:RoomDenyDownloadDisabled");
    case "RoomArchived":
      return t("InfoPanel:RoomArchived");
    case "RoomUnarchived":
      return t("InfoPanel:RoomUnarchived");
    case "RoomIndexExportSaved":
      return t("InfoPanel:RoomIndexExportLocation", {
        sectionName: t("Common:MyFilesSection"),
      });
    case "FormSubmit":
      return t("InfoPanel:FilledOutForm");
    case "FormOpenedForFilling":
      return t("InfoPanel:StartedFillingItOut");
    case "FileCustomFilterEnabled":
      return t("InfoPanel:FileCustomFilterEnabled");
    case "FileCustomFilterDisabled":
      return t("InfoPanel:FileCustomFilterDisabled");

    case "FormStartedToFill":
      return t("InfoPanel:FormStartedToFill");

    case "FormPartiallyFilled":
      return t("InfoPanel:FormPartiallyFilled");

    case "FormCompletelyFilled":
      return t("InfoPanel:FormCompletelyFilled");

    case "FormStopped":
      return t("InfoPanel:FormStopped");

    default:
      return null;
  }
};
