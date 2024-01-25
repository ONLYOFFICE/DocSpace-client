import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import AccessEditFormReactSvgUrl from "PUBLIC_DIR/images/access.edit.form.react.svg?url";
import FileActionsConvertEditDocReactSvgUrl from "PUBLIC_DIR/images/file.actions.convert.edit.doc.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.reat.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";
import Refresh12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/refresh.react.svg?url";
import Mute12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/mute.react.svg?url";
import Mute16ReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";

import React, { useState } from "react";
import styled from "styled-components";
import { isMobile as isMobileDevice } from "react-device-detect";

import Badge from "@docspace/components/badge";
import IconButton from "@docspace/components/icon-button";
import commonIconsStyles from "@docspace/components/utils/common-icons-style";

import {
  FileStatus,
  RoomsType,
  ShareAccessRights,
} from "@docspace/common/constants";
import { Base } from "@docspace/components/themes";

import { ColorTheme, ThemeType } from "@docspace/components/ColorTheme";
import { isTablet, isDesktop, size } from "@docspace/components/utils/device";
import { classNames } from "@docspace/components/utils/classNames";

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${(props) => props.theme.filesBadges.backgroundColor};
  padding: 6px;
  border-radius: 4px;
  box-shadow: 0px 2px 4px rgba(4, 15, 27, 0.16);
`;

StyledWrapper.defaultProps = { theme: Base };

const BadgeWrapper = ({ onClick, isTile, children: badge }) => {
  if (!isTile) return badge;

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const newBadge = React.cloneElement(badge, { isHovered: isHovered });

  return (
    <StyledWrapper
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {newBadge}
    </StyledWrapper>
  );
};

const Badges = ({
  t,
  theme,
  newItems,
  item,
  isTrashFolder,
  isPrivacyFolder,
  isDesktopClient,
  accessToEdit,
  showNew,
  onFilesClick,
  onShowVersionHistory,
  onBadgeClick,
  setConvertDialogVisible,
  viewAs,
  onUnpinClick,
  onUnmuteClick,
  isMutedBadge,
  isArchiveFolderRoot,
  isVisitor,
  onCopyPrimaryLink,
  isArchiveFolder,
}) => {
  const {
    id,
    locked,
    version,
    versionGroup,
    fileExst,
    isEditing,
    isRoom,
    pinned,
    isFolder,
    mute,
    rootFolderId,
    new: newCount,
  } = item;

  const showEditBadge = !locked || item.access === 0;
  const isPrivacy = isPrivacyFolder && isDesktopClient;
  const isForm = fileExst === ".oform";
  const isPdf = fileExst === ".pdf";
  const isTile = viewAs === "tile";

  const countVersions = versionGroup > 999 ? "999+" : versionGroup;

  const contentNewItems = newItems > 999 ? "999+" : newItems;

  const isLargeTabletDevice =
    isMobileDevice && window.innerWidth >= size.desktop;

  const tabletViewBadge = !isTile && (isTablet() || isLargeTabletDevice);
  const desktopView = !isTile && isDesktop();

  const sizeBadge = isTile || tabletViewBadge ? "medium" : "small";

  const lineHeightBadge = isTile || tabletViewBadge ? "1.46" : "1.34";

  const paddingBadge = isTile || tabletViewBadge ? "0 5px" : "0 5px";

  const fontSizeBadge = isTile || tabletViewBadge ? "11px" : "9px";

  const iconForm =
    sizeBadge === "medium" ? FormFillRectSvgUrl : AccessEditFormReactSvgUrl;

  const iconEdit = !isForm ? FileActionsConvertEditDocReactSvgUrl : iconForm;

  const iconRefresh = desktopView ? Refresh12ReactSvgUrl : RefreshReactSvgUrl;

  const iconPin = UnpinReactSvgUrl;
  const iconMute =
    sizeBadge === "medium" ? Mute16ReactSvgUrl : Mute12ReactSvgUrl;

  const unpinIconProps = {
    "data-id": id,
    "data-action": "unpin",
  };

  const commonBadgeProps = {
    borderRadius: "11px",
    fontSize: fontSizeBadge,
    fontWeight: 800,
    maxWidth: "50px",
    padding: paddingBadge,
    lineHeight: lineHeightBadge,
    "data-id": id,
    isMutedBadge,
  };

  const versionBadgeProps = {
    borderRadius: "50px",
    color: theme.filesBadges.color,
    fontSize: "9px",
    fontWeight: 800,
    maxWidth: "60px",
    padding: isTile || tabletViewBadge ? "2px 5px" : "0 4px",
    lineHeight: "12px",
    "data-id": id,
  };
  const unmuteIconProps = {
    "data-id": id,
    "data-rootfolderid": rootFolderId,
    "data-new": newCount,
  };
  const onShowVersionHistoryProp = item.security?.ReadHistory
    ? { onClick: onShowVersionHistory }
    : {};

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

  return fileExst ? (
    <div className="badges additional-badges file__badges">
      {isEditing && !isVisitor && !isPdf && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          isEditing={isEditing}
          iconName={iconEdit}
          className="badge icons-group is-editing tablet-badge tablet-edit"
          size={sizeBadge}
          onClick={onFilesClick}
          hoverColor={theme.filesBadges.hoverIconColor}
          title={isForm ? t("Common:FillFormButton") : t("Common:EditButton")}
        />
      )}
      {item.viewAccessibility?.MustConvert &&
        item.security?.Convert &&
        !isTrashFolder &&
        !isArchiveFolderRoot && (
          <ColorTheme
            themeId={ThemeType.IconButton}
            onClick={setConvertDialogVisible}
            iconName={iconRefresh}
            className="badge tablet-badge icons-group can-convert"
            size={sizeBadge}
            hoverColor={theme.filesBadges.hoverIconColor}
          />
        )}
      {version > 1 && (
        <BadgeWrapper {...onShowVersionHistoryProp} isTile={isTile}>
          <Badge
            {...versionBadgeProps}
            className="badge-version badge-version-current tablet-badge icons-group"
            backgroundColor={theme.filesBadges.badgeBackgroundColor}
            label={t("VersionBadge", { version: countVersions })}
            {...onShowVersionHistoryProp}
            noHover={true}
            isVersionBadge={true}
            title={t("ShowVersionHistory")}
          />
        </BadgeWrapper>
      )}
      {showNew && (
        <BadgeWrapper onClick={onBadgeClick} isTile={isTile}>
          <Badge
            {...commonBadgeProps}
            className="badge-version badge-new-version tablet-badge icons-group"
            label={t("New")}
            onClick={onBadgeClick}
          />
        </BadgeWrapper>
      )}
    </div>
  ) : (
    <div
      className={classNames("badges", {
        ["folder__badges"]: isFolder && !isRoom,
        ["room__badges"]: isRoom,
      })}
    >
      {showCopyLinkIcon && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={LinkReactSvgUrl}
          className="badge row-copy-link icons-group tablet-badge"
          size={sizeBadge}
          onClick={onCopyPrimaryLink}
          title={t("Files:CopyGeneralLink")}
        />
      )}

      {showCopyLinkIcon && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={TabletLinkReactSvgUrl}
          className="badge tablet-row-copy-link icons-group  tablet-badge"
          size={sizeBadge}
          onClick={onCopyPrimaryLink}
          title={t("Files:CopyGeneralLink")}
        />
      )}

      {isRoom && mute && (
        <ColorTheme
          themeId={ThemeType.IconButtonMute}
          onClick={onUnmuteClick}
          iconName={iconMute}
          size={sizeBadge}
          className="badge  is-mute tablet-badge"
          {...unmuteIconProps}
        />
      )}
      {isRoom && pinned && (
        <ColorTheme
          themeId={ThemeType.IconButtonPin}
          onClick={onUnpinClick}
          className="badge icons-group is-pinned tablet-badge tablet-pinned"
          iconName={iconPin}
          size={sizeBadge}
          {...unpinIconProps}
        />
      )}
      {showNew && (
        <Badge
          {...commonBadgeProps}
          className="new-items tablet-badge"
          label={contentNewItems}
          onClick={onBadgeClick}
        />
      )}
    </div>
  );
};

export default Badges;
