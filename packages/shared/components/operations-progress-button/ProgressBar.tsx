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
import ClearIcon from "PUBLIC_DIR/images/icons/16/clear.react.svg";
import AlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import TickIcon from "PUBLIC_DIR/images/icons/12/tick.react.svg";
import RightArrowIcon from "PUBLIC_DIR/images/icons/12/right-arrow.react.svg";

import { classNames } from "../../utils";
import { Text } from "../text";
import { IconButton } from "../icon-button";
import { globalColors } from "../../themes";
import styles from "./OperationsProgressButton.module.scss";
import { ProgressBarMobileProps } from "./OperationsProgressButton.types";
import { LoadingButton } from "../loading-button";

const ProgressBar = ({
  label,
  alert,
  percent,
  open,
  onCancel,
  withoutProgress,
  iconUrl,
  completed,
  onClearProgress,
  operationId,
  operation,
  onOpenPanel,
  withoutStatus,
}: ProgressBarMobileProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const onCloseClick = () => {
    if (onClearProgress && operation) {
      setIsVisible(false);
      closeTimerRef.current = setTimeout(() => {
        onClearProgress(operationId ?? null, operation);
      }, 300);
    }
  };

  const onClearClick = () => {
    if (!onClearProgress || !operation) return;
    setIsVisible(false);
    clearTimerRef.current = setTimeout(() => {
      onClearProgress(operationId ?? null, operation);
    }, 300);
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return (
    <div
      className={classNames(styles.progressBarWrapper, {
        [styles.isUploading]: open,
        [styles.fadeOut]: !isVisible,
      })}
    >
      <div className={styles.progressWrapper}>
        <div
          className={classNames(styles.progressMainContainer, {
            [styles.withClick]: onOpenPanel,
          })}
          {...(onOpenPanel && { onClick: onOpenPanel })}
        >
          <div>
            <IconButton
              {...(onOpenPanel && { onClick: onOpenPanel })}
              iconName={iconUrl}
              size={16}
              color="white"
            />
            {!withoutStatus && (alert || completed) ? (
              <div
                className={classNames(styles.infoIcon, {
                  [styles.alert]: alert,
                  [styles.complete]: !alert && completed,
                })}
              >
                {alert ? <AlertIcon /> : <TickIcon />}
              </div>
            ) : null}
          </div>
          <div className={styles.labelWrapper}>
            <Text
              className={classNames(
                (styles.progressHeader,
                {
                  [styles.withClick]: onOpenPanel,
                }),
              )}
              fontSize="14px"
              fontWeight={600}
              truncate
              color="white"
            >
              {label}
            </Text>
            {onOpenPanel ? <RightArrowIcon /> : null}
          </div>
        </div>

        <div className={styles.progressInfoWrapper}>
          {withoutProgress ? (
            completed ? (
              <ClearIcon onClick={onCloseClick} />
            ) : (
              <div className={styles.progressLoader} />
            )
          ) : completed ? (
            <ClearIcon onClick={onClearClick} />
          ) : (
            <LoadingButton
              percent={percent}
              onClick={onCancel}
              backgroundColor={globalColors.grayText}
              loaderColor={globalColors.white}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { ProgressBar };
