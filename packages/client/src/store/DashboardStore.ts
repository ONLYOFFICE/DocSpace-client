import { makeAutoObservable } from "mobx";

import SelectedFolderStore from "./SelectedFolderStore";
import ClientLoadingStore from "./ClientLoadingStore";

import { FolderType } from "@docspace/common/constants";
import { combineUrl, isDefaultRole } from "@docspace/common/utils";

import config from "PACKAGE_FILE";
import api from "@docspace/common/api";

import type { IDashboard, IRole } from "@docspace/common/Models";
import type {
  FillQueue,
  Folder as FolderInfoType,
  RoleDefaultType,
  RoleDoneType,
  RoleInterruptedType,
} from "@docspace/common/types";
import { RoleTypeEnum } from "@docspace/common/enums";

const DASHBOARD_VIEW_AS_KEY = "board-view-as";
const DEFAULT_VIEW_AS_VALUE = "dashboard";

class DashboardStore {
  public viewAs!: string;
  public dashboard?: IDashboard;
  private _roles: FillQueue[] = [];

  constructor(
    private selectedFolderStore: SelectedFolderStore,
    private clientLoadingStore: ClientLoadingStore
  ) {
    makeAutoObservable(this);
    this.initViewAs();
  }

  //#region private method

  private initViewAs = (): void => {
    const viewAs =
      localStorage.getItem(DASHBOARD_VIEW_AS_KEY) ?? DEFAULT_VIEW_AS_VALUE;

    this.viewAs = viewAs;
  };

  private settingUpNavigationPath = async (dashboard: IDashboard) => {
    const navigationPath = await Promise.all(
      dashboard.pathParts.map(async (folder) => {
        const { Rooms, Archive } = FolderType;

        let folderId = folder;

        const folderInfo: FolderInfoType =
          dashboard.current.id === folderId
            ? dashboard.current
            : await api.files.getFolderInfo(folderId);

        const { id, title, rootFolderId, rootFolderType, roomType } =
          folderInfo;

        const isRootRoom =
          rootFolderId === id &&
          (rootFolderType === Rooms || rootFolderType === Archive);

        return {
          id: folderId,
          title,
          isRoom: !!roomType,
          isRootRoom,
        };
      })
    ).then((res) => {
      return res.slice(0, -1).reverse();
    });

    this.selectedFolderStore.setSelectedFolder({
      folders: dashboard.folders,
      ...dashboard.current,
      pathParts: dashboard.pathParts,
      navigationPath: navigationPath,
      ...{ new: dashboard.new },
    });

    this.clientLoadingStore.setIsSectionHeaderLoading(false);
  };

  private getRolesContextOptions = (type: RoleTypeEnum) => {
    switch (type) {
      case RoleTypeEnum.Default:
        return [];

      case RoleTypeEnum.Done:
        return ["link-for-room-members", "download"];

      case RoleTypeEnum.Interrupted:
        return [];
    }
  };

  private gotoRole = (id: string | number, roodId: string | number) => {
    window.DocSpace.navigate(`rooms/shared/${roodId}/role/${id}`);
  };

  //#endregion

  //#region getter

  public get roles(): IRole[] {
    const roles = this._roles.map<IRole>((role) => {
      if (role.type === RoleTypeEnum.Default) {
        const defaultRole: RoleDefaultType = {
          ...role,
          getOptions: () => [],
          onClickLocation: (roomId: string | number) =>
            this.gotoRole(role.id, roomId),
          onClickBadge: () => {},
        };

        return defaultRole;
      }

      const doneOrInterruptedRole: RoleDoneType | RoleInterruptedType = {
        ...role,
        getOptions: () => [],
        onClickBadge: () => {},
      };

      return doneOrInterruptedRole;
    });

    return roles;
  }
  //#endregion

  //#region public method

  public setViewAs = (viewAs: string): void => {
    console.log("DashboardStore setViewAs", viewAs);

    this.viewAs = viewAs;
    localStorage.setItem(DASHBOARD_VIEW_AS_KEY, viewAs);
  };

  public setRoles = (roles: FillQueue[]) => {
    this._roles = roles;
  };

  public setDashboard = (dashboard: IDashboard) => {
    this.dashboard = dashboard;
  };

  public fetchDashboard = async (
    fileId: number | string
  ): Promise<IDashboard> => {
    try {
      const dashboard: IDashboard = await api.files.getDashboard(fileId);

      this.setRoles(dashboard.current.fillQueue);
      this.setDashboard(dashboard);

      await this.settingUpNavigationPath(dashboard);

      return dashboard;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  //#endregion
}

export default DashboardStore;
