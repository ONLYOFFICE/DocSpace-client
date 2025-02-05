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

import React, { useMemo } from "react";

import UploadIcon from "PUBLIC_DIR/images/icons/24/upload.react.svg";
import TrashIcon from "PUBLIC_DIR/images/icons/24/trash.react.svg";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import PlusIcon from "PUBLIC_DIR/images/icons/16/button.plus.react.svg";
import MinusIcon from "PUBLIC_DIR/images/icons/16/button.minus.react.svg";
import RefreshIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg";
import CloseIcon from "PUBLIC_DIR/images/close-icon.react.svg";
import ExportRoomIndexIcon from "PUBLIC_DIR/images/icons/24/export-room-index.react.svg";
import HorizontalDotsIcon from "PUBLIC_DIR/images/icons/16/horizontal-dots.react.svg";
import ArrowIcon from "PUBLIC_DIR/images/icons/16/top-arrow.react.svg";
import TickIcon from "PUBLIC_DIR/images/icons/12/tick.react.svg";
import DeletePermanentlyIcon from "PUBLIC_DIR/images/icons/24/delete-permanently.react.svg";
import CopyIcon from "PUBLIC_DIR/images/icons/24/copy.react.svg";
import DownloadIcon from "PUBLIC_DIR/images/icons/24/download.react.svg";
import DuplicateIcon from "PUBLIC_DIR/images/icons/24/duplicate.react.svg";
import MarkAsReadIcon from "PUBLIC_DIR/images/icons/24/mark-as-read.react.svg";
import MoveIcon from "PUBLIC_DIR/images/icons/24/move.react.svg";
import FileIcon from "PUBLIC_DIR/images/icons/24/file.react.svg";

import { classNames } from "../../utils";

import { FloatingButtonProps } from "./FloatingButton.types";
import { FloatingButtonIcons } from "./FloatingButton.enums";
import styles from "./FloatingButton.module.scss";

const ICON_COMPONENTS = {
  [FloatingButtonIcons.upload]: <UploadIcon />,
  [FloatingButtonIcons.other]: <FileIcon />,
  [FloatingButtonIcons.trash]: <TrashIcon />,
  [FloatingButtonIcons.move]: <MoveIcon />,
  [FloatingButtonIcons.plus]: <PlusIcon />,
  [FloatingButtonIcons.minus]: <MinusIcon />,
  [FloatingButtonIcons.refresh]: <RefreshIcon />,
  [FloatingButtonIcons.duplicate]: <DuplicateIcon />,
  [FloatingButtonIcons.exportIndex]: <ExportRoomIndexIcon />,
  [FloatingButtonIcons.dots]: <HorizontalDotsIcon />,
  [FloatingButtonIcons.arrow]: <ArrowIcon />,
  [FloatingButtonIcons.deletePermanently]: <DeletePermanentlyIcon />,
  [FloatingButtonIcons.copy]: <CopyIcon />,
  [FloatingButtonIcons.download]: <DownloadIcon />,
  [FloatingButtonIcons.markAsRead]: <MarkAsReadIcon />,
} as const;

const FloatingButton = ({
  id,
  className,
  style,
  icon = FloatingButtonIcons.other,
  alert = false,
  completed = false,
  onClick,
  color,
  clearUploadedFilesHistory,
  withoutProgress,
  showCancelButton,
}: FloatingButtonProps) => {
  const iconComponent = useMemo(() => {
    return ICON_COMPONENTS[icon] ?? ICON_COMPONENTS[FloatingButtonIcons.other];
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
        "layout-progress-bar_wrapper",
      )}
    >
      <div
        id={id}
        onClick={onClick}
        data-testid="floating-button"
        data-role="button"
        aria-label={`${icon} button`}
        className={classNames(styles.circleWrap, buttonClassName, {
          [styles.loading]: !completed,
          [styles.completed]: completed,
        })}
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
            [styles.loading]: !completed,
            [styles.completed]: completed,
          })}
        >
          {withoutProgress ? null : <div className={styles.loader} />}
          <div className={classNames(styles.floatingButton)}>
            <div
              className={classNames(styles.iconBox, "icon-box", {
                [styles.accentIcon]: [
                  FloatingButtonIcons.upload,
                  FloatingButtonIcons.trash,
                  FloatingButtonIcons.deletePermanently,
                  FloatingButtonIcons.other,
                ].includes(icon),
              })}
            >
              {iconComponent}
            </div>
            {alert || completed ? (
              <div
                data-testid="floating-button-alert"
                className={classNames(styles.alertIcon, {
                  [styles.alert]: alert,
                  [styles.complete]: !alert && completed,
                })}
              >
                {alert ? (
                  <ButtonAlertIcon
                    style={{ overflow: "hidden", verticalAlign: "middle" }}
                  />
                ) : (
                  <TickIcon
                    className="tick-icon"
                    style={{ overflow: "hidden", verticalAlign: "middle" }}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showCancelButton ? (
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
