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
}: GuidProps) => {
  const theme = useTheme();

  const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);

  const { isRTL } = useInterfaceDirection();

  const [modalTop, setModalTop] = React.useState<null | number>(null);
  const [directionX, setDirectionX] = React.useState<null | string>(
    isRTL ? "right" : "left",
  );

  const modalText = getHeaderText(formFillingTipsNumber, t);

  const isLastTip = formFillingTipsNumber === FormFillingTipsState.Uploading;

  const onCloseBackdrop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const onNextTips = () => {
    if (isLastTip) {
      return onClose();
    }
    setFormFillingTipsNumber(formFillingTipsNumber + 1);
  };

  const onPrevTips = () => {
    setFormFillingTipsNumber(formFillingTipsNumber - 1);
  };

  const tipsCircle = [];

  for (let i = 1; i < 6; i += 1) {
    tipsCircle.push(
      <div
        className={classNames(styles.tipsCircle, {
          [styles.isSelected]: i === formFillingTipsNumber,
        })}
        key={`tips_circle_${i}`}
      />,
    );
  }

  const onResize = React.useCallback(() => {
    const screenHeight = document.documentElement.clientHeight;
    const screenWidth = document.documentElement.clientWidth;

    if (position.left + MODAL_WIDTH + GUID_MODAL_MARGIN >= screenWidth) {
      if (isRTL) {
        setDirectionX("right");
      } else {
        setDirectionX("left");
      }
    } else if (isRTL) {
      setDirectionX("right");
    } else {
      setDirectionX("left");
    }

    if (screenHeight < position.bottom + GUID_MODAL_MARGIN + MAX_MODAL_HEIGHT) {
      return setModalTop(position.top - GUID_MODAL_MARGIN - MAX_MODAL_HEIGHT);
    }
    setModalTop(position.bottom + GUID_MODAL_MARGIN);
  }, [position.bottom, position.left, position.top, isRTL]);

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [
    onResize,
    position.bottom,
    position.height,
    position.left,
    position.top,
    position.width,
  ]);

  if (isMobile()) {
    onClose();
  }

  const dialogClassName = classNames(
    styles.dialog,
    "not-selectable",
    "dialog",
    {
      [styles.directionLeft]: directionX === "left",
      [styles.directionRight]: directionX === "right",
    },
  );

  const dialogStyles: React.CSSProperties = {
    ["--manual-x" as string]:
      directionX === "left" || isRTL
        ? isLastTip && !isDesktop()
          ? isRTL
            ? `${position.right - MODAL_WIDTH}px`
            : `${position.left - MODAL_WIDTH}px`
          : "250px"
        : "20px",
    top: `${modalTop}px`,
  };

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
      : infoPanelVisible
        ? "calc(100% - 650px)"
        : "100%",
    height: `${position.height}px`,
  };

  return (
    <div className="guidance">
      <div
        className={classNames(styles.guidBackdrop)}
        onClick={onCloseBackdrop}
      />
      <div className={classNames(styles.guidElement)} style={clippedStyles} />
      <div
        id="modal-onMouseDown-close"
        role="dialog"
        className={dialogClassName}
        style={dialogStyles}
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
            <div className="circle-container">{tipsCircle}</div>
            <div className="button-container">
              {formFillingTipsNumber !== FormFillingTipsState.Starting ? (
                <Button
                  id="form-filling_tips_back"
                  key="TipsBack"
                  label={t("Common:Back")}
                  size={ButtonSize.extraSmall}
                  onClick={onPrevTips}
                />
              ) : null}

              <Button
                id="form-filling_tips_next"
                key="TipsNext"
                primary
                label={isLastTip ? t("Common:GotIt") : t("Common:Next")}
                size={ButtonSize.extraSmall}
                onClick={onNextTips}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Guid };
