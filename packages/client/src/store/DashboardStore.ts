import { makeAutoObservable } from "mobx";

const DASHBOARD_VIEW_AS_KEY = "board-view-as";
const DEFAULT_VIEW_AS_VALUE = "dashboard";

class DashboardStore {
  public viewAs!: string;

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
}

export default DashboardStore;
