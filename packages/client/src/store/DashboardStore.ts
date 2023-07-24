import { makeAutoObservable, runInAction } from "mobx";
import { NavigateOptions } from "react-router-dom";

import SelectedFolderStore from "./SelectedFolderStore";
import ClientLoadingStore from "./ClientLoadingStore";

import { FolderType } from "@docspace/common/constants";

import api from "@docspace/common/api";

import type { IDashboard, IRole } from "@docspace/common/Models";
import type {
  RoleQueue,
  Folder as FolderInfoType,
  RoleDefaultType,
  RoleDoneType,
  RoleInterruptedType,
  File,
} from "@docspace/common/types";
import { RoleTypeEnum } from "@docspace/common/enums";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

const DASHBOARD_VIEW_AS_KEY = "board-view-as";
const DEFAULT_VIEW_AS_VALUE = "dashboard";

class DashboardStore {
  private _roles: RoleQueue[] = [];

  public viewAs!: string;
  public dashboard?: IDashboard;
  public SelectedRolesMap: Map<number, IRole> = new Map();
  public BufferSelectionRole?: IRole;

  public filesByRole = new Map<number, File[]>();

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
      isDashboard: true,
      ...{ new: dashboard.new },
    });

    this.clientLoadingStore.setIsSectionHeaderLoading(false);
  };

  private removeOptions = (options: string[], toRemoveArray: string[]) =>
    options.filter((o) => !toRemoveArray.includes(o));

  private getRolesContextOptionsModel = (role: RoleQueue) => {
    let roleOptions = [
      "link-for-room-members",
      "separator0",
      "download-role",
      "copy-role",
      "separator1",
      "delete-role",
    ];

    if (role.type === RoleTypeEnum.Default) {
      roleOptions = this.removeOptions(roleOptions, [
        "separator1",
        "delete-role",
      ]);
    }

    return roleOptions;
  };

  private goTo = (url: string, options?: NavigateOptions) => {
    window.DocSpace.navigate(url, options);
  };

  private setBufferSelection = (
    role: IRole,
    checked: boolean,
    withSelection?: boolean
  ) => {
    const hasRole = this.SelectedRolesMap.has(role.id);

    if (withSelection && hasRole) {
      this.clearBufferSelectionRole();
    }

    if (withSelection && !hasRole) {
      this.BufferSelectionRole = role;
      this.SelectedRolesMap.clear();
    }

    if (!withSelection) {
      this.BufferSelectionRole = role;
      this.SelectedRolesMap.clear();
      if (checked) this.SelectedRolesMap.set(role.id, role);
    }
  };

  //#endregion

  //#region getter

  public get roles(): IRole[] {
    if (!this.dashboard) return [];

    const roles = this._roles.map<IRole>((role) => {
      const url = getCategoryUrl(
        CategoryType.Role,
        this.dashboard?.current.id,
        role.id
      );

      const general = {
        contextOptionsModel: this.getRolesContextOptionsModel(role),
        onClickBadge: () => {},
        onChecked: this.selectedRole,
        onContentRowCLick: this.setBufferSelection,
        isChecked: this.SelectedRolesMap.has(role.id),
        isActive: this.BufferSelectionRole?.id === role.id,
        url,
      };

      if (role.type === RoleTypeEnum.Default) {
        const defaultRole: RoleDefaultType = {
          ...role,
          ...general,
          onClickLocation: () =>
            this.goTo(url, { state: { fromDashboard: true } }),
        };

        return defaultRole;
      }

      const doneOrInterruptedRole: RoleDoneType | RoleInterruptedType = {
        ...role,
        ...general,
      };

      return doneOrInterruptedRole;
    });

    return roles;
  }
  //#endregion

  //#region public method

  public selectedRole = (role: IRole, checked: boolean): void => {
    if (this.BufferSelectionRole) this.clearBufferSelectionRole();

    if (checked) this.SelectedRolesMap.set(role.id, role);
    else this.SelectedRolesMap.delete(role.id);
  };

  public clearSelectedRoleMap = (): void => {
    this.SelectedRolesMap.clear();
  };

  public clearBufferSelectionRole = (): void => {
    this.BufferSelectionRole = undefined;
  };

  public setViewAs = (viewAs: string): void => {
    const isNotEmptySelected = this.SelectedRolesMap.size !== 0;

    if (isNotEmptySelected && viewAs === "dashboard") {
      this.clearSelectedRoleMap();
    }

    this.viewAs = viewAs;
    localStorage.setItem(DASHBOARD_VIEW_AS_KEY, viewAs);
  };

  public setRoles = (roles: RoleQueue[]): void => {
    this._roles = roles;
  };

  public setDashboard = (dashboard: IDashboard): void => {
    this.dashboard = dashboard;
  };

  public fetchFilesByRole = async (roleId: number): Promise<File[]> => {
    const boardId = this.dashboard?.current.id;

    if (!boardId) return Promise.reject();

    try {
      const files: File[] = await api.files.getFilesByRole(boardId, roleId);
      runInAction(() => {
        this.filesByRole.set(roleId, files);
      });
      return files;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public fetchDashboard = async (
    fileId: number | string
  ): Promise<IDashboard> => {
    try {
      const dashboard: IDashboard = await api.files.getDashboard(fileId);

      this.setRoles(dashboard.current.roleQueue);
      this.setDashboard(dashboard);

      await this.settingUpNavigationPath(dashboard);

      return dashboard;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public setSelectedRolesMap = (selectedRolesMap: Map<number, IRole>) => {
    this.SelectedRolesMap = selectedRolesMap;
  };
  //#endregion
}

export default DashboardStore;
