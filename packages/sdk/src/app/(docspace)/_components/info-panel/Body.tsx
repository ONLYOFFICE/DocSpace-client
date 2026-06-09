// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";
import { observer } from "mobx-react";

import { ScrollbarContext } from "@docspace/ui-kit/components/scrollbar";
import type { TLogo } from "@docspace/ui-kit/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFolder } from "@docspace/shared/api/files/types";

import { FolderType } from "@docspace/shared/enums";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { normalizeRoomLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";
import {
  RoomActionsContext,
  type RoomActionsHandler,
} from "@/app/(rooms)/_contexts/RoomActionsContext";
import useRoomActions from "@/app/(rooms)/_hooks/useRoomActions";
import type { TFolderItem } from "@/app/(docspace)/_hooks/useItemList";

import { InfoPanelView, useInfoPanelStore } from "../../_store/InfoPanelStore";

import { getAvailableTabs } from "./helpers/tabs";
import Details from "./views/Details";
import History from "./views/History";
import Members from "./views/Members";
import { useMembers } from "./views/Members/useMembers";
import RoomHeader from "./sub-components/RoomHeader";
import ShareView from "./views/Share";
import { NoItem, SeveralItems } from "./views/EmptyStates";

import commonStyles from "./helpers/Common.module.scss";

type InfoPanelBodyProps = {
  onTagsChanged?: () => void;
};

const InfoPanelBody = observer(({ onTagsChanged }: InfoPanelBodyProps) => {
  const infoPanelStore = useInfoPanelStore();
  const filesSelectionStore = useFilesSelectionStore();
  const filesListStore = useFilesListStore();
  const { selection, fileView, isVisible, isPinnedSelection } = infoPanelStore;

  const selectedCount = filesSelectionStore.selection.length;
  const isSeveralItems = selectedCount > 1;

  const isRoom =
    !!selection && "isRoom" in selection && Boolean(selection.isRoom);
  const scrollContext = React.use(ScrollbarContext);
  const scrollToTop = React.useCallback(() => {
    scrollContext?.parentScrollbar?.scrollToTop();
  }, []);
  const membersData = useMembers({
    room: isRoom ? (selection as unknown as TRoom) : null,
    scrollToTop,
  });

  const inheritedRoomActions = React.useContext(RoomActionsContext);
  const roomActions = useRoomActions();
  const isArchive = filesListStore.rootFolderType === FolderType.Archive;
  const fallbackRoomActions = React.useMemo<RoomActionsHandler>(
    () => ({
      archiveSelected: () => {},
      deleteSelected: () => {},
      restoreSelected: () => {},
      pinSelected: () => {},
      isArchive,
      editRoom: roomActions.editRoom,
      inviteRoom: roomActions.inviteRoom,
      changeOwner: roomActions.changeOwner,
      archiveRoom: roomActions.archiveRoom,
      deleteRoom: roomActions.deleteRoom,
      infoRoom: roomActions.infoRoom,
      roomChanged: roomActions.roomChanged,
    }),
    [roomActions, isArchive],
  );

  // Clear pinned selection when the user navigates to a different folder so that
  // a previously-pinned room does not remain visible after entering another room.
  const prevFolderIdRef = React.useRef<number | string | undefined>(
    filesListStore.currentFolder?.id,
  );
  React.useEffect(() => {
    const newId = filesListStore.currentFolder?.id;
    if (newId !== prevFolderIdRef.current) {
      prevFolderIdRef.current = newId;
      infoPanelStore.setPinnedSelection(false);
    }
  }, [filesListStore.currentFolder?.id, infoPanelStore]);

  React.useEffect(() => {
    if (!isVisible) return;

    // When the panel was opened explicitly for a specific item (e.g. from the
    // folder header context menu), don't let the selection-sync overwrite it.
    // The pin is cleared when the panel closes or the user clicks another item.
    if (isPinnedSelection && selectedCount === 0) return;

    if (isPinnedSelection && selectedCount > 0) {
      infoPanelStore.setPinnedSelection(false);
    }

    if (isSeveralItems) {
      if (selection !== null) infoPanelStore.setSelection(null);
      return;
    }

    const cf = filesListStore.currentFolder;
    const isRootFolder = !!(cf && cf.id === cf.rootFolderId);
    let currentFolderAsItem = null;
    if (!isRootFolder && cf) {
      const rawLogo = (cf as unknown as { logo?: TLogo }).logo;
      const { roomLogo, roomIconColor, hasRoomImage } = normalizeRoomLogo(rawLogo);
      currentFolderAsItem = {
        ...cf,
        isFolder: true as const,
        isRoom: !!cf.roomType,
        roomLogo,
        roomIconColor,
        hasRoomImage,
      };
    }

    const next =
      selectedCount === 1
        ? filesSelectionStore.selection[0]
        : (filesSelectionStore.bufferSelection ?? currentFolderAsItem ?? null);

    if (!next) {
      if (selection !== null) infoPanelStore.setSelection(null);
      return;
    }

    if (selection && selection.id === next.id) return;

    infoPanelStore.setSelection(next as TFolder);
  }, [
    isVisible,
    isPinnedSelection,
    isSeveralItems,
    selectedCount,
    filesSelectionStore.selection,
    filesSelectionStore.bufferSelection,
    filesListStore.currentFolder,
    selection,
    infoPanelStore,
  ]);

  const availableTabs = selection ? getAvailableTabs(selection) : [];
  const currentView = availableTabs.includes(fileView)
    ? fileView
    : (availableTabs[0] ?? InfoPanelView.infoDetails);

  const isMembersView = currentView === InfoPanelView.infoMembers;

  const room = selection as unknown as TRoom;
  const hasEditAccess = isRoom ? Boolean(room.security?.EditAccess) : false;

  const showHeader = !isSeveralItems && !!selection && isRoom;

  const renderContent = () => {
    if (isSeveralItems) return <SeveralItems count={selectedCount} />;

    if (!selection) return <NoItem />;

    if (currentView === InfoPanelView.infoMembers)
      return <Members selection={selection} membersData={membersData} />;
    if (currentView === InfoPanelView.infoShare)
      return <ShareView selection={selection} />;
    if (currentView === InfoPanelView.infoHistory)
      return <History selection={selection} />;
    return <Details selection={selection} onTagsChanged={onTagsChanged} />;
  };

  return (
    <div
      className={commonStyles.infoPanelBody}
      data-info-panel-scroll
      data-testid="info_panel_body"
    >
      {showHeader ? (
        <RoomActionsContext.Provider
          value={inheritedRoomActions ?? fallbackRoomActions}
        >
          <RoomHeader
            selection={selection as TFolder}
            isMembersView={isMembersView}
            hasEditAccess={hasEditAccess}
            setSearchValue={membersData.handleSearchMembers}
            onInvite={() =>
              roomActions.inviteRoom(selection as unknown as TFolderItem)
            }
            onUpdated={onTagsChanged}
          />
        </RoomActionsContext.Provider>
      ) : null}

      {renderContent()}
    </div>
  );
});

export default InfoPanelBody;
