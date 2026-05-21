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

import { Trans, useTranslation } from "react-i18next";
import { useContext, useState } from "react";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { deletePortal } from "@docspace/shared/api/portal";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import styles from "../confirm.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type RemovePortalFormProps = {
  siteUrl?: string;
  onlyofficeUrl: string;
};

const RemovePortalForm = ({
  onlyofficeUrl,
  siteUrl,
}: RemovePortalFormProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const { linkData } = useContext(ConfirmRouteContext);

  const [isRemoved, setIsRemoved] = useState(false);

  const url = siteUrl || onlyofficeUrl;

  const onDeleteClick = async () => {
    try {
      const res = await deletePortal(linkData.confirmHeader);
      setIsRemoved(true);
      setTimeout(
        () =>
          (window.location.href = res && typeof res === "string" ? res : url),
        10000,
      );
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

  return isRemoved ? (
    <Text>
      <Trans t={t} i18nKey="SuccessRemoved" ns="Confirm">
        Your account has been successfully removed. In 10 seconds you will be
        redirected to the
        <Link isHovered href={url} dataTestId="redirect_site_link">
          site
        </Link>
      </Trans>
    </Text>
  ) : (
    <>
      <Text className="subtitle">
        {t("PortalRemoveTitle", {
          productName: getBrandName("ProductName"),
        })}
      </Text>
      <div className={styles.buttonsWrapper}>
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("Common:Delete")}
          tabIndex={1}
          onClick={onDeleteClick}
          testId="delete_portal_button"
        />
        <Button
          scale
          size={ButtonSize.medium}
          label={t("Common:CancelButton")}
          tabIndex={1}
          onClick={onCancelClick}
          testId="cancel_button"
        />
      </div>
    </>
  );
};

export default RemovePortalForm;
