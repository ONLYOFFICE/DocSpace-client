import React, { forwardRef, useImperativeHandle, useState } from "react";

import MediaContextMenu from "PUBLIC_DIR/images/vertical-dots.react.svg";
import ImageViewerToolbarProps, {
  ImperativeHandle,
  ToolbarItemType,
} from "./ViewerToolbar.props";

import {
  ImageViewerToolbarWrapper,
  ListTools,
  ToolbarItem,
} from "./ViewerToolbar.styled";

const ViewerToolbar = forwardRef<ImperativeHandle, ImageViewerToolbarProps>(
  (
    {
      toolbar,
      className,
      percentValue,
      toolbarEvent,
      generateContextMenu,
      setIsOpenContextMenu,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [percent, setPercent] = useState<number>(() =>
      Math.round(percentValue * 100),
    );

    useImperativeHandle(
      ref,
      () => {
        return {
          setPercentValue(percentArg: number) {
            setPercent(Math.round(percentArg * 100));
          },
        };
      },
      [],
    );

    function getContextMenu(item: ToolbarItemType) {
      const contextMenu = generateContextMenu(isOpen);
      return (
        <ToolbarItem
          style={{ position: "relative" }}
          key={item.key}
          onClick={() => {
            setIsOpenContextMenu((open) => !open);
            setIsOpen((open) => !open);
          }}
          data-key={item.key}
        >
          <div className="context" style={{ height: "16px" }}>
            <MediaContextMenu />
          </div>
          {contextMenu}
        </ToolbarItem>
      );
    }

    function getPercentCompoent() {
      return (
        <div
          className="iconContainer zoomPercent"
          style={{ width: "auto", color: "#fff", userSelect: "none" }}
        >
          {`${percent}%`}
        </div>
      );
    }

    function renderToolbarItem(item: ToolbarItemType) {
      if (item.disabled) return null;

      if (item.key === "context-menu") {
        return getContextMenu(item);
      }

      let content: JSX.Element | undefined = item?.render;

      if (item.key === "percent") {
        content = getPercentCompoent();
      }

      return (
        <ToolbarItem
          $percent={item.percent ? percent : 100}
          $isSeparator={item.actionType === -1}
          key={item.key}
          onClick={() => {
            toolbarEvent(item);
          }}
          data-key={item.key}
        >
          {content}
        </ToolbarItem>
      );
    }

    return (
      <ImageViewerToolbarWrapper className={className}>
        <ListTools>{toolbar.map((item) => renderToolbarItem(item))}</ListTools>
      </ImageViewerToolbarWrapper>
    );
  },
);

ViewerToolbar.displayName = "ImageViewerToolba";

export { ViewerToolbar };
