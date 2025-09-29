/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { useMemo, useState } from "react";

import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import FileActionsConvertEditDocReactSvg from "PUBLIC_DIR/images/file.actions.convert.edit.doc.react.svg";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import Refresh12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/refresh.react.svg?url";
import Mute12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/mute.react.svg?url";
import Mute16ReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import CustomFilter12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/custom-filter.react.svg?url";
import CustomFilter16ReactSvgUrl from "PUBLIC_DIR/images/icons/16/custom-filter.react.svg?url";
import LockedIconReactSvg from "PUBLIC_DIR/images/file.actions.locked.react.svg?url";
import LockedIconReact12Svg from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";
import FavoriteFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";

import { isMobile as isMobileDevice } from "react-device-detect";

import { FILLING_FORM_STATUS_COLORS } from "../../constants";

import { Tooltip } from "../tooltip";
import { Text } from "../text";
import { Link, LinkTarget, LinkType } from "../link";
import { Badge } from "../badge";

import { RoomsType, ShareAccessRights } from "../../enums";
import { globalColors } from "../../themes";

import {
  classNames,
  getFillingStatusLabel,
  getFillingStatusTitle,
  IconSizeType,
  isDesktop,
  isTablet,
  size,
} from "../../utils";

import styles from "./Badges.module.scss";
import type { BadgesProps, BadgeWrapperProps } from "./Badges.type";
import { IconButton } from "../icon-button";

const BadgeWrapper = ({
  onClick,
  isTile,
  children: badge,
}: BadgeWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isTile) return badge;

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const badgeProps = { isHovered };

  const newBadge = React.cloneElement(badge, badgeProps);

  return (
    <div
      className={styles.badgeWrapper}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {newBadge}
    </div>
  );
};

const Badges = ({
  t,
  theme,
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
  isTemplatesFolder,
  onCreateRoom,
  newFilesBadge,
  className,
  isExtsCustomFilter,
  customFilterExternalLink,
  onClickLock,
  onClickFavorite,
  isRecentFolder,
  isPublicRoom,
}: BadgesProps) => {
  const {
    id,
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
    security,
    lockedBy,
    locked,
    isFavorite,
    // startFilling,
  } = item;

  const isTile = viewAs === "tile";

  const customFilterEnabled = item.customFilterEnabled;

  const countVersions =
    versionGroup && versionGroup > 999 ? "999+" : versionGroup;

  const isLargeTabletDevice =
    isMobileDevice && window.innerWidth >= size.desktop;

  const tabletViewBadge = !isTile && (isTablet() || isLargeTabletDevice);
  const desktopView = !isTile && isDesktop();

  const sizeBadge =
    isTile || tabletViewBadge ? IconSizeType.medium : IconSizeType.small;

  const paddingBadge = isTile || tabletViewBadge ? "0 5px" : "0 5px";

  const fontSizeBadge = isTile || tabletViewBadge ? "11px" : "9px";

  const iconEdit = <FileActionsConvertEditDocReactSvg />;

  const iconRefresh = desktopView ? Refresh12ReactSvgUrl : RefreshReactSvgUrl;
  const iconLock = desktopView ? LockedIconReact12Svg : LockedIconReactSvg;

  const iconPin = UnpinReactSvgUrl;
  const iconMute =
    sizeBadge === "medium" ? Mute16ReactSvgUrl : Mute12ReactSvgUrl;
  const iconCustomFilter =
    sizeBadge === "medium"
      ? CustomFilter16ReactSvgUrl
      : CustomFilter12ReactSvgUrl;

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
    "data-id": id,
    isMutedBadge,
  };

  const versionBadgeProps = {
    borderRadius: "50px",
    color: theme.filesBadges.color,
    fontSize: "9px",
    fontWeight: 800,
    maxWidth: "60px",
    "data-id": id,
  };
  const unmuteIconProps = {
    "data-id": id,
    "data-rootfolderid": rootFolderId,
    "data-new": newCount,
  };
  const onShowVersionHistoryProp =
    security && "ReadHistory" in security && security?.ReadHistory
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

  const lockedByUser = lockedBy ?? "";

  const canLock = security && "Lock" in security ? security.Lock : undefined;

  const onDraftClick = () => {
    if (!isTrashFolder) openLocationFile?.();
  };

  const { fillingStatusLabel, fillingStatusTitle } = useMemo(
    () => ({
      fillingStatusLabel: getFillingStatusLabel(item.formFillingStatus, t),
      fillingStatusTitle: getFillingStatusTitle(item.formFillingStatus, t),
    }),
    [item.formFillingStatus, t],
  );

  const getTooltipContent = () => (
    <>
      <Text fontSize="12px" fontWeight={400} noSelect>
        {t("CustomFilterEnableDiscription")}
      </Text>
      {customFilterExternalLink ? (
        <Link
          type={LinkType.action}
          target={LinkTarget.blank}
          className="custom-filter-tooltip-link"
          fontSize="13px"
          fontWeight={600}
          href={customFilterExternalLink}
          isHovered
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
    </>
  );

  const wrapperCommonClasses = classNames(styles.badges, className, "badges", {
    [styles.tableView]: viewAs === "table",
    [styles.rowView]: viewAs === "row",
    [styles.tileView]: viewAs === "tile",
  });

  const getLockTooltip = () => (
    <Text fontSize="12px" fontWeight={400} noSelect>
      {t("Common:LockedBy", { userName: lockedByUser })}
    </Text>
  );

  const onIconLockClick = () => {
    if (!canLock) {
      return;
    }

    if (onClickLock) onClickLock();
  };

  return fileExst ? (
    <div
      data-testid="badges"
      className={classNames(
        wrapperCommonClasses,
        "additional-badges file__badges",
      )}
    >
      {/* {startFilling && (
        <IconButton
          size={sizeBadge}
          iconName={iconForm}
          onClick={onFilesClick}
          title={t("Common:ReadyToFillOut")}
          hoverColor={accent}
          className="badge icons-group is-editing tablet-badge tablet-edit"
        />
      )} */}

      {item.formFillingStatus ? (
        <BadgeWrapper isTile={isTile}>
          <Badge
            noHover
            isVersionBadge
            className="badge tablet-badge icons-group"
            backgroundColor={FILLING_FORM_STATUS_COLORS[item.formFillingStatus]}
            label={fillingStatusLabel}
            title={fillingStatusTitle}
            {...versionBadgeProps}
            maxWidth="max-content"
          />
        </BadgeWrapper>
      ) : null}

      {hasDraft ? (
        <BadgeWrapper isTile={isTile}>
          <Badge
            noHover
            isVersionBadge
            className={classNames(
              styles.versionBadge,
              "badge-version badge-version-current tablet-badge icons-group",
            )}
            backgroundColor={theme.filesBadges.badgeBackgroundColor}
            label={t("Common:BadgeMyDraftTitle")}
            title={t("Common:BadgeMyDraftTitle")}
            {...versionBadgeProps}
            style={{
              width: "max-content",
            }}
            onClick={onDraftClick}
          />
        </BadgeWrapper>
      ) : null}

      {isEditing ? (
        <IconButton
          iconNode={iconEdit}
          className={classNames(
            styles.iconBadge,
            "badge icons-group is-editing tablet-badge tablet-edit",
          )}
          onClick={onFilesClick}
          color="accent"
          hoverColor="accent"
          title={t("Common:EditButton")}
        />
      ) : null}

      {locked && !isTile ? (
        <>
          <IconButton
            iconName={iconLock}
            className={classNames(
              styles.iconBadge,
              "badge tablet-badge icons-group",
            )}
            data-id={id}
            data-locked={!!locked}
            onClick={onIconLockClick}
            color={theme.filesQuickButtons.sharedColor}
            hoverColor="accent"
            title={t("Common:UnblockFile")}
            data-tooltip-id={`lockTooltip${item.id}`}
          />
          {lockedByUser && !canLock ? (
            <Tooltip
              id={`lockTooltip${item.id}`}
              place="bottom"
              getContent={getLockTooltip}
              maxWidth="300px"
              openOnClick
            />
          ) : null}
        </>
      ) : null}

      {item.viewAccessibility?.MustConvert &&
      security &&
      "Convert" in security &&
      security?.Convert &&
      !isTrashFolder &&
      !isArchiveFolderRoot ? (
        <IconButton
          onClick={setConvertDialogVisible}
          iconName={iconRefresh}
          className={classNames(
            styles.iconBadge,
            "badge tablet-badge icons-group can-convert",
          )}
          hoverColor="accent"
        />
      ) : null}
      {versionGroup && versionGroup > 1 ? (
        <BadgeWrapper {...onShowVersionHistoryProp} isTile={isTile}>
          <Badge
            {...versionBadgeProps}
            className={classNames(
              styles.versionBadge,
              "badge-version badge-version-current tablet-badge icons-group",
            )}
            backgroundColor={theme.filesBadges.badgeBackgroundColor}
            label={t("Common:VersionBadge", {
              version: countVersions as string,
            })}
            {...onShowVersionHistoryProp}
            noHover
            isVersionBadge
            title={t("Common:ShowVersionHistory")}
          />
        </BadgeWrapper>
      ) : null}

      {showNew ? (
        <BadgeWrapper onClick={onBadgeClick} isTile={isTile}>
          <Badge
            {...commonBadgeProps}
            className="badge-version badge-new-version tablet-badge icons-group"
            label={t("Common:New")}
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
            tooltipContent={t("Common:BadgeAlertDescription")}
          />
        </BadgeWrapper>
      )} */}

      {customFilterEnabled && !isRoom && isExtsCustomFilter ? (
        <>
          <IconButton
            id="customFilterTooltip"
            iconName={iconCustomFilter}
            size={sizeBadge}
            data-tooltip-id="customFilterTooltip"
            className="badge is-custom-filter tablet-badge"
            color={globalColors.mainGreen}
            hoverColor={globalColors.mainGreen}
          />

          <Tooltip
            id="customFilterTooltip"
            place="bottom-start"
            getContent={getTooltipContent}
            clickable
            maxWidth="238px"
            className={styles.customFilterTooltip}
            noUserSelect
          />
        </>
      ) : null}
    </div>
  ) : (
    <div
      data-testid="badges"
      className={classNames(wrapperCommonClasses, {
        folder__badges: isFolder && !isRoom,
        room__badges: isRoom,
      })}
    >
      {showCopyLinkIcon ? (
        <IconButton
          iconName={LinkReactSvgUrl}
          className={classNames(
            styles.iconBadge,
            "badge row-copy-link icons-group tablet-badge",
          )}
          onClick={onCopyPrimaryLink}
          title={t("Common:CopySharedLink")}
          hoverColor="accent"
        />
      ) : null}

      {showCopyLinkIcon ? (
        <IconButton
          iconName={TabletLinkReactSvgUrl}
          className={classNames(
            styles.iconBadge,
            "badge tablet-row-copy-link icons-group tablet-badge",
          )}
          onClick={onCopyPrimaryLink}
          title={t("Common:CopySharedLink")}
          hoverColor="accent"
        />
      ) : null}

      {isRoom && mute && !isTile ? (
        <IconButton
          onClick={onUnmuteClick}
          iconName={iconMute}
          className={classNames(
            styles.iconBadge,
            styles.muteBadge,
            "badge  is-mute tablet-badge",
          )}
          {...unmuteIconProps}
        />
      ) : null}
      {isRoom && pinned ? (
        <IconButton
          onClick={onUnpinClick}
          className={classNames(
            styles.iconBadge,
            styles.pinBadge,
            "badge icons-group is-pinned tablet-badge tablet-pinned",
          )}
          iconName={iconPin}
          {...unpinIconProps}
        />
      ) : null}
      {isTemplatesFolder && isTile ? (
        <IconButton
          iconName={CreateRoomReactSvgUrl}
          className={classNames(
            styles.iconBadge,
            "badge tablet-row-create-room icons-group  tablet-badge",
          )}
          size={IconSizeType.medium}
          onClick={onCreateRoom}
          title={t("Common:CreateRoom")}
          hoverColor="accent"
        />
      ) : null}
      {showNew && !isTile ? newFilesBadge : null}
      {showNew && isTile && isRoom ? (
        <div className={styles.badgeWrapperNewBadge}>{newFilesBadge}</div>
      ) : null}
      {showNew && isTile && !isRoom ? newFilesBadge : null}

      {isFolder &&
      isTile &&
      isFavorite &&
      !isRecentFolder &&
      !isPublicRoom &&
      !isTrashFolder ? (
        <IconButton
          iconName={FavoriteFillReactSvgUrl}
          className={classNames("badge icons-group")}
          size={IconSizeType.medium}
          onClick={onClickFavorite}
          color="accent"
          title={t("Common:Favorites")}
        />
      ) : null}
    </div>
  );
};

export default Badges;
