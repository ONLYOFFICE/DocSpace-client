import { makeAutoObservable } from "mobx";

import type DashboardStore from "./DashboardStore";
import type { IFileByRole } from "@docspace/common/Models";
import type { RoleQueue } from "@docspace/common/types";

class FileByRoleStore {
  public firstLoaded: boolean = false;

  constructor(private dashboardStore: DashboardStore, private role: RoleQueue) {
    makeAutoObservable(this);
  }

  public get FilesByRole() {
    const files = this.dashboardStore.filesByRole.get(this.role.id);

    if (!files) return [];

    return files.map<IFileByRole>((file) => {
      return {
        ...file,
        selected: this.dashboardStore.selectedFilesByRoleMap.has(file.id),
        isActive:
          file.id === this.dashboardStore.BufferSelectionFilesByRole?.id,
        contextOptionsModel: this.dashboardStore.getFilesContextOptionsMode(
          file,
          this.role
        ),
      };
    });
  }

  public setFirstLoaded = (arg: boolean) => {
    this.firstLoaded = arg;
  };
}

export default FileByRoleStore;
