import { TTranslation } from "@docspace/shared/types";
import { Trans } from "react-i18next";
import { AnyFeedInfo } from "./FeedInfo";

export const useFeedTranslation = (
  t: TTranslation,
  feed: { action: { key: AnyFeedInfo["key"] }; data: any },
) => {
  switch (feed.action.key) {
    case "FileCreated":
      return t("InfoPanel:FileCreated");
    case "FileUploaded":
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
      return t("InfoPanel:FileMoved");
    case "FileCopied":
      if (feed.data.fromParentTitle) {
        return t("InfoPanel:FileCopiedTo", {
          folderTitle: feed.data.parentTitle,
        });
      }
      return t("InfoPanel:FileCopied");
    case "FileDeleted":
      return t("InfoPanel:FileDeleted");
    case "FolderCreated":
      return t("InfoPanel:FolderCreated");
    case "FolderRenamed":
      return t("InfoPanel:FolderRenamed");
    case "FolderMoved":
      return t("InfoPanel:FolderMoved");
    case "FolderCopied":
      return t("InfoPanel:FolderCopied");
    case "FolderDeleted":
      return t("InfoPanel:FolderDeleted");
    case "RoomCreated":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="HistoryRoomCreated"
          values={{ roomTitle: feed.data.title }}
          components={{ 1: <strong /> }}
        />
      );
    case "RoomCopied":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="HistoryRoomCopied"
          values={{ roomTitle: feed.data.title }}
          components={{ 1: <strong /> }}
        />
      );
    case "RoomRenamed":
      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="RoomRenamed"
          values={{
            roomTitle: feed.data.newTitle,
            oldRoomTitle: feed.data.oldTitle,
          }}
          components={{ 1: <strong /> }}
        />
      );
    case "AddedRoomTags":
      return t("InfoPanel:AddedRoomTags");
    case "DeletedRoomTags":
      return t("InfoPanel:DeletedRoomTags");
    case "RoomLogoCreated":
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
          components={{ 1: <strong /> }}
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
          components={{ 1: <strong /> }}
        />
      );
    case "RoomCreateUser":
      return t("InfoPanel:RoomCreateUser");
    case "RoomUpdateAccessForUser":
      return t("InfoPanel:RoomUpdateAccess");
    case "RoomRemoveUser":
      return t("InfoPanel:RoomRemoveUser");
    case "RoomGroupAdded":
      return t("InfoPanel:RoomGroupAdded");
    case "RoomUpdateAccessForGroup":
      return t("InfoPanel:RoomUpdateAccess");
    case "RoomGroupRemove":
      return t("InfoPanel:RoomGroupRemove");

    case "FormSubmit":
      return t("InfoPanel:FilledOutForm");
    case "FormOpenedForFilling":
      return t("InfoPanel:StartedFillingItOut");

    default:
      return null;
  }
};
