import FilesFilter from "@docspace/shared/api/files/filter";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

export default function getItemUrl(
  id: string | number,
  isFolder: boolean,
  needConvert: boolean,
  canOpenPlayer: boolean,
  shareKey?: string,
) {
  if (typeof window === "undefined") return "";

  const proxyURL = window.ClientConfig?.proxy?.url || window.location.origin;

  if (canOpenPlayer) {
    const filterObj = FilesFilter.getFilter(window.location)!.toUrlParams();

    return `${proxyURL}/sdk/public-room/${MEDIA_VIEW_URL}/${id}?${shareKey ? `key=${shareKey}&` : ""}${filterObj}`;
  }

  if (isFolder) {
    return `${proxyURL}/sdk/public-room?${shareKey ? `key=${shareKey}&` : ""}folder=${id}`;
  }

  return `${proxyURL}/doceditor?${shareKey ? `share=${shareKey}&` : ""}fileId=${id}${needConvert ? "&action=view" : ""}`;
}
