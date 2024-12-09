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

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { setTenantQuotaSettings } from "@docspace/shared/api/settings";

import QuotaForm from "../../QuotaForm";

const ChangeStorageQuotaDialog = (props) => {
  const {
    initialSize,
    portalInfo,
    isVisible,
    updateFunction,
    onClose,
    isDisableQuota,
  } = props;

  const { t } = useTranslation("Common");

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [size, setSize] = useState("");

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [size]);

  const isSizeError = () => {
    if (isDisableQuota) return false;

    if (size.trim() === "") {
      setIsError(true);
      return true;
    }

    return false;
  };
  const onSaveClick = async () => {
    if (isSizeError()) return;

    isError && setIsError(false);
    setIsLoading(true);

    try {
      const storageQuota = await setTenantQuotaSettings({
        TenantId: portalInfo.tenantId,
        Quota: isDisableQuota ? -1 : size,
      });

      await updateFunction(storageQuota);

      toastr.success(t("Common:StorageQuotaSet"));
    } catch (e) {
      toastr.error(e);
    }

    setSize("");
    onClose && onClose();
    setIsLoading(false);
  };

  const onSetQuotaBytesSize = (bytes) => {
    setSize(bytes);
  };
  const onKeyUpHandler = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      if (isSizeError()) return;

      onSaveClick();
      setSize("");
      setIsError(false);
    }
  };
  const onCloseClick = () => {
    setSize("");
    setIsError(false);
    onClose && onClose();
  };

  return (
    <ModalDialog visible={isVisible} onClose={onCloseClick}>
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
        {!isDisableQuota && (
          <QuotaForm
            onSetQuotaBytesSize={onSetQuotaBytesSize}
            isLoading={isLoading}
            isError={isError}
            initialSize={initialSize}
            isAutoFocussed
          />
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onSaveClick}
          isLoading={isLoading}
          isDisabled={!isDisableQuota && size.trim() === ""}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseClick}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ChangeStorageQuotaDialog;
