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

import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FilesTourProps = {
  filesTourStore: FilesTourStore;
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isFilesRoot: boolean;
  canCreate: boolean;
  showFilter: boolean;
  hasItems: boolean;
  sectionId: string | null;
  sharedId: string | null;
  recentId: string | null;
  favoritesId: string | null;
  trashId: string | null;
};

const FilesTour = ({
  filesTourStore,
  userId,
  audience,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isFilesRoot,
  canCreate,
  showFilter,
  hasItems,
  sectionId,
  sharedId,
  recentId,
  favoritesId,
  trashId,
}: FilesTourProps) => {
  const { t } = useTranslation(["FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  const flags = useMemo<TourStepFlags>(
    () => ({
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      sectionId,
      sharedId,
      recentId,
      favoritesId,
      trashId,
    }),
    [
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      sectionId,
      sharedId,
      recentId,
      favoritesId,
      trashId,
    ],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) => getTourSteps(t, callbacks, flags),
    [t, flags],
  );

  const { Tour } = useTour(
    filesTourStore,
    buildSteps,
    isMobileView,
    "files tour",
  );

  usePendingTour(
    filesTourStore,
    !firstLoad && !isSectionLoading && isFilesRoot,
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
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    filesTourStore,
  }: TStore) => {
    const {
      myFolder,
      myFolderId,
      sharedWithMeFolder,
      recentFolderId,
      favoritesFolderId,
      recycleBinFolderId,
      isPersonalRoom,
      isSharedWithMeFolder,
      isRoot,
    } = treeFoldersStore;

    const audience = getTourAudience(userStore?.user);
    const hasMyDocuments = !!myFolder && audience !== "guest";
    const sharedWithMeId = sharedWithMeFolder?.id;

    return {
      filesTourStore,
      userId: userStore?.user?.id,
      audience,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      // Nothing in the section is behind a loader any more, so the anchors the
      // steps point at are the ones actually on screen.
      isSectionLoading: clientLoadingStore.showBodyLoader,
      // Where the tour is allowed to open: the root of the Files section.
      // For everyone with a personal space that root is My documents. A guest
      // has none — the sidebar points their Files item at Shared with me
      // instead — so that folder is their section root and the tour has to
      // accept it, or it can never open for them at all.
      isFilesRoot:
        !publicRoomStore.isPublicRoom &&
        ((isPersonalRoom && isRoot) ||
          (!hasMyDocuments && !!isSharedWithMeFolder)),
      canCreate: !!myFolder?.security?.Create,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      // Sidebar anchors (ClientArticleSidebar → NavMenu data-item-id). Item
      // ids of tree sections are their folder ids, so they mirror the same
      // gating the sidebar itself applies (Trash is hidden from guests).
      //
      // The section item is keyed by the My documents folder id when there is
      // one, and by the literal "files" when there is not — the exact fallback
      // ClientArticleSidebar uses to build the item for a guest.
      sectionId:
        hasMyDocuments && myFolderId != null
          ? String(myFolderId)
          : sharedWithMeId != null
            ? "files"
            : null,
      sharedId: sharedWithMeId != null ? String(sharedWithMeId) : null,
      recentId: recentFolderId != null ? String(recentFolderId) : null,
      favoritesId: favoritesFolderId != null ? String(favoritesFolderId) : null,
      trashId:
        hasMyDocuments && recycleBinFolderId != null
          ? String(recycleBinFolderId)
          : null,
    };
  },
)(observer(FilesTour));
