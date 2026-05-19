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

import { toUrlParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { request } from "@docspace/shared/api/client";
import { convertFile } from "@docspace/shared/api/files";
import { TEditHistory, TFile } from "@docspace/shared/api/files/types";
import { TTranslation } from "@docspace/shared/types";
import { TFormRole } from "@/types";
import { toastr } from "@docspace/ui-kit/components/toast";

export const convertDocumentUrl = async (fileId: number | string) => {
  const convert = await convertFile(fileId, null, null, true);
  return convert && convert[0]?.result;
};

export const showDocEditorMessage = async (
  url: string,
  id: string | number,
) => {
  const result = await convertDocumentUrl(id);
  const splitUrl = url.split("#message/");

  if (result) {
    const newUrl = `${result.webUrl}#message/${splitUrl[1]}`;

    window.history.pushState({}, "", newUrl);
  }
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
    let errorMessage = "";

    if (typeof e === "object") {
      errorMessage = (
        e as { response: { data: { error: { message: string } } } }
      )?.response?.data?.error?.message;
    }

    toastr.error(errorMessage);
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
    title,
    folderid: folderId,
    response: openNewTab ? null : "message",
  };

  const params = toUrlParams(options, true);
  if (!openNewTab) {
    return getDataSaveAs(params) as Promise<T>;
  }
  const handlerUrl = combineUrl(
    window.ClientConfig?.proxy?.url,

    window.AscDesktopEditor !== undefined // FIX Save as with open new tab on DesktopEditors
      ? "/Products/Files/HttpHandlers/"
      : "",
    `/filehandler.ashx?${params}`,
  );

  window.open(handlerUrl, "_blank");
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

  const rtlRegexp = /[\u04c7-\u0591\u05D0-\u05EA\u05F0-\u05F4\u0600-\u06FF]/;

  return rtlRegexp.test(str[0]);
};

export const setDocumentTitle = (
  t: TTranslation,
  subTitle: string | null,
  fileType: string,
  documentReady: boolean,
  successAuth: boolean,
  organizationName: string,
  callback?: (value: string) => void,
) => {
  const moduleTitle = "Documents"; // TODO: Replace to API variant

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
export const calculateAsideHeight = (callback?: () => void) => {
  const viewPort = window?.AscDesktopEditor?.getViewportSettings?.();

  if (!viewPort?.widgetType || viewPort.widgetType !== "window") return;

  const { captionHeight } = viewPort;

  const elements = {
    backdrop: document.querySelector(
      ".backdrop-active, .modal-backdrop-active",
    ),
    aside: document.querySelector("aside"),
  };

  const isElementInDom = !!elements.backdrop || !!elements.aside;

  if (!isElementInDom)
    return setTimeout(() => {
      if (typeof callback === "function") callback();
    }, 350);

  const styles = {
    height: `calc(100dvh - ${captionHeight}px)`,
    top: `${captionHeight}px`,
  };

  if (elements.backdrop) {
    Object.assign((elements.backdrop as HTMLElement).style, {
      height: styles.height,
      marginTop: styles.top,
    });
  }

  if (elements.aside) {
    Object.assign(elements.aside.style, {
      height: styles.height,
      top: styles.top,
    });
  }
};

export const isFormRole = (role: unknown): role is TFormRole[] => {
  return typeof role === "object" && Array.isArray(role) && "name" in role[0];
};

export const isPDFDocument = (file: TFile | undefined) => {
  if (!file) return false;

  return file.fileExst === ".pdf" && !file.isForm;
};
