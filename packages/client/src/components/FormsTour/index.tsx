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

import type FormsTourStore from "SRC_DIR/store/FormsTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FormsTourProps = {
  formsTourStore: FormsTourStore;
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isFormsRoot: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  isTableView: boolean;
  hasForms: boolean;
};

const FormsTour = ({
  formsTourStore,
  userId,
  audience,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isFormsRoot,
  canCreate,
  canUseTemplates,
  showFilter,
  hasItems,
  isTableView,
  hasForms,
}: FormsTourProps) => {
  const { t } = useTranslation(["FormsTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  const flags = useMemo<TourStepFlags>(
    () => ({
      audience,
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      isTableView,
      hasForms,
    }),
    [
      audience,
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      isTableView,
      hasForms,
    ],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) => getTourSteps(t, callbacks, flags),
    [t, flags],
  );

  const { Tour } = useTour(
    formsTourStore,
    buildSteps,
    isMobileView,
    "forms tour",
  );

  usePendingTour(
    formsTourStore,
    !firstLoad && !isSectionLoading && isFormsRoot,
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
    formsTourStore,
  }: TStore) => {
    const { roomsFolder, isFormsFolder, isRoot } = treeFoldersStore;

    const audience = getTourAudience(userStore?.user);
    const isAdminAudience = audience === "admin";

    return {
      formsTourStore,
      userId: userStore?.user?.id,
      audience,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      // Nothing in the section is behind a loader any more, so the anchors the
      // steps point at are the ones actually on screen.
      isSectionLoading: clientLoadingStore.showBodyLoader,
      isFormsRoot: isFormsFolder && isRoot && !publicRoomStore.isPublicRoom,
      // Same gate as the rooms creation banner / sidebar Templates item.
      canCreate: isAdminAudience && !!roomsFolder,
      canUseTemplates: isAdminAudience,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      isTableView: filesStore.viewAs === "table",
      // The Forms sidebar item is shown whenever Rooms exists (it surfaces
      // Form Filling Rooms via searchArea=Forms).
      hasForms: !!roomsFolder,
    };
  },
)(observer(FormsTour));
