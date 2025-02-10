// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useEffect, useState, useMemo } from "react";

import ButtonUploadIcon from "PUBLIC_DIR/images/button.upload.react.svg";
import ButtonFileIcon from "PUBLIC_DIR/images/button.file.react.svg";
import ButtonTrashIcon from "PUBLIC_DIR/images/button.trash.react.svg";
import ButtonMoveIcon from "PUBLIC_DIR/images/button.move.react.svg";
import ButtonDuplicateIcon from "PUBLIC_DIR/images/button.duplicate.react.svg";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import ButtonPlusIcon from "PUBLIC_DIR/images/icons/16/button.plus.react.svg";
import ButtonMinusIcon from "PUBLIC_DIR/images/icons/16/button.minus.react.svg";
import RefreshIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg";
import CloseIcon from "PUBLIC_DIR/images/close-icon.react.svg";
import ExportRoomIndexIcon from "PUBLIC_DIR/images/icons/16/export-room-index.react.svg";

import { classNames } from "../../utils";

import { FloatingButtonProps } from "./FloatingButton.types";
import { FloatingButtonIcons } from "./FloatingButton.enums";
import styles from "./FloatingButton.module.scss";

const MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR = 3;

const ANIMATION_DELAY = 1000;

const ICON_COMPONENTS = {
  [FloatingButtonIcons.upload]: <ButtonUploadIcon data-icon="upload" />,
  [FloatingButtonIcons.file]: <ButtonFileIcon data-icon="file" />,
  [FloatingButtonIcons.trash]: <ButtonTrashIcon data-icon="trash" />,
  [FloatingButtonIcons.move]: <ButtonMoveIcon data-icon="move" />,
  [FloatingButtonIcons.plus]: <ButtonPlusIcon data-icon="plus" />,
  [FloatingButtonIcons.minus]: <ButtonMinusIcon data-icon="minus" />,
  [FloatingButtonIcons.refresh]: <RefreshIcon data-icon="refresh" />,
  [FloatingButtonIcons.duplicate]: (
    <ButtonDuplicateIcon data-icon="duplicate" />
  ),
  [FloatingButtonIcons.exportIndex]: (
    <ExportRoomIndexIcon data-icon="exportIndex" />
  ),
} as const;

const useProgressAnimation = (percent: number) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const timerId = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerId.current = setTimeout(
      () => setAnimationCompleted(percent === 100),
      ANIMATION_DELAY,
    );

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [percent]);

  return animationCompleted;
};

const FloatingButton = ({
  id,
  className,
  style,
  icon = FloatingButtonIcons.upload,
  alert = false,
  percent = 0,
  onClick,
  color,
  clearUploadedFilesHistory,
  showTwoProgress,
}: FloatingButtonProps) => {
  const animationCompleted = useProgressAnimation(percent);

  const displayProgress = useMemo(() => {
    return (
      !(percent === 100 && animationCompleted) &&
      icon !== FloatingButtonIcons.minus
    );
  }, [percent, animationCompleted, icon]);

  const iconComponent = useMemo(() => {
    return (
      ICON_COMPONENTS[icon] ?? ICON_COMPONENTS[FloatingButtonIcons.duplicate]
    );
  }, [icon]);

  const handleProgressClear = () => {
    clearUploadedFilesHistory?.();
  };

  const buttonClassName = useMemo(() => {
    return classNames([className, "not-selectable"]) || "not-selectable";
  }, [className]);

  return (
    <div
      className={classNames(
        styles.floatingButtonWrapper,
        {
          [styles.showTwoProgress]: showTwoProgress,
        },
        "layout-progress-bar_wrapper",
      )}
    >
      <div
        id={id}
        onClick={onClick}
        data-testid="floating-button"
        data-role="button"
        data-display-progress={displayProgress ? "true" : "false"}
        aria-label={`${icon} button`}
        className={classNames(styles.circleWrap, buttonClassName)}
        style={
          color
            ? ({
                "--floating-circle-button-background": color,
                ...style,
              } as React.CSSProperties)
            : { ...style }
        }
      >
        <div
          className={classNames(styles.circle, {
            [styles.showProgress]:
              percent > MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR &&
              displayProgress,
            [styles.loading]:
              percent <= MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR &&
              displayProgress,
          })}
          style={
            {
              "--circle-rotation-angle": `${percent * 1.8}deg`,
            } as React.CSSProperties
          }
          data-testid="floating-button-progress"
        >
          <div
            className={classNames(
              styles.circleMask,
              "circle__mask circle__full",
            )}
          >
            <div className={classNames(styles.circleFill, "circle__fill")} />
          </div>
          <div className={classNames(styles.circleMask, "circle__mask")}>
            <div className={classNames(styles.circleFill, "circle__fill")} />
          </div>

          <div
            className={classNames(
              styles.floatingButton,
              styles.circle__background,
              "circle__background",
            )}
            style={
              { "--floating-button-background": color } as React.CSSProperties
            }
          >
            <div className={classNames(styles.iconBox, "icon-box")}>
              {iconComponent}
            </div>
            {alert ? (
              <div
                className={styles.alertIcon}
                data-testid="floating-button-alert"
              >
                <ButtonAlertIcon
                  style={{ overflow: "hidden", verticalAlign: "middle" }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {clearUploadedFilesHistory && percent === 100 ? (
        <CloseIcon
          className="layout-progress-bar_close-icon"
          onClick={handleProgressClear}
          data-testid="floating-button-close-icon"
        />
      ) : null}
    </div>
  );
};

export { FloatingButton, FloatingButtonIcons };
