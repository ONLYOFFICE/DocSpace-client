import copy from "copy-to-clipboard";
import { makeAutoObservable } from "mobx";
import config from "PACKAGE_FILE";

import DashboardHeaderMenuService from "SRC_DIR/services/DashboardHeaderMenu.service";

import { combineUrl } from "@docspace/common/utils";
import toastr from "@docspace/components/toast/toastr";

import type { ContextMenuModel } from "@docspace/components/types";
import type { IFileByRole, IRole } from "@docspace/common/Models";
import type DashboardStore from "./DashboardStore";
import type DialogsStore from "./DialogsStore";
import type ContextOptionsStore from "./ContextOptionsStore";

import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";

class DashboardContextOpetion {
  public dashboardHeaderMenuService!: DashboardHeaderMenuService;

  constructor(
    private dashboardStore: DashboardStore,
    private dialogsStore: DialogsStore,
    private contextOptionsStore: ContextOptionsStore
  ) {
    this.dashboardHeaderMenuService = new DashboardHeaderMenuService(
      dashboardStore,
      this
    );

    makeAutoObservable(this);
  }

  private getFullUrl = (url: string) => {
    const proxyURL =
      window.DocSpaceConfig?.proxy?.url || window.location.origin;

    return combineUrl(proxyURL, config.homepage, url);
  };

  public onCopyLink = (item: IRole, t: (arg: string) => string) => {
    const url = this.getFullUrl(item.url);

    copy(url);

    return toastr.success(t("Translations:LinkCopySuccess"));
  };

  public onCopyLinkFile = (item: IFileByRole, t: (arg: string) => string) => {
    // const url = this.getFullUrl(item.url);
    // copy(url);
    //TODO: Added item url

    return toastr.success(t("Translations:LinkCopySuccess"));
  };

  public deleteRole = (role: IRole) => {
    this.dialogsStore.setDeleteAllFormsDialogVisible(true);
    this.dashboardStore.BufferSelectionRole = role;
  };

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
        iconUrl: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "copy-role": {
        id: "option_role_copy-role",
        key: "copy-role",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        iconUrl: CopyReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "delete-role": {
        id: "option_role_delete",
        key: "delete-role",
        label: t("Files:DeleteAllForm"),
        icon: TrashReactSvgUrl,
        iconUrl: TrashReactSvgUrl,
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

  public getGroupFileByRoleContextOptions = (t: (arg: string) => string) => {
    const length = this.dashboardStore.selectedFilesByRoleMap.size;
    const selectedFiles = this.dashboardStore.selectedFilesByRoleMap.values();

    const optionsModel: Record<string, ContextMenuModel> = {
      "cancel-filling": {
        id: "option_cancel-filling",
        key: "cancel-filling",
        label: t("Common:CancelFilling"),
        icon: CrossReactSvgUrl,
        iconUrl: CrossReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "download-file": {
        id: "option_file-by-role_download-role",
        key: "download-file",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        iconUrl: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "download-file-as": {
        id: "option_file-by-role_download-file",
        key: "download-file-as",
        label: t("Translations:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        iconUrl: DownloadAsReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "move-to": {
        id: "option_move-to",
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        iconUrl: MoveReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "copy-file": {
        id: "option_file-by-role_copy-file",
        key: "copy-file",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        iconUrl: CopyReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },
      delete: {
        id: "option_file-by-role_delete",
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        iconUrl: TrashReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },
    };

    const groupOptions: Record<string, number> = {
      "cancel-filling": 0,
      "download-file": 0,
      "download-file-as": 0,
      "move-to": 0,
      "copy-file": 0,
      delete: 0,
    };

    for (const role of selectedFiles) {
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
        label: t("Files:LinkForRoomMembers"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.onCopyLink(role, t),
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
        label: t("Files:DeleteAllForm"),
        icon: TrashReactSvgUrl,
        onClick: () => this.deleteRole(role),
        disabled: false,
      },
    };

    const contextOption = role.contextOptionsModel.map(
      (option) => options[option]
    );
    return contextOption;
  };

  public getOptionsFileByRole = (
    t: (arg: string) => string,
    file: IFileByRole
  ) => {
    const options: Record<string, ContextMenuModel> = {
      "link-for-room-members": {
        id: "option_file-by-role_link-for-room-members",
        key: "link-for-room-members",
        label: t("Files:LinkForRoomMembers"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => this.contextOptionsStore.onCopyLink(file, t),
        disabled: false,
      },

      preview: {
        id: "option_preview",
        key: "preview",
        label: t("Common:Preview"),
        icon: EyeReactSvgUrl,
        onClick: () => this.contextOptionsStore.onPreviewClick(file),
        disabled: false,
      },

      "cancel-filling": {
        id: "option_cancel-filling",
        key: "cancel-filling",
        label: t("Common:CancelFilling"),
        icon: CrossReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "fill-form": {
        id: "option_fill-form",
        key: "fill-form",
        label: t("Common:FillFormButton"),
        icon: FormFillRectSvgUrl,
        onClick: () => this.contextOptionsStore.onClickLinkFillForm(file),
        disabled: false,
      },

      "download-file": {
        id: "option_file-by-role_download-role",
        key: "download-file",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "download-file-as": {
        id: "option_file-by-role_download-file",
        key: "download-file-as",
        label: t("Translations:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "move-to": {
        id: "option_move-to",
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },

      "copy-file": {
        id: "option_file-by-role_copy-file",
        key: "copy-file",
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
      delete: {
        id: "option_file-by-role_delete",
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => {},
        disabled: false,
      },
    };

    const contextOption = file.contextOptionsModel.map(
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

  public getModelFile = (file: IFileByRole, t: (arg: string) => string) => {
    const countSelectedFiles = this.dashboardStore.selectedFilesByRoleMap.size;

    if (countSelectedFiles > 1) {
      return this.getGroupFileByRoleContextOptions(t);
    }

    return this.getOptionsFileByRole(t, file);
  };
}

export default DashboardContextOpetion;
