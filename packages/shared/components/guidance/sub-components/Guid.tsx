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
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import { useTheme } from "styled-components";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { isMobile, classNames } from "../../../utils";
import { AsideHeader } from "../../aside-header";

import styles from "./Guid.module.scss";
import modalStyles from "../../modal-dialog/ModalDialog.module.scss";
import { getDynamicPlacement } from "./Guid.utils";
import {
  GuidProps,
  GuidanceStep,
  ClippedPosition,
  GuidancePlacement,
} from "./Guid.types";
import { SIDE_OFFSET, RTL_ROW_OFFSET } from "./Guid.constants";

const getModalPosition = (
  positions: ClippedPosition[],
  placement: GuidancePlacement,
  isRTL: boolean,
  windowWidth: number,
  windowHeight: number,
  modalWidth: number,
  modalHeight: number,
  viewAs: string,
  currentGuidance?: GuidanceStep,
): { left: number; top: number } => {
  let mainPosition = positions[0];
  const currentPlacement =
    placement === "dynamic" ? getDynamicPlacement(viewAs) : placement;

  if (mainPosition?.width === 0 && mainPosition?.height === 0 && positions[1]) {
    mainPosition = positions[1];
  }

  if (!mainPosition) return { left: 0, top: 0 };

  const rtlOffset =
    isRTL && viewAs === "row" && currentGuidance?.position?.[0]?.offset?.rtl
      ? RTL_ROW_OFFSET
      : 0;

  const baseLeft = isRTL
    ? mainPosition.left - modalWidth - SIDE_OFFSET + rtlOffset
    : mainPosition.right + SIDE_OFFSET;

  const isNotEnoughHorizontalSpace = isRTL
    ? baseLeft < 0
    : baseLeft + modalWidth > windowWidth;
  const proposedTop = mainPosition.bottom + SIDE_OFFSET;
  const isNotEnoughVerticalSpace = proposedTop + modalHeight > windowHeight;

  if (currentPlacement === "bottom") {
    let left;
    if (isRTL) {
      const wouldOverflowHorizontally =
        windowWidth - mainPosition.right + modalWidth > windowWidth;
      left = wouldOverflowHorizontally
        ? mainPosition.left + rtlOffset
        : mainPosition.right - modalWidth + rtlOffset;
    } else {
      const wouldOverflowHorizontally =
        mainPosition.left + modalWidth > windowWidth;
      left = wouldOverflowHorizontally
        ? mainPosition.right - modalWidth
        : Math.max(0, mainPosition.left);
    }

    return {
      left,
      top: isNotEnoughVerticalSpace
        ? mainPosition.bottom - modalHeight
        : proposedTop,
    };
  }

  if (!isNotEnoughHorizontalSpace) {
    return {
      left: baseLeft,
      top: Math.max(0, mainPosition.top),
    };
  }

  if (!isNotEnoughVerticalSpace) {
    return {
      left: isRTL
        ? mainPosition.right + rtlOffset - modalWidth
        : Math.max(0, mainPosition.left),
      top: proposedTop,
    };
  }

  return {
    left: isRTL
      ? mainPosition.right + SIDE_OFFSET
      : mainPosition.left - modalWidth - SIDE_OFFSET + rtlOffset,
    top: mainPosition.bottom - modalHeight,
  };
};

const Guid: React.FC<GuidProps> = ({
  currentGuidance,
  positions,
  sectionWidth,
  onNext,
  onPrev,
  onClose,
  currentStep,
  totalSteps,
  isRTL,
  viewAs,
  guidanceConfig,
  t,
}) => {
  const theme = useTheme();

  const modalRef = useRef<HTMLDivElement>(null);
  const [modalWidth, setModalWidth] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (!modalRef.current) return;

    const updateModalSize = () => {
      if (!modalRef.current) return;
      setModalWidth(modalRef.current.offsetWidth);
      setModalHeight(modalRef.current.offsetHeight);
    };

    const timeoutId = setTimeout(updateModalSize, 0);
    return () => clearTimeout(timeoutId);
  }, [currentGuidance]);

  const isLastStep = currentStep === totalSteps - 1;
  const { placement = "side" } = currentGuidance || {};

  const modalPosition = useMemo(
    () =>
      getModalPosition(
        positions,
        placement,
        isRTL,
        windowWidth,
        windowHeight,
        modalWidth,
        modalHeight,
        viewAs,
        currentGuidance,
      ),
    [
      positions,
      placement,
      isRTL,
      windowWidth,
      windowHeight,
      modalWidth,
      modalHeight,
      viewAs,
      currentGuidance,
    ],
  );

  const clippedElements = useMemo(
    () =>
      positions.map((position, index) => ({
        key: `guid-element-${index}`,
        style: {
          ["--backdrop-filter-value" as string]: theme.isBase
            ? "contrast(165%)"
            : "contrast(0.82)",
          width: position.width
            ? `${position.width}px`
            : `${sectionWidth - 4}px`,
          height: `${position.height}px`,
          left: `${position.left}px`,
          top: `${position.top}px`,
          right: `${position.right}px`,
        },
      })),
    [positions, theme.isBase, sectionWidth],
  );

  const renderClippedElements = useCallback(() => {
    return clippedElements.map((element, index) => {
      const elementClippedClassName = classNames(styles.guidElement, {
        [styles.smallBorderRadius]:
          currentGuidance?.position[index]?.smallBorder,
      });

      return (
        <div
          key={element.key}
          className={elementClippedClassName}
          style={element.style}
        />
      );
    });
  }, [clippedElements, currentGuidance]);

  const tipsCircles = useMemo(
    () =>
      guidanceConfig.map((step, index) => (
        <div
          className={classNames(styles.tipsCircle, {
            [styles.isSelected]: index === currentStep,
          })}
          key={`tips_circle_${step.id}`}
        />
      )),
    [guidanceConfig, currentStep],
  );

  const closeBackdrop = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  if (isMobile()) {
    onClose();
  }

  return (
    <div className="guidance">
      <div
        className={classNames(styles.guidBackdrop)}
        onClick={closeBackdrop}
      />
      {renderClippedElements()}
      <div
        ref={modalRef}
        id="modal-onMouseDown-close"
        role="dialog"
        className={classNames(styles.dialog, "not-selectable", "dialog")}
        style={{
          left: modalPosition.left,
          top: modalPosition.top,
        }}
      >
        <div
          id="modal-dialog"
          className={classNames(styles.content, "guidance-dialog", {
            [styles.visible]: true,
            [styles.displayTypeModal]: "modal",
            [styles.autoMaxHeight]: true,
          })}
        >
          <AsideHeader
            id="modal-header-swipe"
            className={classNames(["modal-header"]) || "modal-header"}
            header={currentGuidance?.header}
            onCloseClick={onClose}
          />

          <div
            className={classNames(modalStyles.body, "modal-body", {
              [styles.displayTypeModal]: "modal",
            })}
          >
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
              {currentStep !== 0 ? (
                <Button
                  id="form-filling_tips_back"
                  key="TipsBack"
                  label={t("Common:Back")}
                  size={ButtonSize.extraSmall}
                  onClick={onPrev}
                />
              ) : null}
              <Button
                id="form-filling_tips_next"
                key="TipsNext"
                primary
                label={isLastStep ? t("Common:GotIt") : t("Common:Next")}
                size={ButtonSize.extraSmall}
                onClick={isLastStep ? onClose : onNext}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Guid };
