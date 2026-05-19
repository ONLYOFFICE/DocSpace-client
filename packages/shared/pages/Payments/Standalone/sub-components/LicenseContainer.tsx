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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { FileInput } from "@docspace/ui-kit/components/file-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { ILicenseProps } from "../Standalone.types";
import styles from "../Standalone.module.scss";

let timerId: ReturnType<typeof setTimeout> | null = null;

export const LicenseContainer = ({
  setPaymentsLicense,
  acceptPaymentsLicense,
  isLicenseCorrect,
  isTrial,
}: ILicenseProps) => {
  const { t } = useTranslation("Common");
  const [isLicenseUploading, setIsLicenseUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    };
  }, []);

  const onLicenseFileHandler = async (file: File | File[]) => {
    timerId = setTimeout(() => {
      setIsLicenseUploading(true);
    }, 100);

    const fd = new FormData();
    if (Array.isArray(file)) {
      fd.append("files", file[0]);
    } else {
      fd.append("files", file);
    }

    await setPaymentsLicense(null, fd);

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    setIsLicenseUploading(false);
  };

  const onClickUpload = async () => {
    timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    await acceptPaymentsLicense(t);

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    setIsLoading(false);
  };

  return (
    <div className="payments_license">
      <Text fontWeight={700} fontSize="16px">
        {t("ActivateLicense")}
      </Text>

      <Text
        fontWeight={400}
        fontSize="14px"
        className={styles.paymentsLicenseDescription}
      >
        {!isTrial ? t("ActivateRenewalDescr") : t("ActivateUploadDescr")}
      </Text>
      <FileInput
        className={styles.paymentsFileInput}
        scale
        size={InputSize.base}
        accept={[".lic"]}
        placeholder={t("UploadLicenseFile")}
        onInput={onLicenseFileHandler}
        isDisabled={isLicenseUploading || isLoading}
        isLoading={isLicenseUploading}
        data-test-id="upload_license_file_input"
      />
      <div className={styles.buttonComponent}>
        <Button
          primary
          label={t("Common:Activate")}
          size={ButtonSize.small}
          onClick={onClickUpload}
          isLoading={isLoading}
          isDisabled={!isLicenseCorrect}
          testId="activate_license_button"
        />
      </div>
    </div>
  );
};
