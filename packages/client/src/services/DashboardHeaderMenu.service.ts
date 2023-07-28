import { IFileByRole, IRole } from "@docspace/common/Models";
import DashboardContextOption from "SRC_DIR/store/DashboardContextOption";
import DashboardStore from "../store/DashboardStore";

class DashboardHeaderMenuService {
  constructor(
    private dashboardStore: DashboardStore,
    private dashboardContextOptionStore: DashboardContextOption
  ) {}

  private get isDashboardView() {
    return this.dashboardStore.viewAs === "dashboard";
  }

  public get isHeaderMenuVisible(): boolean {
    if (this.isDashboardView) {
      return this.dashboardStore.selectedFilesByRoleMap.size > 0;
    }

    return this.dashboardStore.SelectedRolesMap.size > 0;
  }

  public get isHeaderChecked(): boolean {
    if (this.isDashboardView) {
      let count = 0;

      this.dashboardStore.filesByRole.forEach((files) => {
        count += files.length;
      });

      return this.dashboardStore.selectedFilesByRoleMap.size === count;
    }

    return (
      this.dashboardStore.SelectedRolesMap.size ===
      this.dashboardStore.roles.length
    );
  }

  public get isHeaderIndeterminate(): boolean {
    return !this.isHeaderChecked;
  }

  public onChangeSelected = (checked: boolean) => {
    const {
      clearSelectedRoleMap,
      clearSelectedFileByRoleMap,
      roles,
      collectionFileByRoleStore,
      setSelectedRolesMap,
      setSelectedFilesByRoleMap,
    } = this.dashboardStore;

    if (checked) {
      if (this.isDashboardView) {
        let selected = new Map<number, IFileByRole>();

        collectionFileByRoleStore.forEach((store) => {
          store.FilesByRole.forEach((file) => selected.set(file.id, file));
        });

        setSelectedFilesByRoleMap(selected);
      } else {
        setSelectedRolesMap(
          new Map<number, IRole>(roles.map((role) => [role.id, role]))
        );
      }
    } else {
      clearSelectedRoleMap();
      clearSelectedFileByRoleMap();
    }
  };

  public getHeaderContextMenu = (t: (text: string) => string) => {
    if (this.isDashboardView)
      return this.dashboardContextOptionStore.getGroupFileByRoleContextOptions(
        t
      );

    return this.dashboardContextOptionStore.getGroupContextOptions(t);
  };
}

export default DashboardHeaderMenuService;
