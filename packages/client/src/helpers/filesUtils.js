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

import CloudServicesGoogleDriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.google.drive.react.svg?url";
import CloudServicesBoxReactSvgUrl from "PUBLIC_DIR/images/cloud.services.box.react.svg?url";
import CloudServicesDropboxReactSvgUrl from "PUBLIC_DIR/images/cloud.services.dropbox.react.svg?url";
import CloudServicesOnedriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.onedrive.react.svg?url";
import CloudServicesKdriveReactSvgUrl from "PUBLIC_DIR/images/cloud.services.kdrive.react.svg?url";
import CloudServicesYandexReactSvgUrl from "PUBLIC_DIR/images/cloud.services.yandex.react.svg?url";
import CloudServicesNextcloudReactSvgUrl from "PUBLIC_DIR/images/cloud.services.nextcloud.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CloudServicesWebdavReactSvgUrl from "PUBLIC_DIR/images/cloud.services.webdav.react.svg?url";
import { RoomsType } from "@docspace/shared/enums";

import { OPERATIONS_NAME } from "@docspace/shared/constants";

import i18n from "../i18n";
import { getBrandName } from "@docspace/shared/constants/brands";

export const getRoomTypeName = (room, t) => {
  switch (room) {
    case RoomsType.CustomRoom:
      return t("Common:CustomRooms");

    case RoomsType.AIRoom:
      return t("Common:AIRoomTitle");

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
    default:
      break;
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
      return i18n.t("Common:NewPDFForm");
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
      return getBrandName("TypeTitleBoxNet");

    case "DropBox":
    case "DropboxV2":
      return getBrandName("TypeTitleDropBox");

    case "DocuSign":
      return getBrandName("TypeTitleDocuSign");

    case "Google":
    case "GoogleDrive":
      return getBrandName("TypeTitleGoogle");

    case "OneDrive":
    case "SkyDrive":
      return getBrandName("TypeTitleSkyDrive");

    case "SharePoint":
      return getBrandName("TypeTitleSharePoint");
    case "WebDav":
      return getBrandName("TypeTitleWebDav");
    case "kDrive":
      return getBrandName("TypeTitlekDrive");
    case "Yandex":
      return getBrandName("TypeTitleYandex");

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

export const calculateRoomLogoParams = (img, x, y, zoom) => {
  let imgWidth;
  let imgHeight;
  let dimensions;
  if (img.width > img.height) {
    imgWidth = Math.min(1280, img.width);
    imgHeight = Math.round(img.height / (img.width / imgWidth));
    dimensions = Math.round(imgHeight / zoom);
  } else {
    imgHeight = Math.min(1280, img.height);
    imgWidth = Math.round(img.width / (img.height / imgHeight));
    dimensions = Math.round(imgWidth / zoom);
  }

  const croppedX = Math.round(x * imgWidth - dimensions / 2);
  const croppedY = Math.round(y * imgHeight - dimensions / 2);

  return {
    x: croppedX,
    y: croppedY,
    width: dimensions,
    height: dimensions,
  };
};

export const removeSeparator = (options) => {
  const newOptions = options.map((o, index) => {
    if (index === 0 && o.includes("separator")) {
      return false;
    }

    if (index === options.length - 1 && o.includes("separator")) {
      return false;
    }

    if (o?.includes("separator") && options[index + 1].includes("separator")) {
      return false;
    }

    return o;
  });

  return newOptions.filter((o) => o);
};

export const removeOptions = (options, toRemoveArray) =>
  options.filter((o) => !toRemoveArray.includes(o));

export const mappingActiveItems = (items, destFolderId) => {
  const arrayFormation = items.map((item) =>
    typeof item === "object"
      ? { ...item, destFolderId: destFolderId ?? item.destFolderId }
      : {
          id: item,
          destFolderId,
        },
  );
  return arrayFormation;
};

export const getOperationsProgressTitle = (type, progress) => {
  const {
    trash,
    move,
    copy,
    download,
    duplicate,
    exportIndex,
    markAsRead,
    deletePermanently,
    upload,
    convert,
    deleteVersionFile,
  } = OPERATIONS_NAME;
  switch (type) {
    case trash:
      return i18n.t("Files:MovingToTrash");
    case move:
      return i18n.t("Common:MoveToOperation");
    case copy:
      return i18n.t("Common:CopyOperation");
    case download:
      return i18n.t("Files:Downloading");
    case duplicate:
      return i18n.t("Files:Duplicating");
    case exportIndex:
      return i18n.t("Files:ExportingIndex");
    case markAsRead:
      return i18n.t("Files:MarkingRead");
    case deletePermanently:
      return i18n.t("Files:DeletingPermanently");
    case upload:
      if (progress > 0 && progress < 100)
        return i18n.t("Files:UploadingProgress", { progress });
      return i18n.t("Files:Uploading");
    case convert:
      return i18n.t("Files:Converting");
    case deleteVersionFile:
      return i18n.t("Files:DeletingVersion");

    default:
      return i18n.t("Files:OtherProcesses");
  }
};
