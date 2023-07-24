import { IFileByRole } from "@docspace/common/Models";
import { makeAutoObservable, runInAction } from "mobx";
import type DashboardStore from "./DashboardStore";

class FileByRoleStore {
  constructor(private dashboard: DashboardStore, private roleId: number) {
    makeAutoObservable(this);
  }

  public get FilesByRole() {
    const files = this.dashboard.filesByRole.get(this.roleId);

    if (!files) return [];

    return files.map<IFileByRole>((file) => {
      return {
        ...file,
        selected: this.dashboard.selectedFilesByRoleMap.has(file.id),
        isActive: false,
      };
    });
  }
}

export default FileByRoleStore;
