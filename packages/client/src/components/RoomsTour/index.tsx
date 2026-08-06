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

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  DeviceType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import type RoomsTourStore from "SRC_DIR/store/RoomsTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import { getTourAudience } from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";

import type { TCreatedBy } from "@docspace/shared/types";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type RoomsTourProps = {
  roomsTourStore: RoomsTourStore;
  filesStore: FilesStore;
  infoPanelStore: InfoPanelStore;
  user: UserStore["user"];
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isRoomsRoot: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  roomsId: string | null;
};

/** What the member step took over, so its `close` can hand it all back. */
type InfoPanelState = {
  selection: ReturnType<FilesStore["getSelection"]>;
  bufferSelection: FilesStore["bufferSelection"];
  view: InfoPanelStore["roomsView"];
  isVisible: boolean;
};

const RoomsTour = ({
  roomsTourStore,
  filesStore,
  infoPanelStore,
  user,
  userId,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isRoomsRoot,
  canCreate,
  canUseTemplates,
  showFilter,
  hasItems,
  roomsId,
}: RoomsTourProps) => {
  const { t } = useTranslation(["RoomsTour", "FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  // The info panel is a piece of the user's own workspace, not the tour's, so
  // the step that borrows it records everything it overwrites first.
  const borrowedPanel = useRef<InfoPanelState | null>(null);

  const openInfoPanel = useCallback(() => {
    const room = filesStore.filesList?.[0];
    if (!room || borrowedPanel.current) return;

    borrowedPanel.current = {
      selection: filesStore.getSelection(),
      bufferSelection: filesStore.bufferSelection,
      view: infoPanelStore.roomsView,
      isVisible: infoPanelStore.isVisible,
    };

    // Selecting the room is what points the panel at it — `infoPanelSelection`
    // reads the file list's selection, it has no setter of its own.
    filesStore.setSelection([room]);
    infoPanelStore.openMembersTab();
  }, [filesStore, infoPanelStore]);

  const closeInfoPanel = useCallback(() => {
    const previous = borrowedPanel.current;
    if (!previous) return;
    borrowedPanel.current = null;

    filesStore.setSelection(previous.selection);
    filesStore.setBufferSelection(previous.bufferSelection);
    infoPanelStore.setView(previous.view);
    infoPanelStore.setIsVisible(previous.isVisible);
  }, [filesStore, infoPanelStore]);

  const infoPanelHooks = useMemo(
    () => ({ reveal: openInfoPanel, restore: closeInfoPanel }),
    [openInfoPanel, closeInfoPanel],
  );

  const reloadSection = useCallback(
    () => filesStore.fetchRooms(null, null, true, false, true),
    [filesStore],
  );

  // Hands the section back: the mocks come down and the real (empty) list is
  // fetched again, which is what puts the empty screen up. The closing step
  // does this on purpose, to point at the button that lives there.
  const endDemo = useCallback(() => {
    if (!tourDemo.isActive) return;
    tourDemo.deactivate();
    void reloadSection();
  }, [reloadSection]);

  const demoHooks = useMemo(
    // Nothing to restore afterwards: the section is already the user's own
    // again by the time this step is done with it.
    () => ({ reveal: endDemo, restore: () => {} }),
    [endDemo],
  );

  // A portal with no rooms of its own shows a tour reduced to its sidebar
  // steps, so the section is stood in for while the tour runs. Armed on the
  // pending request, before `usePendingTour` starts anything: the reload has
  // to have landed by the time joyride freezes the step list against the DOM.
  useEffect(() => {
    if (!roomsTourStore.isPending || roomsTourStore.isRunning) return;
    if (tourDemo.isActive || hasItems) return;
    if (isMobileView || firstLoad || isSectionLoading || !isRoomsRoot) return;
    if (!user) return;
    // Only for someone who can act on what the stand-in section shows. A
    // member with no rooms has nothing to be shown and nothing to do about it
    // — the closing step would send them at a button they do not have.
    if (!canCreate) return;

    tourDemo.activate({
      list: "rooms",
      // The rooms tour never walks into a room, so the stand-in list is the
      // whole of what it borrows — and it only ever borrows it when the real
      // one came back empty.
      standInForList: true,
      // Each stand-in room is named after its own type, with the very keys the
      // banner's tiles are built from — so the demo adds no strings of its own
      // to translate — and listed in the order those tiles sit in.
      rooms: [
        {
          roomType: RoomsType.EditingRoom,
          title: t("Common:CollaborationRoomTitle"),
        },
        {
          roomType: RoomsType.VirtualDataRoom,
          title: t("Common:VirtualDataRoom"),
        },
        { roomType: RoomsType.PublicRoom, title: t("Common:PublicRoom") },
        { roomType: RoomsType.CustomRoom, title: t("Common:CustomRoomTitle") },
      ],
      owner: user as unknown as TCreatedBy,
      // What the members step is about: a room is people with different
      // reaches into it.
      memberAccess: [ShareAccessRights.Editing, ShareAccessRights.ReadOnly],
    });

    void reloadSection();
  }, [
    roomsTourStore.isPending,
    roomsTourStore.isRunning,
    hasItems,
    isMobileView,
    firstLoad,
    isSectionLoading,
    isRoomsRoot,
    user,
    canCreate,
    reloadSection,
    t,
  ]);

  // A tour that ends while a step is still up — closed, skipped, its anchor
  // gone — never reaches that step's `after`, so the panel would stay borrowed
  // and the stand-in rooms would outlive the tour that put them there. Both
  // calls are no-ops when there is nothing to hand back.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (roomsTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    closeInfoPanel();
    endDemo();
  }, [roomsTourStore.isRunning, closeInfoPanel, endDemo]);

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      roomsId,
      infoPanelHooks,
      isDemo: tourDemo.isActive,
      demoHooks,
    }),
    [
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      roomsId,
      infoPanelHooks,
      demoHooks,
    ],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) => getTourSteps(t, callbacks, flags),
    [t, flags],
  );

  const { Tour } = useTour(
    roomsTourStore,
    buildSteps,
    isMobileView,
    "rooms tour",
  );

  usePendingTour(
    roomsTourStore,
    !firstLoad &&
      !isSectionLoading &&
      isRoomsRoot &&
      // With the section stood in for, "ready" also means the stand-in rooms
      // have actually landed. Without this the reload above and the start
      // timer race, and joyride can freeze its step list against the empty
      // page the reload is on its way to replace.
      (!tourDemo.isActive || hasItems),
    isMobileView,
  );

  if (isFrame || !userId) return null;

  return Tour ? createPortal(Tour, document.body) : null;
};

export default inject(
  ({
    userStore,
    settingsStore,
    filesStore,
    infoPanelStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    roomsTourStore,
  }: TStore) => {
    const { roomsFolder, roomsFolderId, isRoomsFolderRoot, isRoot } =
      treeFoldersStore;

    const isAdminAudience = getTourAudience(userStore?.user) === "admin";

    return {
      roomsTourStore,
      // The member step drives both of these directly: it selects a room and
      // opens the panel on it, then puts each back the way it found it.
      filesStore,
      infoPanelStore,
      // The stand-in rooms are owned by the user themselves — the less of the
      // section is invented, the less of it can be wrong.
      user: userStore?.user,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      // Nothing in the section is behind a loader any more, so the anchors the
      // steps point at are the ones actually on screen.
      isSectionLoading: clientLoadingStore.showBodyLoader,
      isRoomsRoot: isRoomsFolderRoot && isRoot && !publicRoomStore.isPublicRoom,
      // Only room admins / admins see the rooms creation banner and the
      // Templates sidebar item (same gate as ClientArticleSidebar).
      canCreate: isAdminAudience && !!roomsFolder,
      canUseTemplates: isAdminAudience,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      // Sidebar anchor (ClientArticleSidebar → NavMenu data-item-id). The
      // Rooms parent item id is the tree folder id; its sub-items use static
      // ids ("rooms-recent", "rooms-trash").
      roomsId: roomsFolderId != null ? String(roomsFolderId) : null,
    };
  },
)(observer(RoomsTour));
