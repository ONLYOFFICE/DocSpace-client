import FilesFilter from "@docspace/shared/api/files/filter";

import { RoomsType } from "@docspace/shared/enums";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ROOM_DOCUMENTS,
} from "@docspace/shared/utils/filterConstants";

import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl, getCategoryTypeByFolderType } from "./utils";

export const createFolderNavigation = async (
  item,
  categoryType,
  userId,
  roomType,
  currentTitle,
) => {
  if (!item) return { url: "", state: {} };

  const {
    isRoom,
    rootFolderType,
    id,
    roomType: itemRoomType,
    title,
    shared,
    external,
    navigationPath,
    lifetime,
    security,
  } = item;

  const isAiRoom = itemRoomType === RoomsType.AIRoom;

  const path = isAiRoom
    ? getCategoryUrl(CategoryType.Chat, id)
    : getCategoryUrl(getCategoryTypeByFolderType(rootFolderType, id), id);
  const filter = FilesFilter.getDefault();
  const filterObj = FilesFilter.getFilter(window.location);

  if (isRoom && !isAiRoom) {
    if (userId) {
      const key =
        categoryType === CategoryType.Archive
          ? `${FILTER_ARCHIVE_DOCUMENTS}=${userId}`
          : `${FILTER_ROOM_DOCUMENTS}=${userId}`;

      const filterObject = getUserFilter(key);

      if (filterObject?.sortBy) filter.sortBy = filterObject.sortBy;
      if (filterObject?.sortOrder) filter.sortOrder = filterObject.sortOrder;
    }
  } else if (filterObj && !isAiRoom) {
    // For the document section at all levels there is one sorting
    filter.sortBy = filterObj.sortBy;
    filter.sortOrder = filterObj.sortOrder;
  }

  filter.folder = id;

  const isShared = shared || navigationPath?.findIndex((r) => r.shared) > -1;

  const isExternal =
    external || navigationPath?.findIndex((r) => r.external) > -1;

  const state = {
    title,
    isRoot: false,
    rootFolderType,
    isRoom,
    rootRoomTitle: roomType ? currentTitle : "",
    isPublicRoomType: itemRoomType === RoomsType.PublicRoom || false,
    isAiRoomType: isAiRoom,
    isShared,
    isExternal,
    canCreate: security?.canCreate,
    isLifetimeEnabled: itemRoomType === RoomsType.VirtualDataRoom && !!lifetime,
  };
  const url = `${path}?${filter.toUrlParams()}`;

  return { url, state };
};
