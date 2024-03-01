import { TFile } from "@docspace/shared/api/files/types";
import { frameCallCommand } from "@docspace/shared/utils/common";

import { convertDocumentUrl } from ".";
import { updateFile } from "@docspace/shared/api/files";

export type TInfoEvent = { data: { mode: string } };

export const onSDKInfo = (event: object) => {
  const data = (event as TInfoEvent).data;

  console.log("ONLYOFFICE Document Editor is opened in mode " + data.mode);
};

export type TWarningEvent = {
  data: { warningCode: string; warningDescription: string };
};

export const onSDKWarning = (event: object) => {
  const data = (event as TWarningEvent).data;
  frameCallCommand("setIsLoaded");
  console.log(
    "ONLYOFFICE Document Editor reports a warning: code " +
      data.warningCode +
      ", description " +
      data.warningDescription,
  );
};

export type TErrorEvent = {
  data: { errorCode: string; errorDescription: string };
};

export const onSDKError = (event: object) => {
  const data = (event as TErrorEvent).data;
  frameCallCommand("setIsLoaded");
  console.log(
    "ONLYOFFICE Document Editor reports an error: code " +
      data.errorCode +
      ", description " +
      data.errorDescription,
  );
};

export const onSDKRequestHistoryClose = () => {
  document.location.reload();
};

export const onSDKRequestEditRights = async (fileInfo: TFile) => {
  console.log("ONLYOFFICE Document Editor requests editing rights");
  const url = window.location.href;

  const index = url.indexOf("&action=view");

  if (index) {
    let convertUrl = url.substring(0, index);

    if (
      fileInfo?.viewAccessibility?.MustConvert &&
      fileInfo?.security?.Convert
    ) {
      const newUrl = await convertDocumentUrl(fileInfo.id);
      if (newUrl) {
        convertUrl = newUrl.webUrl;
      }
    }
    history.pushState({}, "", convertUrl);
    document.location.reload();
  }
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
