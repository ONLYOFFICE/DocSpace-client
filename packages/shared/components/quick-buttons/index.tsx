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

import { isTablet as isTabletDevice } from "react-device-detect";

import FileActionsDownloadReactSvg from "PUBLIC_DIR/images/icons/16/download.react.svg";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import LifetimeReactSvgUrl from "PUBLIC_DIR/images/lifetime.react.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";

import { useTheme } from "styled-components";

import { classNames, IconSizeType, isTablet } from "../../utils";
import { RoomsType, ShareAccessRights } from "../../enums";
import { Tooltip } from "../tooltip";
import { Text } from "../text";
import { IconButton } from "../icon-button";

import type { QuickButtonsProps } from "./QuickButtons.types";

export const QuickButtons = (props: QuickButtonsProps) => {
  const {
    t,
    item,
    onClickDownload,
    onCopyPrimaryLink,
    isDisabled,
    viewAs,
    isPublicRoom,
    onClickShare,
    isPersonalRoom,
    isArchiveFolder,
    isIndexEditingMode,
    showLifetimeIcon,
    expiredDate,
    roomLifetime,
    onCreateRoom,
    isTemplatesFolder,
  } = props;

  const theme = useTheme();

  const { shared } = item;

  const locked = "locked" in item ? item.locked : undefined;

  const isTile = viewAs === "tile";

  const colorLock = locked
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const colorShare = shared ? "accent" : theme.filesQuickButtons.color;

  const tabletViewQuickButton = isTablet() || isTabletDevice;

  const sizeQuickButton: IconSizeType =
    isTile || tabletViewQuickButton ? IconSizeType.medium : IconSizeType.small;

  const isAvailableDownloadFile =
    isPublicRoom && item.security?.Download && viewAs === "tile";

  const isAvailableShareFile = isPersonalRoom && item.canShare;

  const isPublicRoomType =
    "roomType" in item &&
    (item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.FormRoom ||
      item.roomType === RoomsType.CustomRoom);

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
        ? t("Common:FileWillBeDeletedPermanently", { date: expiredDate || "" })
        : t("Common:SectionMoveNotification", {
            sectionName: t("Common:TrashSection"),
            date: expiredDate || "",
          })}
    </Text>
  );

  return (
    <div className="badges additional-badges badges__quickButtons">
      {!isIndexEditingMode ? (
        <>
          {showLifetimeIcon ? (
            <>
              <IconButton
                iconName={LifetimeReactSvgUrl}
                className="badge file-lifetime icons-group"
                size={sizeQuickButton}
                isClickable
                isDisabled={isDisabled}
                data-tooltip-id="lifetimeTooltip"
              />

              <Tooltip
                id="lifetimeTooltip"
                place="bottom"
                getContent={getTooltipContent}
                maxWidth="300px"
              />
            </>
          ) : null}

          {isAvailableDownloadFile ? (
            <IconButton
              iconNode={<FileActionsDownloadReactSvg />}
              className="badge download-file icons-group"
              size={sizeQuickButton}
              onClick={onClickDownload}
              isDisabled={isDisabled}
              hoverColor="accent"
              title={t("Common:Download")}
            />
          ) : null}
          {isTemplatesFolder ? (
            <IconButton
              iconName={CreateRoomReactSvgUrl}
              className="badge create-room icons-group"
              size={IconSizeType.medium}
              onClick={onCreateRoom}
              color={colorLock}
              isDisabled={isDisabled}
              hoverColor="accent"
              title={t("Common:CreateRoom")}
            />
          ) : null}
          {showCopyLinkIcon ? (
            <IconButton
              iconName={LinkReactSvgUrl}
              className="badge copy-link icons-group"
              size={sizeQuickButton}
              onClick={onCopyPrimaryLink}
              color={colorLock}
              isDisabled={isDisabled}
              hoverColor="accent"
              title={t("Common:CopySharedLink")}
            />
          ) : null}
          {isAvailableShareFile ? (
            <IconButton
              iconName={LinkReactSvgUrl}
              className={classNames("badge copy-link icons-group", {
                "create-share-link": !item.shared,
                "link-shared": item.shared,
              })}
              size={sizeQuickButton}
              onClick={onClickShare}
              color={colorShare}
              isDisabled={isDisabled}
              hoverColor="accent"
              title={t("Common:CopySharedLink")}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};
