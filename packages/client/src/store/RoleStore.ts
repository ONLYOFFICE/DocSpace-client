import api from "@docspace/common/api";
import RoleFilter from "@docspace/common/api/files/roleFilter";

import { FolderType } from "@docspace/common/constants";
import { IRole } from "@docspace/common/Models";

import type {
  CurrentRoleResponseType,
  Folder as FolderInfoType,
  RoleQueue,
} from "@docspace/common/types";
import type DashboardContextOpetion from "./DashboardContextOption";
import type DashboardStore from "./DashboardStore";
import type FilesStore from "./FilesStore";

class RoleStore {
  public role?: IRole;

  constructor(
    private filesStore: FilesStore,
    private dashboardStore: DashboardStore,
    private dashboardContextOptionStore: DashboardContextOpetion
  ) {}

  private resetState = (): void => {
    const { setFolders, setBoards, setSelection, setSelected } =
      this.filesStore;

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

    this.filesStore.selectedFolderStore.setSelectedFolder({
      folders: [],
      ...currentRole.current,
      pathParts: currentRole.pathParts,
      navigationPath: navigationPath.reverse(),
      isDashboard: false,
      isRolePage: true,
      new: currentRole.new,
    });

    this.filesStore.clientLoadingStore.setIsSectionHeaderLoading(false);
  };

  public setRole = (role: RoleQueue) => {
    this.role = this.dashboardStore.convertToRole(role);
  };

  public getRoleHeaderContextMenu = (t: (arg: string) => string) => {
    if (!this.role) return [];

    return this.dashboardContextOptionStore.getOptions(this.role, t);
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
      this.setRole(result.current);
      this.filesStore.setFiles(result.files);
      await this.settingUpNavigationPath(result);

      filter.total = result.total;
      this.filesStore.setFilter(filter);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export default RoleStore;
