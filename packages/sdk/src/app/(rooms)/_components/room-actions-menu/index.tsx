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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { isMobile } from "@docspace/shared/utils";
import type { TFolder } from "@docspace/shared/api/files/types";
import {
  ContextMenu,
  type ContextMenuRefType,
} from "@docspace/ui-kit/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import useRoomContextMenuModel from "../../_hooks/useRoomContextMenuModel";
import { RoomActionsContext } from "../../_contexts/RoomActionsContext";
import { filterInfoPanelModel } from "./utils";

type RoomActionsMenuProps = {
  selection: TFolder;
};

const RoomActionsMenu = ({ selection }: RoomActionsMenuProps) => {
  const { t } = useTranslation(["Common"]);
  const actions = React.useContext(RoomActionsContext);
  const filesListStore = useFilesListStore();
  const contextMenuRef = React.useRef<ContextMenuRefType>(null);

  const item =
    filesListStore.items.find((i) => i.id === selection.id) ??
    (selection as unknown as TFolderItem | TFileItem);

  const { getContextModel } = useRoomContextMenuModel(
    actions?.editRoom,
    actions?.roomChanged,
    actions?.changeOwner,
    actions?.isArchive,
    actions?.restoreRoom,
    actions?.deleteRoom,
    actions?.deleteSelected,
    actions?.restoreSelected,
    actions?.archiveRoom,
    actions?.archiveSelected,
    actions?.infoRoom,
    actions?.inviteRoom,
  );

  const getData = React.useCallback(
    () => filterInfoPanelModel(getContextModel(item, true)),
    [getContextModel, item],
  );

  const model = React.useMemo(() => getData(), [getData]);

  const onClick = (e: React.MouseEvent) => {
    if (!contextMenuRef.current?.menuRef.current)
      contextMenuRef.current?.show(e);
  };

  return (
    <>
      <ContextMenuButton
        id="info-panel_room-context-button"
        iconName={VerticalDotsReactSvgUrl}
        size={16}
        title={t("Common:Actions")}
        onClick={onClick}
        getData={getData}
        directionX="right"
        displayType={ContextMenuButtonDisplayType.toggle}
      />
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        model={model}
        withBackdrop={isMobile()}
        baseZIndex={310}
        ignoreChangeView={isMobile()}
        isRoom
        isArchive={actions?.isArchive}
      />
    </>
  );
};

export default observer(RoomActionsMenu);

