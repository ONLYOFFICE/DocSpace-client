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
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

import PublicRoomIcon from "PUBLIC_DIR/images/icons/32/room/public.svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { ValidationStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { validatePublicRoomPassword } from "@docspace/shared/api/rooms";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import type { PasswordEntryDialogProps } from "./PasswordEntryDialog.types";
import styles from "./PasswordEntry.module.scss";

const PasswordEntryDialog = ({
  onClose,
  openItemAction,
  item,
  isDownload,
  onClickDownload,
}: PasswordEntryDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>(undefined);

  const { t } = useTranslation(["UploadPanel", "Common"]);

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const handleClose = () => {
    onClose();
    abortControllerRef.current?.abort();
  };

  const handleSubmit = async () => {
    if (!item.requestToken) return;

    if (password.trim().length === 0) {
      return setErrorMessage(t("Common:RequiredField"));
    }

    setIsLoading(true);
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await validatePublicRoomPassword(
        item.requestToken,
        password,
        abortControllerRef.current.signal,
      );

      switch (response?.status) {
        case ValidationStatus.Ok: {
          if (isDownload) {
            onClickDownload(item, t);
          } else {
            openItemAction(item, t);
          }

          onClose();
          break;
        }

        case ValidationStatus.InvalidPassword: {
          setErrorMessage(t("Common:IncorrectPassword"));
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) return;

      toastr.error(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const title = item.title;

  return (
    <ModalDialog
      visible
      withForm
      autoMaxHeight
      onClose={handleClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:EnterPassword")}</ModalDialog.Header>
      <ModalDialog.Body>
        <section className={styles.content}>
          <span>{t("Common:NeedPassword")}:</span>
          <div className={styles.roomIconWrapper}>
            <PublicRoomIcon />
            <h4 className={styles.roomTitle}>{title}</h4>
          </div>
          <FieldContainer
            isVertical
            labelVisible={false}
            hasError={!!errorMessage}
            errorMessage={errorMessage}
            className={styles.passwordField}
          >
            <PasswordInput
              scale
              simpleView
              tabIndex={0}
              id="password"
              isAutoFocussed
              isDisableTooltip
              inputName="password"
              inputValue={password}
              size={InputSize.middle}
              isDisabled={isLoading}
              forwardedRef={inputRef}
              hasError={!!errorMessage}
              onChange={onChangePassword}
              autoComplete="current-password"
              placeholder={t("Common:Password")}
            />
          </FieldContainer>
        </section>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          tabIndex={0}
          type="submit"
          isLoading={isLoading}
          size={ButtonSize.normal}
          onClick={handleSubmit}
          label={t("Common:ContinueButton")}
        />
        <Button
          scale
          tabIndex={0}
          onClick={handleClose}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default PasswordEntryDialog;
