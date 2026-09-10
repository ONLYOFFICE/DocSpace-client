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

import {
  getTourSteps,
  FIRST_ITEM_SELECTOR,
  type TourStepFlags,
} from "./tourSteps";

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
    () => ({
      reveal: openInfoPanel,
      restore: closeInfoPanel,
      // The panel is opened *on* the first room, which `openInfoPanel` reads
      // out of the file list. Walking back into this step from the closing one
      // means the stand-in rooms are being fetched again right now, so the row
      // is waited for rather than assumed — without it the reveal reads an
      // empty list, gives up, and the step is left with no panel to point at.
      awaitBefore: FIRST_ITEM_SELECTOR,
      // That row can be coming back from the server (the closing step's
      // `restore` re-fetches the stand-in list), which is a round trip rather
      // than a re-render.
      navigates: true,
    }),
    [openInfoPanel, closeInfoPanel],
  );

  const reloadSection = useCallback(
    () => filesStore.fetchRooms(null, null, true, false, true),
    [filesStore],
  );

  // What the section is stood in for with. Built once for both the arming
  // effect below and the closing step's `restore`, which puts the stand-in
  // rooms back when the user walks back out of that step — the config has to
  // be the same one either way, or the tour would resume on a different list
  // than the one it walked through.
  const demoConfig = useMemo(
    () => ({
      list: "rooms" as const,
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
    }),
    [user, t],
  );

  // Hands the section back: the mocks come down and the real (empty) list is
  // fetched again, which is what puts the empty screen up. The closing step
  // does this on purpose, to point at the button that lives there.
  const endDemo = useCallback(() => {
    if (!tourDemo.isActive) return;
    tourDemo.deactivate();
    void reloadSection();
  }, [reloadSection]);

  // Puts the stand-in rooms back, for a user who walks back out of the closing
  // step. Without it that step is a one-way door: it drops the demo to show the
  // real empty screen, and the steps before it anchor on a banner and a room
  // row that the empty screen does not have. react-joyride answers a step whose
  // target has gone by moving one further in the direction of travel, so a
  // single Back skipped a step, and from there the index walked off the start
  // of the list and closed the tour outright.
  const restoreDemo = useCallback(() => {
    if (tourDemo.isActive || !user) return;
    tourDemo.activate(demoConfig);
    void reloadSection();
  }, [demoConfig, reloadSection, user]);

  const demoHooks = useMemo(
    () => ({
      reveal: endDemo,
      restore: restoreDemo,
      // Both directions swap the list through a re-fetch, so the screen this
      // step points at — and the one the step before it points back at —
      // arrives on a round trip rather than on a re-render.
      navigates: true,
    }),
    [endDemo, restoreDemo],
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

    // Whatever the audience. Somebody who cannot create a room has the most to
    // gain from this and the least without it: their empty section renders
    // neither the banner nor the filter bar, so their tour is one sidebar step
    // — nothing about what a room row does, and nothing about the member list
    // that is the whole point of the section for them. The closing step is what
    // keeps that honest: it forks on `canCreate` and names the empty list for
    // anyone who has no "create a room" button to be sent at.
    tourDemo.activate(demoConfig);

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
    reloadSection,
    demoConfig,
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

  // The effect above only fires while this component is around to see the tour
  // stop. Leaving the section takes it down instead — and the interceptors are
  // module state, so they would outlive it and keep answering for a section the
  // user has already walked away from, while the borrowed info panel would stay
  // pointed at a stand-in room that no longer exists. Whatever mounts next
  // fetches its own list, so there is nothing to reload here.
  //
  // `closeInfoPanelRef` keeps the current implementation reachable from a
  // cleanup that must run on unmount and on nothing else.
  const closeInfoPanelRef = useRef(closeInfoPanel);
  closeInfoPanelRef.current = closeInfoPanel;

  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
      closeInfoPanelRef.current();
    },
    [],
  );

  // Read in the render body rather than inside the memo: a value only `useMemo`
  // reads is a value `observer` does not track, so arming the demo would not
  // re-render the component — and a value missing from the deps is one a cached
  // memo never picks up even if it did. Here the demo is only ever armed on an
  // empty list, so the `hasItems` flip that the reload brings happens to
  // recompute this anyway; the dependency is spelled out so it does not have to.
  const isDemo = tourDemo.isActive;

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      roomsId,
      infoPanelHooks,
      isDemo,
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
      isDemo,
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
      (!isDemo || hasItems),
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
