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

import React, { useState, useLayoutEffect, useCallback, useRef } from "react";
import { observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import type { AnimationEvent } from "react";
import { FloatingButton } from "../../floating-button";
import { FloatingButtonIcons } from "../../floating-button/FloatingButton.enums";
import { DropDown } from "../../drop-down";
import ProgressList from "./ProgressList";
import styles from "../Section.module.scss";
import { OperationsProgressProps } from "../Section.types";
import { OPERATIONS_NAME } from "../../../constants/index";
import { HelpButton } from "../../help-button";

type OperationName = keyof typeof OPERATIONS_NAME;
let timerId = null;

const operationToIconMap: Record<OperationName, FloatingButtonIcons> = {
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
  // const [shouldHideButton, setShouldHideButton] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // const prevOperationsCompletedRef = useRef<boolean>(operationsCompleted);

  const handleAnimationEnd = useCallback(
    (e: AnimationEvent) => {
      const animation = e.animationName;

      if (
        animation.includes("hideButton") ||
        animation.includes("hideButtonImmediate")
      ) {
        clearSecondaryProgressData(null, null, true);
        clearPrimaryProgressData(null, true);
      }
    },
    [clearSecondaryProgressData, clearPrimaryProgressData],
  );

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

  // useLayoutEffect(() => {
  //   if (prevOperationsCompletedRef.current && !operationsCompleted) {
  //     clearSecondaryProgressData(null, null, true);
  //   }

  //   prevOperationsCompletedRef.current = operationsCompleted;
  // }, [
  //   operationsCompleted,
  //   secondaryActiveOperations,
  //   clearSecondaryProgressData,
  // ]);

  const operationsLength =
    primaryActiveOperations.length + secondaryActiveOperations.length;

  const isSeveralOperations = operationsLength > 1;

  useLayoutEffect(() => {
    if (isOpenDropdown && !isSeveralOperations) setIsOpenDropdown(false);
  }, [isOpenDropdown, isSeveralOperations]);

  const onOpenDropdown = () => {
    // const willClose = isOpenDropdown;
    setIsOpenDropdown(!isOpenDropdown);

    // if (!willClose) {
    //   clearTimeout(timerId);
    //   timerId = null;
    // }

    // if (willClose && operationsCompleted && secondaryActiveOperations.length) {
    //   // const time = primaryActiveOperations.length > 0 ? 8000 : 4000;
    //   // timerId = setTimeout(() => {
    //   //  setShouldHideButton(true);
    //   // }, time);
    // }
  };

  // const onCloseButton = () => {
  //   setShouldHideButton(true);
  // };

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
      operationToIconMap[operation as OperationName] || FloatingButtonIcons.file
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

  const onCanelOperation = () => {
    cancelUpload(t);
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.progressBarContainer, {
        [styles.autoHide]:
          !isOpenDropdown && operationsCompleted && !needErrorChecking,
        // [styles.immediateHide]: shouldHideButton && !needErrorChecking,
        [styles.laterHide]: primaryActiveOperations.length > 0,
        [styles.mainButtonVisible]: mainButtonVisible,
      })}
    >
      <HelpButton
        className="layout-progress-bar"
        place="left"
        tooltipContent={getTooltipLabel()}
        openOnClick={false}
      >
        <FloatingButton
          icon={getIcons()}
          alert={operationsAlert}
          completed={operationsCompleted}
          {...(isSeveralOperations && { onClick: onOpenDropdown })}
          percent={operationsCompleted ? 100 : 0}
          {...(!isSeveralOperations &&
            primaryActiveOperations.length && { onClick: onOpenPanel })}
          {...(showCancelButton && { onCloseButton: onCanelOperation })}
          showCancelButton={showCancelButton}
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
            clearPrimaryProgressData(operationName, "")
          }
          onCancel={onCanelOperation}
          onOpenPanel={onOpenPanel}
        />
      </DropDown>
    </div>
  );
};

export default observer(OperationsProgress);
