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

import React, { useEffect, useState } from "react";

import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { FileInput } from "@docspace/shared/components/file-input";
import { Button } from "@docspace/shared/components/button";
import { StyledButtonComponent } from "./StyledComponent";

let timerId;
const LicenseContainer = (props) => {
  const {
    t,
    setPaymentsLicense,
    acceptPaymentsLicense,
    isLicenseCorrect,
    setIsLoading,
    isLoading,
    isTrial,
  } = props;

  const [isLicenseUploading, setIsLicenseUploading] = useState(false);
  useEffect(() => {
    return () => {
      clearTimeout(timerId);
      timerId = null;
    };
  });
  const onLicenseFileHandler = async (file) => {
    timerId = setTimeout(() => {
      setIsLicenseUploading(true);
    }, [100]);

    let fd = new FormData();
    fd.append("files", file);

    await setPaymentsLicense(null, fd);

    clearTimeout(timerId);
    timerId = null;
    setIsLicenseUploading(false);
  };

  const onClickUpload = async () => {
    timerId = setTimeout(() => {
      setIsLoading(true);
    }, [200]);

    await acceptPaymentsLicense(t);

    clearTimeout(timerId);
    timerId = null;
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
        className="payments_license-description"
      >
        {!isTrial ? t("ActivateRenewalDescr") : t("ActivateUploadDescr")}
      </Text>
      <FileInput
        className="payments_file-input"
        scale
        size="base"
        accept={[".lic"]}
        placeholder={t("UploadLicenseFile")}
        onInput={onLicenseFileHandler}
        isDisabled={isLicenseUploading || isLoading}
        isLoading={isLicenseUploading}
      />
      <StyledButtonComponent>
        <Button
          primary
          label={t("Common:Activate")}
          size="small"
          onClick={onClickUpload}
          isLoading={isLoading}
          isDisabled={!isLicenseCorrect}
        />
      </StyledButtonComponent>
    </div>
  );
};

export default inject(({ paymentStore, currentQuotaStore }) => {
  const {
    setPaymentsLicense,
    acceptPaymentsLicense,
    isLicenseCorrect,
    setIsLoading,
    isLoading,
  } = paymentStore;

  const { isTrial } = currentQuotaStore;

  return {
    setPaymentsLicense,
    acceptPaymentsLicense,
    isLicenseCorrect,
    setIsLoading,
    isLoading,
    isTrial,
  };
})(observer(LicenseContainer));
