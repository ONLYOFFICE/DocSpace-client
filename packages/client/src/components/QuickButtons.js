import FileActionsLockedReactSvgUrl from "PUBLIC_DIR/images/file.actions.locked.react.svg?url";
import FileActionsDownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/locked.react.svg?url";
import FileActionsFavoriteReactSvgUrl from "PUBLIC_DIR/images/file.actions.favorite.react.svg?url";
import FavoriteReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";

import React from "react";
import styled from "styled-components";

import { isTablet, isMobile, commonIconsStyles } from "@docspace/shared/utils";
import {
  FileStatus,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

const QuickButtons = (props) => {
  const {
    t,
    item,
    theme,
    sectionWidth,
    onClickLock,
    onClickDownload,
    onCopyPrimaryLink,
    isDisabled,
    onClickFavorite,
    viewAs,
    folderCategory,
    isPublicRoom,
    onClickShare,
    isPersonalRoom,
    isArchiveFolder,
  } = props;

  const { id, locked, shared, fileStatus, title, fileExst } = item;

  const isFavorite =
    (fileStatus & FileStatus.IsFavorite) === FileStatus.IsFavorite;

  const isTile = viewAs === "tile";

  const iconLock = locked ? FileActionsLockedReactSvgUrl : LockedReactSvgUrl;

  const colorLock = locked
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const iconFavorite = isFavorite
    ? FileActionsFavoriteReactSvgUrl
    : FavoriteReactSvgUrl;

  const colorFavorite = isFavorite
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const colorShare = shared
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const tabletViewQuickButton = isTablet();

  const sizeQuickButton = isTile || tabletViewQuickButton ? "medium" : "small";

  const displayBadges = viewAs === "table" || isTile || tabletViewQuickButton;

  const setFavorite = () => onClickFavorite(isFavorite);

  const isAvailableLockFile =
    !folderCategory && fileExst && displayBadges && item.security.Lock;
  const isAvailableDownloadFile =
    isPublicRoom && item.security.Download && viewAs === "tile";

  const isAvailableShareFile = isPersonalRoom && item.canShare;

  const isPublicRoomType =
    item.roomType === RoomsType.PublicRoom ||
    item.roomType === RoomsType.CustomRoom;

  const haveLinksRight =
    item?.access === ShareAccessRights.RoomManager ||
    item?.access === ShareAccessRights.None;

  const showCopyLinkIcon =
    isPublicRoomType &&
    haveLinksRight &&
    item.shared &&
    !isArchiveFolder &&
    !isTile;

  const onShare = () => {
    if (isMobile()) return;
    onClickShare();
  };

  return (
    <div className="badges additional-badges  badges__quickButtons">
      {isAvailableLockFile && (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={iconLock}
          className="badge lock-file icons-group"
          size={sizeQuickButton}
          data-id={id}
          data-locked={locked ? true : false}
          onClick={onClickLock}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("UnblockVersion")}
        />
      )}
      {isAvailableDownloadFile && (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={FileActionsDownloadReactSvgUrl}
          className="badge download-file icons-group"
          size={sizeQuickButton}
          onClick={onClickDownload}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("Common:Download")}
        />
      )}
      {showCopyLinkIcon && (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={LinkReactSvgUrl}
          className="badge copy-link icons-group"
          size={sizeQuickButton}
          onClick={onCopyPrimaryLink}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("Files:CopySharedLink")}
        />
      )}
      {isAvailableShareFile && (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={LinkReactSvgUrl}
          className="badge copy-link icons-group"
          size={sizeQuickButton}
          onClick={onShare}
          color={colorShare}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("Files:CopySharedLink")}
        />
      )}
      {/* {fileExst && !isTrashFolder && displayBadges && (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={iconFavorite}
          isFavorite={isFavorite}
          className="favorite badge icons-group"
          size={sizeQuickButton}
          data-id={id}
          data-title={title}
          color={colorFavorite}
          onClick={setFavorite}
          hoverColor={theme.filesQuickButtons.hoverColor}
        />
      )} */}
    </div>
  );
};

export default QuickButtons;
