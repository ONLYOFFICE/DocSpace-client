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

import { isTablet as isTabletDevice } from "react-device-detect";

import FileActionsLockedReactSvgUrl from "PUBLIC_DIR/images/file.actions.locked.react.svg?url";
import FileActionsDownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import LifetimeReactSvgUrl from "PUBLIC_DIR/images/lifetime.react.svg?url";
import LockedReact12SvgUrl from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";

import { useMemo } from "react";
import styled from "styled-components";

import { isTablet, classNames } from "@docspace/shared/utils";
import {
  DeviceType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

const StyledQuickButtons = styled.div`
  .file-lifetime {
    svg {
      rect {
        fill: ${({ theme }) => theme.filesQuickButtons.lifeTimeColor};
      }

      circle,
      path {
        stroke: ${({ theme }) => theme.filesQuickButtons.lifeTimeColor};
      }
    }
  }
`;

const QuickButtons = (props) => {
  const {
    t,
    item,
    theme,
    onClickLock,
    onClickDownload,
    onCopyPrimaryLink,
    isDisabled,
    viewAs,
    folderCategory,
    isPublicRoom,
    onClickShare,
    isPersonalRoom,
    isArchiveFolder,
    isIndexEditingMode,
    currentDeviceType,
    showLifetimeIcon,
    expiredDate,
    currentColorScheme,
    roomLifetime,
  } = props;

  const isMobile = currentDeviceType === DeviceType.mobile;

  const { id, locked, shared, fileExst } = item;

  const isTile = viewAs === "tile";
  const isRow = viewAs == "row";

  const iconLock = useMemo(() => {
    if (isMobile) {
      return LockedReact12SvgUrl;
    }

    return locked ? FileActionsLockedReactSvgUrl : LockedReactSvgUrl;
  }, [locked, isMobile]);

  const colorLock = locked
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const colorShare = shared
    ? currentColorScheme.main?.accent
    : theme.filesQuickButtons.color;

  const tabletViewQuickButton = isTablet() || isTabletDevice;

  const sizeQuickButton = isTile || tabletViewQuickButton ? "medium" : "small";
  const displayBadges =
    viewAs === "table" ||
    (isRow && locked && isMobile) ||
    isTile ||
    tabletViewQuickButton;

  const isAvailableLockFile =
    !folderCategory && fileExst && displayBadges && item.security.Lock;

  const isAvailableDownloadFile =
    isPublicRoom && item.security.Download && viewAs === "tile";

  const isAvailableShareFile = isPersonalRoom && item.canShare;

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

  const getTooltipContent = () => (
    <Text fontSize="12px" fontWeight={400} noSelect>
      {roomLifetime?.deletePermanently
        ? t("Files:FileWillBeDeletedPermanently", { date: expiredDate })
        : t("Files:FileWillBeMovedToTrash", { date: expiredDate })}
    </Text>
  );

  return (
    <StyledQuickButtons className="badges additional-badges badges__quickButtons">
      {!isIndexEditingMode ? (
        <>
          {showLifetimeIcon ? (
            <>
              <ColorTheme
                themeId={ThemeId.IconButton}
                iconName={LifetimeReactSvgUrl}
                className="badge file-lifetime icons-group"
                size={sizeQuickButton}
                isClickable
                isDisabled={isDisabled}
                data-tooltip-id="lifetimeTooltip"
                color={theme.filesQuickButtons.lifeTimeColor}
              />

              <Tooltip
                id="lifetimeTooltip"
                place="bottom"
                getContent={getTooltipContent}
                maxWidth="300px"
              />
            </>
          ) : null}

          {isAvailableLockFile ? (
            <ColorTheme
              themeId={ThemeId.IconButton}
              iconName={iconLock}
              className="badge lock-file icons-group"
              size={sizeQuickButton}
              data-id={id}
              data-locked={!!locked}
              onClick={onClickLock}
              color={colorLock}
              isDisabled={isDisabled}
              hoverColor={theme.filesQuickButtons.sharedColor}
              title={t("UnblockVersion")}
            />
          ) : null}
          {isAvailableDownloadFile ? (
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
          ) : null}
          {showCopyLinkIcon ? (
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
          ) : null}
          {isAvailableShareFile ? (
            <ColorTheme
              themeId={ThemeId.IconButton}
              iconName={LinkReactSvgUrl}
              className={classNames("badge copy-link icons-group", {
                "create-share-link": !item.shared,
              })}
              size={sizeQuickButton}
              onClick={onClickShare}
              color={colorShare}
              isDisabled={isDisabled}
              hoverColor={theme.filesQuickButtons.sharedColor}
              title={t("Files:CopySharedLink")}
            />
          ) : null}
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
        </>
      ) : null}
    </StyledQuickButtons>
  );
};

export default QuickButtons;
