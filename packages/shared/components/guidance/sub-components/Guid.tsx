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

import React, { useState, useEffect, useRef } from "react";

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

const SIDE_OFFSET = 16;

const getModalPosition = (
  positions: Position[],
  placement: GuidancePlacement,
  isRTL: boolean,
  windowWidth: number,
  windowHeight: number,
  modalWidth: number,
  modalHeight: number,
): { left: number; top: number } => {
  let mainPosition = positions[0];

  if (mainPosition?.width === 0 && mainPosition?.height === 0 && positions[1]) {
    mainPosition = positions[1];
  }

  if (!mainPosition) return { left: 0, top: 0 };

  // Calculate side position first to check if it fits
  const baseLeft = isRTL
    ? mainPosition.left - modalWidth - SIDE_OFFSET
    : mainPosition.right + SIDE_OFFSET;

  const isNotEnoughHorizontalSpace = isRTL
    ? baseLeft < 0
    : baseLeft + modalWidth > windowWidth;
  const proposedTop = mainPosition.bottom + SIDE_OFFSET;
  const isNotEnoughVerticalSpace = proposedTop + modalHeight > windowHeight;

  if (placement === "bottom") {
    const wouldOverflowHorizontally =
      mainPosition.left + modalWidth > windowWidth;
    const left = wouldOverflowHorizontally
      ? mainPosition.right - modalWidth
      : Math.max(0, mainPosition.left);

    return {
      left,
      top: isNotEnoughVerticalSpace
        ? mainPosition.bottom - modalHeight
        : proposedTop,
    };
  }

  // placement === "side"
  if (!isNotEnoughHorizontalSpace) {
    // If side placement fits, use it
    return {
      left: baseLeft,
      top: Math.max(0, mainPosition.top),
    };
  }

  // If side doesn't fit, try bottom
  if (!isNotEnoughVerticalSpace) {
    return {
      left: Math.max(0, mainPosition.left),
      top: proposedTop,
    };
  }

  // If neither side nor bottom fits, switch sides and lift up
  return {
    left: isRTL
      ? mainPosition.right + SIDE_OFFSET
      : mainPosition.left - modalWidth - SIDE_OFFSET,
    top: mainPosition.bottom - modalHeight,
  };
};

const Guid: React.FC<GuidProps> = ({
  guidanceConfig,
  currentStepIndex,
  setCurrentStepIndex,
  onClose,
  positions,
  infoPanelVisible,
  viewAs,
  currentGuidance,
  sectionWidth,
  t,
}) => {
  const theme = useTheme();
  const { isRTL } = useInterfaceDirection();

  const modalRef = useRef<HTMLDivElement>(null);
  const [modalWidth, setModalWidth] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (modalRef.current) {
      setModalWidth(modalRef.current.offsetWidth);
      setModalHeight(modalRef.current.offsetHeight);
    }
  }, [currentGuidance]);

  const isLastStep = currentStepIndex === guidanceConfig.length - 1;
  const { placement = "side" } = currentGuidance || {};

  const modalPosition = getModalPosition(
    positions,
    placement,
    isRTL,
    windowWidth,
    windowHeight,
    modalWidth,
    modalHeight,
  );

  const clippedClassName = classNames(styles.guidElement, {
    [styles.smallBorderRadius]: isLastStep,
  });

  const clippedElements = positions.map((position, index) => ({
    key: `guid-element-${index}`,
    style: {
      ["--backdrop-filter-value" as string]: theme.isBase
        ? "contrast(200%)"
        : "contrast(0.82)",
      width: position.width ? `${position.width}px` : `${sectionWidth}px`,
      height: `${position.height}px`,
      left: `${position.left}px`,
      top: `${position.top}px`,
      right: `${position.right}px`,
    },
  }));

  const tipsCircles = guidanceConfig.map((step, index) => (
    <div
      className={classNames(styles.tipsCircle, {
        [styles.isSelected]: index === currentStepIndex,
      })}
      key={`tips_circle_${step.id}`}
    />
  ));

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

  const dialogClassName = classNames(styles.dialog, "not-selectable", "dialog");
  const contentClassName = classNames(styles.content, "guidance-dialog", {
    [styles.visible]: true,
    [styles.displayTypeModal]: "modal",
    [styles.autoMaxHeight]: true,
  });
  const bodyClassName = classNames(modalStyles.body, "modal-body", {
    [styles.displayTypeModal]: "modal",
  });

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
        ref={modalRef}
        id="modal-onMouseDown-close"
        role="dialog"
        className={dialogClassName}
        style={{
          left: modalPosition.left,
          top: modalPosition.top,
        }}
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
              {currentStepIndex !== 0 && (
                <Button
                  id="form-filling_tips_back"
                  key="TipsBack"
                  label={t("Common:Back")}
                  size={ButtonSize.extraSmall}
                  onClick={prevTips}
                />
              )}
              <Button
                id="form-filling_tips_next"
                key="TipsNext"
                primary
                label={isLastStep ? t("Common:GotIt") : t("Common:Next")}
                size={ButtonSize.extraSmall}
                onClick={isLastStep ? onClose : nextTips}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Guid };
