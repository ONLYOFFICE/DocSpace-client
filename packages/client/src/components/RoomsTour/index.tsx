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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ROOMS_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import { getTourAudience } from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";
import { waitForElement } from "SRC_DIR/components/Tour/waitForElement";
import {
  fadeSectionIn,
  fadeSectionOut,
} from "SRC_DIR/components/Tour/sectionFade";

import type { TCreatedBy } from "@docspace/shared/types";

import {
  getTourSteps,
  FIRST_ITEM_SELECTOR,
  GROUPS_SELECTOR,
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
  organizeRoomsGrouping: boolean;
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
  organizeRoomsGrouping,
}: RoomsTourProps) => {
  const { t, ready } = useTranslation(["RoomsTour", "FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

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

    // The panel follows the file list's selection; it has no setter of its own.
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
      // The reveal reads the first room off a list that may still be loading.
      awaitBefore: FIRST_ITEM_SELECTOR,
      navigates: true,
    }),
    [openInfoPanel, closeInfoPanel],
  );

  const reloadSection = useCallback(
    () => filesStore.fetchRooms(null, null, true, false, true),
    [filesStore],
  );

  // Shared by the arming effect and the closing step's `restore`.
  const demoConfig = useMemo(
    () => ({
      list: "rooms" as const,
      standInForList: true,
      // Named by the tiles' own keys, in the banner order.
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
      memberAccess: [ShareAccessRights.Editing, ShareAccessRights.ReadOnly],
    }),
    [user, t],
  );

  // `fade` is for an early close: the closing step fades the section itself.
  const endDemo = useCallback(
    async ({ fade = false } = {}) => {
      if (!tourDemo.isActive) return;

      if (fade) await fadeSectionOut();
      tourDemo.deactivate();

      try {
        await reloadSection();
      } finally {
        if (fade) fadeSectionIn();
      }
    },
    [reloadSection],
  );

  // Walking back out of the closing step needs the list its steps anchor on.
  const restoreDemo = useCallback(() => {
    if (tourDemo.isActive || !user) return;
    tourDemo.activate(demoConfig);
    void reloadSection();
  }, [demoConfig, reloadSection, user]);

  const demoHooks = useMemo(
    () => ({
      reveal: endDemo,
      restore: restoreDemo,
      swapsList: true,
      navigates: true,
    }),
    [endDemo, restoreDemo],
  );

  // Stands in for an empty section before `usePendingTour` starts anything.
  useEffect(() => {
    if (!roomsTourStore.isPending || roomsTourStore.isRunning) return;
    if (tourDemo.isActive || hasItems) return;
    if (isMobileView || firstLoad || isSectionLoading || !isRoomsRoot) return;
    if (!user) return;
    // The demo keeps the names it was armed with, so they must be loaded.
    if (!ready) return;

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
    ready,
    demoConfig,
  ]);

  // A tour closed mid-step never reaches that step's `after`.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (roomsTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    closeInfoPanel();
    endDemo({ fade: true });
  }, [roomsTourStore.isRunning, closeInfoPanel, endDemo]);

  // The effect above never fires when the section unmounts instead.
  const closeInfoPanelRef = useRef(closeInfoPanel);
  closeInfoPanelRef.current = closeInfoPanel;

  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
      closeInfoPanelRef.current();
    },
    [],
  );

  // Read in the render body, where `observer` tracks it.
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
    ROOMS_TOUR_LABEL,
  );

  // ui-kit mounts the groups row after a round trip the loading flags miss.
  const [groupsRowSettled, setGroupsRowSettled] = useState(
    !showFilter || !organizeRoomsGrouping,
  );

  useEffect(() => {
    if (!showFilter || !organizeRoomsGrouping) {
      setGroupsRowSettled(true);
      return undefined;
    }

    setGroupsRowSettled(false);
    const controller = new AbortController();

    waitForElement(GROUPS_SELECTOR, 5000, controller.signal)
      .catch(() => {})
      .finally(() => setGroupsRowSettled(true));

    return () => controller.abort();
  }, [showFilter, organizeRoomsGrouping]);

  usePendingTour(
    roomsTourStore,
    !firstLoad &&
      !isSectionLoading &&
      isRoomsRoot &&
      // With a stand-in, ready also means its rooms have landed.
      (!isDemo || hasItems) &&
      groupsRowSettled,
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
    filesSettingsStore,
  }: TStore) => {
    const { roomsFolder, roomsFolderId, isRoomsFolderRoot, isRoot } =
      treeFoldersStore;

    const isAdminAudience = getTourAudience(userStore?.user) === "admin";

    return {
      roomsTourStore,
      filesStore,
      infoPanelStore,
      user: userStore?.user,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isSectionLoading: clientLoadingStore.showBodyLoader,
      isRoomsRoot: isRoomsFolderRoot && isRoot && !publicRoomStore.isPublicRoom,
      // Same gate as ClientArticleSidebar.
      canCreate: isAdminAudience && !!roomsFolder,
      canUseTemplates: isAdminAudience,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      roomsId: roomsFolderId != null ? String(roomsFolderId) : null,
      organizeRoomsGrouping: filesSettingsStore.organizeRoomsGrouping,
    };
  },
)(observer(RoomsTour));
