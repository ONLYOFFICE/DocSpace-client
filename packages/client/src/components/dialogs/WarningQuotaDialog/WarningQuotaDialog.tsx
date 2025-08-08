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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { WarningQuotaDialogProps } from "./WarningQuotaDialog.types";

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
          productName: t("Common:ProductName"),
        }),
      );
    }

    if (quotaLimits.length === 0) {
      return "";
    }

    return t("Settings:StorageQuotaWarningDescription", {
      quotaLimits: quotaLimits.join(", "),
      productName: t("Common:ProductName"),
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
        <Text>{t("Settings:WantToContinue")}</Text>
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
