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

import { FloatingButton } from "../../floating-button";
import { FloatingButtonIcons } from "../../floating-button/FloatingButton.enums";
import { DropDown } from "../../drop-down";
import ProgressList from "./ProgressList";
import styles from "../Section.module.scss";
import { OperationsProgressProps } from "../Section.types";
import { OPERATIONS_NAME } from "../../../constants/index";

const operationToIconMap: Record<string, FloatingButtonIcons> = {
  [OPERATIONS_NAME.download]: FloatingButtonIcons.file,
  [OPERATIONS_NAME.convert]: FloatingButtonIcons.refresh,
  [OPERATIONS_NAME.copy]: FloatingButtonIcons.duplicate,
  [OPERATIONS_NAME.duplicate]: FloatingButtonIcons.duplicate,
  [OPERATIONS_NAME.markAsRead]: FloatingButtonIcons.file,
  [OPERATIONS_NAME.deletePermanently]: FloatingButtonIcons.trash,
  [OPERATIONS_NAME.exportIndex]: FloatingButtonIcons.exportIndex,
  [OPERATIONS_NAME.move]: FloatingButtonIcons.move,
  [OPERATIONS_NAME.trash]: FloatingButtonIcons.trash,
  [OPERATIONS_NAME.other]: FloatingButtonIcons.file,
};
const OperationsProgress: React.FC<OperationsProgressProps> = ({
  secondaryActiveOperations = [],
  operationsAlert,
  operationsCompleted = false,
  clearSecondaryProgressData,
}) => {
  const [isOpenPanel, setIsOpenPanel] = useState<boolean>(false);
  const [shouldHideButton, setShouldHideButton] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevOperationsCompletedRef = useRef<boolean>(operationsCompleted);

  const handleAnimationEnd = useCallback(
    (e: AnimationEvent) => {
      const animation = e.animationName;

      if (
        animation.includes("hideButton") ||
        animation.includes("hideButtonImmediate")
      ) {
        clearSecondaryProgressData(null, null, true);
      }
    },
    [clearSecondaryProgressData],
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

  useLayoutEffect(() => {
    if (prevOperationsCompletedRef.current && !operationsCompleted) {
      clearSecondaryProgressData(null, null, true);
    }

    prevOperationsCompletedRef.current = operationsCompleted;
  }, [
    operationsCompleted,
    secondaryActiveOperations,
    clearSecondaryProgressData,
  ]);

  const onOpenProgressPanel = () => {
    const willClose = isOpenPanel;
    setIsOpenPanel(!isOpenPanel);

    if (willClose && operationsCompleted && secondaryActiveOperations.length) {
      setShouldHideButton(true);
    }
  };

  // const onCloseButton = () => {
  //   setShouldHideButton(true);
  // };

  const isSeveralOperations = secondaryActiveOperations.length > 1;

  const getIcons = () => {
    if (isSeveralOperations) {
      return isOpenPanel ? FloatingButtonIcons.arrow : FloatingButtonIcons.dots;
    }
    return (
      operationToIconMap[secondaryActiveOperations[0].operation] ||
      FloatingButtonIcons.file
    );
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.progressBarContainer, {
        [styles.hideImmediate]: shouldHideButton,
        [styles.hidden]: !isOpenPanel && operationsCompleted,
      })}
    >
      <FloatingButton
        className="layout-progress-bar"
        icon={getIcons()}
        alert={operationsAlert}
        completed={operationsCompleted}
        {...(isSeveralOperations && { onClick: onOpenProgressPanel })}
        percent={operationsCompleted ? 100 : 0}
        // onCloseButton={onCloseButton}
      />

      <DropDown
        open={isOpenPanel}
        withBackdrop
        manualWidth="344px"
        directionY="top"
        directionX="right"
        fixedDirection
        isDefaultMode={false}
        className={classNames(styles.styledDropDown, styles.progressDropdown)}
      >
        <ProgressList
          operations={secondaryActiveOperations}
          clearSecondaryProgressData={clearSecondaryProgressData}
        />
      </DropDown>
    </div>
  );
};

export default observer(OperationsProgress);
