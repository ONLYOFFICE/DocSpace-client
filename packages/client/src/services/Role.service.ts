import api from "@docspace/common/api";

import { FolderType } from "@docspace/common/constants";

import type RoleFilter from "@docspace/common/api/files/roleFilter";
import type {
  CurrentRoleResponseType,
  Folder as FolderInfoType,
} from "@docspace/common/types";
import type FilesStore from "SRC_DIR/store/FilesStore";

class RoleService {
  constructor(private fileStore: FilesStore) {}

  private resetState = (): void => {
    const { setFolders, setBoards, setSelection, setSelected } = this.fileStore;

    setFolders([]);
    setBoards([]);
    setSelection([]);
    setSelected("close");
  };

  private settingUpNavigationPath = async (
    currentRole: CurrentRoleResponseType
  ) => {
    const navigationPath = await Promise.all(
      currentRole.pathParts.map(async (folderId) => {
        const { Rooms, Archive } = FolderType;

        const folderInfo: FolderInfoType = await api.files.getFolderInfo(
          folderId
        );

        const { id, title, rootFolderId, rootFolderType, roomType, type } =
          folderInfo;

        const isRootRoom =
          rootFolderId === id &&
          (rootFolderType === Rooms || rootFolderType === Archive);

        return {
          id: folderId,
          title,
          isRoom: !!roomType,
          isRootRoom,
          isDashboard: type === FolderType.Dashboard,
        };
      })
    );

    this.fileStore.selectedFolderStore.setSelectedFolder({
      folders: [],
      ...currentRole.current,
      pathParts: currentRole.pathParts,
      navigationPath: navigationPath.reverse(),
      isDashboard: false,
      isRolePage: true,
      ...{ new: currentRole.new },
    });

    this.fileStore.clientLoadingStore.setIsSectionHeaderLoading(false);
  };

  public getRole = async (
    boardId: string,
    roleId: string,
    filter: RoleFilter
  ) => {
    try {
      const result: CurrentRoleResponseType = await api.files.getRole(
        boardId,
        roleId
      );

      this.resetState();
      this.fileStore.setFiles(result.files);
      this.settingUpNavigationPath(result);

      filter.total = result.total;
      this.fileStore.setFilter(filter);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export default RoleService;
