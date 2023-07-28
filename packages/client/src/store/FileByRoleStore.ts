import { makeAutoObservable, runInAction } from "mobx";

import { RoleTypeEnum } from "@docspace/common/enums";
import type DashboardStore from "./DashboardStore";
import type { IFileByRole, IRole } from "@docspace/common/Models";
import type { FileByRoleType } from "@docspace/common/types";

class FileByRoleStore {
  constructor(private dashboard: DashboardStore, private role: IRole) {
    makeAutoObservable(this);
  }

  private getContextMenuModel = (file: FileByRoleType) => {
    if (this.role.type === RoleTypeEnum.Default) {
      let options: string[] = [
        "fill-form",
        "preview",
        "separator0",
        "link-for-room-members",
        "separator1",
        "cancel-filling",
      ];

      return options;
    } else {
      let options: string[] = [
        "preview",
        "separator0",
        "link-for-room-members",
        "download-file",
        "download-file-as",
        "move-to",
        "copy-file",
        "separator1",
        "delete",
      ];

      return options;
    }
  };

  public get FilesByRole() {
    const files = this.dashboard.filesByRole.get(this.role.id);

    if (!files) return [];

    return files.map<IFileByRole>((file) => {
      return {
        ...file,
        selected: this.dashboard.selectedFilesByRoleMap.has(file.id),
        isActive: file.id === this.dashboard.BufferSelectionFilesByRole?.id,
        contextOptionsModel: this.getContextMenuModel(file),
      };
    });
  }
}

export default FileByRoleStore;
