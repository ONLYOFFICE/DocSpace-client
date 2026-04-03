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

"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useJoyride, EVENTS, STATUS, ACTIONS } from "react-joyride";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import { useFormsTourStore } from "../_store/FormsTourStore";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
import { useFormsListStore } from "../_store/FormsListStore";
import { getTourSteps, type TourStepData, type TourStepCallbacks, type TourStepFlags } from "../_utils/tourSteps";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsUserStore } from "../_store/FormsUserStore";
import { createMockFormFolders, createMockCompletedFiles } from "../_utils/mockFormFiles";
import TourTooltip from "../_components/tour-tooltip";

export default function useFormsTour() {
  const tourStore = useFormsTourStore();
  const navStore = useFormsNavigationStore();
  const formsListStore = useFormsListStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { user } = useFormsUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { t } = useTranslation(["Common"]);

  const tourCallbacks = useMemo<TourStepCallbacks>(
    () => ({
      navigate: (path: string) => {
        const currentPathname = pathnameRef.current;
        if (currentPathname.startsWith(path)) return;
        const sp = searchParamsRef.current;
        const params = new URLSearchParams();
        const rid = sp.get("roomId") ?? "";
        const lid = sp.get("libraryId") ?? "";
        if (rid) params.set("roomId", rid);
        if (lid) params.set("libraryId", lid);
        const qs = params.toString();
        router.replace(`${path}${qs ? `?${qs}` : ""}`);
      },
      openCompletedFolder: () => {
        if (!navStore.completedFolder && tourStore.showMockItems) {
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
    }),
    [navStore, tourStore, formsListStore, router],
  );

  const canCreate = !!formsSettingsStore.folderSecurity?.Create;
  const showLibrary =
    formsSettingsStore.hasLibrary && canCreate;
  const showSettings = !!(user?.isOwner || user?.isAdmin);

  const tourFlags = useMemo<TourStepFlags>(
    () => ({ canCreate, showLibrary, showSettings }),
    [canCreate, showLibrary, showSettings],
  );

  const steps = useMemo(
    () => getTourSteps(t, tourCallbacks, tourFlags),
    [t, tourCallbacks, tourFlags],
  );

  const { controls, on, state, Tour } = useJoyride({
    continuous: true,
    steps,
    stepIndex: tourStore.stepIndex,
    run: tourStore.isRunning,
    scrollToFirstStep: true,
    tooltipComponent: TourTooltip,
    options: {
      arrowColor: globalColors.black,
      arrowBase: 18,
      arrowSize: 8,
      overlayColor: "rgba(0, 0, 0, 0.5)",
      overlayClickAction: "close",
      zIndex: 10000,
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

    const unsubBefore = on(EVENTS.STEP_BEFORE, (data) => {
      const stepData = data.step.data as TourStepData | undefined;
      const targetPage = stepData?.page;

      // Close menus when leaving menu steps
      if (!isContextMenuStep(data.step.target) && !isPlusMenuStep(data.step.target)) {
        dismissContextMenu();
      }

      // Close completed folder when leaving that step
      if (navStore.completedFolder && !stepData?.openCompletedFolder) {
        navStore.goBackToCompletedRoot();
      }

      const currentPathname = pathnameRef.current;
      if (targetPage && !currentPathname.startsWith(targetPage)) {
        const sp = searchParamsRef.current;
        const params = new URLSearchParams();
        const rid = sp.get("roomId") ?? "";
        const lid = sp.get("libraryId") ?? "";
        if (rid) params.set("roomId", rid);
        if (lid) params.set("libraryId", lid);
        const qs = params.toString();
        router.replace(`${targetPage}${qs ? `?${qs}` : ""}`);
      }
    });

    const unsubAfter = on(EVENTS.STEP_AFTER, (data) => {
      if (data.action === ACTIONS.CLOSE) {
        dismissContextMenu();
        tourStore.completeTour();
        tourCallbacks.navigate("/forms/my-forms");
        return;
      }
      const nextIndex =
        data.index + (data.action === ACTIONS.PREV ? -1 : 1);
      tourStore.setStepIndex(nextIndex);
    });

    const unsubEnd = on(EVENTS.TOUR_END, () => {
      dismissContextMenu();
      tourStore.completeTour();
      tourCallbacks.navigate("/forms/my-forms");
    });

    const unsubStatus = on(EVENTS.TOUR_STATUS, (data) => {
      if (data.status === STATUS.SKIPPED) {
        dismissContextMenu();
        tourStore.completeTour();
        tourCallbacks.navigate("/forms/my-forms");
      }
    });

    return () => {
      unsubBefore();
      unsubAfter();
      unsubEnd();
      unsubStatus();
    };
  }, [on, router, tourStore, navStore, tourCallbacks]);

  return { Tour, controls, state };
}
