import React from "react";

import type { TFile } from "@docspace/shared/api/files/types";

import MediaZoomInIcon from "PUBLIC_DIR/images/media.zoomin.react.svg";
import MediaZoomOutIcon from "PUBLIC_DIR/images/media.zoomout.react.svg";
import MediaRotateLeftIcon from "PUBLIC_DIR/images/media.rotateleft.react.svg";
import MediaRotateRightIcon from "PUBLIC_DIR/images/media.rotateright.react.svg";
import MediaDeleteIcon from "PUBLIC_DIR/images/media.delete.react.svg";
import MediaDownloadIcon from "PUBLIC_DIR/images/download.react.svg";
import ViewerSeparator from "PUBLIC_DIR/images/viewer.separator.react.svg";
import PanelReactSvg from "PUBLIC_DIR/images/panel.react.svg";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/duplicate.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";

import { ToolbarActionType } from "./MediaViewer.enums";
import type { ContextFunctions, TranslationType } from "./MediaViewer.types";

export const getPDFContextModel = (
  t: TranslationType,
  item: TFile,
  funcs: Omit<ContextFunctions, "onShowInfoPanel">,
) => {
  const options: ContextMenuModel[] = [
    {
      id: "option_edit",
      key: "edit",
      label: t("Common:EditButton"),
      icon: AccessEditReactSvgUrl,
      onClick: () => funcs.onClickLinkEdit?.(item),
      disabled: !item.viewAccessibility.WebEdit,
    },
    {
      id: "option_preview",
      key: "preview",
      label: t("Common:Preview"),
      icon: EyeReactSvgUrl,
      onClick: () => funcs.onPreviewClick?.(item),
      disabled: !item.security.Read,
    },
    {
      key: "separator0",
      isSeparator: true,
      disabled: false,
    },
    {
      id: "option_link-for-room-members",
      key: "link-for-room-members",
      label: t("Files:CopyLink"),
      icon: InvitationLinkReactSvgUrl,
      onClick: () => funcs.onCopyLink?.(item, t),
      disabled: false,
    },
    {
      id: "option_copy-to",
      key: "copy-to",
      label: t("Common:Copy"),
      icon: CopyReactSvgUrl,
      onClick: funcs.onCopyAction,
      disabled: !item.security.Copy,
    },
    {
      id: "option_create-copy",
      key: "copy",
      label: t("Common:Duplicate"),
      icon: DuplicateReactSvgUrl,
      onClick: () => funcs.onDuplicate?.(item, t),
      disabled: !item.security.Duplicate,
    },
    {
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => funcs.onClickDownload?.(item, t),
      disabled: !item.security.Download,
    },
    {
      id: "option_download-as",
      key: "download-as",
      label: t("Translations:DownloadAs"),
      icon: DownloadAsReactSvgUrl,
      onClick: funcs.onClickDownloadAs,
      disabled: !item.security.Download,
    },
    {
      id: "option_rename",
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => funcs.onClickRename?.(item),
      disabled: !item.security.Rename,
    },
    {
      key: "separator1",
      isSeparator: true,
      disabled: false,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => funcs.onClickDelete?.(item, t),
      disabled: !item.security.Delete,
    },
  ];

  return options;
};

export const getMobileMediaContextModel = (
  t: TranslationType,
  targetFile: TFile,
  funcs: Omit<
    ContextFunctions,
    "onClickDownloadAs" | "onCopyLink" | "onPreviewClick" | "onClickLinkEdit"
  >,
) => {
  const {
    onShowInfoPanel,
    onClickDownload,
    onMoveAction,
    onCopyAction,
    onDuplicate,
    onClickRename,
    onClickDelete,
  } = funcs;

  const options = [
    {
      id: "option_room-info",
      key: "room-info",
      label: t("Common:Info"),
      icon: InfoOutlineReactSvgUrl,
      onClick: () => {
        return onShowInfoPanel?.(targetFile);
      },
      disabled: false,
    },
    {
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => onClickDownload?.(targetFile, t),
      disabled: false,
    },
    {
      key: "move-to",
      label: t("Common:MoveTo"),
      icon: MoveReactSvgUrl,
      onClick: onMoveAction,
      disabled: !targetFile.security.Move,
    },
    {
      id: "option_copy-to",
      key: "copy-to",
      label: t("Common:Copy"),
      icon: CopyReactSvgUrl,
      onClick: onCopyAction,
      disabled: !targetFile.security.Copy,
    },
    {
      id: "option_create-copy",
      key: "copy",
      label: t("Common:Duplicate"),
      icon: DuplicateReactSvgUrl,
      onClick: () => onDuplicate?.(targetFile, t),
      disabled: !targetFile.security.Duplicate,
    },
    {
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => onClickRename?.(targetFile),
      disabled: !targetFile.security.Rename,
    },

    {
      key: "separator0",
      isSeparator: true,
      disabled: !targetFile.security.Delete,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => onClickDelete?.(targetFile, t),
      disabled: !targetFile.security.Delete,
    },
  ];

  return options;
};

export const getDesktopMediaContextModel = (
  t: TranslationType,
  targetFile: TFile,
  archiveRoom: boolean,
  funcs: Pick<
    ContextFunctions,
    "onClickDownload" | "onClickRename" | "onClickDelete"
  >,
) => {
  const { onClickDelete, onClickDownload, onClickRename } = funcs;

  const options = [
    {
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => onClickDownload?.(targetFile, t),
      disabled: false,
    },
    {
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => onClickRename?.(targetFile),
      disabled: archiveRoom,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => onClickDelete?.(targetFile, t),
      disabled: archiveRoom,
    },
  ];

  return options;
};

export const getCustomToolbar = (
  targetFile: TFile,
  isEmptyContextMenu: boolean,
  onDeleteClick?: VoidFunction,
  onDownloadClick?: VoidFunction,
) => {
  return [
    {
      key: "zoomOut",
      percent: true,
      actionType: ToolbarActionType.ZoomOut,
      render: (
        <div className="iconContainer zoomOut">
          <MediaZoomOutIcon />
        </div>
      ),
    },
    {
      key: "percent",
      actionType: ToolbarActionType.Reset,
    },
    {
      key: "zoomIn",
      actionType: ToolbarActionType.ZoomIn,
      render: (
        <div className="iconContainer zoomIn">
          <MediaZoomInIcon />
        </div>
      ),
    },
    {
      key: "rotateLeft",
      actionType: ToolbarActionType.RotateLeft,
      render: (
        <div className="iconContainer rotateLeft">
          <MediaRotateLeftIcon />
        </div>
      ),
    },
    {
      key: "rotateRight",
      actionType: ToolbarActionType.RotateRight,
      render: (
        <div className="iconContainer rotateRight">
          <MediaRotateRightIcon />
        </div>
      ),
    },
    {
      key: "separator download-separator",
      actionType: -1,
      noHover: true,
      render: (
        <div className="separator" style={{ height: "16px" }}>
          <ViewerSeparator />
        </div>
      ),
      disabled: !targetFile.security.Download,
    },
    {
      key: "download",
      actionType: ToolbarActionType.Download,
      render: (
        <div className="iconContainer download" style={{ height: "16px" }}>
          <MediaDownloadIcon />
        </div>
      ),
      onClick: onDownloadClick,
      disabled: !targetFile.security.Download,
    },
    {
      key: "context-separator",
      actionType: -1,
      noHover: true,
      render: (
        <div className="separator" style={{ height: "16px" }}>
          <ViewerSeparator />
        </div>
      ),
      disabled: isEmptyContextMenu,
    },
    {
      key: "context-menu",
      actionType: -1,
      disabled: isEmptyContextMenu,
    },
    {
      key: "delete",
      actionType: 103,
      render: (
        <div className="iconContainer viewer-delete">
          <MediaDeleteIcon />
        </div>
      ),
      onClick: onDeleteClick,
      disabled: !targetFile.security.Delete,
    },
  ];
};

export const getPDFToolbar = (): ReturnType<typeof getCustomToolbar> => {
  return [
    {
      key: "panel",
      actionType: ToolbarActionType.Panel,
      render: (
        <div className="iconContainer zoomOut panelToggle">
          <PanelReactSvg transform="rotate(180)" />
        </div>
      ),
    },
    {
      key: "context-separator-panel",
      actionType: -1,
      noHover: true,
      render: (
        <div className="separator" style={{ height: "16px" }}>
          <ViewerSeparator />
        </div>
      ),
      disabled: false,
    },
    {
      key: "zoomOut",
      percent: true,
      actionType: ToolbarActionType.ZoomOut,
      render: (
        <div className="iconContainer zoomOut">
          <MediaZoomOutIcon />
        </div>
      ),
    },
    {
      key: "percent",
      actionType: ToolbarActionType.Reset,
    },
    {
      key: "zoomIn",
      actionType: ToolbarActionType.ZoomIn,
      render: (
        <div className="iconContainer zoomIn">
          <MediaZoomInIcon />
        </div>
      ),
    },
    // {
    //   key: "context-separator-zoom",
    //   actionType: -1,
    //   noHover: true,
    //   render: (
    //     <div className="separator" style={{ height: "16px" }}>
    //       <ViewerSeparator  />
    //     </div>
    //   ),
    // },
    // {
    //   key: "rotateLeft",
    //   actionType: ToolbarActionType.RotateLeft,
    //   render: (
    //     <div className="iconContainer rotateLeft">
    //       <MediaRotateLeftIcon  />
    //     </div>
    //   ),
    // },
    // {
    //   key: "rotateRight",
    //   actionType: ToolbarActionType.RotateRight,
    //   render: (
    //     <div className="iconContainer rotateRight">
    //       <MediaRotateRightIcon  />
    //     </div>
    //   ),
    // },
    {
      key: "context-separator-rotate",
      actionType: -1,
      noHover: true,
      render: (
        <div className="separator" style={{ height: "16px" }}>
          <ViewerSeparator />
        </div>
      ),
      disabled: false,
    },
    {
      key: "context-menu",
      actionType: -1,
      disabled: false,
    },
  ];
};
