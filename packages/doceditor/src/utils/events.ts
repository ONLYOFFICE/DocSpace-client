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

import { TFile } from "@docspace/shared/api/files/types";
import { frameCallCommand } from "@docspace/shared/utils/common";
import { updateFile } from "@docspace/shared/api/files";
import { TTranslation } from "@docspace/shared/types";

import { convertDocumentUrl } from ".";

export type TInfoEvent = { data: { mode: string } };

export const onSDKInfo = (event: object) => {
  const data = (event as TInfoEvent).data;

  console.log(`ONLYOFFICE Document Editor is opened in mode ${data.mode}`);
};

export type TWarningEvent = {
  data: { warningCode: string; warningDescription: string };
};

export const onSDKWarning = (event: object) => {
  const data = (event as TWarningEvent).data;
  frameCallCommand("setIsLoaded");
  console.log(
    `ONLYOFFICE Document Editor reports a warning: code ${
      data.warningCode
    }, description ${data.warningDescription}`,
  );
};

export type TErrorEvent = {
  data: { errorCode: string; errorDescription: string };
};

export const onSDKError = (event: object) => {
  const data = (event as TErrorEvent).data;
  frameCallCommand("setIsLoaded");
  console.log(
    `ONLYOFFICE Document Editor reports an error: code ${
      data.errorCode
    }, description ${data.errorDescription}`,
  );
};

export const onSDKRequestHistoryClose = () => {
  document.location.reload();
};

export const onSDKRequestEditRights = async (
  t: TTranslation,
  fileInfo?: TFile,
  documentType?: string,
) => {
  console.log("ONLYOFFICE Document Editor requests editing rights");

  const url = window.location.href;
  const isPDF = documentType === "pdf";

  let newURL = new URL(url);
  let title = "";

  if (
    !isPDF &&
    fileInfo?.viewAccessibility?.MustConvert &&
    fileInfo?.security?.Convert
  ) {
    try {
      const response = await convertDocumentUrl(fileInfo.id);

      if (response && response.webUrl) {
        title = response.title;
        newURL = new URL(response.webUrl);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Error converting document", { error });
      return;
    }
  } else {
    if (newURL.searchParams.has("action")) newURL.searchParams.delete("action");

    newURL.searchParams.append("action", "edit");
  }

  const messageAfterConversion = t("Editor:DocumentConverted", { title });
  const stringURL = newURL.toString();
  const concatURL = title
    ? stringURL.concat(`#message/${messageAfterConversion}`)
    : stringURL;

  window.history.pushState({}, "", concatURL);
  document.location.reload();
};

export type TRenameEvent = {
  data: string;
};

export const onSDKRequestRename = async (
  event: object,
  id: string | number,
) => {
  const title = (event as TRenameEvent).data;
  await updateFile(id, title);
};

export const onOutdatedVersion = () => window.location.reload();
