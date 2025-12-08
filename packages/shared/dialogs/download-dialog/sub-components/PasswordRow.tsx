/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import RemoveIcon from "PUBLIC_DIR/images/remove.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import ProtectedReactSvgUrl from "PUBLIC_DIR/images/icons/16/protected.react.svg?url";

import type { ContextMenuModel } from "../../../components/context-menu";
import { Text } from "../../../components/text";
import { Button, ButtonSize } from "../../../components/button";
import { IconButton } from "../../../components/icon-button";
import { ContextMenuButton } from "../../../components/context-menu-button";
import { SimulatePassword } from "../../../components/simulate-password";

import { isFile, type PasswordRowProps } from "../DownloadDialog.types";
import styles from "../DownloadDialog.module.scss";

export const PasswordRow = ({
  item,
  resetDownloadedFileFormat,
  discardDownloadedFile,
  updateDownloadedFilePassword,
  getItemIcon,
  type,
}: PasswordRowProps) => {
  const [showPasswordInput, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const { t } = useTranslation(["Common"]);
  const inputRef = useRef(null);

  const onInputClick = useCallback(() => {
    const newState = !showPasswordInput;

    setShowPassword(newState);
  }, [showPasswordInput]);

  const onButtonClick = useCallback(() => {
    onInputClick();
    updateDownloadedFilePassword(item.id, password, type);
  }, [item.id, onInputClick, password, type, updateDownloadedFilePassword]);

  const onChangePassword = useCallback((pwd: string) => {
    setPassword(pwd);
  }, []);

  const onChangeInOriginal = () => {
    if (!isFile(item)) return;

    resetDownloadedFileFormat(item.id, item.fileExst, type);
  };

  const removeFromList = () => {
    discardDownloadedFile(item.id, type);
  };

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if ((!showPasswordInput && type === "password") || !password) return;

      event.stopPropagation();
      event.preventDefault();

      if (event.key === "Enter") {
        onButtonClick();
      }
    },
    [onButtonClick, password, showPasswordInput, type],
  );

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp, true);

    return () => {
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [onKeyUp]);

  const getOptions = () => {
    const options: ContextMenuModel[] = [];

    if (type !== "original") {
      options.push({
        key: "original-format",
        label: t("Common:OriginalFormat"),
        onClick: onChangeInOriginal,
        disabled: false,
        icon: DownloadAsReactSvgUrl,
      });
    }

    options.push({
      key: "enter-password",
      label: t("Common:EnterPassword"),
      onClick: onInputClick,
      disabled: false,
      icon: ProtectedReactSvgUrl,
    });

    if (type !== "remove") {
      options.push({
        key: "remove",
        label: t("Common:RemoveFromList"),
        onClick: removeFromList,
        disabled: false,
        icon: RemoveIcon,
      });
    }

    return options;
  };

  const element = getItemIcon(item);

  return (
    <div className={styles.downloadContent}>
      <div className={styles.downloadDialogRow}>
        <div
          className={classNames(
            styles.downloadDialogMainContent,
            styles.passwordContent,
          )}
          onClick={onInputClick}
        >
          <IconButton
            className={styles.removeIcon}
            size={16}
            iconName={ProtectedReactSvgUrl}
            onClick={onInputClick}
            color={showPasswordInput ? "accent" : undefined}
          />
          <div>{element}</div>
          <Text
            fontWeight="600"
            fontSize="14px"
            className={styles.passwordTitle}
            dir="auto"
            truncate
          >
            {item.title}
          </Text>
        </div>
        <div className={styles.downloadDialogActions}>
          <ContextMenuButton
            className="expandButton"
            directionX="left"
            getData={getOptions}
            title={t("Common:Actions")}
            isDisabled={false}
            usePortal
            iconName={VerticalDotsReactSvgUrl}
          />
        </div>
      </div>
      {showPasswordInput ? (
        <div className={styles.passwordInput}>
          <SimulatePassword
            onChange={onChangePassword}
            forwardedRef={inputRef}
            inputValue={password}
          />
          <Button
            id="conversion-button"
            size={ButtonSize.small}
            scale
            primary
            label={t("Common:SaveButton")}
            onClick={onButtonClick}
            isDisabled={!password}
          />
        </div>
      ) : null}
    </div>
  );
};
