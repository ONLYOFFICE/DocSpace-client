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

import React from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { isMobile, isDesktop, classNames } from "../../../utils";
import { AsideHeader } from "../../aside-header";

import styles from "./Guid.module.scss";
import modalStyles from "../../modal-dialog/ModalDialog.module.scss";

import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";

const GUID_MODAL_MARGIN = 18;
const MAX_MODAL_HEIGHT = 190;
const MODAL_WIDTH = 430;

const Guid = ({
  guidanceConfig,
  currentStepIndex,
  setCurrentStepIndex,
  onClose,
  positions,
  infoPanelVisible,
  viewAs,
  currentGuidance,
  sectionWidth,
}: GuidProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);
  const { isRTL } = useInterfaceDirection();

  const isLastStep = currentStepIndex === guidanceConfig.length - 1;
  const isStartingStep = currentStepIndex === 0;

  const closeBackdrop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const nextTips = () => {
    if (isLastStep) {
      return onClose();
    }
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const prevTips = () => {
    setCurrentStepIndex(currentStepIndex - 1);
  };

  const tipsCircles = guidanceConfig.map((step, index) => (
    <div
      className={classNames(styles.tipsCircle, {
        [styles.isSelected]: index === currentStepIndex,
      })}
      key={`tips_circle_${step.id}`}
    />
  ));

  const getXDirection = React.useCallback(
    (screenWidth: number) => {
      let xDirection = isRTL ? "right" : "left";
      const hasOverflow = positions.some(
        (pos) => pos.left + MODAL_WIDTH + GUID_MODAL_MARGIN >= screenWidth,
      );
      if (hasOverflow) {
        xDirection = isRTL ? "right" : "left";
      }
      return xDirection;
    },
    [isRTL, positions],
  );

  const calculateTopPosition = React.useCallback(
    (screenHeight: number) => {
      const screenWidth = document.documentElement.clientWidth;
      const defaultTopPosition = positions[0]?.bottom + GUID_MODAL_MARGIN;
      const isTileView = viewAs === "tile";
      const isRelevantTip = isStartingStep;

      const isNotEnoughSpace = positions.some((pos) =>
        isRTL
          ? pos.left - MODAL_WIDTH < 0
          : screenWidth <
            (isStartingStep ? pos.right : pos.left) +
              MODAL_WIDTH +
              GUID_MODAL_MARGIN,
      );

      const isNotEnoughVerticalSpace = positions.some(
        (pos) =>
          screenHeight < pos.bottom + GUID_MODAL_MARGIN + MAX_MODAL_HEIGHT,
      );

      if (isTileView && isRelevantTip) {
        if (isNotEnoughSpace) {
          return defaultTopPosition;
        }
        if (isStartingStep) {
          return positions[0]?.top;
        }
      }

      if (isNotEnoughVerticalSpace) {
        return positions[0]?.top - GUID_MODAL_MARGIN - MAX_MODAL_HEIGHT;
      }

      return defaultTopPosition;
    },
    [positions, isStartingStep, isRTL, viewAs],
  );

  const calculateManualX = React.useCallback(
    (xDirection: string) => {
      const screenWidth = document.documentElement.clientWidth;
      const isTileView = viewAs === "tile";
      const isRelevantTip = isStartingStep;

      const getPositionX = () => {
        if (isRTL) {
          return isStartingStep ? positions[0]?.left : positions[0]?.right;
        }
        return positions[0]?.left;
      };

      const isNotEnoughSpace = isRTL
        ? getPositionX() - MODAL_WIDTH < 0
        : screenWidth < getPositionX() + MODAL_WIDTH + GUID_MODAL_MARGIN;

      if (isLastStep && !isDesktop()) {
        return "15px";
      }

      if (isTileView && isRelevantTip) {
        if (isNotEnoughSpace) {
          return isRTL
            ? `${positions[0]?.left}px`
            : `${positions[0]?.right - MODAL_WIDTH}px`;
        }

        if (isStartingStep) {
          return isRTL
            ? `${positions[0]?.left - MODAL_WIDTH - GUID_MODAL_MARGIN}px`
            : `${positions[0]?.right + GUID_MODAL_MARGIN}px`;
        }

        return isRTL
          ? `${positions[0]?.right - MODAL_WIDTH}px`
          : `${positions[0]?.left}px`;
      }

      if (xDirection === "left" || isRTL) {
        return isDesktop() ? "250px" : "60px";
      }

      return "20px";
    },
    [isRTL, isStartingStep, positions, isLastStep, viewAs],
  );

  const onResize = React.useCallback(() => {
    const screenHeight = document.documentElement.clientHeight;
    const screenWidth = document.documentElement.clientWidth;

    const xDirection = getXDirection(screenWidth);
    const top = calculateTopPosition(screenHeight);
    const manualX = calculateManualX(xDirection);

    return {
      ["--manual-x" as string]: manualX,
      ["--manual-y" as string]: `${top}px`,
    };
  }, [getXDirection, calculateTopPosition, calculateManualX]);

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  if (isMobile()) {
    onClose();
  }

  const directionX =
    isLastStep && !isDesktop()
      ? isRTL
      : (isStartingStep && viewAs === "tile") || !isRTL;

  const dialogClassName = classNames(
    styles.dialog,
    "not-selectable",
    "dialog",
    {
      [styles.directionLeft]: directionX,
      [styles.directionRight]: !directionX,
    },
  );

  const contentClassName = classNames(styles.content, "guidance-dialog", {
    [styles.visible]: true,
    [styles.displayTypeModal]: "modal",
    [styles.autoMaxHeight]: true,
  });

  const bodyClassName = classNames(modalStyles.body, "modal-body", {
    [styles.displayTypeModal]: "modal",
  });

  const clippedClassName = classNames(styles.guidElement, {
    [styles.smallBorderRadius]: isLastStep,
    [styles.fromRight]:
      infoPanelVisible && isRTL && viewAs !== "tile" && isStartingStep,
  });

  const clippedElements = positions.map((position, index) => ({
    key: `guid-element-${index}`,
    style: {
      ["--backdrop-filter-value" as string]: theme.isBase
        ? "contrast(200%)"
        : "contrast(0.82)",
      left: `${position.left}px`,
      top: `${position.top}px`,
      width: position.width ? `${position.width}px` : `${sectionWidth}px`,
      height: `${position.height}px`,
    },
  }));

  return (
    <div className="guidance">
      <div
        className={classNames(styles.guidBackdrop)}
        onClick={closeBackdrop}
      />
      {clippedElements.map((element) => (
        <div
          key={element.key}
          className={clippedClassName}
          style={element.style}
        />
      ))}
      <div
        id="modal-onMouseDown-close"
        role="dialog"
        className={dialogClassName}
        style={onResize()}
      >
        <div id="modal-dialog" className={contentClassName}>
          <AsideHeader
            id="modal-header-swipe"
            className={classNames(["modal-header"]) || "modal-header"}
            header={currentGuidance?.header}
            onCloseClick={onClose}
          />

          <div className={bodyClassName}>
            <Text
              className="tips-description"
              fontWeight="400"
              fontSize="13px"
              lineHeight="20px"
            >
              {" "}
              {currentGuidance?.description}
            </Text>
          </div>

          <div
            className={
              classNames(modalStyles.footer, ["modal-footer"]) || "modal-footer"
            }
          >
            <div className="circle-container">{tipsCircles}</div>
            <div className="button-container">
              {currentStepIndex !== 0 ? (
                <Button
                  id="form-filling_tips_back"
                  key="TipsBack"
                  label={t("Common:Back")}
                  size={ButtonSize.extraSmall}
                  onClick={prevTips}
                />
              ) : null}

              <Button
                id="form-filling_tips_next"
                key="TipsNext"
                primary
                label={isLastStep ? t("Common:GotIt") : t("Common:Next")}
                size={ButtonSize.extraSmall}
                onClick={nextTips}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Guid };
