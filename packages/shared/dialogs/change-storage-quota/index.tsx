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

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { Button, ButtonSize } from "../../components/button";
import { Text } from "../../components/text";
import { toastr } from "../../components/toast";
import { QuotaForm } from "../../components/quota-form";
import { setTenantQuotaSettings } from "../../api/settings";

import { ChangeStorageQuotaDialogProps } from "./ChangeStorageQuotaDialog.types";

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
        <Text noSelect>
          {isDisableQuota
            ? t("Common:TurnOffDiskSpaceLimit", {
                productName: t("Common:ProductName"),
              })
            : t("Common:SetDiskSpaceQuota", {
                productName: t("Common:ProductName"),
              })}
        </Text>
        {!isDisableQuota ? (
          <QuotaForm
            onSetQuotaBytesSize={onSetQuotaBytesSize}
            isLoading={isLoading}
            isError={isError}
            initialSize={Number(initialSize)}
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
