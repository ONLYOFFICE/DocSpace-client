// (c) Copyright Ascensio System SIA 2009-2024
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

import styled from "styled-components";
import React, { useState } from "react";

import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import FileActionsConvertEditDocReactSvgUrl from "PUBLIC_DIR/images/file.actions.convert.edit.doc.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import Refresh12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/refresh.react.svg?url";
import Mute12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/mute.react.svg?url";
import Mute16ReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";

import { isMobile as isMobileDevice } from "react-device-detect";

import { Badge } from "@docspace/shared/components/badge";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import { globalColors } from "@docspace/shared/themes";

import {
  isTablet,
  isDesktop,
  size,
  classNames,
  injectDefaultTheme,
} from "@docspace/shared/utils";
import NewFilesBadge from "./NewFilesBadge";

const StyledWrapper = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${(props) => props.theme.filesBadges.backgroundColor};
  padding: 6px;
  border-radius: 4px;
  box-shadow: 0px 2px 4px ${globalColors.badgeShadow};
`;

const BadgeWrapper = ({ onClick, isTile, children: badge }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isTile) return badge;

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const newBadge = React.cloneElement(badge, { isHovered });

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
  showNew,
  onFilesClick,
  onShowVersionHistory,
  onBadgeClick,
  openLocationFile,
  setConvertDialogVisible,
  viewAs,
  onUnpinClick,
  onUnmuteClick,
  isMutedBadge,
  isArchiveFolderRoot,
  onCopyPrimaryLink,
  isArchiveFolder,
  isRecentTab,
  canEditing,
}) => {
  const {
    id,
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
    hasDraft,
    // startFilling,
  } = item;

  const isTile = viewAs === "tile";

  const countVersions = versionGroup > 999 ? "999+" : versionGroup;

  const isLargeTabletDevice =
    isMobileDevice && window.innerWidth >= size.desktop;

  const tabletViewBadge = !isTile && (isTablet() || isLargeTabletDevice);
  const desktopView = !isTile && isDesktop();

  const sizeBadge = isTile || tabletViewBadge ? "medium" : "small";

  const lineHeightBadge = isTile || tabletViewBadge ? "1.46" : "1.34";

  const paddingBadge = isTile || tabletViewBadge ? "0 5px" : "0 5px";

  const fontSizeBadge = isTile || tabletViewBadge ? "11px" : "9px";

  const iconEdit = FileActionsConvertEditDocReactSvgUrl;

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
    item.roomType === RoomsType.FormRoom ||
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

  const onDraftClick = () => {
    if (!isTrashFolder) openLocationFile();
  };

  return fileExst ? (
    <div className="badges additional-badges file__badges">
      {/* {startFilling && (
        <ColorTheme
          isEditing
          size={sizeBadge}
          iconName={iconForm}
          onClick={onFilesClick}
          themeId={ThemeId.IconButton}
          title={t("Common:ReadyToFillOut")}
          hoverColor={theme.filesBadges.hoverIconColor}
          className="badge icons-group is-editing tablet-badge tablet-edit"
        />
      )} */}

      {hasDraft ? (
        <BadgeWrapper isTile={isTile}>
          <Badge
            noHover
            isVersionBadge
            className="badge-version badge-version-current tablet-badge icons-group"
            backgroundColor={theme.filesBadges.badgeBackgroundColor}
            label={t("BadgeMyDraftTitle")}
            title={t("BadgeMyDraftTitle")}
            {...versionBadgeProps}
            style={{
              width: "max-content",
            }}
            onClick={onDraftClick}
          />
        </BadgeWrapper>
      ) : null}

      {isEditing && !(isRecentTab && !canEditing) ? (
        <ColorTheme
          themeId={ThemeId.IconButton}
          isEditing={isEditing}
          iconName={iconEdit}
          className="badge icons-group is-editing tablet-badge tablet-edit"
          size={sizeBadge}
          onClick={onFilesClick}
          hoverColor={theme.filesBadges.hoverIconColor}
          title={t("Common:EditButton")}
        />
      ) : null}
      {item.viewAccessibility?.MustConvert &&
      item.security?.Convert &&
      !isTrashFolder &&
      !isArchiveFolderRoot ? (
        <ColorTheme
          themeId={ThemeId.IconButton}
          onClick={setConvertDialogVisible}
          iconName={iconRefresh}
          className="badge tablet-badge icons-group can-convert"
          size={sizeBadge}
          hoverColor={theme.filesBadges.hoverIconColor}
        />
      ) : null}
      {version > 1 ? (
        <BadgeWrapper {...onShowVersionHistoryProp} isTile={isTile}>
          <Badge
            {...versionBadgeProps}
            className="badge-version badge-version-current tablet-badge icons-group"
            backgroundColor={theme.filesBadges.badgeBackgroundColor}
            label={t("VersionBadge", { version: countVersions })}
            {...onShowVersionHistoryProp}
            noHover
            isVersionBadge
            title={t("ShowVersionHistory")}
          />
        </BadgeWrapper>
      ) : null}
      {showNew ? (
        <BadgeWrapper onClick={onBadgeClick} isTile={isTile}>
          <Badge
            {...commonBadgeProps}
            className="badge-version badge-new-version tablet-badge icons-group"
            label={t("Files:New")}
            onClick={onBadgeClick}
          />
        </BadgeWrapper>
      ) : null}
      {/* {isForm  && (
        <BadgeWrapper isTile={isTile}>
          <HelpButton
            place="bottom"
            size={isViewTable ? 12 : 16}
            className="bagde_alert icons-group"
            tooltipContent={t("BadgeAlertDescription")}
          />
        </BadgeWrapper>
      )} */}
    </div>
  ) : (
    <div
      className={classNames("badges", {
        folder__badges: isFolder && !isRoom,
        room__badges: isRoom,
      })}
    >
      {showCopyLinkIcon ? (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={LinkReactSvgUrl}
          className="badge row-copy-link icons-group tablet-badge"
          size={sizeBadge}
          onClick={onCopyPrimaryLink}
          title={t("Files:CopySharedLink")}
        />
      ) : null}

      {showCopyLinkIcon ? (
        <ColorTheme
          themeId={ThemeId.IconButton}
          iconName={TabletLinkReactSvgUrl}
          className="badge tablet-row-copy-link icons-group  tablet-badge"
          size={sizeBadge}
          onClick={onCopyPrimaryLink}
          title={t("Files:CopySharedLink")}
        />
      ) : null}

      {isRoom && mute ? (
        <ColorTheme
          themeId={ThemeId.IconButtonMute}
          onClick={onUnmuteClick}
          iconName={iconMute}
          size={sizeBadge}
          className="badge  is-mute tablet-badge"
          {...unmuteIconProps}
        />
      ) : null}
      {isRoom && pinned ? (
        <ColorTheme
          themeId={ThemeId.IconButtonPin}
          onClick={onUnpinClick}
          className="badge icons-group is-pinned tablet-badge tablet-pinned"
          iconName={iconPin}
          size={sizeBadge}
          {...unpinIconProps}
        />
      ) : null}
      {showNew ? (
        <NewFilesBadge
          className="tablet-badge"
          newFilesCount={newItems}
          folderId={id}
          mute={mute}
          isRoom={isRoom}
        />
      ) : null}
    </div>
  );
};

export default Badges;
