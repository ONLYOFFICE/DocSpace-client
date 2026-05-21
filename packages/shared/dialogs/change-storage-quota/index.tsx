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

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { QuotaForm } from "../../components/quota-form";
import { setTenantQuotaSettings } from "../../api/settings";

import { ChangeStorageQuotaDialogProps } from "./ChangeStorageQuotaDialog.types";
import styles from "./ChangeStorageQuotaDialog.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const ChangeStorageQuotaDialog = ({
  initialSize,
  portalInfo,
  isVisible,
  updateFunction,
  onClose,
  isDisableQuota,
}: ChangeStorageQuotaDialogProps) => {
  const { t } = useTranslation("Common");

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [size, setSize] = useState("");

  const isSizeError = useCallback(() => {
    if (isDisableQuota) return false;
    if (size.trim() === "") {
      setIsError(true);
      return true;
    }

    return false;
  }, [size, setIsError, isDisableQuota]);

  const onSaveClick = useCallback(async () => {
    if (isSizeError()) return;

    setIsLoading(true);

    try {
      const storageQuota = await setTenantQuotaSettings({
        TenantId: portalInfo?.tenantId,
        Quota: isDisableQuota ? -1 : size,
      });

      if (updateFunction) {
        updateFunction(storageQuota);
      }

      if (onClose) onClose();
    } catch (error) {
      toastr.error(error!);
    }

    if (onClose) onClose();
    setIsLoading(false);
  }, [
    isSizeError,
    portalInfo?.tenantId,
    isDisableQuota,
    size,
    updateFunction,
    onClose,
  ]);

  const onSetQuotaBytesSize = (bytes: string) => {
    setSize(bytes);
  };

  const onKeyUpHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.keyCode === 13 || e.which === 13) {
        if (isSizeError()) return;
        onSaveClick();
        setSize("");
        setIsError(false);
      }
    },
    [isSizeError, onSaveClick, setSize, setIsError],
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  const onCloseClick = () => {
    setSize("");
    setIsError(false);
    if (onClose) onClose();
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.modal}
      visible={isVisible}
      onClose={onCloseClick}
    >
      <ModalDialog.Header>
        {isDisableQuota
          ? t("Common:DisableStorageQuota")
          : t("Common:ManageStorageQuota")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text className={styles.description}>
          {isDisableQuota
            ? t("Common:TurnOffDiskSpaceLimit", {
                productName: getBrandName("ProductName"),
              })
            : t("Common:SetDiskSpaceQuota", {
                productName: getBrandName("ProductName"),
              })}
        </Text>
        {!isDisableQuota ? (
          <QuotaForm
            onSetQuotaBytesSize={onSetQuotaBytesSize}
            isLoading={isLoading}
            isError={isError}
            initialSize={initialSize ? Number(initialSize) : 0}
            isAutoFocussed
            dataTestId="storage_quota"
          />
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          primary
          onClick={onSaveClick}
          isLoading={isLoading}
          isDisabled={!isDisableQuota ? size.trim() === "" : false}
          scale
          testId="storage_quota_save_button"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onCloseClick}
          isDisabled={isLoading}
          scale
          testId="storage_quota_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
