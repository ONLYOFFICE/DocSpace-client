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

import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { BrandName as BrandNamePage } from "@docspace/shared/pages/Branding/BrandName";
import { toastr } from "@docspace/shared/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
import { BRAND_NAME_REGEX } from "@docspace/shared/constants";

import LoaderBrandName from "../sub-components/loaderBrandName";

const BrandNameComponent = (props) => {
  const {
    t,
    isSettingPaid,
    standalone,
    showNotAvailable,
    brandName,
    defaultBrandName,
    deviceType,
    isBrandNameLoaded,
    setBrandName,
    saveBrandName,
    getBrandName,
  } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBrandName();
  }, []);

  const onSave = async (data) => {
    try {
      setIsSaving(true);
      await saveBrandName(data);
      setBrandName(data.logoText);

      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (err) {
      toastr.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidation = (value) => {
    let errorCode = "";

    if (!value) {
      errorCode = "Empty";
    } else if (value.length < 2) {
      errorCode = "MinLength";
    } else if (!BRAND_NAME_REGEX.test(value)) {
      errorCode = "SpecSymbols";
    }

    setError(errorCode);
    return errorCode;
  };

  return !isBrandNameLoaded ? (
    <LoaderBrandName />
  ) : (
    <BrandNamePage
      t={t}
      isSettingPaid={isSettingPaid}
      showNotAvailable={showNotAvailable}
      standalone={standalone}
      isSaving={isSaving}
      isBrandNameLoaded={isBrandNameLoaded}
      defaultBrandName={defaultBrandName}
      brandName={brandName}
      onSave={onSave}
      deviceType={deviceType}
      error={error}
      onValidate={handleValidation}
    />
  );
};

export const BrandName = inject(
  ({ settingsStore, currentQuotaStore, brandingStore }) => {
    const {
      brandName,
      defaultBrandName,
      isBrandNameLoaded,
      getBrandName,
      setBrandName,
      saveBrandName,
    } = brandingStore;

    const { deviceType, checkEnablePortalSettings, standalone } = settingsStore;

    const { isCustomizationAvailable } = currentQuotaStore;

    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);
    const showNotAvailable = isManagement()
      ? !isCustomizationAvailable
      : !isSettingPaid && standalone;
    return {
      theme: settingsStore.theme,
      isSettingPaid,
      deviceType,
      standalone,
      showNotAvailable,
      brandName,
      defaultBrandName,
      isBrandNameLoaded,
      getBrandName,
      setBrandName,
      saveBrandName,
    };
  },
)(
  withTranslation(["Settings", "Profile", "Common"])(
    observer(BrandNameComponent),
  ),
);
