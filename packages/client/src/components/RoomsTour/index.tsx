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

import { useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";

import type RoomsTourStore from "SRC_DIR/store/RoomsTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import WelcomeTourDialog, {
  type TourFeature,
} from "SRC_DIR/components/Tour/WelcomeTourDialog";

import RoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import UserReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.user.react.svg?url";
import SharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/icons/16/security.react.svg?url";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type RoomsTourProps = {
  roomsTourStore: RoomsTourStore;
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isRoomsRoot: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  isTableView: boolean;
  roomsId: string | null;
  archiveId: string | null;
};

const RoomsTour = ({
  roomsTourStore,
  userId,
  currentDeviceType,
  isFrame,
  firstLoad,
  isRoomsRoot,
  canCreate,
  canUseTemplates,
  showFilter,
  hasItems,
  isTableView,
  roomsId,
  archiveId,
}: RoomsTourProps) => {
  const { t } = useTranslation(["RoomsTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  useEffect(() => {
    if (userId) roomsTourStore.hydrateForUser(userId);
  }, [userId, roomsTourStore]);

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      isTableView,
      roomsId,
      archiveId,
    }),
    [
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      isTableView,
      roomsId,
      archiveId,
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

  const features = useMemo<TourFeature[]>(
    () => [
      {
        icon: RoomsReactSvgUrl,
        title: t("RoomsTour:FeatureTypesTitle"),
        description: t("RoomsTour:FeatureTypes"),
      },
      {
        icon: UserReactSvgUrl,
        title: t("RoomsTour:FeatureMembersTitle"),
        description: t("RoomsTour:FeatureMembers"),
      },
      {
        icon: SharedReactSvgUrl,
        title: t("RoomsTour:FeatureAccessTitle"),
        description: t("RoomsTour:FeatureAccess"),
      },
      {
        icon: SecurityReactSvgUrl,
        title: t("RoomsTour:FeatureRoomSecurityTitle"),
        description: t("RoomsTour:FeatureRoomSecurity"),
      },
    ],
    [t],
  );

  if (isFrame || !userId) return null;

  const welcomeVisible =
    !firstLoad &&
    isRoomsRoot &&
    roomsTourStore.isHydrated &&
    !roomsTourStore.tourCompleted &&
    !roomsTourStore.isRunning;

  const onStart = () => {
    if (isMobileView) {
      roomsTourStore.completeTour();
      return;
    }
    roomsTourStore.startTour();
  };

  const onSkip = () => {
    roomsTourStore.completeTour();
  };

  return (
    <>
      <WelcomeTourDialog
        visible={welcomeVisible}
        title={t("RoomsTour:RoomsWelcomeTitle")}
        features={features}
        canTakeTour={!isMobileView}
        onStart={onStart}
        onSkip={onSkip}
      />
      {Tour ? createPortal(Tour, document.body) : null}
    </>
  );
};

export default inject(
  ({
    authStore,
    userStore,
    settingsStore,
    filesStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    roomsTourStore,
  }: TStore) => {
    const {
      roomsFolder,
      roomsFolderId,
      archiveFolderId,
      isRoomsFolderRoot,
      isRoot,
    } = treeFoldersStore;

    const { isAdmin, isRoomAdmin } = authStore;

    return {
      roomsTourStore,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isRoomsRoot:
        isRoomsFolderRoot && isRoot && !publicRoomStore.isPublicRoom,
      // Only room admins / admins see the rooms creation banner and the
      // Templates sidebar item (same gate as ClientArticleSidebar).
      canCreate: (isAdmin || isRoomAdmin) && !!roomsFolder,
      canUseTemplates: isAdmin || isRoomAdmin,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      isTableView: filesStore.viewAs === "table",
      // Sidebar anchors (ClientArticleSidebar → NavMenu data-item-id). The
      // Rooms parent item id is the tree folder id, and so is Archive's; the
      // remaining sub-items use static ids ("rooms-recent", "rooms-trash").
      roomsId: roomsFolderId != null ? String(roomsFolderId) : null,
      archiveId: archiveFolderId != null ? String(archiveFolderId) : null,
    };
  },
)(observer(RoomsTour));
