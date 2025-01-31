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
import { useCallback, useEffect, useMemo } from "react";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Navigation, {
  TNavigationItem,
} from "@docspace/shared/components/navigation";
import { DeviceType, WhiteLabelLogoType } from "@docspace/shared/enums";
import { getLogoUrl } from "@docspace/shared/utils/common";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";

import { useNavigationStore } from "../../_store/NavigationStore";
import useFolderActions from "../../_hooks/useFolderActions";

import type { HeaderProps } from "./Header.types";

export type { HeaderProps };

const Header = ({ current, pathParts, isEmptyList, theme }: HeaderProps) => {
  const navigationStore = useNavigationStore();

  const { t } = useTranslation(["Common"]);

  const { openFolder } = useFolderActions({ t });

  const { title, security, rootFolderId, id } = current;

  const isRoomsFolder = pathParts[0].id === rootFolderId;

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, theme === "Dark");
  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, theme === "Dark");

  const navigationItems: TNavigationItem[] = useMemo(() => {
    const items = pathParts.map((p) => ({
      id: p.id,
      title: p.title,
      isRootRoom: !!p.roomType,
    }));

    items.pop();

    return items.reverse();
  }, [pathParts]);

  useEffect(() => {
    navigationStore.setNavigationItems(navigationItems);
    navigationStore.setCurrentFolderId(id);
    navigationStore.setCurrentTitle(title);
    navigationStore.setCurrentIsRootRoom(isRoomsFolder);
  }, [title, navigationItems]);

  const currentNavigationItems =
    navigationStore.navigationItems ?? navigationItems;

  const onBackToParentFolder = useCallback(() => {
    openFolder(currentNavigationItems[0].id, currentNavigationItems[0].title);
  }, [
    openFolder,
    currentNavigationItems[0]?.id,
    currentNavigationItems[0]?.title,
  ]);

  useEffect(() => {
    window.addEventListener("popstate", onBackToParentFolder);

    return () => {
      window.removeEventListener("popstate", onBackToParentFolder);
    };
  }, [onBackToParentFolder]);

  return (
    <div
      className={classnames(styles.headerContainer, {
        [styles.infoPanelVisible]: false,
        [styles.isExternalFolder]: false,
        [styles.isLifetimeEnabled]: false,
      })}
    >
      <Navigation
        title={navigationStore.currentTitle ?? title}
        onBackToParentFolder={onBackToParentFolder}
        rootRoomTitle={
          currentNavigationItems.length === 0 ? "" : pathParts[0].title
        }
        showRootFolderTitle={false}
        canCreate={security.Create}
        withLogo={logo}
        burgerLogo={burgerLogo}
        currentDeviceType={DeviceType.desktop}
        navigationItems={currentNavigationItems}
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
        isRootFolder={currentNavigationItems.length === 0}
        isInfoPanelVisible={false}
        toggleInfoPanel={() => {}}
        onLogoClick={() => {}}
        hideInfoPanel={() => {}}
        onClickFolder={() => {}}
        clearTrash={() => {}}
        showFolderInfo={() => {}}
        getContextOptionsPlus={() => []}
        getContextOptionsFolder={() => []}
      />
    </div>
  );
};

export default observer(Header);
