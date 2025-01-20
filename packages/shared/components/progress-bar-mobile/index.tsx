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

import { IconButton } from "../icon-button";
import { Text } from "../text";
import { classNames } from "../../utils";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";

import styles from "./ProgressBarMobile.module.scss";
import { ProgressBarMobileProps } from "./ProgressBarMobile.types";

const ProgressBarMobile = ({
  label,
  status,
  percent,
  open,
  onCancel,
  icon,
  onClickAction,
  hideButton,
  error,
  withoutProgress,
  iconUrl,
  completed,
  onClearProgress,
  operationId,
  operation,
}: ProgressBarMobileProps) => {
  const uploadPercent = percent > 100 ? 100 : percent;

  const onClickHeaderAction = () => {
    onClickAction?.();
    hideButton?.();
  };

  const onCloseClick = () => {
    if (onClearProgress && operation) {
      onClearProgress(null, operation);
    }
  };
  console.log("====completed", completed);

  return (
    <div
      className={classNames(styles.progressBarContainer, {
        [styles.isUploading]: open,
      })}
    >
      <div className={styles.progressWrapper}>
        <div className={styles.progressMainContainer}>
          <div>
            <IconButton onClick={onCancel} iconName={iconUrl} size={16} />
            {/* {alert ? (
              <div
                className={styles.alertIcon}
                data-testid="floating-button-alert"
              >
                <ButtonAlertIcon
                  style={{ overflow: "hidden", verticalAlign: "middle" }}
                />
              </div>
            ) : null} */}
          </div>
          <Text
            className={styles.progressHeader}
            fontSize="14px"
            fontWeight={600}
            truncate
          >
            {label}
          </Text>
        </div>

        <div className={styles.progressInfoWrapper}>
          {withoutProgress ? (
            completed ? (
              <IconButton
                onClick={onCloseClick}
                iconName={CrossIcon}
                size={16}
              />
            ) : (
              <div className={styles.progressLoader} />
            )
          ) : (
            <IconButton
              onClick={onClickHeaderAction}
              iconName={ArrowIcon}
              size={14}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { ProgressBarMobile };
