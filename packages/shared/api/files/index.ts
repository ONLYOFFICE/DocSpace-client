import axios, { AxiosRequestConfig } from "axios";

import { ConflictResolveType, FolderType } from "../../enums";
import {
  checkFilterInstance,
  decodeDisplayName,
  getFolderClassNameByType,
  sortInDisplayOrder,
} from "../../utils/common";

import { request } from "../client";

import FilesFilter from "./filter";
import {
  TDocServiceLocation,
  TEditDiff,
  TEditHistory,
  TFile,
  TFileLink,
  TFilesSettings,
  TFolder,
  TGetFolder,
  TGetFolderPath,
  TGetReferenceDataRequest,
  TOpenEditRequest,
  TOperation,
  TPresignedUri,
  TSendEditorNotify,
  TSharedUsers,
  TThirdPartyCapabilities,
  TTirdParties,
  TUploadOperation,
} from "./types";

export async function openEdit(
  fileId: number,
  version: string,
  doc: string,
  view: string,
  headers: Record<string, string>,
  shareKey: string,
) {
  const params = []; // doc ? `?doc=${doc}` : "";

  if (view) {
    params.push(`view=${view}`);
  }

  if (version) {
    params.push(`version=${version}`);
  }

  if (doc) {
    params.push(`doc=${doc}`);
  }

  if (shareKey) {
    params.push(`share=${shareKey}`);
  }

  const paramsString = params.length > 0 ? `?${params.join("&")}` : "";

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}/openedit${paramsString}`,
  };

  if (headers) options.headers = headers;

  const res = (await request(options)) as TOpenEditRequest;

  return res;
}

export async function getReferenceData(data: {
  fileKey: number;
  instanceId: string;
  sourceFileId: number;
  path: string;
}) {
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/files/file/referencedata`,
    data,
  };

  const res = (await request(options)) as TGetReferenceDataRequest;

  return res;
}

export async function getFolderInfo(folderId: number, skipRedirect = false) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/folder/${folderId}`,
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
  folderId: string | number,
  filter: FilesFilter,
  signal: AbortSignal,
) {
  let params = folderId;

  if (folderId && typeof folderId === "string") {
    folderId = encodeURIComponent(folderId.replace(/\\\\/g, "\\"));
  }

  if (filter) {
    checkFilterInstance(filter, FilesFilter);

    params = `${folderId}?${filter.toApiUrlParams()}`;
  }

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/${params}`,
    signal,
  };

  const res = (await request(options)) as TGetFolder;

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
    const { foldersCount, filesCount } = current;
    const { parentId, title, id, rootFolderType, security } = current;

    const type = +rootFolderType;

    const name = getFolderClassNameByType(type);

    return {
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
    };
  });
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

export async function createFolder(parentFolderId: number, title: string) {
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
) {
  const data = { deleteAfter, immediately };
  const options: AxiosRequestConfig = {
    method: "delete",
    url: `/files/folder/${folderId}`,
    data,
  };

  const res = (await request(options)) as TOperation[];

  return res;
}

export async function createFile(
  folderId: number,
  title: string,
  templateId: number,
  formId: number,
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

export async function getFileInfo(fileId: number) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}`,
  };

  const res = (await request(options)) as TFile;

  return res;
}

export async function updateFile(
  fileId: string,
  title: string,
  lastVersion: number,
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
) {
  const data = { deleteAfter, immediately };
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
    url: "/files/fileops/emptytrash",
  })) as TOperation[];
  return res;
}

export async function removeFiles(
  folderIds: number[],
  fileIds: number[],
  deleteAfter: boolean,
  immediately: boolean,
) {
  const data = { folderIds, fileIds, deleteAfter, immediately };
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

  const res = (await request({
    method: "post",
    url: "/files/owner",
    data,
  })) as TFolder[];

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
export function uploadBackup(url: string, data: unknown) {
  return axios.post(url, data);
}

export async function downloadFiles(
  fileIds: number[],
  folderIds: number[],
  shareKey: string,
) {
  const data = { fileIds, folderIds };
  const share = shareKey ? `?share=${shareKey}` : "";

  const res = (await request({
    method: "put",
    url: `/files/fileops/bulkdownload${share}`,
    data,
  })) as TOperation[];

  return res;
}

export async function getProgress() {
  const res = (await request({
    method: "get",
    url: "/files/fileops",
  })) as TOperation[];
  return res;
}

export async function checkFileConflicts(
  destFolderId: number,
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
) {
  const data = {
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
    content,
  };

  const res = (await request({
    method: "put",
    url: "/files/fileops/copy",
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
) {
  const data = {
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
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

export async function markAsRead(folderIds: number[], fileIds: number[]) {
  const data = { folderIds, fileIds };
  const res = (await request({
    method: "put",
    url: "/files/fileops/markasread",
    data,
  })) as TOperation[];

  return res;
}

export async function getNewFiles(folderId: number) {
  const res = (await request({
    method: "get",
    url: `/files/${folderId}/news`,
  })) as TFile[];

  return res;
}

// TODO: update res type
export async function convertFile(fileId: null, password = null, sync = false) {
  const data = { password, sync };

  const res = await request({
    method: "put",
    url: `/files/file/${fileId}/checkconversion`,
    data,
  });

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
  const data = { lockFile: lock };

  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/lock`,
    data,
  })) as TFile;

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

export function thirdParty(val: boolean) {
  const data = { set: val };
  return request({ method: "put", url: "files/thirdparty", data });
}

export async function getThirdPartyList() {
  const res = (await request({
    method: "get",
    url: "files/thirdparty",
  })) as TTirdParties;

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
  return request({ method: "post", url: "files/thirdparty", data });
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
  return request({ method: "get", url: "files/thirdparty/backup" });
}

// export function deleteThirdParty(providerId) {
//   return request({ method: "delete", url: `files/thirdparty/${providerId}` });
// }

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

// TODO: Need update res type
export function getIsEncryptionSupport() {
  return request({
    method: "get",
    url: "/files/@privacy/available",
  });
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

// TODO: Need update res type
export function getEncryptionKeys() {
  return request({
    method: "get",
    url: "privacyroom/keys",
  });
}

// TODO: Need update res type
export function getEncryptionAccess(fileId: number) {
  return request({
    method: "get",
    url: `privacyroom/access/${fileId}`,
    data: fileId,
  });
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

export async function getPresignedUri(fileId: number) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/presigned`,
  })) as TPresignedUri;

  return res;
}

// TODO: Need update res type
export function checkFillFormDraft(fileId: number) {
  return request({
    method: "post",
    url: `files/masterform/${fileId}/checkfillformdraft`,
    data: { fileId },
  });
}

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

  const res = (await request(options)) as TSharedUsers;

  return res;
}

export async function getProtectUsers(fileId: number) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/file/${fileId}/protectusers`,
  };

  const res = (await request(options)) as TSharedUsers;

  return res;
}

export async function sendEditorNotify(
  fileId: number,
  actionLink: {},
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
  internalUrl: string,
  portalUrl: string,
) {
  const res = (await request({
    method: "put",
    url: `files/docservice`,
    data: {
      DocServiceUrl: docServiceUrl,
      DocServiceUrlInternal: internalUrl,
      DocServiceUrlPortal: portalUrl,
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

export async function getExternalLinks(
  fileId: number,
  startIndex = 0,
  count = 50,
) {
  const linkParams = `?startIndex=${startIndex}&count=${count}`;

  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/links${linkParams}`,
  })) as TFileLink[];

  return res;
}

export async function getPrimaryLink(fileId: number) {
  const res = (await request({
    method: "get",
    url: `files/file/${fileId}/link`,
  })) as TFileLink;

  return res;
}

export async function editExternalLink(
  fileId: number,
  linkId: number,
  access: number,
  primary: boolean,
  internal: boolean,
  expirationDate: string,
) {
  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/links`,
    data: { linkId, access, primary, internal, expirationDate },
  })) as TFileLink;

  return res;
}

export async function addExternalLink(
  fileId: number,
  access: number,
  primary: boolean,
  internal: boolean,
) {
  const res = (await request({
    method: "put",
    url: `/files/file/${fileId}/links`,
    data: { access, primary, internal },
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

