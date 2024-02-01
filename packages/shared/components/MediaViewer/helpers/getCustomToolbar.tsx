import React from "react";

import type { TFile } from "@docspace/shared/api/files/types";

import MediaZoomInIcon from "PUBLIC_DIR/images/media.zoomin.react.svg";
import MediaZoomOutIcon from "PUBLIC_DIR/images/media.zoomout.react.svg";
import MediaRotateLeftIcon from "PUBLIC_DIR/images/media.rotateleft.react.svg";
import MediaRotateRightIcon from "PUBLIC_DIR/images/media.rotateright.react.svg";
import MediaDeleteIcon from "PUBLIC_DIR/images/media.delete.react.svg";
import MediaDownloadIcon from "PUBLIC_DIR/images/download.react.svg";
// import MediaFavoriteIcon from "PUBLIC_DIR/images/favorite.react.svg";
import ViewerSeparator from "PUBLIC_DIR/images/viewer.separator.react.svg";
import PanelReactSvg from "PUBLIC_DIR/images/panel.react.svg";

import { ToolbarActionType } from "../MediaViewer.enums";

export const getCustomToolbar = (
  targetFile: TFile,
  isEmptyContextMenu: boolean,
  onDeleteClick: VoidFunction,
  onDownloadClick: VoidFunction,
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
