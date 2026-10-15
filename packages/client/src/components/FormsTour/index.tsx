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
import { runInAction } from "mobx";
import { useTranslation } from "react-i18next";

import {
  DeviceType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import FilesFilter from "@docspace/shared/api/files/filter";
import { getFolder } from "@docspace/shared/api/files";
import { CategoryType } from "@docspace/shared/constants";

import type FormsTourStore from "SRC_DIR/store/FormsTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import { FORMS_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import useDemoSwap from "SRC_DIR/components/Tour/useDemoSwap";
import { getTourAudience } from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";
import {
  fadeSectionIn,
  fadeSectionOut,
} from "SRC_DIR/components/Tour/sectionFade";
import {
  DEMO_SPACE_ITEM_IDS,
  withDemoFormLaunched,
  type TourDemoConfig,
} from "SRC_DIR/api/tourDemo/data";

import type { TCreatedBy } from "@docspace/shared/types";

import {
  getTourSteps,
  FIRST_ITEM_SELECTOR,
  type TourStepFlags,
} from "./tourSteps";

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
  const { t, ready } = useTranslation(["FormsTour", "FilesTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  // Where the tour was standing when it walked into a space, so it can put the
  // user back exactly there rather than reconstruct the section's URL — the
  // filter in it is the one they arrived with.
  const sectionLocation = useRef<string | null>(null);

  type OwnSpace = {
    id: number;
    title: string;
    rootFolderType?: FolderType;
    items: { form: number; inProgress: number; complete: number };
  };
  const [ownSpace, setOwnSpace] = useState<OwnSpace | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!formsTourStore.isPending || formsTourStore.isRunning) return;
    if (ownSpace !== undefined) return;
    if (firstLoad || isSectionLoading || !isFormsRoot) return;

    const space = filesStore.filesList?.[0] as
      | {
          id: number;
          title: string;
          rootFolderType?: FolderType;
          isRoom?: boolean;
        }
      | undefined;
    if (!hasItems || !space?.isRoom) {
      setOwnSpace(null);
      return;
    }

    let cancelled = false;
    getFolder(space.id, FilesFilter.getDefault())
      .then(({ files, folders }) => {
        if (cancelled) return;
        const form = files.find((file) => file.fileExst === ".pdf");
        const inProgress = folders.find(
          (folder) => folder.type === FolderType.InProgress,
        );
        const complete = folders.find(
          (folder) => folder.type === FolderType.Done,
        );
        setOwnSpace(
          form && inProgress && complete
            ? {
                id: space.id,
                title: space.title,
                rootFolderType: space.rootFolderType,
                items: {
                  form: form.id as number,
                  inProgress: inProgress.id as number,
                  complete: complete.id as number,
                },
              }
            : null,
        );
      })
      .catch(() => {
        if (!cancelled) setOwnSpace(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    formsTourStore.isPending,
    formsTourStore.isRunning,
    ownSpace,
    firstLoad,
    isSectionLoading,
    isFormsRoot,
    hasItems,
    filesStore,
  ]);

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
   *
   * That the demo is what answers it is also the limit of the trip: the url the
   * tour navigates to (`/forms/-1000?…`) only resolves while the mocks are up.
   * Reloading the page while standing inside a stand-in space asks the server
   * about a room it has never heard of, and the section shows "room not
   * available" — a dead end the user leaves by clicking the section in the
   * sidebar. Nothing guards against it because nothing sensibly can: a reload
   * is a fresh application with no tour running, and the alternative — teaching
   * the router that some negative ids are pretend — would spread the demo into
   * code that has no other reason to know about it. The tour itself always
   * leaves the same way it came in (`leaveSpace`), on every path that ends it.
   */
  const enterSpace = useCallback(() => {
    if (sectionLocation.current) return;

    const space = ownSpace ?? tourDemo.space;
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
  }, [ownSpace]);

  /** Puts the tour back at the section root. A no-op if it never left. */
  const leaveSpace = useCallback(() => {
    const previous = sectionLocation.current;
    if (!previous) return;
    sectionLocation.current = null;

    window.DocSpace?.navigate(previous, { replace: true });
  }, []);

  const spaceHooks = useMemo(
    // `restore` is deliberately empty: the way out belongs to the steps that
    // need the section root, so walking between the in-room steps does not
    // navigate out and straight back in again. `navigates` buys the anchor the
    // longer wait a route change needs — the room has to be fetched and
    // rendered before any row inside it exists to point at.
    () => ({
      reveal: enterSpace,
      restore: () => {},
      navigates: true,
      // Walked back into from the closing step: the list is on its way back.
      awaitBefore: FIRST_ITEM_SELECTOR,
    }),
    [enterSpace],
  );

  // The launch the tour cannot do for real, faked on the loaded row.
  const spaceItemIds = ownSpace?.items ?? DEMO_SPACE_ITEM_IDS;
  const setFormLaunched = useCallback(
    (launched: boolean) => {
      const form = filesStore.files.find(
        (file) => file.id === spaceItemIds.form,
      );
      if (!form || !!form.startFilling === launched) return;

      runInAction(() => {
        Object.assign(form, withDemoFormLaunched(form, launched));
      });
    },
    [filesStore, spaceItemIds],
  );

  const launchHooks = useMemo(
    () => ({
      reveal: () => setFormLaunched(true),
      restore: () => setFormLaunched(false),
    }),
    [setFormLaunched],
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
  const endDemo = useCallback(
    async ({ fade = false } = {}) => {
      const swaps =
        tourDemo.isStandingInForList || sectionLocation.current !== null;
      if (fade && swaps) await fadeSectionOut();

      try {
        if (!tourDemo.isActive) {
          leaveSpace();
          return;
        }

        const wasStandingIn = tourDemo.isStandingInForList;
        tourDemo.deactivate();
        leaveSpace();
        if (wasStandingIn) await reloadSection();
      } finally {
        if (fade && swaps) fadeSectionIn();
      }
    },
    [leaveSpace, reloadSection],
  );

  // Shared by the arming effect and the closing step's `restore`.
  const demoConfig = useMemo<TourDemoConfig>(
    () => ({
      list: "rooms",
      standInForList: !hasItems,
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
      memberAccess: [
        ShareAccessRights.FormFilling,
        ShareAccessRights.FormFilling,
      ],
      contents: {
        inProgressTitle: t("Common:InProgress"),
        completeTitle: t("Common:Complete"),
      },
    }),
    [t, user, hasItems],
  );

  // Walked back out of the closing step: the stand-in list comes back.
  const restoreDemo = useCallback(() => {
    if (tourDemo.isActive || !user) return;
    tourDemo.activate(demoConfig);
    void reloadSection();
  }, [demoConfig, reloadSection, user]);

  const demoHooks = useMemo(
    () => ({
      reveal: () => {
        void endDemo();
      },
      restore: restoreDemo,
      swapsList: true,
      navigates: true,
    }),
    [endDemo, restoreDemo],
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
  // Armed whatever the list holds: the stand-in space is built off the list
  // response either way. The section is hidden only while an empty list is
  // being replaced.
  const shouldArmDemo =
    formsTourStore.isPending &&
    !formsTourStore.isRunning &&
    !tourDemo.isActive &&
    !isMobileView &&
    !firstLoad &&
    !isSectionLoading &&
    isFormsRoot &&
    !!user &&
    ready;

  const { isPreparing, runSwap } = useDemoSwap(shouldArmDemo && !hasItems);

  useEffect(() => {
    if (!shouldArmDemo) return;

    const arm = () => {
      tourDemo.activate(demoConfig);
      return reloadSection();
    };

    if (hasItems) {
      void arm();
    } else {
      runSwap(arm);
    }
  }, [shouldArmDemo, hasItems, demoConfig, reloadSection, runSwap]);

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

    void endDemoRef.current({ fade: true });
    setOwnSpace(undefined);
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

  // Read in the render body rather than inside the memo, for two reasons that
  // are really the same one: a value only `useMemo` reads is a value `observer`
  // does not track, so the component would stop re-rendering when the demo is
  // armed — and a value missing from the deps is one a cached memo never picks
  // up even if it did. This tour arms its demo whatever the section holds
  // (unlike the other three, which only do it on an empty one), so on a portal
  // that already has form spaces there is no `hasItems` flip to recompute the
  // memo behind them, and every step inside the stand-in space would be dropped.
  const isDemo = tourDemo.isActive;
  const isStandIn = tourDemo.isStandingInForList;

  const flags = useMemo<TourStepFlags>(
    () => ({
      isDesktop,
      canCreate,
      canUseTemplates,
      showFilter,
      hasItems,
      hasForms,
      isDemo: isDemo || !!ownSpace,
      isStandIn,
      usesStandInSpace: !ownSpace,
      spaceItemIds,
      spaceHooks,
      launchHooks,
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
      isDemo,
      isStandIn,
      ownSpace,
      spaceItemIds,
      spaceHooks,
      launchHooks,
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
    FORMS_TOUR_LABEL,
  );

  usePendingTour(
    formsTourStore,
    !firstLoad &&
      !isSectionLoading &&
      isFormsRoot &&
      ownSpace !== undefined &&
      !isPreparing &&
      // With the list stood in for, "ready" also means the stand-in spaces have
      // actually landed. Without this the reload above and the start timer
      // race, and joyride can freeze its step list against the empty page the
      // reload is on its way to replace.
      (!isStandIn || hasItems),
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
