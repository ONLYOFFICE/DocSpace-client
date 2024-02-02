import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg";
import MediaContextMenu from "PUBLIC_DIR/images/vertical-dots.react.svg";

import {
  DownloadIconWrapper,
  PlayerDesktopContextMenuWrapper,
} from "./PlayerDesktopContextMenu.styled";
import PlayerDesktopContextMenuProps from "./PlayerDesktopContextMenu.props";

const ContextRight = "9";
const ContextBottom = "48";

export const PlayerDesktopContextMenu = memo(
  ({
    canDownload,
    isPreviewFile,
    hideContextMenu,
    onDownloadClick,
    generateContextMenu,
  }: PlayerDesktopContextMenuProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const [isOpenContext, setIsOpenContext] = useState<boolean>(false);

    const context = useMemo(
      () => generateContextMenu(isOpenContext, ContextRight, ContextBottom),
      [generateContextMenu, isOpenContext],
    );

    const toggleContext = () => setIsOpenContext((pre) => !pre);

    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }
        setIsOpenContext(false);
      };
      document.addEventListener("mousedown", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
      };
    }, []);

    if (hideContextMenu && canDownload) {
      return (
        <DownloadIconWrapper onClick={onDownloadClick}>
          <DownloadReactSvgUrl />
        </DownloadIconWrapper>
      );
    }
    if (isPreviewFile) return;

    return (
      <PlayerDesktopContextMenuWrapper ref={ref} onClick={toggleContext}>
        <MediaContextMenu />
        {context}
      </PlayerDesktopContextMenuWrapper>
    );
  },
);

PlayerDesktopContextMenu.displayName = "PlayerDesktopContextMenu";
