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

import type FormsTourStore from "SRC_DIR/store/FormsTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import WelcomeTourDialog, {
  type TourFeature,
} from "SRC_DIR/components/Tour/WelcomeTourDialog";

import FormReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.form.react.svg?url";
import FormFillReactSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import TemplateReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.template.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FormsTourProps = {
  formsTourStore: FormsTourStore;
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isFormsRoot: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasForms: boolean;
};

const FormsTour = ({
  formsTourStore,
  userId,
  currentDeviceType,
  isFrame,
  firstLoad,
  isFormsRoot,
  canCreate,
  canUseTemplates,
  showFilter,
  hasForms,
}: FormsTourProps) => {
  const { t } = useTranslation(["FormsTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  useEffect(() => {
    if (userId) formsTourStore.hydrateForUser(userId);
  }, [userId, formsTourStore]);

  const flags = useMemo<TourStepFlags>(
    () => ({ isDesktop, canCreate, canUseTemplates, showFilter, hasForms }),
    [isDesktop, canCreate, canUseTemplates, showFilter, hasForms],
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

  const features = useMemo<TourFeature[]>(
    () => [
      {
        icon: FormReactSvgUrl,
        title: t("FormsTour:FeatureFormsTitle"),
        description: t("FormsTour:FeatureForms"),
      },
      {
        icon: FormFillReactSvgUrl,
        title: t("FormsTour:FeatureCollectTitle"),
        description: t("FormsTour:FeatureCollect"),
      },
      {
        icon: TemplateReactSvgUrl,
        title: t("FormsTour:FeatureGalleryTitle"),
        description: t("FormsTour:FeatureGallery"),
      },
      {
        icon: DownloadReactSvgUrl,
        title: t("FormsTour:FeatureExportTitle"),
        description: t("FormsTour:FeatureExport"),
      },
    ],
    [t],
  );

  if (isFrame || !userId) return null;

  const welcomeVisible =
    !firstLoad &&
    isFormsRoot &&
    formsTourStore.isHydrated &&
    !formsTourStore.tourCompleted &&
    !formsTourStore.isRunning;

  const onStart = () => {
    if (isMobileView) {
      formsTourStore.completeTour();
      return;
    }
    formsTourStore.startTour();
  };

  const onSkip = () => {
    formsTourStore.completeTour();
  };

  return (
    <>
      <WelcomeTourDialog
        visible={welcomeVisible}
        title={t("FormsTour:FormsWelcomeTitle")}
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
    formsTourStore,
  }: TStore) => {
    const { roomsFolder, isFormsFolder, isRoot } = treeFoldersStore;

    const { isAdmin, isRoomAdmin } = authStore;

    return {
      formsTourStore,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      isFormsRoot: isFormsFolder && isRoot && !publicRoomStore.isPublicRoom,
      // Same gate as the rooms creation banner / sidebar Templates item.
      canCreate: (isAdmin || isRoomAdmin) && !!roomsFolder,
      canUseTemplates: isAdmin || isRoomAdmin,
      showFilter: !filesStore.isEmptyPage,
      // The Forms sidebar item is shown whenever Rooms exists (it surfaces
      // Form Filling Rooms via searchArea=Forms).
      hasForms: !!roomsFolder,
    };
  },
)(observer(FormsTour));
