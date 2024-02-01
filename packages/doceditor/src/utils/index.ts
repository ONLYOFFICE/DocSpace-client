import { toUrlParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { request } from "@docspace/shared/api/client";

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
