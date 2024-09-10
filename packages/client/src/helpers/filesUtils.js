// (c) Copyright Ascensio System SIA 2009-2024
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

import CloudServicesGoogleDriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.google.drive.react.svg?url";
import CloudServicesBoxReactSvgUrl from "PUBLIC_DIR/images/cloud.services.box.react.svg?url";
import CloudServicesDropboxReactSvgUrl from "PUBLIC_DIR/images/cloud.services.dropbox.react.svg?url";
import CloudServicesOnedriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.onedrive.react.svg?url";
import CloudServicesKdriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.kdrive.react.svg?url";
import CloudServicesYandexReactSvgUrl from "PUBLIC_DIR/images/cloud.services.yandex.react.svg?url";
import CloudServicesNextcloudReactSvgUrl from "PUBLIC_DIR/images/cloud.services.nextcloud.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import CloudServicesWebdavReactSvgUrl from "PUBLIC_DIR/images/cloud.services.webdav.react.svg?url";
import { authStore, settingsStore } from "@docspace/shared/store";
import { FileType, RoomsType } from "@docspace/shared/enums";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import i18n from "../i18n";

import { request } from "@docspace/shared/api/client";

export const getFileTypeName = (fileType) => {
  switch (fileType) {
    case FileType.Unknown:
      return i18n.t("Common:Unknown");
    case FileType.Archive:
      return i18n.t("Common:Archive");
    case FileType.Video:
      return i18n.t("Common:Video");
    case FileType.Audio:
      return i18n.t("Common:Audio");
    case FileType.Image:
      return i18n.t("Common:Image");
    case FileType.Spreadsheet:
      return i18n.t("Files:Spreadsheet");
    case FileType.Presentation:
      return i18n.t("Files:Presentation");
    case FileType.Document:
    case FileType.OFormTemplate:
    case FileType.OForm:
    case FileType.PDF:
      return i18n.t("Files:Document");
    default:
      return i18n.t("Files:Folder");
  }
};

export const getRoomTypeName = (room, t) => {
  switch (room) {
    case RoomsType.CustomRoom:
      return t("Common:CustomRooms");

    case RoomsType.FillingFormsRoom:
      return t("Common:FillingFormRooms");

    case RoomsType.EditingRoom:
      return t("Common:CollaborationRooms");

    case RoomsType.ReviewRoom:
      return t("Common:Review");

    case RoomsType.ReadOnlyRoom:
      return t("Common:ViewOnlyRooms");

    case RoomsType.PublicRoom:
      return t("Common:PublicRoom");

    case RoomsType.VirtualDataRoom:
      return t("Common:VirtualDataRoom");

    case RoomsType.FormRoom:
      return t("Common:FormRoom");
  }
};

export const getDefaultFileName = (format) => {
  switch (format) {
    case "docx":
      return i18n.t("Common:NewDocument");
    case "xlsx":
      return i18n.t("Common:NewSpreadsheet");
    case "pptx":
      return i18n.t("Common:NewPresentation");
    case "pdf":
      return i18n.t("Common:NewMasterForm");
    default:
      return i18n.t("Common:NewFolder");
  }
};

export const getUnexpectedErrorText = () => {
  return i18n.t("Common:UnexpectedError");
};

export const connectedCloudsTitleTranslation = (key, t) => {
  switch (key) {
    case "Box":

    case "BoxNet":
      return t("Translations:FolderTitleBoxNet");

    case "DropBox":
    case "DropboxV2":
      return t("Translations:FolderTitleDropBox");

    case "DocuSign":
      return t("Translations:FolderTitleDocuSign");

    case "Google":
    case "GoogleDrive":
      return t("Translations:FolderTitleGoogle");

    case "OneDrive":
    case "SkyDrive":
      return t("Translations:FolderTitleSkyDrive");

    case "SharePoint":
      return t("Translations:FolderTitleSharePoint");
    case "WebDav":
      return t("Translations:FolderTitleWebDav");
    case "kDrive":
      return t("Translations:FolderTitlekDrive");
    case "Yandex":
      return t("Translations:FolderTitleYandex");

    default:
      return key;
  }
};

export const connectedCloudsTypeTitleTranslation = (key, t) => {
  switch (key) {
    case "Box":
    case "BoxNet":
      return t("Translations:TypeTitleBoxNet");

    case "DropBox":
    case "DropboxV2":
      return t("Translations:TypeTitleDropBox");

    case "DocuSign":
      return t("Translations:TypeTitleDocuSign");

    case "Google":
    case "GoogleDrive":
      return t("Translations:TypeTitleGoogle");

    case "OneDrive":
    case "SkyDrive":
      return t("Translations:TypeTitleSkyDrive");

    case "SharePoint":
      return t("Translations:TypeTitleSharePoint");
    case "WebDav":
      return t("Translations:TypeTitleWebDav");
    case "kDrive":
      return t("Translations:TypeTitlekDrive");
    case "Yandex":
      return t("Translations:TypeTitleYandex");

    default:
      return key;
  }
};

export const connectedCloudsTypeIcon = (key) => {
  switch (key) {
    case "GoogleDrive":
      return CloudServicesGoogleDriveReactSvgUrl;
    case "Box":
      return CloudServicesBoxReactSvgUrl;
    case "DropboxV2":
      return CloudServicesDropboxReactSvgUrl;
    case "OneDrive":
      return CloudServicesOnedriveReactSvgUrl;
    case "SharePoint":
      return CloudServicesOnedriveReactSvgUrl;
    case "kDrive":
      return CloudServicesKdriveReactSvgUrl;
    case "Yandex":
      return CloudServicesYandexReactSvgUrl;
    case "NextCloud":
      return CloudServicesNextcloudReactSvgUrl;
    case "OwnCloud":
      return CatalogFolderReactSvgUrl;
    case "WebDav":
      return CloudServicesWebdavReactSvgUrl;
    default:
  }
};
