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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "../../../../components/text";
import { FileInput } from "../../../../components/file-input";
import { InputSize } from "../../../../components/text-input";
import { Button, ButtonSize } from "../../../../components/button";

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
