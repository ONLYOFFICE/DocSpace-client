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

import { DeviceType } from "@docspace/shared/enums";
import type { UserStore } from "@docspace/shared/store/UserStore";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import { FILES_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import useDemoSwap from "SRC_DIR/components/Tour/useDemoSwap";
import TourPreparing from "SRC_DIR/components/Tour/TourPreparing";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";
import {
  fadeSectionIn,
  fadeSectionOut,
} from "SRC_DIR/components/Tour/sectionFade";
import { tourDemo } from "SRC_DIR/api/tourDemo";
import { buildDemoFileList } from "SRC_DIR/api/tourDemo/data";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

/** The sidebar anchors the tour's last step points at. */
type SidebarIds = Pick<
  TourStepFlags,
  "sectionId" | "sharedId" | "recentId" | "favoritesId" | "trashId"
>;

type FilesTourProps = {
  filesTourStore: FilesTourStore;
  filesStore: FilesStore;
  user: UserStore["user"];
  userId?: string;
  audience: TourAudience;
  isMobileView: boolean;
  isDesktop: boolean;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isFilesRoot: boolean;
  isSharedWithMeRoot: boolean;
  sharedFolderId: number | null;
  personalFolderId: number | null;
  canCreate: boolean;
  showFilter: boolean;
  hasItems: boolean;
  sidebarIds: SidebarIds;
};

const FilesTour = ({
  filesTourStore,
  filesStore,
  user,
  userId,
  audience,
  isMobileView,
  isDesktop,
  isFrame,
  firstLoad,
  isSectionLoading,
  isFilesRoot,
  isSharedWithMeRoot,
  sharedFolderId,
  personalFolderId,
  canCreate,
  showFilter,
  hasItems,
  sidebarIds,
}: FilesTourProps) => {
  const { t, ready } = useTranslation(["FilesTour", "RoomsTour", "Common"]);

  const isPersonalRoot = isFilesRoot && !isSharedWithMeRoot;
  const standInFolderId = isSharedWithMeRoot
    ? sharedFolderId
    : personalFolderId;

  const reloadSection = useCallback(
    () =>
      filesStore.fetchFiles(
        standInFolderId,
        filesStore.filter,
        true,
        false,
        true,
      ),
    [filesStore, standInFolderId],
  );

  const demoConfig = useMemo(() => {
    if (standInFolderId === null || !user) return null;

    return {
      list: isSharedWithMeRoot ? ("shared" as const) : ("personal" as const),
      folderId: standInFolderId,
      standInForList: true,
      files: buildDemoFileList({
        document: t("Common:Document"),
        spreadsheet: t("Common:Spreadsheet"),
        presentation: t("Common:Presentation"),
      }),
      owner: user,
    };
  }, [isSharedWithMeRoot, standInFolderId, user, t]);

  // The closing step fades the section itself; a tour closed with the cross or
  // Esc never reaches it, so there `fade` is this function's to do.
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
    if (tourDemo.isActive || !demoConfig) return;

    tourDemo.activate(demoConfig);
    reloadSection();
  }, [demoConfig, reloadSection]);

  const demoHooks = useMemo(
    () => ({
      reveal: endDemo,
      restore: restoreDemo,
      navigates: true,
      swapsList: true,
    }),
    [endDemo, restoreDemo],
  );

  const isDemo = tourDemo.isActive;

  // Not read off `tourDemo`: the demo is started in an effect, a render later.
  const needsDemo =
    !hasItems && !!demoConfig && (isSharedWithMeRoot || isPersonalRoot);

  // The render the demo starts on, so the section can be hidden before the
  // empty screen it stands in for is painted.
  const shouldStartDemo =
    filesTourStore.isPending &&
    !filesTourStore.isRunning &&
    !isDemo &&
    !isMobileView &&
    !firstLoad &&
    !isSectionLoading &&
    needsDemo &&
    ready;

  const { isPreparing, runSwap } = useDemoSwap(shouldStartDemo);

  useEffect(() => {
    if (!shouldStartDemo || !demoConfig) return;

    runSwap(() => {
      tourDemo.activate(demoConfig);
      return reloadSection();
    });
  }, [shouldStartDemo, demoConfig, reloadSection, runSwap]);

  const hasStarted = useRef(false);

  useEffect(() => {
    if (filesTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    endDemo({ fade: true });
  }, [filesTourStore.isRunning, endDemo]);

  // The effect above never fires when the section unmounts instead.
  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
    },
    [],
  );

  const flags: TourStepFlags = {
    audience,
    isSharedWithMe: isSharedWithMeRoot,
    isDesktop,
    canCreate,
    showFilter,
    hasItems,
    ...sidebarIds,
    isDemo,
    demoHooks,
  };

  const buildSteps = (callbacks: TourStepCallbacks) =>
    getTourSteps(t, callbacks, flags);

  const { Tour } = useTour(
    filesTourStore,
    buildSteps,
    isMobileView,
    FILES_TOUR_LABEL,
  );

  const isSectionReady =
    !firstLoad &&
    !isSectionLoading &&
    isFilesRoot &&
    !needsDemo &&
    !isPreparing;

  usePendingTour(filesTourStore, isSectionReady, isMobileView);

  if (isFrame || !userId) return null;

  return (
    <>
      {isPreparing ? <TourPreparing /> : null}
      {Tour ? createPortal(Tour, document.body) : null}
    </>
  );
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

    // Anyone can open Shared with me; it is a Files root only for someone with
    // no personal space.
    const isSharedWithMeRoot = !hasMyDocuments && !!isSharedWithMeFolder;
    const isPersonalRoot = isPersonalRoom && isRoot;
    const isFilesRoot =
      !publicRoomStore.isPublicRoom && (isPersonalRoot || isSharedWithMeRoot);

    const asFolderId = (id: unknown) => (typeof id === "number" ? id : null);
    const asItemId = (id: unknown) => (id != null ? String(id) : null);

    // ClientArticleSidebar keys the section item by the My documents folder,
    // falling back to the literal "files" for a guest.
    const sectionId =
      hasMyDocuments && myFolderId != null
        ? String(myFolderId)
        : sharedWithMeId != null
          ? "files"
          : null;

    return {
      filesTourStore,
      filesStore,
      user: userStore?.user,
      userId: userStore?.user?.id,
      audience,
      isMobileView: settingsStore.currentDeviceType === DeviceType.mobile,
      isDesktop: settingsStore.currentDeviceType === DeviceType.desktop,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isSectionLoading: clientLoadingStore.showBodyLoader,
      isFilesRoot,
      isSharedWithMeRoot: isSharedWithMeRoot && !publicRoomStore.isPublicRoom,
      sharedFolderId: asFolderId(sharedWithMeId),
      personalFolderId: asFolderId(myFolderId),
      canCreate: !!myFolder?.security?.Create,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      sidebarIds: {
        sectionId,
        sharedId: asItemId(sharedWithMeId),
        recentId: asItemId(recentFolderId),
        favoritesId: asItemId(favoritesFolderId),
        // The sidebar hides Trash from a guest.
        trashId: hasMyDocuments ? asItemId(recycleBinFolderId) : null,
      },
    };
  },
)(observer(FilesTour));

