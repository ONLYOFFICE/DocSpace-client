import { IRole } from "@docspace/common/Models";
import { ContextMenuModel } from "@docspace/components/types";
import { makeAutoObservable } from "mobx";
import DashboardStore from "./DashboardStore";

import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

class DashboardContextOpetion {
  constructor(private dashboardStore: DashboardStore) {
    makeAutoObservable(this);
  }

  public getGroupContextOptions = (t: (arg: string) => string) => {
    const length = this.dashboardStore.SelectedRolesMap.size;
    const selectedRoles = this.dashboardStore.SelectedRolesMap.values();

    const groupOptions: Record<string, number> = {
      "download-role": 0,
      "copy-role": 0,
      "delete-role": 0,
    };

    const optionsModel: Record<string, ContextMenuModel> = {
      "download-role": {
        id: "option_role_download-role",
        key: "download-role",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "copy-role": {
        id: "option_role_copy-role",
        key: "copy-role",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "delete-role": {
        id: "option_role_delete",
        key: "delete-role",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },
    };

    for (const role of selectedRoles) {
      role.contextOptionsModel.forEach((option) => {
        groupOptions[option] !== undefined && ++groupOptions[option];
      });
    }

    const options = Object.entries(groupOptions)
      .filter((item) => item[1] === length)
      .map((item) => optionsModel[item[0]]);

    return options;
  };

  public getOptions = (
    role: IRole,
    t: (arg: string) => string
  ): ContextMenuModel[] => {
    const options: Record<string, ContextMenuModel> = {
      "link-for-room-members": {
        id: "option_role_link-for-room-members",
        key: "link-for-room-members",
        label: t("LinkForRoomMembers"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "download-role": {
        id: "option_role_download-role",
        key: "download-role",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "copy-role": {
        id: "option_role_copy-role",
        key: "copy-role",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      separator0: {
        key: "separator0",
        isSeparator: true,
        disabled: false,
      },
      separator1: {
        key: "separator1",
        isSeparator: true,
        disabled: false,
      },
      "delete-role": {
        id: "option_role_delete",
        key: "delete-role",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },
    };

    const contextOption = role.contextOptionsModel.map(
      (option) => options[option]
    );
    return contextOption;
  };

  public getModel = (role: IRole, t: (arg: string) => string) => {
    const countSelectedRoles = this.dashboardStore.SelectedRolesMap.size;

    if (countSelectedRoles > 1) {
      return this.getGroupContextOptions(t);
    }

    return this.getOptions(role, t);
  };
}

export default DashboardContextOpetion;
