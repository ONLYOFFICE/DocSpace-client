import copy from "copy-to-clipboard";
import { makeAutoObservable } from "mobx";
import uniqueid from "lodash/uniqueId";

import config from "PACKAGE_FILE";

import DashboardHeaderMenuService from "SRC_DIR/services/DashboardHeaderMenu.service";

import { combineUrl } from "@docspace/common/utils";
import {
  downloadFiles as downloadFilesApi,
  removeFiles as removeFilesApi,
} from "@docspace/common/api/files";
import toastr from "@docspace/components/toast/toastr";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";

import type { ContextMenuModel } from "@docspace/components/types";
import type { IFileByRole, IRole } from "@docspace/common/Models";
import type DashboardStore from "./DashboardStore";
import type DialogsStore from "./DialogsStore";
import type ContextOptionsStore from "./ContextOptionsStore";
import type FilesActionStore from "./FilesActionsStore";
import type UploadDataStore from "./UploadDataStore";
import type SecondaryProgressDataStore from "./SecondaryProgressDataStore";

import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";

class DashboardContextOptionStore {
  public dashboardHeaderMenuService!: DashboardHeaderMenuService;

  constructor(
    private dashboardStore: DashboardStore,
    private dialogsStore: DialogsStore,
    private contextOptionsStore: ContextOptionsStore,
    private filesActionsStore: FilesActionStore
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

  public onCopyLink = (item: { url: string }, t: (arg: string) => string) => {
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
        onClick: () => this.downloadRoles(t("Translations:ArchivingData")),
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
        onClick: () => this.downloadFiles(t("Translations:ArchivingData")),
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
        onClick: this.contextOptionsStore.onMoveAction,
        disabled: false,
      },

      "copy-file": {
        id: "option_file-by-role_copy-file",
        key: "copy-file",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        iconUrl: CopyReactSvgUrl,
        onClick: this.contextOptionsStore.onCopyAction,
        disabled: false,
      },
      delete: {
        id: "option_file-by-role_delete",
        key: "delete",
        label: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        iconUrl: TrashReactSvgUrl,
        onClick: () =>
          this.contextOptionsStore.dialogsStore.setDeleteDialogVisible(true),
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
        onClick: () => this.downloadRoles(t("Translations:ArchivingData")),
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

  public deleteAction = async (
    translations: {
      deleteOperation: string;
      successRemoveFile: string;
      successRemoveFolder: string;
      successRemoveRoom: string;
      successRemoveRooms: string;
      FileRemoved: string;
      deleteSelectedElem: string;
    },
    items: IFileByRole[]
  ) => {
    const { secondaryProgressDataStore, loopFilesOperations } = this
      .filesActionsStore.uploadDataStore as UploadDataStore;

    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore as SecondaryProgressDataStore;

    const { selectedFilesByRoleMap, BufferSelectionFilesByRole, removeFiles } =
      this.dashboardStore;

    const selection =
      items && items.length > 0
        ? items
        : selectedFilesByRoleMap.size === 0
        ? BufferSelectionFilesByRole
          ? [BufferSelectionFilesByRole]
          : []
        : Array.from(this.dashboardStore.selectedFilesByRoleMap.values());

    const operationId = uniqueid("operation_");

    const files = selection.filter(
      (item) => !this.dashboardStore.activeFilesByRole.has(item.id)
    );

    const fileIds = files.map((file) => file.id);
    const filesCount = files.length;

    if (filesCount === 0) return;

    setSecondaryProgressBarData({
      icon: "trash",
      visible: true,
      percent: 0,
      label: translations.deleteOperation,
      alert: false,
      filesCount,
      operationId,
    });

    this.dashboardStore.addActiveFiles(
      fileIds,
      this.dashboardStore.dashboard?.current.id ?? ""
    );

    try {
      this.filesActionsStore.filesStore.setOperationAction(true);
      this.filesActionsStore.setGroupMenuBlocked(true);

      await removeFilesApi([], fileIds, false, false)
        .then(async (res) => {
          if (res[0]?.errro) return Promise.reject(res[0].error);

          const data = res[0] ? res[0] : null;
          const pbData = {
            icon: "trash",
            label: translations.deleteOperation,
            operationId,
          };

          await loopFilesOperations(data, pbData);

          filesCount > 1
            ? toastr.success(translations.deleteSelectedElem)
            : toastr.success(translations.FileRemoved);

          removeFiles(files);
          setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        })
        .finally(() => {
          this.dashboardStore.clearActiveFiles(fileIds);
        });
    } catch (error: any) {
      setSecondaryProgressBarData({
        visible: true,
        alert: true,
        operationId,
      });
      setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);

      return toastr.error(error?.message ? error.message : error);
    } finally {
      this.filesActionsStore.filesStore.setOperationAction(false);
      this.filesActionsStore.setGroupMenuBlocked(false);
      this.dashboardStore.clearActiveFiles(fileIds);
    }
  };

  public downloadRoles = (label: string) => {
    const { SelectedRolesMap, BufferSelectionRole } = this.dashboardStore;
    if (!this.dashboardStore.dashboard) return;

    let roles: IRole[] = [];

    if (SelectedRolesMap.size === 0 && BufferSelectionRole) {
      roles = [BufferSelectionRole];
    } else if (SelectedRolesMap.size > 0) {
      roles = Array.from(SelectedRolesMap.values());
    }

    const roleIds = roles.map((role) => role.id);

    console.log({ roleIds });

    this.filesActionsStore.setGroupMenuBlocked(true);

    const { secondaryProgressDataStore } = this.filesActionsStore
      .uploadDataStore as UploadDataStore;

    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore as SecondaryProgressDataStore;

    if (this.filesActionsStore.isBulkDownload) return;

    this.filesActionsStore.setIsBulkDownload(true);

    const operationId = uniqueid("operation_");

    this.dashboardStore.addActiveRoles(
      roleIds,
      this.dashboardStore.dashboard.current.id
    );

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label,
      alert: false,
      operationId,
    });

    downloadFilesApi([], [], null, {
      boardId: this.dashboardStore.dashboard.current.id,
      roleIds,
    })
      .then(async (response) => {
        const data = response[0] ? response[0] : null;
        const pbData = {
          icon: "file",
          label,
          operationId,
        };

        const item =
          data?.finished && data?.url
            ? data
            : await this.filesActionsStore.uploadDataStore.loopFilesOperations(
                data,
                pbData,
                true
              );
        this.filesActionsStore.setIsBulkDownload(false);
        if (item.url) {
          window.location.href = item.url;
        } else {
          setSecondaryProgressBarData({
            visible: true,
            alert: true,
            operationId,
          });
        }
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        !item.url && toastr.error("", null, 0, true);
      })
      .catch((error) => {
        this.filesActionsStore.setIsBulkDownload(false);
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
          operationId,
        });
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(error.message ? error.message : error);
      })
      .finally(() => {
        this.filesActionsStore.setGroupMenuBlocked(false);
        this.dashboardStore.clearActiveRoles(roleIds);
      });
  };

  public downloadFiles = (label: string) => {
    const size = this.dashboardStore.selectedFilesByRoleMap.size;

    if (size === 1) {
      const values = this.dashboardStore.selectedFilesByRoleMap.values();
      const value = values.next().value;

      if (value.fileExst) window.open(value.viewUrl, "_self");

      return;
    }

    const fileIds = Array.from(
      this.dashboardStore.selectedFilesByRoleMap.values(),
      (file) => file.id
    );

    this.filesActionsStore.setGroupMenuBlocked(true);

    const { secondaryProgressDataStore } = this.filesActionsStore
      .uploadDataStore as UploadDataStore;

    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      secondaryProgressDataStore as SecondaryProgressDataStore;

    if (this.filesActionsStore.isBulkDownload) return;

    this.filesActionsStore.setIsBulkDownload(true);

    const operationId = uniqueid("operation_");

    this.dashboardStore.addActiveFiles(
      fileIds,
      this.dashboardStore.dashboard?.current.id ?? ""
    );

    setSecondaryProgressBarData({
      icon: "file",
      visible: true,
      percent: 0,
      label,
      alert: false,
      operationId,
    });

    downloadFilesApi(fileIds, [])
      .then(async (res) => {
        const data = res[0] ? res[0] : null;
        const pbData = {
          icon: "file",
          label,
          operationId,
        };

        const item =
          data?.finished && data?.url
            ? data
            : await this.filesActionsStore.uploadDataStore.loopFilesOperations(
                data,
                pbData,
                true
              );
        this.filesActionsStore.setIsBulkDownload(false);
        if (item.url) {
          window.location.href = item.url;
        } else {
          setSecondaryProgressBarData({
            visible: true,
            alert: true,
            operationId,
          });
        }
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        !item.url && toastr.error("", null, 0, true);
      })
      .catch((error) => {
        this.filesActionsStore.setIsBulkDownload(false);
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
          operationId,
        });
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
        return toastr.error(error.message ? error.message : error);
      })
      .finally(() => {
        this.filesActionsStore.setGroupMenuBlocked(false);
        this.dashboardStore.clearActiveFiles(fileIds);
      });
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
        onClick: () => this.contextOptionsStore.onClickDownload(file, t),
        disabled: false,
      },

      "download-file-as": {
        id: "option_file-by-role_download-file",
        key: "download-file-as",
        label: t("Translations:DownloadAs"),
        icon: DownloadAsReactSvgUrl,
        onClick: this.contextOptionsStore.onClickDownloadAs,
        disabled: false,
      },

      "move-to": {
        id: "option_move-to",
        key: "move-to",
        label: t("Common:MoveTo"),
        icon: MoveReactSvgUrl,
        onClick: this.contextOptionsStore.onMoveAction,
        disabled: false,
      },

      "copy-file": {
        id: "option_file-by-role_copy-file",
        key: "copy-file",
        label: t("Common:Copy"),
        icon: CopyReactSvgUrl,
        onClick: this.contextOptionsStore.onCopyAction,
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
        onClick: () =>
          this.contextOptionsStore.dialogsStore.setDeleteDialogVisible(true),
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

export default DashboardContextOptionStore;
