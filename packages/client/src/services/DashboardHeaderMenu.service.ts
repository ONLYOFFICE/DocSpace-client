import { IRole } from "@docspace/common/Models";
import DashboardContextOption from "SRC_DIR/store/DashboardContextOption";
import DashboardStore from "../store/DashboardStore";

class DashboardHeaderMenuService {
  constructor(
    private dashboardStore: DashboardStore,
    private dashboardContextOptionStore: DashboardContextOption
  ) {}

  public get isHeaderMenuVisible(): boolean {
    return this.dashboardStore.SelectedRolesMap.size > 0;
  }

  public get isHeaderChecked(): boolean {
    return (
      this.dashboardStore.SelectedRolesMap.size ===
      this.dashboardStore.roles.length
    );
  }

  public get isHeaderIndeterminate(): boolean {
    return !this.isHeaderChecked;
  }

  public onChangeSelected = (checked: boolean) => {
    const { clearSelectedRoleMap, roles, setSelectedRolesMap } =
      this.dashboardStore;

    if (checked) {
      setSelectedRolesMap(
        new Map<number, IRole>(roles.map((role) => [role.id, role]))
      );
    } else {
      clearSelectedRoleMap();
    }
  };

  public getHeaderContextMenu = (t: (text: string) => string) => {
    return this.dashboardContextOptionStore.getGroupContextOptions(t);
  };
}

export default DashboardHeaderMenuService;
