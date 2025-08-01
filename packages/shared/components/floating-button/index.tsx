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
import BackupIcon from "PUBLIC_DIR/images/icons/24/backup.react.svg";

import { classNames } from "../../utils";

import { FloatingButtonProps } from "./FloatingButton.types";
import { FloatingButtonIcons } from "./FloatingButton.enums";
import styles from "./FloatingButton.module.scss";

const ICON_COMPONENTS = {
  [FloatingButtonIcons.upload]: <UploadIcon data-testid="icon-upload" />,
  [FloatingButtonIcons.other]: <FileIcon data-testid="icon-other" />,
  [FloatingButtonIcons.trash]: <TrashIcon data-testid="icon-trash" />,
  [FloatingButtonIcons.move]: <MoveIcon data-testid="icon-move" />,
  [FloatingButtonIcons.plus]: <PlusIcon data-testid="icon-plus" />,
  [FloatingButtonIcons.minus]: <MinusIcon data-testid="icon-minus" />,
  [FloatingButtonIcons.refresh]: <RefreshIcon data-testid="icon-refresh" />,
  [FloatingButtonIcons.duplicate]: (
    <DuplicateIcon data-testid="icon-duplicate" />
  ),
  [FloatingButtonIcons.exportIndex]: (
    <ExportRoomIndexIcon data-testid="icon-exportIndex" />
  ),
  [FloatingButtonIcons.dots]: <HorizontalDotsIcon data-testid="icon-dots" />,
  [FloatingButtonIcons.arrow]: <ArrowIcon data-testid="icon-arrow" />,
  [FloatingButtonIcons.deletePermanently]: (
    <DeletePermanentlyIcon data-testid="icon-deletePermanently" />
  ),
  [FloatingButtonIcons.copy]: <CopyIcon data-testid="icon-copy" />,
  [FloatingButtonIcons.download]: <DownloadIcon data-testid="icon-download" />,
  [FloatingButtonIcons.markAsRead]: (
    <MarkAsReadIcon data-testid="icon-markAsRead" />
  ),
  [FloatingButtonIcons.backup]: <BackupIcon data-testid="icon-backup" />,
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
  withoutStatus = false,
  percent,
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

  const accentIcons = [
    FloatingButtonIcons.upload,
    FloatingButtonIcons.trash,
    FloatingButtonIcons.deletePermanently,
    FloatingButtonIcons.other,
  ] as const;

  const isAccentIcon = accentIcons.includes(
    icon as (typeof accentIcons)[number],
  );

  const isCompleted = completed || (completed && percent && percent >= 100);

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
          [styles.loading]: !isCompleted,
          [styles.completed]: isCompleted,
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
            [styles.loading]: !isCompleted,
            [styles.completed]: isCompleted,
          })}
          data-testid="floating-button-progress"
        >
          {withoutProgress ? null : (
            <div
              className={classNames(styles.loader, {
                [styles.withProgress]: !!percent,
              })}
              {...(percent && {
                style: {
                  "--percent-percentage": `${percent}%`,
                } as React.CSSProperties,
              })}
            />
          )}
          <div className={classNames(styles.floatingButton)}>
            <div
              className={classNames(styles.iconBox, "icon-box", {
                [styles.accentIcon]: isAccentIcon,
              })}
            >
              {iconComponent}
            </div>
            {!withoutStatus && (alert || isCompleted) ? (
              <div
                data-testid="floating-button-alert"
                className={classNames(styles.alertIcon, {
                  [styles.alert]: alert,
                  [styles.complete]: !alert && isCompleted,
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
