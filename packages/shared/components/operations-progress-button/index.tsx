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
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { isMobile } from "react-device-detect";
import { FloatingButton } from "../floating-button";
import { FloatingButtonIcons } from "../floating-button/FloatingButton.enums";
import { DropDown } from "../drop-down";
import ProgressList from "./ProgressList";
import styles from "./OperationsProgressButton.module.scss";
import { OperationsProgressProps } from "./OperationsProgressButton.types";
import { OPERATIONS_NAME } from "../../constants/index";
import { HelpButton } from "../help-button";
import { Backdrop } from "../backdrop";
import { Text } from "../text";

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
  deleteVersionFile: FloatingButtonIcons.trash,
  backup: FloatingButtonIcons.backup,
};

const OperationsProgressButton: React.FC<OperationsProgressProps> = ({
  operations = [],
  panelOperations = [],
  operationsAlert,
  operationsCompleted = false,
  clearOperationsData,
  clearPanelOperationsData,
  cancelUpload,
  mainButtonVisible,
  needErrorChecking,
  showCancelButton,
  isInfoPanelVisible,
}) => {
  const { t } = useTranslation(["Common"]);

  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);
  const [isHideTooltip, setIsHideTooltip] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const panelOperationsLength = panelOperations.length;
  const operationsLength = operations.length;

  const allOperationsLength = panelOperationsLength + operationsLength;
  const isSeveralOperations = allOperationsLength > 1;

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
    (e: globalThis.AnimationEvent) => {
      const animation = e.animationName;

      if (
        animation.includes("hideButton") ||
        animation.includes("hideButtonImmediate")
      ) {
        clearOperationsData?.();
        clearPanelOperationsData?.();
      }
    },
    [clearOperationsData, clearPanelOperationsData],
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const onOpenDropdown = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };

  const handleTooltipOpen = () => {
    clearTimers();
    setIsHovered(false);

    hideTimerRef.current = setTimeout(() => {
      setIsHideTooltip(true);

      resetTimerRef.current = setTimeout(() => {
        setIsHideTooltip(false);
      }, 100);
    }, 3500);
  };

  const handleFloatingButtonClick = () => {
    if (isMobile && !panelOperationsLength) {
      setIsHovered(true);
    }

    if (isSeveralOperations) {
      onOpenDropdown();

      return;
    }

    if (panelOperationsLength) {
      setIsHideTooltip(true);

      panelOperations[0].showPanel?.(true);
      clearTimers();

      resetTimerRef.current = setTimeout(() => {
        setIsHideTooltip(false);
      }, 100);
    }
  };

  const handleOperationClick = () => {
    setIsHideTooltip(true);
    clearTimers();
    setIsOpenDropdown(false);
    setIsHovered(false);
    resetTimerRef.current = setTimeout(() => {
      setIsHideTooltip(false);
    }, 100);
  };

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.addEventListener(
      "animationend",
      handleAnimationEnd as EventListener,
    );

    return () => {
      container.removeEventListener(
        "animationend",
        handleAnimationEnd as EventListener,
      );
    };
  }, [handleAnimationEnd]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  useLayoutEffect(() => {
    if (isOpenDropdown && !isSeveralOperations) {
      setIsOpenDropdown(false);
      setIsHovered(false);
    }
  }, [isOpenDropdown, isSeveralOperations]);

  const getIcons = () => {
    if (isSeveralOperations) {
      return isOpenDropdown
        ? FloatingButtonIcons.arrow
        : FloatingButtonIcons.dots;
    }
    const operation = operationsLength
      ? operations[0].operation
      : panelOperations[0].operation;

    return (
      operationToIconMap[operation as OperationName] ||
      FloatingButtonIcons.other
    );
  };
  const getPercent = () => {
    if (isSeveralOperations) {
      return;
    }

    return operationsLength
      ? operations[0].percent
      : panelOperations[0].percent;
  };

  const getErrorCount = () => {
    return operationsLength
      ? operations[0].errorCount
      : panelOperations[0].errorCount;
  };
  const getTooltipLabel = () => {
    if (isSeveralOperations) {
      return (
        <Text fontWeight={600}>
          {t("Common:Processes", { count: allOperationsLength })}
        </Text>
      );
    }

    if (operationsAlert) {
      const operationName = operationsLength
        ? operations[0].label
        : panelOperations[0].label;

      if (getPercent()) {
        return (
          <Text fontWeight={600}>
            {operationName}
            <br />
            {t("Common:ErrorUploadingFiles", { count: getErrorCount() })}
          </Text>
        );
      }
      return (
        <Text fontWeight={600}>
          {t("Common:ErrorOperation", {
            operationName,
          })}
        </Text>
      );
    }

    if (operationsCompleted) {
      const operationName = operationsLength
        ? operations[0].label
        : panelOperations[0].label;

      return (
        <Text fontWeight={600}>
          {t("Common:SuccessOperation", {
            operationName,
          })}
        </Text>
      );
    }

    const operationName = operationsLength
      ? operations[0].label
      : panelOperations[0].label;

    return <Text fontWeight={600}>{operationName}</Text>;
  };

  const onCancelOperation = () => {
    cancelUpload?.(t);
  };

  const disableOpenPanel =
    panelOperationsLength === 1 && !panelOperations[0].showPanel;

  const withoutStatus = disableOpenPanel && panelOperations[0].withoutStatus;

  const isLaterHide = () => {
    if (disableOpenPanel) return false;

    if (panelOperationsLength > 0) return true;

    return false;
  };

  const checkError = needErrorChecking && !disableOpenPanel;

  return (
    <>
      <Backdrop
        zIndex={210}
        visible={isOpenDropdown}
        onClick={() => setIsOpenDropdown(false)}
      />
      <div
        ref={containerRef}
        className={classNames(styles.progressBarContainer, {
          [styles.autoHide]:
            !isOpenDropdown && operationsCompleted && !checkError && !isHovered,
          [styles.laterHide]: isLaterHide(),
          [styles.immidiateHide]:
            !isSeveralOperations && operationsCompleted && disableOpenPanel,
          [styles.mainButtonVisible]: mainButtonVisible,
          [styles.infoPanelVisible]: isInfoPanelVisible,
        })}
        style={{ zIndex: isOpenDropdown ? "211" : "201" }}
        onMouseEnter={!isMobile ? handleMouseEnter : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      >
        <HelpButton
          className="layout-progress-bar"
          place="left"
          tooltipContent={getTooltipLabel()}
          openOnClick={isMobile}
          {...(isMobile && { afterShow: handleTooltipOpen })}
          {...(isHideTooltip && { isOpen: false })}
          noUserSelect
        >
          <FloatingButton
            className={classNames(styles.floatingButton, {
              [styles.cursorDefault]:
                !panelOperationsLength || disableOpenPanel,
            })}
            icon={getIcons()}
            alert={operationsAlert}
            completed={operationsCompleted}
            onClick={handleFloatingButtonClick}
            {...(!isSeveralOperations &&
              !isMobile && {
                showCancelButton,
                clearUploadedFilesHistory: onCancelOperation,
              })}
            withoutStatus={withoutStatus}
            percent={getPercent()}
          />
        </HelpButton>

        {isOpenDropdown ? (
          <DropDown
            open={isOpenDropdown}
            withBackdrop={false}
            manualWidth="344px"
            directionY="top"
            directionX="left"
            fixedDirection
            isDefaultMode={false}
            className={classNames(styles.styledDropDown)}
          >
            <ProgressList
              operations={operations}
              panelOperations={panelOperations}
              clearOperationsData={clearOperationsData}
              clearPanelOperationsData={(
                _: string | null,
                operationName: string | null,
              ) => {
                clearPanelOperationsData?.(operationName);
              }}
              onCancel={onCancelOperation}
              onOpenPanel={handleOperationClick}
            />
          </DropDown>
        ) : null}
      </div>
    </>
  );
};

export default OperationsProgressButton;
