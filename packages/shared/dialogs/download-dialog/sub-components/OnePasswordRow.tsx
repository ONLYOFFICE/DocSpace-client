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

import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import RemoveIcon from "PUBLIC_DIR/images/remove.react.svg?url";

import { toastr } from "../../../components/toast";
import { ContextMenuButton } from "../../../components/context-menu-button";
import { ModalDialog, ModalDialogType } from "../../../components/modal-dialog";
import { Button, ButtonSize } from "../../../components/button";
import { Text } from "../../../components/text";
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

  const onChangePassword = (pwd: string) => {
    setPassword(pwd);
  };

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
