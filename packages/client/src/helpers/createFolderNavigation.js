import FilesFilter from "@docspace/shared/api/files/filter";

import { RoomsType } from "@docspace/shared/enums";

import { CategoryType } from "SRC_DIR/helpers/constants";

import { getCategoryUrl, getCategoryTypeByFolderType } from "./utils";

export const createFolderNavigation = async (
  item,
  categoryType,
  userId,
  roomType,
  currentTitle,
  getPublicKey,
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

  const path = getCategoryUrl(
    getCategoryTypeByFolderType(rootFolderType, id),
    id,
  );
  const filter = FilesFilter.getDefault();
  const filterObj = FilesFilter.getFilter(window.location);

  if (isRoom) {
    const key =
      categoryType === CategoryType.Archive
        ? `UserFilterArchiveRoom=${userId}`
        : `UserFilterSharedRoom=${userId}`;

    const filterStorageSharedRoom = userId && localStorage.getItem(key);

    if (filterStorageSharedRoom) {
      const splitFilter = filterStorageSharedRoom.split(",");

      filter.sortBy = splitFilter[0];
      filter.sortOrder = splitFilter[1];
    }
  } else {
    // For the document section at all levels there is one sorting
    filter.sortBy = filterObj.sortBy;
    filter.sortOrder = filterObj.sortOrder;
  }

  filter.folder = id;

  if (getPublicKey) {
    const shareKey = await getPublicKey(item);
    if (shareKey) filter.key = shareKey;
  }

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
    isShared,
    isExternal,
    canCreate: security?.canCreate,
    isLifetimeEnabled: itemRoomType === RoomsType.VirtualDataRoom && !!lifetime,
  };
  const url = `${path}?${filter.toUrlParams()}`;

  return { url, state };
};
