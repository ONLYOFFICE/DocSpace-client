/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import RemoveIcon from "PUBLIC_DIR/images/remove.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import ProtectedReactSvgUrl from "PUBLIC_DIR/images/icons/16/protected.react.svg?url";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
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
