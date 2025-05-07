// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import MediaZoomInIcon from "PUBLIC_DIR/images/media.zoomin.react.svg";
import MediaZoomOutIcon from "PUBLIC_DIR/images/media.zoomout.react.svg";
import MediaRotateLeftIcon from "PUBLIC_DIR/images/media.rotateleft.react.svg";
import MediaRotateRightIcon from "PUBLIC_DIR/images/media.rotateright.react.svg";
import MediaDeleteIcon from "PUBLIC_DIR/images/media.delete.react.svg";
import MediaDownloadIcon from "PUBLIC_DIR/images/icons/16/download.react.svg";
import ViewerSeparator from "PUBLIC_DIR/images/viewer.separator.react.svg";
import PanelReactSvg from "PUBLIC_DIR/images/panel.react.svg";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import type { TFile } from "../../api/files/types";

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
      label: t("Common:CopyLink"),
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
      label: t("Common:DownloadAs"),
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
  isPublicFile: boolean,
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
      disabled: isPublicFile,
    },
    {
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => onClickDownload?.(targetFile, t),
      disabled: !targetFile.security.Download,
    },
    {
      key: "move-to",
      label: t("Common:MoveTo"),
      icon: MoveReactSvgUrl,
      onClick: onMoveAction,
      disabled: !targetFile.security.Move || isPublicFile,
    },
    {
      id: "option_copy-to",
      key: "copy-to",
      label: t("Common:Copy"),
      icon: CopyReactSvgUrl,
      onClick: onCopyAction,
      disabled: !targetFile.security.Copy || isPublicFile,
    },
    {
      id: "option_create-copy",
      key: "copy",
      label: t("Common:Duplicate"),
      icon: DuplicateReactSvgUrl,
      onClick: () => onDuplicate?.(targetFile, t),
      disabled: !targetFile.security.Duplicate || isPublicFile,
    },
    {
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => onClickRename?.(targetFile),
      disabled: !targetFile.security.Rename || isPublicFile,
    },

    {
      key: "separator0",
      isSeparator: true,
      disabled: !targetFile.security.Delete || isPublicFile,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => onClickDelete?.(targetFile, t),
      disabled: !targetFile.security.Delete || isPublicFile,
    },
  ];

  return options;
};

export const getDesktopMediaContextModel = (
  t: TranslationType,
  targetFile: TFile,
  archiveRoom: boolean,
  isPublicFile: boolean,
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
      disabled: !targetFile.security.Download,
    },
    {
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => onClickRename?.(targetFile),
      disabled: archiveRoom || isPublicFile,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: TrashReactSvgUrl,
      onClick: () => onClickDelete?.(targetFile, t),
      disabled: archiveRoom || isPublicFile,
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
