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

import { FormFillingTipsState } from "../../../enums";
import styles from "./Guid.module.scss";
import modalStyles from "../../modal-dialog/ModalDialog.module.scss";

import { getHeaderText } from "./Guid.utils";
import { GuidProps } from "./Guid.types";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";

const GUID_MODAL_MARGIN = 16;
const MAX_MODAL_HEIGHT = 190;
const MODAL_WIDTH = 430;

const Guid = ({
  formFillingTipsNumber,
  setFormFillingTipsNumber,
  onClose,
  position,
  infoPanelVisible,
  viewAs,
}: GuidProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);
  const { isRTL } = useInterfaceDirection();

  const modalText = getHeaderText(formFillingTipsNumber, t);
  const isLastTip = formFillingTipsNumber === FormFillingTipsState.Uploading;
  const isStartingTip = formFillingTipsNumber === FormFillingTipsState.Starting;
  const isCompleteTip =
    formFillingTipsNumber === FormFillingTipsState.Complete ||
    formFillingTipsNumber === FormFillingTipsState.Submitting;

  const isSharingTip = formFillingTipsNumber === FormFillingTipsState.Sharing;

  const closeBackdrop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const nextTips = () => {
    if (isLastTip) {
      return onClose();
    }
    setFormFillingTipsNumber(formFillingTipsNumber + 1);
  };

  const prevTips = () => {
    setFormFillingTipsNumber(formFillingTipsNumber - 1);
  };

  const tipsCircles = [];
  for (let i = 1; i < 6; i += 1) {
    tipsCircles.push(
      <div
        className={classNames(styles.tipsCircle, {
          [styles.isSelected]: i === formFillingTipsNumber,
        })}
        key={`tips_circle_${i}`}
      />,
    );
  }

  const getXDirection = React.useCallback(
    (screenWidth: number) => {
      let xDirection = isRTL ? "right" : "left";
      if (position.left + MODAL_WIDTH + GUID_MODAL_MARGIN >= screenWidth) {
        xDirection = isRTL ? "right" : "left";
      }
      return xDirection;
    },
    [isRTL, position.left],
  );

  const calculateTopPosition = React.useCallback(
    (screenHeight: number) => {
      const screenWidth = document.documentElement.clientWidth;
      const defaultTopPosition = position.bottom + GUID_MODAL_MARGIN;
      const isTileView = viewAs === "tile";
      const isRelevantTip = isStartingTip || isCompleteTip || isSharingTip;

      const isNotEnoughSpace = isRTL
        ? position.left - MODAL_WIDTH < 0
        : screenWidth <
          (isStartingTip ? position.right : position.left) +
            MODAL_WIDTH +
            GUID_MODAL_MARGIN;

      const isNotEnoughVerticalSpace =
        screenHeight < position.bottom + GUID_MODAL_MARGIN + MAX_MODAL_HEIGHT;

      if (isTileView && isRelevantTip) {
        if (isNotEnoughSpace) {
          return defaultTopPosition;
        }
        if (isStartingTip) {
          return position.top;
        }
      }

      if (isNotEnoughVerticalSpace) {
        return position.top - GUID_MODAL_MARGIN - MAX_MODAL_HEIGHT;
      }

      return defaultTopPosition;
    },
    [
      position.bottom,
      position.right,
      position.left,
      position.top,
      isStartingTip,
      isRTL,
      isCompleteTip,
      isSharingTip,
      viewAs,
    ],
  );

  const calculateManualX = React.useCallback(
    (xDirection: string) => {
      const screenWidth = document.documentElement.clientWidth;
      const isTileView = viewAs === "tile";
      const isRelevantTip = isStartingTip || isCompleteTip || isSharingTip;

      const getPositionX = () => {
        if (isRTL) {
          return isStartingTip ? position.left : position.right;
        }
        return isSharingTip ? position.left : position.right;
      };

      const isNotEnoughSpace = isRTL
        ? getPositionX() - MODAL_WIDTH < 0
        : screenWidth < getPositionX() + MODAL_WIDTH + GUID_MODAL_MARGIN;

      // Default position for most cases
      if (isLastTip && !isDesktop()) {
        return "15px";
      }

      // Handle tile view cases
      if (isTileView && isRelevantTip) {
        if (isNotEnoughSpace) {
          if (isCompleteTip) {
            return isRTL
              ? `${position.left}px`
              : `${position.right - MODAL_WIDTH}px`;
          }
          if (isSharingTip) {
            return isRTL ? "0px" : `${position.right - MODAL_WIDTH}px`;
          }
          return isRTL
            ? `${position.right - MODAL_WIDTH}px`
            : `${position.left}px`;
        }

        if (isStartingTip) {
          return isRTL
            ? `${position.left - MODAL_WIDTH - GUID_MODAL_MARGIN}px`
            : `${position.right + GUID_MODAL_MARGIN}px`;
        }

        return isRTL
          ? `${position.right - MODAL_WIDTH}px`
          : `${position.left}px`;
      }

      // Handle default RTL or left direction
      if (xDirection === "left" || isRTL) {
        return isDesktop() ? "250px" : "60px";
      }

      return "20px";
    },
    [
      isRTL,
      isStartingTip,
      isSharingTip,
      position.left,
      position.right,
      isLastTip,
      isCompleteTip,
      viewAs,
    ],
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
    isLastTip && !isDesktop()
      ? isRTL
      : ((isStartingTip || isCompleteTip || isSharingTip) &&
          viewAs === "tile") ||
        !isRTL;

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

  const clippedStyles: React.CSSProperties = {
    ["--backdrop-filter-value" as string]: theme.isBase
      ? "contrast(200%)"
      : "contrast(0.73)",
    left: `${position.left}px`,
    top: `${position.top}px`,
    width: position.width
      ? `${position.width}px`
      : infoPanelVisible && viewAs !== "tile"
        ? "calc(100% - 650px)"
        : viewAs === "row"
          ? "calc(100% - 63px)"
          : "calc(100% - 253px)",
    height: `${position.height}px`,
  };

  return (
    <div className="guidance">
      <div
        className={classNames(styles.guidBackdrop)}
        onClick={closeBackdrop}
      />
      <div
        className={classNames(styles.guidElement, {
          [styles.smallBorderRadius]:
            formFillingTipsNumber === FormFillingTipsState.Sharing ||
            formFillingTipsNumber === FormFillingTipsState.Uploading,
          [styles.fromRight]:
            infoPanelVisible &&
            isRTL &&
            viewAs !== "tile" &&
            (isStartingTip || isCompleteTip),
        })}
        style={clippedStyles}
      />
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
            header={modalText?.header}
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
              {modalText?.description}
            </Text>
          </div>

          <div
            className={
              classNames(modalStyles.footer, ["modal-footer"]) || "modal-footer"
            }
          >
            <div className="circle-container">{tipsCircles}</div>
            <div className="button-container">
              {formFillingTipsNumber !== FormFillingTipsState.Starting ? (
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
                label={isLastTip ? t("Common:GotIt") : t("Common:Next")}
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
