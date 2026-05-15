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

"use client";

import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ownerChange } from "@docspace/shared/api/settings";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import styles from "../confirm.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type ChangeOwnerFormProps = {
  newOwner?: string;
};

const ChangeOwnerForm = ({ newOwner }: ChangeOwnerFormProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const { linkData } = useContext(ConfirmRouteContext);

  const ownerId = linkData.uid ?? "";
  const confirmKey = linkData.confirmHeader ?? "";

  const [isOwnerChanged, setIsOwnerChanged] = useState(false);

  const onChangeOwnerClick = async () => {
    try {
      await ownerChange(ownerId, confirmKey);
      setIsOwnerChanged(true);
      setTimeout(() => (window.location.href = "/"), 10000);
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }

      toastr.error(errorMessage);
      console.error(errorMessage);
    }
  };

  const onCancelClick = () => {
    window.location.href = "/";
  };

  return isOwnerChanged ? (
    <Text>
      {t("ConfirmOwnerPortalSuccessMessage", {
        productName: getBrandName("ProductName"),
      })}
    </Text>
  ) : (
    <>
      <Text className="subtitle">
        {t("ConfirmOwnerPortalTitle", {
          newOwner,
          productName: getBrandName("ProductName"),
        })}
      </Text>
      <div className={styles.buttonsWrapper}>
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("Common:SaveButton")}
          tabIndex={2}
          isDisabled={false}
          onClick={onChangeOwnerClick}
          testId="save_change_owner_button"
        />
        <Button
          scale
          size={ButtonSize.medium}
          label={t("Common:CancelButton")}
          tabIndex={2}
          isDisabled={false}
          onClick={onCancelClick}
          testId="cancel_button"
        />
      </div>
    </>
  );
};

export default ChangeOwnerForm;
