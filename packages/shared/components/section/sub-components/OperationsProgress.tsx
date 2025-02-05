// (c) Copyright Ascensio System SIA 2009-2024
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

import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import type { AnimationEvent } from "react";
import { isMobile } from "react-device-detect";
import { FloatingButton } from "../../floating-button";
import { FloatingButtonIcons } from "../../floating-button/FloatingButton.enums";
import { DropDown } from "../../drop-down";
import ProgressList from "./ProgressList";
import styles from "../Section.module.scss";
import { OperationsProgressProps } from "../Section.types";
import { OPERATIONS_NAME } from "../../../constants/index";
import { HelpButton } from "../../help-button";

type ValueOf<T> = T[keyof T];

type OperationName = keyof typeof OPERATIONS_NAME;

const operationToIconMap: Record<
  OperationName,
  ValueOf<typeof FloatingButtonIcons>
> = {
  download: FloatingButtonIcons.download,
  convert: FloatingButtonIcons.refresh,
  copy: FloatingButtonIcons.copy,
  duplicate: FloatingButtonIcons.duplicate,
  markAsRead: FloatingButtonIcons.markAsRead,
  deletePermanently: FloatingButtonIcons.deletePermanently,
  exportIndex: FloatingButtonIcons.exportIndex,
  move: FloatingButtonIcons.move,
  trash: FloatingButtonIcons.trash,
  other: FloatingButtonIcons.other,
  upload: FloatingButtonIcons.upload,
};

const OperationsProgress: React.FC<OperationsProgressProps> = ({
  secondaryActiveOperations = [],
  primaryActiveOperations = [],
  operationsAlert,
  operationsCompleted = false,
  clearSecondaryProgressData,
  clearPrimaryProgressData,
  cancelUpload,
  onOpenPanel,
  mainButtonVisible,
  needErrorChecking,
  showCancelButton,
}) => {
  const { t } = useTranslation(["UploadPanel", "Files"]);

  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);
  const [isHideTooltip, setIsHideTooltip] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const handleAnimationEnd = useCallback(
    (e: AnimationEvent) => {
      const animation = e.animationName;

      if (
        animation.includes("hideButton") ||
        animation.includes("hideButtonImmediate")
      ) {
        clearSecondaryProgressData();
        clearPrimaryProgressData?.();
      }
    },
    [clearSecondaryProgressData, clearPrimaryProgressData],
  );

  const handleTooltipOpen = () => {
    clearTimers();

    hideTimerRef.current = setTimeout(() => {
      setIsHideTooltip(true);
      resetTimerRef.current = setTimeout(() => {
        setIsHideTooltip(false);
      }, 100);
    }, 4000);
  };

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.addEventListener<"animationend">(
      "animationend",
      handleAnimationEnd,
    );

    return () => {
      container.removeEventListener<"animationend">(
        "animationend",
        handleAnimationEnd,
      );
    };
  }, [handleAnimationEnd]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const operationsLength =
    primaryActiveOperations.length + secondaryActiveOperations.length;

  const isSeveralOperations = operationsLength > 1;

  useLayoutEffect(() => {
    if (isOpenDropdown && !isSeveralOperations) setIsOpenDropdown(false);
  }, [isOpenDropdown, isSeveralOperations]);

  const onOpenDropdown = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };

  const getIcons = () => {
    if (isSeveralOperations) {
      return isOpenDropdown
        ? FloatingButtonIcons.arrow
        : FloatingButtonIcons.dots;
    }
    const operation = secondaryActiveOperations.length
      ? secondaryActiveOperations[0].operation
      : primaryActiveOperations[0].operation;

    return (
      operationToIconMap[operation as OperationName] ||
      FloatingButtonIcons.other
    );
  };

  const getTooltipLabel = () => {
    if (isSeveralOperations) {
      return t("Files:Processes", { count: operationsLength });
    }

    const isSecondaryActive = secondaryActiveOperations.length > 0;

    if (operationsAlert) {
      const operationName = isSecondaryActive
        ? secondaryActiveOperations[0].label
        : primaryActiveOperations[0].label;

      return t("Files:ErrorOperation", {
        operationName,
      });
    }

    if (operationsCompleted) {
      const operationName = isSecondaryActive
        ? secondaryActiveOperations[0].label
        : primaryActiveOperations[0].label;

      return t("Files:SuccessOperation", {
        operationName,
      });
    }

    return isSecondaryActive
      ? secondaryActiveOperations[0].label
      : primaryActiveOperations[0].label;
  };

  const onCancelOperation = () => {
    cancelUpload?.(t);
  };

  const disableOpenPanel =
    primaryActiveOperations.length === 1 &&
    primaryActiveOperations[0].disableOpenPanel;

  const isLaterHide = () => {
    if (disableOpenPanel) return false;

    if (primaryActiveOperations.length > 0) return true;

    return false;
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.progressBarContainer, {
        [styles.autoHide]:
          !isOpenDropdown && operationsCompleted && !needErrorChecking,
        [styles.laterHide]: isLaterHide(),
        [styles.mainButtonVisible]: mainButtonVisible,
      })}
    >
      <HelpButton
        className="layout-progress-bar"
        place="left"
        tooltipContent={getTooltipLabel()}
        openOnClick={isMobile}
        {...(isMobile && { afterShow: handleTooltipOpen })}
        {...(isHideTooltip && isMobile && { isOpen: false })}
      >
        <FloatingButton
          icon={getIcons()}
          alert={operationsAlert}
          completed={operationsCompleted}
          {...(isSeveralOperations && { onClick: onOpenDropdown })}
          {...(!isSeveralOperations &&
            primaryActiveOperations.length && { onClick: onOpenPanel })}
          {...(!isSeveralOperations && {
            showCancelButton,
            clearUploadedFilesHistory: onCancelOperation,
          })}
        />
      </HelpButton>

      <DropDown
        open={isOpenDropdown}
        withBackdrop
        manualWidth="344px"
        directionY="top"
        directionX="right"
        fixedDirection
        isDefaultMode={false}
        className={classNames(styles.styledDropDown, styles.progressDropdown)}
      >
        <ProgressList
          secondaryOperations={secondaryActiveOperations}
          primaryOperations={primaryActiveOperations}
          clearSecondaryProgressData={clearSecondaryProgressData}
          clearPrimaryProgressData={(operationId, operationName) =>
            clearPrimaryProgressData?.(operationName)
          }
          onCancel={onCancelOperation}
          {...(!disableOpenPanel && { onOpenPanel })}
        />
      </DropDown>
    </div>
  );
};

export default observer(OperationsProgress);
