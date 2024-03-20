// (c) Copyright Ascensio System SIA 2010-2024
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

import { toUrlParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { request } from "@docspace/shared/api/client";
import { convertFile } from "@docspace/shared/api/files";
import { TEditHistory } from "@docspace/shared/api/files/types";
import { FolderType } from "@docspace/shared/enums";

import { IInitialConfig } from "@/types";

import { IS_VIEW } from "./constants";

export const getBackUrl = (
  rootFolderType: FolderType,
  folderId: string | number,
) => {
  const search = window.location.search;
  const shareIndex = search.indexOf("share=");
  const key = shareIndex > -1 ? search.substring(shareIndex + 6) : null;

  let backUrl = "";

  if (rootFolderType === FolderType.Rooms) {
    if (key) {
      backUrl = `/rooms/share?key=${key}`;
    } else {
      backUrl = `/rooms/shared/${folderId}/filter?folder=${folderId}`;
    }
  } else {
    if (rootFolderType === FolderType.SHARE) {
      backUrl = `/rooms/personal/filter?folder=recent`;
    } else {
      backUrl = `/rooms/personal/filter?folder=${folderId}`;
    }
  }

  const url = window.location.href;
  const origin = url.substring(0, url.indexOf("/doceditor"));

  return `${combineUrl(origin, backUrl)}`;
};

export const isTemplateFile = (
  config: IInitialConfig | undefined,
): config is IInitialConfig => {
  const fileMeta = config?.file;

  return (
    !IS_VIEW &&
    !!fileMeta &&
    fileMeta.viewAccessibility.WebRestrictedEditing &&
    fileMeta.security.FillForms &&
    fileMeta.rootFolderType === FolderType.Rooms &&
    !fileMeta.security.Edit &&
    !config.document.isLinkedForMe
  );
};

export const showDocEditorMessage = async (
  url: string,
  id: string | number,
) => {
  const result = await convertDocumentUrl(id);
  const splitUrl = url.split("#message/");

  if (result) {
    const newUrl = `${result.webUrl}#message/${splitUrl[1]}`;

    history.pushState({}, "", newUrl);
  }
};

export const convertDocumentUrl = async (fileId: number | string) => {
  const convert = await convertFile(fileId, null, true);
  return convert && convert[0]?.result;
};

export const getDataSaveAs = async (params: string) => {
  try {
    const data = await request({
      baseURL: combineUrl(window.DocSpaceConfig?.proxy?.url),
      method: "get",
      url: `/filehandler.ashx?${params}`,
      responseType: "text",
    });

    return data as string;
  } catch (e) {
    console.error("error");
  }
};

export const saveAs = (
  title: string,
  url: string,
  folderId: string | number,
  openNewTab: boolean,
) => {
  const options = {
    action: "create",
    fileuri: url,
    title: title,
    folderid: folderId,
    response: openNewTab ? null : "message",
  };

  const params = toUrlParams(options, true);
  if (!openNewTab) {
    return getDataSaveAs(params);
  } else {
    const handlerUrl = combineUrl(
      window.DocSpaceConfig?.proxy?.url,

      window["AscDesktopEditor"] !== undefined //FIX Save as with open new tab on DesktopEditors
        ? "/Products/Files/HttpHandlers/"
        : "",
      `/filehandler.ashx?${params}`,
    );

    window.open(handlerUrl, "_blank");
  }
};

export const constructTitle = (
  firstPart: string,
  secondPart: string,
  reverse = false,
) => {
  return !reverse
    ? `${firstPart} - ${secondPart}`
    : `${secondPart} - ${firstPart}`;
};

export const checkIfFirstSymbolInStringIsRtl = (str: string | null) => {
  if (!str) return;

  const rtlRegexp = new RegExp(
    /[\u04c7-\u0591\u05D0-\u05EA\u05F0-\u05F4\u0600-\u06FF]/,
  );

  return rtlRegexp.test(str[0]);
};

export const setDocumentTitle = (
  subTitle: string | null = null,
  fileType: string,
  documentReady: boolean,
  successAuth: boolean,
  callback?: (value: string) => void,
) => {
  const organizationName = "ONLYOFFICE"; //TODO: Replace to API variant
  const moduleTitle = "Documents"; //TODO: Replace to API variant

  let newSubTitle = subTitle;

  const isSubTitleRtl = checkIfFirstSymbolInStringIsRtl(subTitle);

  // needs to reverse filename and extension for rtl mode
  if (newSubTitle && fileType && isSubTitleRtl) {
    newSubTitle = `${fileType}.${newSubTitle.replace(`.${fileType}`, "")}`;
  }

  let title;

  if (newSubTitle) {
    if (successAuth && moduleTitle) {
      title = constructTitle(newSubTitle, moduleTitle, isSubTitleRtl);
    } else {
      title = constructTitle(newSubTitle, organizationName, isSubTitleRtl);
    }
  } else if (moduleTitle && organizationName) {
    title = constructTitle(moduleTitle, organizationName);
  } else {
    title = organizationName;
  }

  if (documentReady) {
    callback?.(title);
  }
  document.title = title;
};

export const getCurrentDocumentVersion = (
  fileHistory: TEditHistory[],
  historyLength: number,
) => {
  return window.location.search.indexOf("&version=") !== -1
    ? +window.location.search.split("&version=")[1]
    : fileHistory[historyLength - 1].version;
};

export const getIsZoom = () =>
  typeof window !== "undefined" &&
  (window?.navigator?.userAgent?.includes("ZoomWebKit") ||
    window?.navigator?.userAgent?.includes("ZoomApps"));
