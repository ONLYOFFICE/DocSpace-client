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

import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";

import type FormsTourStore from "SRC_DIR/store/FormsTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import { getTourAudience } from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";

import type { TCreatedBy } from "@docspace/shared/types";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type FormsTourProps = {
  formsTourStore: FormsTourStore;
  filesStore: FilesStore;
  user: UserStore["user"];
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isFormsRoot: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  hasForms: boolean;
};

const FormsTour = ({
  formsTourStore,
  filesStore,
  user,
  userId,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isFormsRoot,
  canCreate,
  canUseTemplates,
  showFilter,
  hasItems,
  hasForms,
}: FormsTourProps) => {
  const { t } = useTranslation(["FormsTour", "FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  // Where the tour was standing when it walked into a space, so it can put the
  // user back exactly there rather than reconstruct the section's URL — the
  // filter in it is the one they arrived with.
  const sectionLocation = useRef<string | null>(null);

  /**
   * Walks into the stand-in space, the way clicking its row would.
   *
   * The space is taken from the demo rather than from the list: the list may
   * be the user's own, and it is the one part of the section that changes
   * underfoot while the tour navigates in and out.
   *
   * The navigation is built here rather than through `openItemAction`: that
   * routes by `getCategoryTypeByFolderType(rootFolderType, id)`, which reads a
   * negative id as "not a room" and would send the tour back to the section
   * root. Everything else about the trip is ordinary — the route fetches
   * `/files/{id}`, which the demo answers.
   */
  const enterSpace = useCallback(() => {
    if (sectionLocation.current) return;

    const space = tourDemo.space;
    if (!space) return;

    sectionLocation.current = `${window.location.pathname}${window.location.search}`;

    const filter = FilesFilter.getDefault();
    filter.folder = String(space.id);

    window.DocSpace?.navigate(
      `${getCategoryUrl(CategoryType.Form, space.id)}?${filter.toUrlParams()}`,
      {
        state: {
          title: space.title,
          isRoot: false,
          rootFolderType: space.rootFolderType,
        },
      },
    );
  }, []);

  /** Puts the tour back at the section root. A no-op if it never left. */
  const leaveSpace = useCallback(() => {
    const previous = sectionLocation.current;
    if (!previous) return;
    sectionLocation.current = null;

    window.DocSpace?.navigate(previous);
  }, []);

  const spaceHooks = useMemo(
    // `restore` is deliberately empty: the way out belongs to the steps that
    // need the section root, so walking between the in-room steps does not
    // navigate out and straight back in again. `navigates` buys the anchor the
    // longer wait a route change needs — the room has to be fetched and
    // rendered before any row inside it exists to point at.
    () => ({ reveal: enterSpace, restore: () => {}, navigates: true }),
    [enterSpace],
  );

  // The section's own filter is passed back rather than left to default: it is
  // what carries `searchArea=Forms`, and a default filter would reload the
  // Rooms listing underneath a tour that is standing in the Forms section.
  const reloadSection = useCallback(
    () =>
      filesStore.fetchRooms(null, filesStore.roomsFilter, true, false, true),
    [filesStore],
  );

  // Hands the section back: the mocks come down, the tour steps out of the
  // stand-in space if it is still in one, and the real (empty) list is fetched
  // again — which is what puts the empty screen up. The closing step does this
  // on purpose, to point at the button that lives there.
  //
  // The order matters. `leaveSpace` navigates, and a navigation starts a
  // section load of its own; anything still in flight while the interceptors
  // are up is answered by them. Dropping the mocks first means every request
  // from here on — the navigation's included — goes to the server, so the
  // stand-in rooms cannot come back after the reload that was meant to
  // replace them.
  const endDemo = useCallback(async () => {
    if (!tourDemo.isActive) {
      leaveSpace();
      return;
    }

    // Only a section that was stood in for has anything to fetch back; when
    // the list was the user's own all along, dropping the mocks is enough.
    const wasStandingIn = tourDemo.isStandingInForList;
    tourDemo.deactivate();

    leaveSpace();

    // Awaited so the reload settles after the navigation's own load rather
    // than alongside it — both now hit the server, and this one is the answer
    // the section is left showing.
    if (wasStandingIn) await reloadSection();
  }, [leaveSpace, reloadSection]);

  const demoHooks = useMemo(
    // Nothing to restore afterwards: the section is already the user's own
    // again by the time this step is done with it. `reveal` is sync by
    // contract and the step's own `waitForElement` is what waits for the empty
    // screen the reload brings up, so the promise is left to settle on its own.
    () => ({
      reveal: () => {
        void endDemo();
      },
      restore: () => {},
      // Steps out of the space and refetches the section, so the empty screen
      // this step points at is the far side of a route change and a request.
      navigates: true,
    }),
    [endDemo],
  );

  /**
   * The tour always has a stand-in space to walk into, and stands in for the
   * whole list when there is nothing in it.
   *
   * The space is the part the tour cannot borrow: a real one grows its
   * `In progress` and `Complete` folders only once a form has been uploaded
   * and started, so walking the user's own space would show a different room
   * to everybody and an empty one to the people this tour is for.
   *
   * The list is a different matter — that one is only replaced when it came
   * back empty, so a portal with collections of its own keeps them.
   *
   * Armed on the pending request, before `usePendingTour` starts anything: the
   * reload has to have landed by the time joyride freezes the step list
   * against the DOM.
   */
  useEffect(() => {
    if (!formsTourStore.isPending || formsTourStore.isRunning) return;
    if (tourDemo.isActive) return;
    if (isMobileView || firstLoad || isSectionLoading || !isFormsRoot) return;
    if (!user) return;

    // Standing in for the list is only for someone who can act on what it
    // shows: the closing step it brings with it points at a "create" button
    // that anyone else does not have.
    const standInForList = !hasItems && canCreate;

    tourDemo.activate({
      standInForList,
      // Three collections anybody recognizes, so the list reads as what the
      // section is for at a glance. Unlike the rooms tour — where each room is
      // named after its own type and the names already exist — a form space
      // has no name of its own to borrow, so these are the tour's own strings.
      rooms: [
        {
          roomType: RoomsType.FormRoom,
          title: t("FormsTour:FormsDemoOnboarding"),
        },
        {
          roomType: RoomsType.FormRoom,
          title: t("FormsTour:FormsDemoTimeOff"),
        },
        {
          roomType: RoomsType.FormRoom,
          title: t("FormsTour:FormsDemoFeedback"),
        },
      ],
      owner: user as unknown as TCreatedBy,
      // The people a collection is run for, for anything that asks a stand-in
      // space who is in it.
      memberAccess: [
        ShareAccessRights.FormFilling,
        ShareAccessRights.FormFilling,
      ],
      // The two system folders the tour walks the user through inside a space,
      // named by the labels the product already uses for them.
      contents: {
        inProgressTitle: t("Common:InProgress"),
        completeTitle: t("Common:Complete"),
      },
    });

    if (standInForList) void reloadSection();
  }, [
    formsTourStore.isPending,
    formsTourStore.isRunning,
    hasItems,
    isMobileView,
    firstLoad,
    isSectionLoading,
    isFormsRoot,
    user,
    canCreate,
    reloadSection,
    t,
  ]);

  // A tour that ends while a step is still up — closed, skipped, its anchor
  // gone — never reaches that step's `after`, so the user would be left
  // standing inside a stand-in space and the mocks would outlive the tour that
  // put them there. `endDemo` steps out of the space itself, and is a no-op
  // when there is nothing to hand back.
  const hasStarted = useRef(false);

  // `endDemo` is rebuilt whenever the stores hand back new callbacks, and this
  // effect must not re-run when that happens — it would hand the section back a
  // second time. Only the running flag decides when it fires; the ref keeps the
  // current implementation reachable from inside.
  const endDemoRef = useRef(endDemo);
  endDemoRef.current = endDemo;

  useEffect(() => {
    if (formsTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    void endDemoRef.current();
  }, [formsTourStore.isRunning]);

  // The effect above only fires while this component is around to see the tour
  // stop. Leaving the section takes it down instead — and the interceptors are
  // module state, so they would outlive it and keep answering for a section the
  // user has already walked away from.
  //
  // Unmounting is the one path that cannot navigate or reload its way out:
  // there is no section on screen any more, and whatever mounts next fetches
  // its own list. Dropping the mocks is both all that is possible here and all
  // that is needed.
  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
    },
    [],
  );

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      hasForms,
      isDemo: tourDemo.isActive,
      isStandIn: tourDemo.isStandingInForList,
      spaceHooks,
      demoHooks,
      leaveSpace,
    }),
    [
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      hasForms,
      spaceHooks,
      demoHooks,
      leaveSpace,
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
    !firstLoad &&
      !isSectionLoading &&
      isFormsRoot &&
      // With the list stood in for, "ready" also means the stand-in spaces have
      // actually landed. Without this the reload above and the start timer
      // race, and joyride can freeze its step list against the empty page the
      // reload is on its way to replace.
      (!tourDemo.isStandingInForList || hasItems),
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

    const isAdminAudience = getTourAudience(userStore?.user) === "admin";

    return {
      formsTourStore,
      // The tour reads the list off this to know which space to walk into, and
      // reloads the section through it when it hands the stand-in back.
      filesStore,
      // The stand-in spaces are owned by the user themselves — the less of the
      // section is invented, the less of it can be wrong.
      user: userStore?.user,
      userId: userStore?.user?.id,
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
      // The Forms sidebar item is shown whenever Rooms exists (it surfaces
      // Form Filling Rooms via searchArea=Forms).
      hasForms: !!roomsFolder,
    };
  },
)(observer(FormsTour));
