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

import { TSelectorItem } from "../../components/selector";
import { TFile, TFolder } from "../../api/files/types";
import { TRoom } from "../../api/rooms/types";
import {
  getIconPathByFolderType,
  getLifetimePeriodTranslation,
} from "../../utils/common";
import { iconSize32 } from "../../utils/image-helpers";
import { DEFAULT_FILE_EXTS } from "./FilesSelector.constants";
import { getTitleWithoutExtension } from "../../utils";
import { TTranslation } from "../../types";
import type FilesFilter from "../../api/files/filter";
import {
  ApplyFilterOption,
  FilesSelectorFilterTypes,
  FilterType,
} from "../../enums";

const isDisableFolder = (
  folder: TFolder,
  disabledItems: (number | string)[],
  filterParam?: string | number,
) => {
  return filterParam ? false : disabledItems?.includes(folder.id);
};

export const convertFoldersToItems: (
  folders: TFolder[],
  disabledItems: (number | string)[],
  filterParam?: string | number,
) => TSelectorItem[] = (
  folders: TFolder[],
  disabledItems: (number | string)[],
  filterParam?: string | number,
) => {
  const items = folders.map((folder: TFolder) => {
    const {
      id,
      title,
      filesCount,
      foldersCount,
      security,
      parentId,
      type,
      rootFolderType,
    } = folder;

    const folderIconPath = getIconPathByFolderType(type);
    const icon = iconSize32.get(folderIconPath) as string;

    const isDisabled = isDisableFolder(folder, disabledItems, filterParam);

    return {
      id,
      label: title,
      title,
      icon,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      isDisabled,
    };
  });

  return items;
};

export const convertFilesToItems: (
  files: TFile[],
  getIcon: (fileExst: string) => string,
  filterParam?: string | number,
  includedItems?: (number | string)[],
) => TSelectorItem[] = (
  files: TFile[],
  getIcon: (fileExst: string) => string,
  filterParam?: string | number,
  includedItems?: (number | string)[],
) => {
  const items = files.map((file) => {
    const {
      id,
      title,
      security,
      folderId,
      rootFolderType,
      fileExst,
      fileType,
      viewUrl,
    } = file;

    const icon = getIcon(fileExst || DEFAULT_FILE_EXTS);
    const label = getTitleWithoutExtension(file, false);

    const isDisabled = includedItems?.length
      ? !includedItems.includes(id)
      : false;

    return {
      id,
      label,
      title,
      icon,
      security,
      parentId: folderId,
      rootFolderType,
      isDisabled: !filterParam || isDisabled,
      fileExst,
      fileType,
      viewUrl,
    };
  });
  return items;
};

export const convertRoomsToItems: (
  rooms: TRoom[],
  t: TTranslation,
) => TSelectorItem[] = (rooms: TRoom[], t: TTranslation) => {
  const items = rooms.map((room) => {
    const {
      id,
      title,
      roomType,
      logo,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      shared,
      lifetime,
    } = room;

    const icon = logo.medium || "";
    const cover = logo?.cover;

    const iconProp = icon ? { icon } : { color: logo.color as string };

    const lifetimeTooltip = lifetime
      ? t("Files:RoomFilesLifetime", {
          days: String(lifetime.value),
          period: getLifetimePeriodTranslation(lifetime.period, t),
        })
      : null;

    return {
      id,
      label: title,
      title,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      roomType,
      shared,
      lifetimeTooltip,
      cover,
      ...iconProp,
    };
  });

  return items;
};

export const getDefaultBreadCrumb = (t: TTranslation) => {
  return {
    label: t("Common:ProductName"),
    id: 0,
    isRoom: false,
  };
};

export const configureFilterByFilterParam = (
  filter: FilesFilter,
  filterParam: string | number,
  extsWebEdited: string[],
  applyFilterOption?: ApplyFilterOption,
) => {
  filter.applyFilterOption = applyFilterOption ?? ApplyFilterOption.Files;
  switch (filterParam) {
    case FilesSelectorFilterTypes.DOCX:
      filter.extension = FilesSelectorFilterTypes.DOCX;
      break;

    case FilesSelectorFilterTypes.IMG:
      filter.filterType = FilterType.ImagesOnly;
      break;

    case FilesSelectorFilterTypes.BackupOnly:
      filter.extension = "gz,tar";
      break;

    case FilesSelectorFilterTypes.XLSX:
      filter.filterType = FilterType.SpreadsheetsOnly;
      break;

    case FilesSelectorFilterTypes.PDF:
    case FilterType.Pdf:
      filter.filterType = FilterType.Pdf;
      break;

    case FilterType.DocumentsOnly:
      filter.filterType = FilterType.DocumentsOnly;
      break;

    case FilterType.DiagramsOnly:
      filter.filterType = FilterType.DiagramsOnly;
      break;

    case FilterType.PDFForm:
      filter.filterType = FilterType.PDFForm;
      break;

    case FilterType.PresentationsOnly:
      filter.filterType = FilterType.PresentationsOnly;
      break;

    case FilterType.SpreadsheetsOnly:
      filter.filterType = FilterType.SpreadsheetsOnly;
      break;

    case FilterType.ImagesOnly:
      filter.filterType = FilterType.ImagesOnly;
      break;

    case FilterType.MediaOnly:
      filter.filterType = FilterType.MediaOnly;
      break;

    case FilterType.ArchiveOnly:
      filter.filterType = FilterType.ArchiveOnly;
      break;

    case FilterType.FoldersOnly:
      filter.filterType = FilterType.FoldersOnly;
      break;

    case FilterType.FilesOnly:
      filter.filterType = FilterType.FilesOnly;
      break;

    case FilesSelectorFilterTypes.ALL:
      filter.applyFilterOption = ApplyFilterOption.All;
      filter.filterType = FilterType.None;
      break;

    case "EditorSupportedTypes":
      filter.extension = extsWebEdited
        .map((extension) => extension.slice(1))
        .join(",");
      break;

    default:
  }
};
