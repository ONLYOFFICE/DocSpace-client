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

import { toUrlParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { request } from "@docspace/shared/api/client";
import { convertFile } from "@docspace/shared/api/files";
import { TEditHistory } from "@docspace/shared/api/files/types";
import { FolderType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

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
      backUrl = `/rooms/share?key=${key}&folder=${folderId}`;
    } else {
      backUrl = `/rooms/shared/${folderId}/filter?folder=${folderId}`;
    }
  } else if (rootFolderType === FolderType.Archive) {
    backUrl = `/rooms/archived/${folderId}/filter?folder=${folderId}`;
  } else {
    if (
      rootFolderType === FolderType.SHARE ||
      rootFolderType === FolderType.Recent
    ) {
      backUrl = `/rooms/personal/filter?folder=recent`;
    } else {
      backUrl = `/rooms/personal/filter?folder=${folderId}`;
    }
  }

  // const origin = url.substring(0, url.indexOf("/doceditor"));
  const origin = window.location.origin;

  return `${combineUrl(origin, backUrl)}`;
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
  const conversionInfo = await convertFile(fileId, null, null, true);

  return conversionInfo && conversionInfo[0]?.result;
};

export const getDataSaveAs = async (params: string) => {
  try {
    const data = await request({
      baseURL: combineUrl(window.ClientConfig?.proxy?.url),
      method: "get",
      url: `/filehandler.ashx?${params}`,
      responseType: "text",
    });

    return data as string;
  } catch (e) {
    console.error("error");
  }
};

export const saveAs = <T = string>(
  title: string,
  url: string,
  folderId: string | number,
  openNewTab: boolean,
  action = "create",
) => {
  const options = {
    action,
    fileuri: url,
    title: title,
    folderid: folderId,
    response: openNewTab ? null : "message",
  };

  const params = toUrlParams(options, true);
  if (!openNewTab) {
    return getDataSaveAs(params) as Promise<T>;
  } else {
    const handlerUrl = combineUrl(
      window.ClientConfig?.proxy?.url,

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
  t: TTranslation,
  subTitle: string | null = null,
  fileType: string,
  documentReady: boolean,
  successAuth: boolean,
  callback?: (value: string) => void,
) => {
  const organizationName = t("Common:OrganizationName");
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

// need for separate window in desktop editors
export const calculateAsideHeight = () => {
  const viewPort = window?.AscDesktopEditor?.getViewportSettings?.();

  if (!viewPort) return;

  if (viewPort.widgetType === "window") {
    const { captionHeight } = viewPort;
    const backdrop =
      (document.getElementsByClassName("backdrop-active")[0] as HTMLElement) ??
      (document.getElementsByClassName(
        "modal-backdrop-active",
      )[0] as HTMLElement);
    const aside = document.getElementsByTagName("aside")[0];

    if (backdrop) {
      backdrop.style.height = `calc(100dvh - ${captionHeight}px`;
      backdrop.style.marginTop = `${captionHeight}px`;
    }
    if (aside) {
      aside.style.height = `calc(100dvh - ${captionHeight}px`;
      aside.style.top = `${captionHeight}px`;
    }
  }
};
