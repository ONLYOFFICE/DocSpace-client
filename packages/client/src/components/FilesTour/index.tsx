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

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";

import type { TourStepFlags } from "./tourSteps";
import useFilesTour from "./useFilesTour";
import WelcomeTourDialog from "./WelcomeTourDialog";

type FilesTourProps = {
  filesTourStore: FilesTourStore;
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isPersonalRoot: boolean;
  canCreate: boolean;
  showFilter: boolean;
  myDocumentsId: string | null;
  quickAccessId: string | null;
};

const FilesTour = ({
  filesTourStore,
  userId,
  currentDeviceType,
  isFrame,
  firstLoad,
  isPersonalRoot,
  canCreate,
  showFilter,
  myDocumentsId,
  quickAccessId,
}: FilesTourProps) => {
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  useEffect(() => {
    if (userId) filesTourStore.hydrateForUser(userId);
  }, [userId, filesTourStore]);

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      showFilter,
      myDocumentsId,
      quickAccessId,
    }),
    [isDesktop, canCreate, showFilter, myDocumentsId, quickAccessId],
  );

  const { Tour } = useFilesTour(filesTourStore, flags, isMobileView);

  if (isFrame || !userId) return null;

  const welcomeVisible =
    !firstLoad &&
    isPersonalRoot &&
    filesTourStore.isHydrated &&
    !filesTourStore.tourCompleted &&
    !filesTourStore.isRunning;

  const onStart = () => {
    if (isMobileView) {
      filesTourStore.completeTour();
      return;
    }
    filesTourStore.startTour();
  };

  const onSkip = () => {
    filesTourStore.completeTour();
  };

  return (
    <>
      <WelcomeTourDialog
        visible={welcomeVisible}
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
    userStore,
    settingsStore,
    filesStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    filesTourStore,
  }: TStore) => {
    const { myFolder, myFolderId, recentFolderId, isPersonalRoom, isRoot } =
      treeFoldersStore;

    const isVisitor = userStore?.user?.isVisitor;
    const hasMyDocuments = !!myFolder && !isVisitor;

    return {
      filesTourStore,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isPersonalRoot:
        isPersonalRoom && isRoot && !publicRoomStore.isPublicRoom,
      canCreate: !!myFolder?.security?.Create,
      showFilter: !filesStore.isEmptyPage,
      // Sidebar anchors (ClientArticleSidebar → NavMenu data-item-id). Item
      // ids of tree sections are their folder ids.
      myDocumentsId:
        hasMyDocuments && myFolderId != null ? String(myFolderId) : null,
      quickAccessId: recentFolderId != null ? String(recentFolderId) : null,
    };
  },
)(observer(FilesTour));
