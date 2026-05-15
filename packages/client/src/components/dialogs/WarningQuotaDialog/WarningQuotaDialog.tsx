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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { WarningQuotaDialogProps } from "./WarningQuotaDialog.types";
import { getBrandName } from "@docspace/shared/constants/brands";

export const WarningQuotaDialog = ({
  t,
  visible,
  onClickRedirect,
  onCloseDialog,
  defaultRoomsQuota,
  defaultUsersQuota,
  tenantCustomQuota,
  isDefaultRoomsQuotaSet,
  isDefaultUsersQuotaSet,
  isTenantCustomQuotaSet,
}: WarningQuotaDialogProps) => {
  const getWarningDescription = () => {
    const quotaLimits = [];

    if (isDefaultRoomsQuotaSet) {
      quotaLimits.push(
        t("Settings:RoomsQuotaLimit", {
          roomsQuotaLimit: getConvertedSize(t, defaultRoomsQuota),
        }),
      );
    }
    if (isDefaultUsersQuotaSet) {
      quotaLimits.push(
        t("Settings:UsersQuotaLimit", {
          usersQuotaLimit: getConvertedSize(t, defaultUsersQuota),
        }),
      );
    }
    if (isTenantCustomQuotaSet) {
      quotaLimits.push(
        t("Settings:TenantQuotaLimit", {
          tenantQuotaLimit: getConvertedSize(t, tenantCustomQuota),
          productName: getBrandName("ProductName"),
        }),
      );
    }

    if (quotaLimits.length === 0) {
      return "";
    }

    return t("Settings:StorageQuotaWarningDescription", {
      quotaLimits: quotaLimits.join(", "),
      productName: getBrandName("ProductName"),
    });
  };

  return (
    <ModalDialog
      autoMaxHeight
      visible={visible}
      onClose={onCloseDialog}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text style={{ marginBottom: "16px" }}>{getWarningDescription()}</Text>
        <Text>{t("Settings:WantToContinueQuota")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:ChangeQuota")}
          size={ButtonSize.normal}
          primary
          onClick={onClickRedirect}
          scale
          testId="continue_change_quota_button"
        />
        <Button
          label={t("Common:ContinueButton")}
          size={ButtonSize.normal}
          onClick={onCloseDialog}
          scale
          testId="cancel_continue_change_quota_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
