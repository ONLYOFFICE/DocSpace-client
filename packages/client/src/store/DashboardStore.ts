import { makeAutoObservable } from "mobx";

import SelectedFolderStore from "./SelectedFolderStore";
import ClientLoadingStore from "./ClientLoadingStore";

import { FolderType } from "@docspace/common/constants";
import { combineUrl } from "@docspace/common/utils";

import config from "PACKAGE_FILE";
import api from "@docspace/common/api";

import type { IDashboard } from "@docspace/common/Models";
import type { Folder as FolderInfoType } from "@docspace/common/types";

const DASHBOARD_VIEW_AS_KEY = "board-view-as";
const DEFAULT_VIEW_AS_VALUE = "dashboard";

class DashboardStore {
  public viewAs!: string;
  public boards: unknown[] = [];
  public dashboard?: IDashboard;

  constructor(
    private selectedFolderStore: SelectedFolderStore,
    private clientLoadingStore: ClientLoadingStore
  ) {
    makeAutoObservable(this);
    this.initViewAs();
  }

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
    console.log({ navigationPath, dashboard });

    this.selectedFolderStore.setSelectedFolder({
      folders: dashboard.folders,
      ...dashboard.current,
      pathParts: dashboard.pathParts,
      navigationPath: navigationPath,
      ...{ new: dashboard.new },
    });

    this.clientLoadingStore.setIsSectionHeaderLoading(false);
  };

  public setViewAs = (viewAs: string): void => {
    console.log("DashboardStore setViewAs", viewAs);

    this.viewAs = viewAs;
    localStorage.setItem(DASHBOARD_VIEW_AS_KEY, viewAs);
  };

  public setBoards(boards: unknown[]) {
    this.boards = boards;
  }

  public setDashboard = (dashboard: IDashboard) => {
    this.dashboard = dashboard;
  };

  public fetchDashboard = async (
    fileId: number | string
  ): Promise<IDashboard> => {
    try {
      const dashboard: IDashboard = await api.files.getDashboard(fileId);
      console.log({ dashboard });
      this.setDashboard(dashboard);
      await this.settingUpNavigationPath(dashboard);

      return dashboard;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public getUrlToBoard(folderId: number) {
    const proxyURL =
      window.DocSpaceConfig?.proxy?.url || window.location.origin;

    const homepage = config?.homepage ?? "";

    return combineUrl(
      proxyURL,
      homepage,
      "rooms/shared",
      folderId.toString(),
      "dashboard"
    );
  }
}

export default DashboardStore;
