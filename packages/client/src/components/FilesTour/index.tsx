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
import { getBrandName } from "@docspace/shared/constants/brands";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";
import WelcomeTourDialog, {
  type TourFeature,
} from "SRC_DIR/components/Tour/WelcomeTourDialog";

import DocumentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import SharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/icons/16/security.react.svg?url";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FilesTourProps = {
  filesTourStore: FilesTourStore;
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isPersonalRoot: boolean;
  canCreate: boolean;
  showFilter: boolean;
  hasItems: boolean;
  isTableView: boolean;
  myDocumentsId: string | null;
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
  isPersonalRoot,
  canCreate,
  showFilter,
  hasItems,
  isTableView,
  myDocumentsId,
  sharedId,
  recentId,
  favoritesId,
  trashId,
}: FilesTourProps) => {
  const { t } = useTranslation(["FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  useEffect(() => {
    if (userId) filesTourStore.hydrateForUser(userId);
  }, [userId, filesTourStore]);

  const flags = useMemo<TourStepFlags>(
    () => ({
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      isTableView,
      myDocumentsId,
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
      isTableView,
      myDocumentsId,
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

  const features = useMemo<TourFeature[]>(
    () => [
      {
        icon: DocumentsReactSvgUrl,
        title: t("FilesTour:FeatureDocumentsTitle"),
        description: t("FilesTour:FeatureDocuments"),
      },
      {
        icon: SharedReactSvgUrl,
        title: t("FilesTour:FeatureSharingTitle"),
        description: t("FilesTour:FeatureSharing"),
      },
      {
        icon: SearchReactSvgUrl,
        title: t("FilesTour:FeatureOrganizeTitle"),
        description: t("FilesTour:FeatureOrganize"),
      },
      {
        icon: SecurityReactSvgUrl,
        title: t("FilesTour:FeatureSecurityTitle"),
        description: t("FilesTour:FeatureSecurity"),
      },
    ],
    [t],
  );

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
        title={t("FilesTour:TourWelcomeTitle", {
          productName: getBrandName("ProductName"),
        })}
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
      isPersonalRoot:
        isPersonalRoom && isRoot && !publicRoomStore.isPublicRoom,
      canCreate: !!myFolder?.security?.Create,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      isTableView: filesStore.viewAs === "table",
      // Sidebar anchors (ClientArticleSidebar → NavMenu data-item-id). Item
      // ids of tree sections are their folder ids, so they mirror the same
      // gating the sidebar itself applies (Trash is hidden from guests).
      myDocumentsId:
        hasMyDocuments && myFolderId != null ? String(myFolderId) : null,
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
