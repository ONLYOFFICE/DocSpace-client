import { makeAutoObservable } from "mobx";
import { combineUrl } from "@docspace/common/utils";
import config from "PACKAGE_FILE";

const DASHBOARD_VIEW_AS_KEY = "board-view-as";
const DEFAULT_VIEW_AS_VALUE = "dashboard";

class DashboardStore {
  public viewAs!: string;
  public boards: unknown[] = [];

  constructor() {
    makeAutoObservable(this);
    this.initViewAs();
  }

  private initViewAs = (): void => {
    const viewAs =
      localStorage.getItem(DASHBOARD_VIEW_AS_KEY) ?? DEFAULT_VIEW_AS_VALUE;

    this.viewAs = viewAs;
  };

  public setViewAs = (viewAs: string): void => {
    console.log("DashboardStore setViewAs", viewAs);

    this.viewAs = viewAs;
    localStorage.setItem(DASHBOARD_VIEW_AS_KEY, viewAs);
  };

  public setBoards(boards: unknown[]) {
    this.boards = boards;
  }

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
