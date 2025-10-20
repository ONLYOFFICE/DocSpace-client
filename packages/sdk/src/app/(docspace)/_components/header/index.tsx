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
import { useSearchParams } from "next/navigation";

import Navigation, {
  TNavigationItem,
} from "@docspace/shared/components/navigation";
import { TableGroupMenu } from "@docspace/shared/components/table";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { getLogoUrl } from "@docspace/shared/utils/common";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import useDeviceType from "@/hooks/useDeviceType";
import { useNavigationStore } from "../../_store/NavigationStore";
import { useFilesSelectionStore } from "../../_store/FilesSelectionStore";
import { useFilesListStore } from "../../_store/FilesListStore";
import { useSettingsStore } from "../../_store/SettingsStore";

import useFolderActions from "../../_hooks/useFolderActions";
import useContextMenuModel from "../../_hooks/useContextMenuModel";
import useHeaderMenu from "../../_hooks/useHeaderMenu";

import type { HeaderProps } from "./Header.types";

export type { HeaderProps };

const Header = ({
  current,
  pathParts,
  isEmptyList,
  showTitle = true,
}: HeaderProps) => {
  const searchParams = useSearchParams();

  const getValue = (key: string) => {
    const value = searchParams.get(key);
    return value === "true" ? true : value === "false" ? false : value;
  };

  showTitle = getValue("showTitle") as boolean;

  const navigationStore = useNavigationStore();
  const filesSelectionStore = useFilesSelectionStore();
  const filesListStore = useFilesListStore();
  const { displayAbout } = useSettingsStore();
  const { currentDeviceType } = useDeviceType();
  const { getHeaderContextMenuModel } = useContextMenuModel({});
  const { getHeaderMenu, onCheckboxChange } = useHeaderMenu();
  const { isBase: isBaseTheme } = useTheme();

  const tableGroupMenuVisible = filesSelectionStore.selection.length > 0;
  const isChecked =
    filesListStore.itemsCount === filesSelectionStore.selection.length;

  const { t } = useTranslation(["Common"]);

  const { openFolder } = useFolderActions({ t });

  const { title, rootFolderId, id } = current;

  const isRoomsFolder = pathParts[0].id === rootFolderId;

  const logo = displayAbout
    ? getLogoUrl(WhiteLabelLogoType.LightSmall, !isBaseTheme)
    : "";

  const burgerLogo = displayAbout
    ? getLogoUrl(WhiteLabelLogoType.LeftMenu, !isBaseTheme)
    : "";

  const navigationItems: TNavigationItem[] = useMemo(() => {
    const items = pathParts
      .map((p) => ({
        id: p.id,
        title: p.title,
        isRootRoom: !p.roomType,
      }))
      .filter((item) => item.isRootRoom);

    items.pop();

    return items.reverse();
  }, [pathParts]);

  useEffect(() => {
    navigationStore.setNavigationItems(navigationItems);
    navigationStore.setCurrentFolderId(id);
    navigationStore.setCurrentTitle(title);
    navigationStore.setCurrentIsRootRoom(isRoomsFolder);
  }, [title, navigationItems, navigationStore, id, isRoomsFolder]);

  const currentNavigationItems =
    navigationStore.navigationItems ?? navigationItems;

  const onBackToParentFolder = useCallback(() => {
    openFolder(currentNavigationItems[0].id, currentNavigationItems[0].title);
  }, [currentNavigationItems, openFolder]);

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
      {tableGroupMenuVisible ? (
        <TableGroupMenu
          withComboBox
          withoutInfoPanelToggler
          isChecked={isChecked}
          isIndeterminate={!isChecked}
          headerMenu={getHeaderContextMenuModel()}
          onClick={() => {}}
          onChange={onCheckboxChange}
          toggleInfoPanel={() => {}}
          isInfoPanelVisible={false}
          checkboxOptions={getHeaderMenu()}
        />
      ) : (
        <div className="header-container">
          <Navigation
            showText
            isRootFolder={currentNavigationItems.length === 0}
            canCreate={false}
            title={navigationStore.currentTitle ?? title}
            rootRoomTitle={
              currentNavigationItems.length === 0 ? "" : pathParts[0].title
            }
            isDesktop={false}
            isFrame
            navigationItems={currentNavigationItems}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={() => []}
            onClickFolder={(idFolder) => {
              openFolder(
                idFolder,
                currentNavigationItems.find((v) => v.id === idFolder)?.title ??
                  currentNavigationItems[0].title,
              );
            }}
            isTrashFolder={false}
            isEmptyPage={isEmptyList}
            isEmptyFilesList={isEmptyList}
            onBackToParentFolder={onBackToParentFolder}
            showRootFolderTitle={false}
            withLogo={logo}
            burgerLogo={burgerLogo}
            withMenu={!isRoomsFolder}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle={showTitle}
            isPublicRoom
            isRoom={!!current.roomType}
            isInfoPanelVisible={false}
            toggleInfoPanel={() => {}}
            onLogoClick={() => {}}
            hideInfoPanel={() => {}}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default observer(Header);
