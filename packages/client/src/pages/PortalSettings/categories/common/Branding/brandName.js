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

import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { BrandName as BrandNamePage } from "@docspace/shared/pages/Branding/BrandName";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
import { BRAND_NAME_REGEX } from "@docspace/shared/constants";
import { DeviceType } from "@docspace/shared/enums";

import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveNavigation";
import LoaderBrandName from "../sub-components/loaderBrandName";
import useCommon from "../useCommon";
import { brandingRedirectUrl } from "./constants";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

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
    brandingStore,
  } = props;

  const isMobileView = deviceType === DeviceType.mobile;

  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "brand-name",
    deviceType,
  });

  const defaultProps = createDefaultHookSettingsProps({
    isMobileView,
    brandingStore,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isMobileView) getCommonInitialValue();
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
      setBrandName,
      saveBrandName,
      brandingStore,
    };
  },
)(
  withTranslation(["Settings", "Profile", "Common"])(
    observer(BrandNameComponent),
  ),
);
