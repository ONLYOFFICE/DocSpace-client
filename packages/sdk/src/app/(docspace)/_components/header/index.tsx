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
import { FolderType } from "@docspace/shared/enums";
import useDeviceType from "@/hooks/useDeviceType";
import { useNavigationStore } from "../../_store/NavigationStore";
import { useFilesSelectionStore } from "../../_store/FilesSelectionStore";
import { useFilesListStore } from "../../_store/FilesListStore";

import useFolderActions from "../../_hooks/useFolderActions";
import useContextMenuModel from "../../_hooks/useContextMenuModel";
import useHeaderMenu from "../../_hooks/useHeaderMenu";
import { DeleteContext } from "../../_contexts/DeleteContext";
import { FileOperationsContext } from "../../_contexts/FileOperationsContext";

import type { HeaderProps } from "./Header.types";

export type { HeaderProps };

const Header = ({
  current,
  pathParts,
  isEmptyList,
  showTitle = true,
  onBurgerClick,
  isInfoPanelVisible = false,
  onToggleInfoPanel,
  headerOffset = 0,
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
  const isTrashSection = filesListStore.rootFolderType === FolderType.TRASH;
  const { getHeaderContextMenuModel } = useContextMenuModel({
    onDeleteClick: deleteCtx?.deleteItem,
    onDeleteSelectedClick: deleteCtx?.deleteItems,
    onCopyClick: !isTrashSection ? fileOpsCtx?.copyItem : undefined,
    onMoveClick: !isTrashSection ? fileOpsCtx?.moveItem : undefined,
    onDuplicateClick: !isTrashSection ? fileOpsCtx?.duplicateItem : undefined,
    onRestoreClick: isTrashSection ? fileOpsCtx?.restoreItem : undefined,
    onCopySelectedClick: !isTrashSection ? fileOpsCtx?.copyItems : undefined,
    onMoveSelectedClick: !isTrashSection ? fileOpsCtx?.moveItems : undefined,
    onRestoreSelectedClick: isTrashSection ? fileOpsCtx?.restoreItems : undefined,
  });
  const { getHeaderMenu, onCheckboxChange } = useHeaderMenu();

  const tableGroupMenuVisible = filesSelectionStore.selection.length > 0;
  const isChecked =
    filesListStore.itemsCount === filesSelectionStore.selection.length;

  const { t } = useTranslation(["Common"]);

  const { openFolder } = useFolderActions({ t });

  const title = current?.title;
  const rootFolderId = current?.rootFolderId;
  const id = current?.id;

  const isRoomsFolder = pathParts?.[0]?.id === rootFolderId;

  const navigationItems: TNavigationItem[] = useMemo(() => {
    if (!pathParts) return [];

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
    if (id !== undefined) navigationStore.setCurrentFolderId(id);
    if (title !== undefined) navigationStore.setCurrentTitle(title);
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
            showText
            isRootFolder={currentNavigationItems.length === 0}
            canCreate={false}
            title={navigationStore.currentTitle ?? title}
            rootRoomTitle={
              currentNavigationItems.length === 0 ? "" : pathParts[0].title
            }
            isDesktop={false}
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
            withMenu={!isRoomsFolder}
            currentDeviceType={currentDeviceType}
            titleIcon=""
            titleIconTooltip=""
            showNavigationButton={false}
            isCurrentFolderInfo={false}
            showTitle={showTitle}
            isRoom={!!current.roomType}
            isInfoPanelVisible={isInfoPanelVisible}
            toggleInfoPanel={onToggleInfoPanel ?? (() => {})}
            withLogo=""
            burgerLogo=""
            onLogoClick={onBurgerClick ?? (() => {})}
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
