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

"use client";

import classnames from "classnames";

import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import Navigation, {
  TNavigationItem,
} from "@docspace/shared/components/navigation";
import {
  DeviceType,
  FolderType,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";
import { TPathParts } from "@docspace/shared/types";
import { getLogoUrl } from "@docspace/shared/utils/common";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";

export type HeaderProps = {
  current: TFolder | TRoom;
  pathParts: TPathParts[];
  isEmptyList: boolean;
  theme: "Base" | "Dark";
};

export const Header = ({
  current,
  pathParts,
  isEmptyList,
  theme,
}: HeaderProps) => {
  const { title, security, rootFolderType, rootFolderId } = current;

  const isRoomsFolder = pathParts[0].id === rootFolderId;

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, theme === "Dark");
  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, theme === "Dark");

  const navigationItems: TNavigationItem[] = pathParts
    .map((p) => ({
      id: p.id,
      title: p.title,
      isRootRoom: !!p.roomType,
    }))
    .reverse();

  navigationItems.pop();

  return (
    <div
      className={classnames(styles.headerContainer, {
        [styles.infoPanelVisible]: false,
        [styles.isExternalFolder]: false,
        [styles.isLifetimeEnabled]: false,
      })}
    >
      <Navigation
        title={title}
        rootRoomTitle={navigationItems.length === 0 ? "" : pathParts[0].title}
        showRootFolderTitle={pathParts.length > 1}
        canCreate={security.Create}
        withLogo={logo}
        burgerLogo={burgerLogo}
        currentDeviceType={DeviceType.desktop}
        navigationItems={navigationItems}
        titleIcon=""
        titleIconTooltip=""
        showNavigationButton={false}
        isCurrentFolderInfo={false}
        isDesktop={false}
        showText={false}
        showTitle
        isPublicRoom
        isEmptyPage={isEmptyList}
        isEmptyFilesList={isEmptyList}
        withMenu={!isRoomsFolder}
        isRoom={!!current.roomType}
        isRootFolder={navigationItems.length === 0}
        isInfoPanelVisible={false}
        toggleInfoPanel={() => {}}
        onLogoClick={() => {}}
        hideInfoPanel={() => {}}
        onClickFolder={() => {}}
        clearTrash={() => {}}
        showFolderInfo={() => {}}
        onBackToParentFolder={() => {}}
        getContextOptionsPlus={() => []}
        getContextOptionsFolder={() => []}
      />
    </div>
  );
};
