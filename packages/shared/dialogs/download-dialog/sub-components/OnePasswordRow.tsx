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

import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import RemoveIcon from "PUBLIC_DIR/images/remove.react.svg?url";

import { toastr } from "@docspace/ui-kit/components/toast";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { SimulatePassword } from "../../../components/simulate-password";
import { isMobile } from "../../../utils";

import styles from "../DownloadDialog.module.scss";
import { isFile, type OnePasswordRowProps } from "../DownloadDialog.types";

export const OnePasswordRow = ({
  item,
  getItemIcon,
  onDownload,
  downloadItems,
  onClosePanel,
  visible,
}: OnePasswordRowProps) => {
  const [password, setPassword] = useState("");
  const { t } = useTranslation(["Common"]);
  const inputRef = useRef(null);

  const onChangePassword = useCallback((pwd: string) => {
    setPassword(pwd);
  }, []);

  const updateDownloadItem = useCallback(
    (fileId: number, updates: { format?: string; password?: string }) => {
      const files = [...downloadItems];
      const itemToUpdate = files.find((f) => f.id === fileId);

      if (itemToUpdate) {
        Object.assign(itemToUpdate, updates);
      }

      return files;
    },
    [downloadItems],
  );

  const onDownloadInOriginal = () => {
    if (!isFile(item)) return;
    const files = updateDownloadItem(item.id, { format: item.fileExst });
    onDownload(files);
  };

  const onDownloadWithPassword = useCallback(() => {
    if (!password.trim().length) return;

    const files = updateDownloadItem(item.id, {
      password,
    });
    toastr.clear();
    onDownload(files);
  }, [item.id, onDownload, password, updateDownloadItem]);

  const onRemoveFromDownload = () => {
    const fileId = item.id;

    const files = downloadItems.filter((f) => f.id !== fileId);
    if (!files.length) {
      onClosePanel();
      return;
    }
    onDownload(files);
  };

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (event.key === "Enter") {
        onDownloadWithPassword();
      }
    },
    [onDownloadWithPassword],
  );

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp, true);

    return () => {
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [onKeyUp]);

  const element = getItemIcon(item);

  const getOptions = () => {
    const options = [
      {
        key: "original-format",
        label: t("Common:OriginalFormat"),
        onClick: onDownloadInOriginal,
        disabled: false,
        icon: DownloadAsReactSvgUrl,
      },
      {
        key: "cancel-action",
        label: t("Common:CancelDownload"),
        onClick: onRemoveFromDownload,
        disabled: false,
        icon: RemoveIcon,
      },
    ];

    return options;
  };

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={onClosePanel}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:DownloadAs")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div
          className={styles.singlePasswordFile}
          data-testid="one-password-row-body"
        >
          <Text>{t("Common:AccessPasswordMessage")}</Text>
          <div className={styles.singlePasswordContent}>
            <div className={styles.singlePasswordRow}>
              {element}
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.passwordTitle}
                truncate
                dir="auto"
              >
                {item.title}
              </Text>
            </div>
            <ContextMenuButton
              directionX={isMobile() ? "left" : "right"}
              getData={getOptions}
              title={t("Common:Actions")}
              isDisabled={false}
              usePortal
              iconName={VerticalDotsReactSvgUrl}
            />
          </div>
          <SimulatePassword
            onChange={onChangePassword}
            forwardedRef={inputRef}
            inputMaxWidth="none"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:ContinueButton")}
          size={ButtonSize.normal}
          primary
          onClick={onDownloadWithPassword}
          isDisabled={!password.trim().length}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onRemoveFromDownload}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
