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
  FileType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type { TCreatedBy } from "@docspace/shared/types";
import type { UserStore } from "@docspace/shared/store/UserStore";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FilesTourProps = {
  filesTourStore: FilesTourStore;
  filesStore: FilesStore;
  user: UserStore["user"];
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isFilesRoot: boolean;
  isSharedWithMeRoot: boolean;
  sharedFolderId: number | null;
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
  filesStore,
  user,
  userId,
  audience,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isFilesRoot,
  isSharedWithMeRoot,
  sharedFolderId,
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

  // The section's own filter is passed back rather than left to default: it is
  // what says which folder is being listed, and a default one would reload My
  // documents underneath a tour standing in Shared with me.
  const reloadSection = useCallback(
    () =>
      filesStore.fetchFiles(
        sharedFolderId,
        filesStore.filter,
        true,
        false,
        true,
      ),
    [filesStore, sharedFolderId],
  );

  // Hands the section back: the mocks come down and the real (empty) list is
  // fetched again, which is what puts the empty screen up. The closing step
  // does this on purpose, to say what will fill it.
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

  /**
   * Whether the list the tour is about to walk will be stood in for.
   *
   * Read during render rather than off `tourDemo`, because the demo is armed in
   * an effect: on the render where the tour request arrives it is not up yet,
   * and a readiness gate that asked `tourDemo` would call the section ready and
   * start the tour against the empty page the reload is on its way to replace.
   * Its only anchor is the sidebar item, so that is a one-step tour — and one
   * that ends itself the moment the reload re-renders the item underneath it.
   *
   * Only this root: a personal space that is empty still has its banner and its
   * "New" button, which is most of what the tour there is about.
   */
  const willStandIn =
    isSharedWithMeRoot && !hasItems && sharedFolderId !== null && !!user;

  // A guest whose Shared with me is empty has nothing anywhere — no personal
  // space to fall back on — and the section shows them a tour reduced to its
  // one sidebar step, so the list is stood in for while the tour runs. Armed on
  // the pending request, before `usePendingTour` starts anything: the reload
  // has to have landed by the time joyride freezes the step list against the
  // DOM.
  useEffect(() => {
    if (!filesTourStore.isPending || filesTourStore.isRunning) return;
    if (tourDemo.isActive) return;
    if (isMobileView || firstLoad || isSectionLoading) return;
    // The same test as `willStandIn`, plus the narrowing TypeScript needs to
    // hand these two to the config below.
    if (!willStandIn || sharedFolderId === null || !user) return;

    tourDemo.activate({
      // Shared with me is a plain folder, so its list is the ordinary
      // `files/{id}` of the folder itself rather than a list endpoint.
      list: "shared",
      folderId: sharedFolderId,
      // The tour never opens a shared file — that is the editor, a different
      // application — so the stand-in list is the whole of what it borrows, and
      // only ever when the real one came back empty.
      standInForList: true,
      // Three files named after what they are, with the very keys the create
      // tiles are built from, so the demo adds no strings of its own to
      // translate. Each carries a different access level, which is the point of
      // the column the tour stops at.
      files: [
        {
          title: t("Common:Document"),
          fileExst: ".docx",
          fileType: FileType.Document,
          access: ShareAccessRights.Editing,
        },
        {
          title: t("Common:Spreadsheet"),
          fileExst: ".xlsx",
          fileType: FileType.Spreadsheet,
          access: ShareAccessRights.Comment,
        },
        {
          title: t("Common:Presentation"),
          fileExst: ".pptx",
          fileType: FileType.Presentation,
          access: ShareAccessRights.ReadOnly,
        },
      ],
      // Required of every demo, and unused here: nothing in this list belongs
      // to the signed-in user, so the stand-in files name their sharer instead.
      owner: user as unknown as TCreatedBy,
    });

    void reloadSection();
  }, [
    filesTourStore.isPending,
    filesTourStore.isRunning,
    willStandIn,
    isMobileView,
    firstLoad,
    isSectionLoading,
    sharedFolderId,
    user,
    reloadSection,
    t,
  ]);

  // A tour that ends while a step is still up — closed, skipped, its anchor
  // gone — never reaches that step's `after`, so the stand-in files would
  // outlive the tour that put them there. `endDemo` is a no-op when there is
  // nothing to hand back.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (filesTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    endDemo();
  }, [filesTourStore.isRunning, endDemo]);

  // The effect above only fires while this component is around to see the tour
  // stop. Leaving the section takes it down instead — and the interceptors are
  // module state, so they would outlive it and keep answering for a section the
  // user has already walked away from. Whatever mounts next fetches its own
  // list, so there is nothing to reload here.
  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
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
      audience,
      isSharedWithMe: isSharedWithMeRoot,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      sectionId,
      sharedId,
      recentId,
      favoritesId,
      trashId,
      isDemo,
      demoHooks,
    }),
    [
      audience,
      isSharedWithMeRoot,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      sectionId,
      sharedId,
      recentId,
      favoritesId,
      trashId,
      isDemo,
      demoHooks,
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
    // `willStandIn` holds from the render the request arrives on until the
    // stand-in files land (it is `!hasItems` that drops it), so the tour cannot
    // start against the page in between. A stand-in that never lands leaves the
    // request armed for the next visit rather than spending it on a page with
    // nothing to show.
    !firstLoad && !isSectionLoading && isFilesRoot && !willStandIn,
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

    // The guest's Files root. `isSharedWithMeFolder` alone is not it: anyone
    // can open Shared with me from the sidebar, but only for someone without a
    // personal space is it the section the tour belongs to.
    const isSharedWithMeRoot = !hasMyDocuments && !!isSharedWithMeFolder;

    return {
      filesTourStore,
      // The stand-in list is fetched back through this when the tour hands the
      // section over.
      filesStore,
      // Required of every demo config; nothing in a shared list is the user's,
      // so it is the sharer the stand-in files name.
      user: userStore?.user,
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
        ((isPersonalRoom && isRoot) || isSharedWithMeRoot),
      // Which of the two roots it is, which is what picks the step list.
      isSharedWithMeRoot: isSharedWithMeRoot && !publicRoomStore.isPublicRoom,
      // The folder the stand-in files go into. A system folder, so always a
      // number — the demo builds the route it claims out of it.
      sharedFolderId: typeof sharedWithMeId === "number" ? sharedWithMeId : null,
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
