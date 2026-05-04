// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use no memo";
"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useJoyride, EVENTS, STATUS, ACTIONS } from "react-joyride";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";
import { useFormsTourStore } from "../_store/FormsTourStore";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
import { useFormsListStore } from "../_store/FormsListStore";
import { getTourSteps, type TourStepData, type TourStepCallbacks, type TourStepFlags } from "../_utils/tourSteps";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsUserStore } from "../_store/FormsUserStore";
import { createMockFormFolders, createMockCompletedFiles } from "../_utils/mockFormFiles";
import { appendRoomParams, formsQuerySuffix } from "../_utils/formsUrl";
import TourTooltip from "../_components/tour-tooltip";

export default function useFormsTour(showMenu = true) {
  const { isBase } = useTheme();
  const tourStore = useFormsTourStore();
  const navStore = useFormsNavigationStore();
  const formsListStore = useFormsListStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { user } = useFormsUserStore();
  const router = useRouter();
  const { currentDeviceType } = useDeviceType();
  const isMobile = currentDeviceType === DeviceType.mobile;
  const isTablet = currentDeviceType === DeviceType.tablet;
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { t } = useTranslation(["Common"]);

  const stepAbortRef = useRef<AbortController | null>(null);
  const freshStepSignal = () => {
    stepAbortRef.current?.abort();
    const ctrl = new AbortController();
    stepAbortRef.current = ctrl;
    return ctrl.signal;
  };
  const currentSignalRef = useRef<AbortSignal | undefined>(undefined);

  const navigateWithParams = (path: string) => {
    router.replace(appendRoomParams(path, searchParamsRef.current));
  };

  const tourCallbacks = useMemo<TourStepCallbacks>(
    () => ({
      openCompletedFolder: () => {
        if (!navStore.completedFolder && tourStore.isDemo) {
          const folders = createMockFormFolders();
          if (folders[0]) {
            navStore.openCompletedFolder(folders[0]);
            formsListStore.setFolders([]);
            formsListStore.setItems(
              createMockCompletedFiles(folders[0].title),
              5,
            );
            formsListStore.setIsLoading(false);
          }
        }
      },
      getSignal: () => currentSignalRef.current,
    }),
    [navStore, tourStore, formsListStore],
  );

  const canCreate = !!formsSettingsStore.folderSecurity?.Create;
  const showLibrary =
    formsSettingsStore.hasLibrary && canCreate;
  const showSettings = !!(user?.isOwner || user?.isAdmin);

  const tourFlags = useMemo<TourStepFlags>(
    () => ({ canCreate, showLibrary, showSettings, showMenu, isTouch: isTablet }),
    [canCreate, showLibrary, showSettings, showMenu, isTablet],
  );

  const steps = useMemo(
    () => getTourSteps(t, tourCallbacks, tourFlags),
    [t, tourCallbacks, tourFlags],
  );

  const { controls, on, state, Tour } = useJoyride({
    continuous: true,
    steps,
    run: isMobile ? false : tourStore.isRunning,
    scrollToFirstStep: false,
    tooltipComponent: TourTooltip,
    options: {
      arrowColor: isBase ? globalColors.white : globalColors.black,
      arrowBase: 18,
      arrowSize: 8,
      overlayColor: "rgba(0, 0, 0, 0.5)",
      overlayClickAction: "close",
      blockTargetInteraction: true,
      skipScroll: true,
      zIndex: 10000,
      beforeTimeout: 15000,
      targetWaitTimeout: 15000,
    },
    locale: {
      back: t("Common:Back"),
      close: t("Common:CloseButton"),
      last: t("Common:Done"),
      next: t("Common:Next"),
      skip: t("Common:Skip"),
    },
  });

  useEffect(() => {
    if (isMobile && tourStore.isRunning) {
      tourStore.completeTour();
    }
  }, [isMobile, tourStore]);

  useEffect(() => {
    if (!tourStore.isRunning) return;

    const qs_suffix = formsQuerySuffix(searchParamsRef.current);

    const routes: string[] = [
      `/forms/my-forms${qs_suffix}`,
      `/forms/in-progress${qs_suffix}`,
      `/forms/completed-forms${qs_suffix}`,
    ];

    if (showLibrary) routes.push(`/forms/library${qs_suffix}`);

    if (showSettings) {
      routes.push(
        `/forms/settings/billing${qs_suffix}`,
        `/forms/settings/ai-agent${qs_suffix}`,
        `/forms/settings/access${qs_suffix}`,
        `/forms/settings/collect-data${qs_suffix}`,
      );
    }

    for (const route of routes) {
      router.prefetch(route);
    }
  }, [tourStore.isRunning, showLibrary, showSettings, router]);

  useEffect(() => {
    if (!tourStore.isRunning) {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
    }
  }, [tourStore.isRunning]);

  useEffect(() => {
    return () => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    const dismissContextMenu = () => {
      document.body.click();
    };

    const isContextMenuStep = (target: unknown) =>
      typeof target === "string" && target.startsWith("#option_");

    const isPlusMenuStep = (target: unknown) =>
      typeof target === "string" &&
      (target === "#upload-forms" ||
        target === "#create-blank-form" ||
        target === '[data-testid="plus-button"]');

    const unsubBeforeHook = on(EVENTS.STEP_BEFORE_HOOK, (data) => {
      currentSignalRef.current = freshStepSignal();

      const stepData = data.step.data as TourStepData | undefined;
      const targetPage = stepData?.page;

      if (
        !isContextMenuStep(data.step.target) &&
        !isPlusMenuStep(data.step.target)
      ) {
        dismissContextMenu();
      }

      if (navStore.completedFolder && !stepData?.openCompletedFolder) {
        navStore.goBackToCompletedRoot();
      }

      const currentPathname = pathnameRef.current;
      if (targetPage && !currentPathname.startsWith(targetPage)) {
        navigateWithParams(targetPage);
      }
    });

    const unsubAfter = on(EVENTS.STEP_AFTER, (data) => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;

      if (data.action === ACTIONS.CLOSE) {
        dismissContextMenu();
        tourStore.completeTour();
        navigateWithParams("/forms/my-forms");
      }
    });

    const unsubEnd = on(EVENTS.TOUR_END, () => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
      dismissContextMenu();
      tourStore.completeTour();
      navigateWithParams("/forms/my-forms");
    });

    const unsubStatus = on(EVENTS.TOUR_STATUS, (data) => {
      if (data.status === STATUS.SKIPPED) {
        stepAbortRef.current?.abort();
        stepAbortRef.current = null;
        currentSignalRef.current = undefined;
        dismissContextMenu();
        tourStore.completeTour();
        navigateWithParams("/forms/my-forms");
      }
    });

    const unsubTargetNotFound = on(EVENTS.TARGET_NOT_FOUND, (data) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "[forms tour] target not found, ending tour:",
          data.step?.target,
        );
      }
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
      tourStore.completeTour();
      navigateWithParams("/forms/my-forms");
    });

    return () => {
      unsubBeforeHook();
      unsubAfter();
      unsubEnd();
      unsubStatus();
      unsubTargetNotFound();
    };
  }, [on, tourStore, navStore]);

  return { Tour: isMobile ? null : Tour, controls, state };
}
