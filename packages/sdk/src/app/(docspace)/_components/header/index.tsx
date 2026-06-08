/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";

import Navigation, {
  TNavigationItem,
} from "@docspace/ui-kit/components/navigation";
import { TableGroupMenu } from "@docspace/ui-kit/components/table";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";
import { FolderType, DeviceType } from "@docspace/shared/enums";
import useDeviceType from "@/hooks/useDeviceType";
import { useNavigationStore } from "../../_store/NavigationStore";
import { useFilesSelectionStore } from "../../_store/FilesSelectionStore";
import { useFilesListStore } from "../../_store/FilesListStore";

import useFolderActions from "../../_hooks/useFolderActions";
import useHeaderMenu from "../../_hooks/useHeaderMenu";
import { DeleteContext } from "../../_contexts/DeleteContext";
import { FileOperationsContext } from "../../_contexts/FileOperationsContext";
import { RoomActionsContext } from "@/app/(rooms)/_contexts/RoomActionsContext";
import { useHeaderContextMenu } from "../../_hooks/useHeaderContextMenu";
import useContextMenuModel from "../../_hooks/useContextMenuModel";
import type { HeaderProps } from "./Header.types";

export type { HeaderProps };

const Header = ({
  current,
  pathParts: pathPartsProp,
  isEmptyList,
  showTitle = true,
  onBurgerClick,
  isInfoPanelVisible = false,
  onToggleInfoPanel,
  headerOffset = 0,
  aiChatButton,
}: HeaderProps) => {
  const searchParams = useSearchParams();

  const getValue = (key: string) => {
    const value = searchParams.get(key);
    return value === "true" ? true : value === "false" ? false : value;
  };

  const showTitleParam = getValue("showTitle");
  if (showTitleParam !== null) showTitle = showTitleParam as boolean;

  const navigationStore = useNavigationStore();
  const filesSelectionStore = useFilesSelectionStore();
  const filesListStore = useFilesListStore();
  const { currentDeviceType } = useDeviceType();
  const deleteCtx = React.useContext(DeleteContext);
  const fileOpsCtx = React.useContext(FileOperationsContext);
  const roomActionsCtx = React.useContext(RoomActionsContext);
  const isTrashSection = filesListStore.rootFolderType === FolderType.TRASH;

  const { getContextOptionsFolder, isRoom } = useHeaderContextMenu(
    filesListStore.currentFolder ?? current,
  );

  const { getHeaderContextMenuModel } = useContextMenuModel({
    onDeleteClick: deleteCtx?.deleteItem,
    onDeleteSelectedClick:
      roomActionsCtx?.deleteSelected ?? deleteCtx?.deleteItems,
    onCopyClick: !isTrashSection ? fileOpsCtx?.copyItem : undefined,
    onMoveClick: !isTrashSection ? fileOpsCtx?.moveItem : undefined,
    onDuplicateClick: !isTrashSection ? fileOpsCtx?.duplicateItem : undefined,
    onRestoreClick: isTrashSection ? fileOpsCtx?.restoreItem : undefined,
    onCopySelectedClick: !isTrashSection ? fileOpsCtx?.copyItems : undefined,
    onMoveSelectedClick: !isTrashSection ? fileOpsCtx?.moveItems : undefined,
    onRestoreSelectedClick: roomActionsCtx?.restoreSelected
      ?? (isTrashSection ? fileOpsCtx?.restoreItems : undefined),
    isRoomsFolder: !!roomActionsCtx,
    isArchiveRoomsFolder: !!roomActionsCtx?.isArchive,
    onArchiveSelectedClick: roomActionsCtx?.archiveSelected,
    onPinSelectedClick: roomActionsCtx?.pinSelected,
  });

  const { getHeaderMenu, onCheckboxChange } = useHeaderMenu();

  const tableGroupMenuVisible = filesSelectionStore.selection.length > 0;
  const isChecked =
    filesListStore.itemsCount === filesSelectionStore.selection.length;

  const { t } = useTranslation(["Common"]);

  const { openFolder } = useFolderActions({ t });

  const activeCurrent = filesListStore.currentFolder ?? current;

  const title = activeCurrent?.title;
  const id = activeCurrent?.id;

  // Desktop trash warning ("Items in Trash are automatically deleted after
  // 30 days") — rendered by ui-kit Navigation/ControlBtn from titles.warningText
  // on desktop. Mobile shows the same text via Section.SectionWarning.
  const navigationTitles = useMemo(
    () =>
      isTrashSection
        ? {
            warningText: t("Common:TrashAutoDeleteWarning", {
              sectionName: t("Common:TrashSection"),
            }),
          }
        : undefined,
    [isTrashSection, t],
  );

  const pathParts = filesListStore.pathParts ?? pathPartsProp;

  const isInRoomsContext =
    pathParts?.[0]?.folderType === FolderType.Rooms ||
    pathParts?.[0]?.folderType === FolderType.Archive;

  // Section root: only one entry in pathParts means we're at the top of a
  // section (Rooms list, My documents, Favorites, Recent, Trash, etc.).
  // Using pathParts.length instead of id === rootFolderId because the server may
  // return rootFolderId = 0 for the section root itself, breaking the equality check.
  const isRootSection = (pathParts?.length ?? 0) <= 1;
  const isRoomsFolder = isInRoomsContext && isRootSection;

  // Trash exposes a header context menu (Empty all / Restore all) even at its
  // root, as long as it is non-empty — mirror the client.
  const showTrashHeaderMenu = isTrashSection && !isEmptyList;
  // Show the kebab / enable the menu in subfolders OR at trash root (non-empty).
  const isHeaderMenuVisible = !isRootSection || showTrashHeaderMenu;

  const navigationItems: TNavigationItem[] = useMemo(() => {
    if (!pathParts) return [];

    const items: TNavigationItem[] = pathParts
      .map((p) => ({
        id: p.id,
        title: p.title,
        isRootRoom: !p.roomType,
      }))
      .filter((item) => isInRoomsContext || item.isRootRoom);

    items.pop();

    return items.reverse();
  }, [pathParts, isInRoomsContext]);

  const prevIdRef = React.useRef<typeof id>(undefined);

  useEffect(() => {
    navigationStore.setNavigationItems(navigationItems);
    if (id !== undefined && prevIdRef.current !== id)
      navigationStore.setCurrentFolderId(id);
    if (
      title !== undefined &&
      (navigationStore.currentTitle === null || prevIdRef.current !== id)
    )
      navigationStore.setCurrentTitle(title);
    prevIdRef.current = id;
    navigationStore.setCurrentIsRootRoom(isRoomsFolder);
  }, [title, navigationItems, navigationStore, id, isRoomsFolder]);

  const currentNavigationItems =
    navigationStore.navigationItems ?? navigationItems;

  const onBackToParentFolder = useCallback(() => {
    if (!currentNavigationItems.length) return;
    openFolder(currentNavigationItems[0].id, currentNavigationItems[0].title);
  }, [currentNavigationItems, openFolder]);

  useEffect(() => {
    window.addEventListener("popstate", onBackToParentFolder);

    return () => {
      window.removeEventListener("popstate", onBackToParentFolder);
    };
  }, [onBackToParentFolder]);

  const { outerOffsetStyle, innerOffsetStyle } = useMemo(() => {
    if (!headerOffset) {
      return {
        outerOffsetStyle: undefined as React.CSSProperties | undefined,
        innerOffsetStyle: undefined as React.CSSProperties | undefined,
      };
    }
    return {
      outerOffsetStyle: { alignSelf: "stretch" } as React.CSSProperties,
      innerOffsetStyle: {
        position: "relative",
        marginInlineStart: `${headerOffset}px`,
        height: "100%",
      } as React.CSSProperties,
    };
  }, [headerOffset]);

  if (!current || !pathParts) return null;

  return (
    <div
      className={classnames(styles.headerContainer, {
        [styles.infoPanelVisible]: isInfoPanelVisible,
        [styles.isExternalFolder]: false,
        [styles.isLifetimeEnabled]: false,
      })}
      style={outerOffsetStyle}
    >
      {tableGroupMenuVisible ? (
        <TableGroupMenu
          withComboBox
          withoutInfoPanelToggler={!onToggleInfoPanel}
          isChecked={isChecked}
          isIndeterminate={!isChecked}
          headerMenu={getHeaderContextMenuModel()}
          onClick={() => {}}
          onChange={onCheckboxChange}
          toggleInfoPanel={onToggleInfoPanel ?? (() => {})}
          isInfoPanelVisible={isInfoPanelVisible}
          checkboxOptions={getHeaderMenu()}
        />
      ) : (
        <div className="header-container" style={innerOffsetStyle}>
          <Navigation
            hideInfoPanel={() => {}}
            showText
            isRootFolder={currentNavigationItems.length === 0}
            canCreate={false}
            title={navigationStore.currentTitle ?? title}
            rootRoomTitle={
              currentNavigationItems.length === 0 ? "" : pathParts[0].title
            }
            isDesktop={currentDeviceType === DeviceType.desktop}
            navigationItems={currentNavigationItems}
            getContextOptionsPlus={() => []}
            getContextOptionsFolder={getContextOptionsFolder}
            onClickFolder={(idFolder) => {
              openFolder(
                idFolder,
                currentNavigationItems.find((v) => v.id === idFolder)?.title ??
                  currentNavigationItems[0].title,
              );
            }}
            isTrashFolder={isTrashSection}
            titles={navigationTitles}
            isEmptyPage={isEmptyList}
            isEmptyFilesList={isEmptyList}
            onBackToParentFolder={onBackToParentFolder}
            showRootFolderTitle={false}
            withMenu={isHeaderMenuVisible}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle={showTitle}
            isRoom={isRoom}
            isInfoPanelVisible={isInfoPanelVisible}
            toggleInfoPanel={onToggleInfoPanel ?? (() => {})}
            withLogo=""
            burgerLogo=""
            onLogoClick={onBurgerClick ?? (() => {})}
            clearTrash={() => {}}
            showFolderInfo={() => {}}
            aiChatButton={aiChatButton}
            isContextButtonVisible={isHeaderMenuVisible}
          />
        </div>
      )}
    </div>
  );
};

export default observer(Header);

