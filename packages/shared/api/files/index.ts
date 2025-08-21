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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import moment from "moment";
import {
  ConflictResolveType,
  FolderType,
  type FormFillingManageAction,
  ShareAccessRights,
} from "../../enums";
import {
  checkFilterInstance,
  decodeDisplayName,
  getFolderClassNameByType,
  sortInDisplayOrder,
} from "../../utils/common";

import { TNewFiles } from "../rooms/types";
import { request } from "../client";

import FilesFilter from "./filter";
import {
  TDocServiceLocation,
  TEditDiff,
  TEditHistory,
  TFile,
  TFileLink,
  TFilesSettings,
  TFilesUsedSpace,
  TFolder,
  TGetFolder,
  TGetFolderPath,
  TGetReferenceData,
  TGetReferenceDataRequest,
  TOpenEditRequest,
  TOperation,
  TPresignedUri,
  TSendEditorNotify,
  TSharedUsers,
  TThirdPartyCapabilities,
  TThirdParties,
  TUploadOperation,
  TConnectingStorages,
  SettingsThirdPartyType,
  TIndexItems,
  TUploadBackup,
  TFormRoleMappingRequest,
  TFileFillingFormStatus,
} from "./types";
import type { TFileConvertId } from "../../dialogs/download-dialog/DownloadDialog.types";

export async function openEdit(
  fileId: number | string,
  version?: string | number,
  doc?: string,
  view?: string,
  headers?: Record<string, string>,
  shareKey?: string,
  editorType?: string,
  action?: string,
) {
  const params = new URLSearchParams();

  if (version) {
    params.append("version", version);
  }
  if (doc) params.append("doc", doc);
  if (shareKey) params.append("share", shareKey);
  if (editorType) params.append("editorType", editorType);
  if (action) params.append(action, "true");

  const paramsString = params.toString();

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}/openedit?${paramsString}`,
  };

  if (headers) options.headers = headers;

  const res = (await request(options)) as TOpenEditRequest;

  if (action === "view") {
    res.config.editorConfig.mode = "view";
  }

  return res;
}

export async function getReferenceData(data: TGetReferenceData) {
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/files/file/referencedata`,
    data,
  };

  const res = (await request(options)) as TGetReferenceDataRequest;

  return res;
}

export async function getFolderInfo(
  folderId: number | string,
  skipRedirect = false,
  share?: string,
) {
  const headers = share
    ? {
        "Request-Token": share,
      }
    : undefined;

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/folder/${folderId}`,
    headers,
  };

  const res = (await request(options, skipRedirect)) as TFolder;

  return res;
}

export async function getFolderPath(folderId: number) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/folder/${folderId}/path`,
  };

  const res = (await request(options)) as TGetFolderPath;
  return res;
}

export async function getFolder(
  folderIdParam: string | number,
  filter: FilesFilter,
  signal?: AbortSignal,
  share?: string,
) {
  let params = folderIdParam;
  let folderId = folderIdParam;

  if (folderId && typeof folderId === "string") {
    folderId = encodeURIComponent(folderId.replace(/\\\\/g, "\\"));
  }

  if (filter) {
    checkFilterInstance(filter, FilesFilter);

    params = `${folderId}?${filter.toApiUrlParams()}`;
  }

  const headers = share
    ? {
        "Request-Token": share,
      }
    : undefined;

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/${params}`,
    signal,
    headers,
  };

  const skipRedirect = true;

  const res = (await request(options, skipRedirect)) as TGetFolder;

  res.files = decodeDisplayName(res.files);
  res.folders = decodeDisplayName(res.folders);

  res.current.isArchive =
    !!res.current.roomType && res.current.rootFolderType === FolderType.Archive;

  return res;
}

export async function getFoldersTree() {
  const res = (await request({
    method: "get",
    url: "/files/@root?filterType=2&count=1",
  })) as TGetFolder[];

  const folders = sortInDisplayOrder(res);

  return folders.map((data, index) => {
    const { new: newItems, pathParts, current } = data;

    const {
      parentId,
      title,
      id,
      rootFolderType,
      security,
      foldersCount,
      filesCount,
    } = current;

    const type = +rootFolderType;

    const name = getFolderClassNameByType(type);

    return {
      ...current,
      id,
      key: `0-${index}`,
      parentId,
      title,
      rootFolderType: type,
      folderClassName: name,
      folders: null,
      pathParts,
      foldersCount,
      filesCount,
      newItems,
      security,
      new: newItems,
    } as TFolder;
  });
}

export async function getPersonalFolderTree() {
  const res = (await request({
    method: "get",
    url: "/files/@my",
  })) as TGetFolder;

  return [
    {
      id: res.current.id,
      parentId: res.current.parentId,
      title: res.current.title,
      rootFolderType: +res.current.rootFolderType,
      rootFolderName: "@my",
      pathParts: res.pathParts,
      foldersCount: res.current.foldersCount,
      newItems: res.new,
      security: res.current.security,
    },
  ];
}

export async function getCommonFoldersTree() {
  const index = 1;
  const res = (await request({
    method: "get",
    url: "/files/@common",
  })) as TGetFolder;

  return [
    {
      id: res.current.id,
      key: `0-${index}`,
      parentId: res.current.parentId,
      title: res.current.title,
      rootFolderType: +res.current.rootFolderType,
      rootFolderName: "@common",
      pathParts: res.pathParts,
      foldersCount: res.current.foldersCount,
      newItems: res.new,
    },
  ];
}
// export function getSharedRoomsTree(filter: FilesFilter) {
//   const filterData = filter ? filter.clone() : RoomsFilter.getDefault();

//   const searchArea = RoomSearchArea.Active;

//   filterData.searchArea = searchArea;

//   return getRooms(filterData).then((sharedRooms) => {
//     let result = [];

//     sharedRooms?.folders.map((currentValue, index) => {
//       currentValue.key = `0-${index}`;
//       result.push(currentValue);
//     });

//     return result;
//   });
// }

// export function getThirdPartyCommonFolderTree() {
//   return request({ method: "get", url: "/files/thirdparty/common" })?.then(
//     (commonThirdPartyArray) => {
//       commonThirdPartyArray.map((currentValue, index) => {
//         commonThirdPartyArray[index].key = `0-${index}`;
//       });
//       return commonThirdPartyArray;
//     },
//   );
// }

// export function getMyFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@my`,
//   };

//   return request(options);
// }

// export function getCommonFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@common`,
//   };

//   return request(options);
// }

// export function getFavoritesFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@favorites`,
//   };

//   return request(options);
// }

// export function getProjectsFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@projects`,
//   };

//   return request(options);
// }

export async function getTrashFolderList() {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/@trash`,
  };

  const res = (await request(options)) as TGetFolder;

  return res;
}

// export function getSharedFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@share`,
//   };

//   return request(options);
// }

// export function getRecentFolderList() {
//   const options: AxiosRequestConfig = {
//     method: "get",
//     url: `/files/@recent`,
//   };

//   return request(options);
// }

export async function createFolder(
  parentFolderId: number | string,
  title: string,
) {
  const data = { title };
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/files/folder/${parentFolderId}`,
    data,
  };

  const res = (await request(options)) as TFolder;

  return res;
}

export async function renameFolder(folderId: number, title: string) {
  const data = { title };
  const options: AxiosRequestConfig = {
    method: "put",
    url: `/files/folder/${folderId}`,
    data,
  };

  const res = (await request(options)) as TFolder;

  return res;
}

export async function deleteFolder(
  folderId: number,
  deleteAfter: boolean,
  immediately: boolean,
  returnSingleOperation: boolean = true,
) {
  const data = { deleteAfter, immediately, returnSingleOperation };
  const options: AxiosRequestConfig = {
    method: "delete",
    url: `/files/folder/${folderId}`,
    data,
  };

  const res = (await request(options)) as TOperation[];

  return res;
}

export async function createFile(
  folderId: number | string,
  title: string,
  templateId?: number,
  formId?: number,
) {
  const data = { title, templateId, formId };
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/files/${folderId}/file`,
    data,
  };

  const res = (await request(options)) as TFile;

  return res;
}

// export function createTextFile(
//   folderId: number,
//   title: string,
//   content: string,
// ) {
//   const data = { title, content };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: `/files/${folderId}/text`,
//     data,
//   };

//   return request(options);
// }

// export function createTextFileInMy(title: string) {
//   const data = { title };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: "/files/@my/file",
//     data,
//   };

//   return request(options);
// }

// export function createTextFileInCommon(title: string) {
//   const data = { title };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: "/files/@common/file",
//     data,
//   };

//   return request(options);
// }

// export function createHtmlFile(
//   folderId: number,
//   title: string,
//   content: string,
// ) {
//   const data = { title, content };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: `/files/${folderId}/html`,
//     data,
//   };

//   return request(options);
// }

// export function createHtmlFileInMy(title: string, content: string) {
//   const data = { title, content };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: "/files/@my/html",
//     data,
//   };

//   return request(options);
// }

// export function createHtmlFileInCommon(title: string, content: string) {
//   const data = { title, content };
//   const options: AxiosRequestConfig = {
//     method: "post",
//     url: "/files/@common/html",
//     data,
//   };

//   return request(options);
// }

export async function getFileInfo(
  fileId: number | string,
  share?: string,
  skipRedirect = false,
) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}`,
    headers: share
      ? {
          "Request-Token": share,
        }
      : undefined,
  };

  const res = (await request(options, skipRedirect)) as TFile;

  return res;
}

export async function updateFile(
  fileId: string | number,
  title: string,
  lastVersion?: number,
) {
  const data = { title, lastVersion };
  const options: AxiosRequestConfig = {
    method: "put",
    url: `/files/file/${fileId}`,
    data,
  };

  const res = (await request(options)) as TFile;

  return res;
}

export async function addFileToRecentlyViewed(fileId: number) {
  const data = { fileId };
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/files/file/${fileId}/recent`,
    data,
  };

  await request(options);
}

export async function deleteFile(
  fileId: number,
  deleteAfter: boolean,
  immediately: boolean,
  returnSingleOperation: boolean = true,
) {
  const data = { deleteAfter, immediately, returnSingleOperation };
  const options: AxiosRequestConfig = {
    method: "delete",
    url: `/files/file/${fileId}`,
    data,
  };

  const res = (await request(options)) as TOperation[];

  return res;
}

export async function emptyTrash() {
  const res = (await request({
    method: "put",
    url: "/files/fileops/emptytrash?single=true",
  })) as TOperation[];
  return res;
}

export async function enableCustomFilter(fileId: number, enabled: boolean) {
  const data = { enabled };
  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/customfilter`,
    data,
  })) as TOperation[];
  return res;
}

export async function removeFiles(
  folderIds: number[],
  fileIds: number[],
  deleteAfter: boolean,
  immediately: boolean,
  returnSingleOperation: boolean = true,
) {
  const data = {
    folderIds,
    fileIds,
    deleteAfter,
    immediately,
    returnSingleOperation,
  };
  const res = (await request({
    method: "put",
    url: "/files/fileops/delete",
    data,
  })) as TOperation[];

  return res;
}

// export function getShareFiles(fileIds: number[], folderIds: number[]) {
//   const data = { fileIds, folderIds };
//   return request({
//     method: "post",
//     url: "/files/share",
//     data,
//   });
// }

// export function setExternalAccess(fileId: number[], accessType: number[]) {
//   const data = { share: accessType };
//   return request({
//     method: "put",
//     url: `/files/${fileId}/setacelink`,
//     data,
//   });
// }

// export function setShareFiles(
//   fileIds: number[],
//   folderIds: number[],
//   share: unknown,
//   notify: unknown,
//   sharingMessage: string,
// ) {
//   const data = { fileIds, folderIds, share, notify, sharingMessage };

//   return request({
//     method: "put",
//     url: "/files/share",
//     data,
//   });
// }

// export function removeShareFiles(fileIds, folderIds) {
//   const data = { fileIds, folderIds };
//   return request({
//     method: "delete",
//     url: "/files/share",
//     data,
//   });
// }

export async function setFileOwner(userId: string, folderIds: number[]) {
  const data = { userId, folderIds };

  const skipRedirect = true;

  const res = (await request(
    {
      method: "post",
      url: "/files/owner",
      data,
    },
    skipRedirect,
  )) as TFolder[];

  return res;
}

export async function startUploadSession(
  folderId: string | number,
  fileName: string,
  fileSize: number,
  relativePath: boolean,
  encrypted: boolean,
  createOn: unknown,
  CreateNewIfExist: boolean,
) {
  const data = {
    fileName,
    fileSize,
    relativePath,
    encrypted,
    createOn,
    CreateNewIfExist,
  };
  const res = (await request({
    method: "post",
    url: `/files/${folderId}/upload/create_session`,
    data,
  })) as TUploadOperation;

  return res;
}

// TODO: Need update res type and remove unknown
export function uploadFile(url: string, data: unknown) {
  return axios.post(url, data);
}

// TODO: Need update res type and remove unknown
export function uploadBackup(url: string, data?: unknown) {
  return axios.post<unknown, AxiosResponse<TUploadBackup>>(url, data);
}

export async function downloadFiles(
  fileIds: number[] | TFileConvertId[],
  folderIds: number[],
  shareKey: string,
  returnSingleOperation: boolean = true,
) {
  const data = { fileIds, folderIds, returnSingleOperation };
  const share = shareKey ? `?share=${shareKey}` : "";

  const res = (await request({
    method: "put",
    url: `/files/fileops/bulkdownload${share}`,
    data,
  })) as TOperation[];

  return res;
}

export async function getProgress(id?: string) {
  const params = id ? `?id=${id}` : "";

  const res = (await request({
    method: "get",
    url: `/files/fileops${params}`,
  })) as TOperation[];
  return res;
}

export async function checkFileConflicts(
  destFolderId: number | string,
  folderIds: number[],
  fileIds: number[],
) {
  let paramsString =
    folderIds.length > 0 ? `&folderIds=${folderIds.join("&folderIds=")}` : "";
  paramsString +=
    fileIds.length > 0 ? `&fileIds=${fileIds.join("&fileIds=")}` : "";

  const res = (await request({
    method: "get",
    url: `/files/fileops/move?destFolderId=${destFolderId}${paramsString}`,
  })) as (TFile | TFolder)[];

  return res;
}

export async function copyToFolder(
  destFolderId: number,
  folderIds: number[],
  fileIds: number[],
  conflictResolveType: ConflictResolveType,
  deleteAfter: boolean,
  content = false,
  toFillOut = false,
  returnSingleOperation: boolean = true,
) {
  const data = {
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
    content,
    toFillOut,
    returnSingleOperation,
  };

  const res = (await request({
    method: "put",
    url: "/files/fileops/copy",
    data,
  })) as TOperation[];

  return res;
}

export async function duplicate(
  folderIds: number[],
  fileIds: number[],
  returnSingleOperation: boolean = true,
) {
  const data = {
    folderIds,
    fileIds,
    returnSingleOperation,
  };

  const res = (await request({
    method: "put",
    url: "/files/fileops/duplicate",
    data,
  })) as TOperation[];

  return res;
}

export async function moveToFolder(
  destFolderId: number,
  folderIds: number[],
  fileIds: number[],
  conflictResolveType: ConflictResolveType,
  deleteAfter: boolean,
  toFillOut = false,
  returnSingleOperation: boolean = true,
) {
  const data = {
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
    toFillOut,
    returnSingleOperation,
  };
  const res = (await request({
    method: "put",
    url: "/files/fileops/move",
    data,
  })) as TOperation[];

  return res;
}

export async function getFileVersionInfo(fileId: number) {
  const res = (await request({
    method: "get",
    url: `/files/file/${fileId}/history`,
  })) as TFile[];
  return res;
}

export async function markAsRead(
  folderIds: number[],
  fileIds: number[],
  returnSingleOperation: boolean = true,
) {
  const data = { folderIds, fileIds, returnSingleOperation };
  const res = (await request({
    method: "put",
    url: "/files/fileops/markasread",
    data,
  })) as TOperation[];

  return res;
}

export async function getNewFiles(folderId: number | string) {
  const res = (await request({
    method: "get",
    url: `/files/${folderId}/news`,
  })) as TNewFiles[];

  return res;
}

export async function getNewFolderFiles(folderId: number | string) {
  const res = (await request({
    method: "get",
    url: `/files/rooms/${folderId}/news`,
  })) as TNewFiles[];

  return res;
}

// TODO: update res type
export async function convertFile(
  fileId: string | number | null,
  outputType = null,
  password = null,
  sync = false,
) {
  const data = { password, sync, outputType };

  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/checkconversion`,
    data,
  })) as { result: { webUrl: string; title: string } }[];

  return res;
}

// TODO: update res type
export function getFileConversationProgress(fileId: number) {
  return request({
    method: "get",
    url: `/files/file/${fileId}/checkconversion`,
  });
}

// TODO: Need update res type
export function finalizeVersion(
  fileId: number,
  version: number,
  continueVersion: boolean,
) {
  const data = { fileId, version, continueVersion };
  return request({
    method: "put",
    url: `/files/file/${fileId}/history`,
    data,
  });
}

// TODO: Need update res type
export function markAsVersion(
  fileId: number,
  continueVersion: boolean,
  version: number,
) {
  const data = { continueVersion, version };
  return request({ method: "put", url: `/files/file/${fileId}/history`, data });
}

export async function versionEditComment(
  fileId: number,
  comment: string,
  version: number,
) {
  const data = { comment, version };

  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/comment`,
    data,
  })) as string;
  return res;
}

export async function versionRestore(fileId: number, lastversion: number) {
  const data = { lastversion };

  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}`,
    data,
  })) as TFile;

  return res;
}

export async function lockFile(fileId: number, lock: boolean) {
  const skipRedirect = true;
  const data = { lockFile: lock };

  const res = (await request(
    {
      method: "put",
      url: `/files/file/${fileId}/lock`,
      data,
    },
    skipRedirect,
  )) as TFile;

  return res;
}

export async function updateIfExist(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/updateifexist",
    data,
  })) as boolean;

  return res;
}

export async function storeOriginal(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/storeoriginal",
    data,
  })) as boolean;

  return res;
}

export async function changeDeleteConfirm(val: boolean) {
  const data = { set: val };
  const res = await request({
    method: "put",
    url: "files/changedeleteconfrim",
    data,
  });

  return res;
}

// export function storeForceSave(val) {
//   const data = { set: val };
//   return request({ method: "put", url: "files/storeforcesave", data });

//   return res;
// }

// export function forceSave(val) {
//   const data = { set: val };
//   return request({ method: "put", url: "files/forcesave", data });
// }

export async function changeKeepNewFileName(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/keepnewfilename",
    data,
  })) as boolean;

  return res;
}

export async function enableDisplayFileExtension(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/displayfileextension",
    data,
  })) as boolean;

  return res;
}

export async function changeOpenEditorInSameTab(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/settings/openeditorinsametab",
    data,
  })) as boolean;

  return res;
}

export async function changeHideConfirmCancelOperation(val: boolean) {
  const data = { set: val };
  const res = (await request({
    method: "put",
    url: "files/hideconfirmcanceloperation",
    data,
  })) as boolean;

  return res;
}

export function enableThirdParty(val: boolean) {
  const data = { set: val };
  return request({ method: "put", url: "files/thirdparty", data });
}

export async function getThirdPartyList() {
  const res = (await request({
    method: "get",
    url: "files/thirdparty",
  })) as TThirdParties;

  return res;
}

export function saveThirdParty(
  url: string,
  login: string,
  password: string,
  token: string,
  isCorporate: boolean,
  customerTitle: string,
  providerKey: string,
  providerId: string,
  isRoomsStorage: boolean,
) {
  const data = {
    url,
    login,
    password,
    token,
    isCorporate,
    customerTitle,
    providerKey,
    providerId,
    isRoomsStorage,
  };
  const skipRedirect = true;

  return request(
    { method: "post", url: "files/thirdparty", data },
    skipRedirect,
  ) as Promise;
}

// TODO: Need update res type
export function saveSettingsThirdParty(
  url: string,
  login: string,
  password: string,
  token: string,
  isCorporate: boolean,
  customerTitle: string,
  providerKey: string,
  providerId: string,
) {
  const data = {
    url,
    login,
    password,
    token,
    isCorporate,
    customerTitle,
    providerKey,
    providerId,
  };
  return request({ method: "post", url: "files/thirdparty/backup", data });
}

// TODO: Need update res type
export function getSettingsThirdParty() {
  return request<SettingsThirdPartyType>({
    method: "get",
    url: "files/thirdparty/backup",
  });
}

export function deleteThirdParty(providerId: string) {
  return request({ method: "delete", url: `files/thirdparty/${providerId}` });
}

export async function getThirdPartyCapabilities() {
  const res = (await request({
    method: "get",
    url: "files/thirdparty/capabilities",
  })) as TThirdPartyCapabilities;

  return res;
}

export async function openConnectWindow(service: string) {
  const res = (await request({
    method: "get",
    url: `thirdparty/${service}`,
  })) as string;

  return res;
}

export async function getSettingsFiles(headers = null) {
  const options: AxiosRequestConfig = { method: "get", url: `/files/settings` };

  if (headers) options.headers = headers;

  const res = (await request(options)) as TFilesSettings;

  return res;
}

export async function markAsFavorite(ids: number[]) {
  const data = { fileIds: ids };
  const options: AxiosRequestConfig = {
    method: "post",
    url: "/files/favorites",
    data,
  };
  const res = (await request(options)) as boolean;
  return res;
}

export async function removeFromFavorite(ids: number[]) {
  const data = { fileIds: ids };
  const options: AxiosRequestConfig = {
    method: "delete",
    url: "/files/favorites",
    data,
  };
  const res = (await request(options)) as boolean;
  return res;
}

export async function getIsEncryptionSupport() {
  const res = (await request({
    method: "get",
    url: "/files/@privacy/available",
  })) as boolean;

  return res;
}

// TODO: Need update res type
export function setEncryptionKeys(keys: { [key: string]: string | boolean }) {
  const data = {
    publicKey: keys.publicKey,
    privateKeyEnc: keys.privateKeyEnc,
    enable: keys.enable,
    update: keys.update,
  };
  return request({
    method: "put",
    url: "privacyroom/keys",
    data,
  });
}

export async function getEncryptionKeys() {
  const res = (await request({
    method: "get",
    url: "privacyroom/keys",
  })) as { [key: string]: string | boolean };

  return res;
}

// TODO: Need update res type
export async function getEncryptionAccess(fileId: number | string) {
  const res = (await request({
    method: "get",
    url: `privacyroom/access/${fileId}`,
    data: fileId,
  })) as { [key: string]: string | boolean };

  return res;
}

// export function updateFileStream(file, fileId, encrypted, forcesave) {
//   let fd = new FormData();
//   fd.append("file", file);
//   fd.append("encrypted", encrypted);
//   fd.append("forcesave", forcesave);

//   return request({
//     method: "put",
//     url: `/files/${fileId}/update`,
//     data: fd,
//   });
// }

export async function setFavoritesSetting(set: boolean) {
  const res = (await request({
    method: "put",
    url: "/files/settings/favorites",
    data: { set },
  })) as boolean;

  return res;
}

export async function setRecentSetting(set: boolean) {
  const res = (await request({
    method: "put",
    url: "/files/displayRecent",
    data: { set },
  })) as boolean;

  return res;
}

export async function hideConfirmConvert(save: boolean) {
  const res = (await request({
    method: "put",
    url: "/files/hideconfirmconvert",
    data: { save },
  })) as boolean;

  return res;
}

export async function getSubfolders(folderId: number) {
  const res = (await request({
    method: "get",
    url: `files/${folderId}/subfolders`,
  })) as TFolder[];

  return res;
}

export async function createThumbnails(fileIds: number[]) {
  const options: AxiosRequestConfig = {
    method: "post",
    url: "/files/thumbnails",
    data: { fileIds },
  };

  const res = (await request(options)) as number[];

  return res;
}

export async function getPresignedUri(fileId: number | string) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/presigned`,
  })) as TPresignedUri;

  return res;
}

// export async function checkFillFormDraft(fileId: number | string) {
//   const res = (await request({
//     method: "post",
//     url: `files/masterform/${fileId}/checkfillformdraft`,
//     data: { fileId },
//   })) as string;

//   return res;
// }

export async function fileCopyAs(
  fileId: number,
  destTitle: string,
  destFolderId: number,
  enableExternalExt: boolean,
  password: string,
) {
  const res = (await request({
    method: "post",
    url: `files/file/${fileId}/copyas`,
    data: {
      destTitle,
      destFolderId,
      enableExternalExt,
      password,
    },
  })) as TFile;

  return res;
}

export async function getEditHistory(
  fileId: number,
  doc: null | string | number,
) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/edit/history?doc=${doc}`,
  })) as TEditHistory[];

  return res;
}

export async function getEditDiff(
  fileId: number,
  version: number,
  doc: null | number | string,
) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/edit/diff?version=${version}&doc=${doc}`,
  })) as TEditDiff;

  return res;
}

export async function restoreDocumentsVersion(
  fileId: number,
  version: number,
  doc: null | number | string,
) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `files/file/${fileId}/restoreversion?version=${version}&doc=${doc}`,
  };

  const res = (await request(options)) as TEditHistory[];

  return res;
}

export async function getSharedUsers(fileId: number) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}/sharedusers`,
  };

  const res = (await request(options)) as TSharedUsers[];

  return res;
}

export async function getProtectUsers(fileId: number) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}/protectusers`,
  };

  const res = (await request(options)) as TSharedUsers[];

  return res;
}

export async function sendEditorNotify(
  fileId: number | string,
  actionLink: string,
  emails: string[],
  message: string,
) {
  const res = (await request({
    method: "post",
    url: `files/file/${fileId}/sendeditornotify`,
    data: {
      actionLink,
      emails,
      message,
    },
  })) as TSendEditorNotify;

  return res;
}

export async function getDocumentServiceLocation(version?: number | string) {
  const params: { version?: string | number } = {};

  if (version !== undefined) {
    params.version = version;
  }

  const res = (await request({
    method: "get",
    url: `/files/docservice`,
    params,
  })) as TDocServiceLocation;

  return res;
}

export async function changeDocumentServiceLocation(
  docServiceUrl: string,
  secretKey: string,
  authHeader: string,
  internalUrl: string,
  portalUrl: string,
  sslVerification: boolean,
) {
  const res = (await request({
    method: "put",
    url: `files/docservice`,
    data: {
      DocServiceUrl: docServiceUrl,
      DocServiceUrlInternal: internalUrl,
      DocServiceUrlPortal: portalUrl,
      DocServiceSignatureSecret: secretKey,
      DocServiceSignatureHeader: authHeader,
      DocServiceSslVerification: sslVerification,
    },
  })) as TDocServiceLocation;

  return res;
}

export async function getFileLink(fileId: number) {
  const res = (await request({
    method: "get",
    url: `/files/file/${fileId}/link`,
  })) as TFileLink;

  return res;
}

export async function getFolderLink(fileId: number) {
  const res = (await request({
    method: "get",
    url: `/files/folder/${fileId}/link`,
  })) as TFileLink;

  return res;
}

export async function getExternalLinks(
  fileId: number | string,
  startIndex = 0,
  count = 50,
  signal?: AbortSignal,
) {
  const linkParams = `?startIndex=${startIndex}&count=${count}`;

  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/links${linkParams}`,
    signal,
  })) as { items: TFileLink[] };

  return res;
}

export async function getPrimaryLink(fileId: number) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/link`,
  })) as TFileLink;

  return res;
}

export async function getPrimaryLinkIfNotExistCreate(
  fileId: number | string,
  access: ShareAccessRights,
  internal: boolean,
  expirationDate: moment.Moment,
) {
  const res = (await request({
    method: "post",
    url: `/files/file/${fileId}/link`,
    data: { access, internal, expirationDate },
  })) as TFileLink;

  return res;
}

export async function editExternalLink(
  fileId: number | string,
  linkId: number | string,
  access: ShareAccessRights,
  primary: boolean,
  internal: boolean,
  expirationDate: moment.Moment,
) {
  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/links`,
    data: { linkId, access, primary, internal, expirationDate },
  })) as TFileLink;

  return res;
}

export async function addExternalLink(
  fileId: number | string,
  access: ShareAccessRights,
  primary: boolean,
  internal: boolean,
  expirationDate?: moment.Moment | null,
) {
  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/links`,
    data: { access, primary, internal, expirationDate },
  })) as TFileLink;

  return res;
}

// TODO: Need update res type
export function checkIsFileExist(folderId: number, filesTitle: string[]) {
  return request({
    method: "post",
    url: `files/${folderId}/upload/check`,
    data: {
      filesTitle,
    },
  });
}

export function deleteFilesFromRecent(fileIds: number[]) {
  return request({
    method: "delete",
    url: `files/recent`,
    data: {
      fileIds,
    },
  });
}

export async function getFilesUsedSpace() {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/filesusedspace`,
  };

  const res = (await request(options)) as TFilesUsedSpace;

  return res;
}

export async function getConnectingStorages() {
  const res = (await request({
    method: "get",
    url: "files/thirdparty/providers",
  })) as TConnectingStorages;

  return res;
}

export async function startFilling(fileId: string | number): Promise<void> {
  const options: AxiosRequestConfig = {
    method: "put",
    url: `files/file/${fileId}/startfilling`,
  };

  await request(options);
}

export async function changeIndex(items: TIndexItems[]) {
  return request({
    method: "put",
    url: "files/order",
    data: { items },
  });
}

export async function reorderIndex(id: number) {
  return request({
    method: "put",
    url: `/files/rooms/${id}/reorder`,
  });
}

export async function checkIsPDFForm(fileId: string | number) {
  return request({
    method: "get",
    url: `/files/file/${fileId}/isformpdf`,
  }) as Promise<boolean>;
}

export async function removeSharedFolder(folderIds: Array<string | number>) {
  return request({
    method: "delete",
    url: `/files/recent`,
    data: {
      folderIds,
    },
  });
}

export async function deleteVersionFile(
  fileId: number,
  versions: number[],
  returnSingleOperation: boolean = true,
) {
  const data = { fileId, versions };
  const res = (await request({
    method: "put",
    url: "/files/fileops/deleteversion",
    data,
    returnSingleOperation,
  })) as TOperation[];

  return res;
}

export async function formRoleMapping(data: TFormRoleMappingRequest) {
  return request({
    method: "post",
    url: `files/file/${data.formId}/formrolemapping`,
    data,
  });
}

export async function manageFormFilling(
  formId: string | number,
  action: FormFillingManageAction,
) {
  return request({
    method: "put",
    url: `files/file/${formId}/manageformfilling`,
    data: {
      formId,
      action,
    },
  });
}

export async function getFormFillingStatus(
  formId: string | number,
): Promise<TFileFillingFormStatus[]> {
  const res = (await request({
    method: "get",
    url: `/files/file/${formId}/formroles`,
  })) as TFileFillingFormStatus[];

  return res;
}
