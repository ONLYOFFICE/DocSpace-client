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

import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveNavigation";
import { WhiteLabel as WhiteLabelPage } from "@docspace/shared/pages/Branding/WhiteLabel";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";

import LoaderWhiteLabel from "../sub-components/loaderWhiteLabel";
import { brandingRedirectUrl } from "./constants";
import useCommon from "../useCommon";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

const WhiteLabelComponent = (props) => {
  const {
    t,
    isSettingPaid,
    deviceType,
    standalone,
    displayAbout,
    showNotAvailable,
    defaultWhiteLabelLogoUrls,
    logoUrls,
    isDefaultLogos,
    isWhiteLabelLoaded,
    setLogoUrls,
    saveWhiteLabelLogos,
    resetWhiteLabelLogos,
    brandingStore,
  } = props;
  const isMobileView = deviceType === DeviceType.mobile;

  const defaultProps = createDefaultHookSettingsProps({
    isMobileView,
    brandingStore,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

  const [isSaving, setIsSaving] = useState(false);
  const showAbout = standalone && isManagement() && displayAbout;

  useEffect(() => {
    if (isMobileView) getCommonInitialValue();
  }, []);

  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "white-label",
    deviceType,
  });

  const onRestoreDefault = async () => {
    try {
      await resetWhiteLabelLogos();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
  };

  const onSave = async (data) => {
    try {
      setIsSaving(true);
      await saveWhiteLabelLogos(data);

      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return !isWhiteLabelLoaded ? (
    <LoaderWhiteLabel />
  ) : (
    <WhiteLabelPage
      logoUrls={logoUrls}
      isSettingPaid={isSettingPaid}
      showAbout={showAbout}
      showNotAvailable={showNotAvailable}
      standalone={standalone}
      onRestoreDefault={onRestoreDefault}
      isSaving={isSaving}
      enableRestoreButton={isDefaultLogos}
      deviceType={deviceType}
      setLogoUrls={setLogoUrls}
      isWhiteLabelLoaded={isWhiteLabelLoaded}
      defaultWhiteLabelLogoUrls={defaultWhiteLabelLogoUrls}
      onSave={onSave}
    />
  );
};

export const WhiteLabel = inject(
  ({ settingsStore, currentQuotaStore, brandingStore }) => {
    const {
      logoUrls,
      brandName,
      defaultBrandName,
      isDefaultLogos,
      isWhiteLabelLoaded,
      setLogoUrls,
      setBrandName,
      saveWhiteLabelLogos,
      saveBrandName,
      resetWhiteLabelLogos,
    } = brandingStore;

    const {
      whiteLabelLogoUrls: defaultWhiteLabelLogoUrls,
      deviceType,
      checkEnablePortalSettings,
      standalone,
      displayAbout,
    } = settingsStore;

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
      displayAbout,
      showNotAvailable,
      defaultWhiteLabelLogoUrls,
      logoUrls,
      brandName,
      defaultBrandName,
      isDefaultLogos,
      isWhiteLabelLoaded,
      setLogoUrls,
      setBrandName,
      saveWhiteLabelLogos,
      saveBrandName,
      resetWhiteLabelLogos,
      brandingStore,
    };
  },
)(
  withTranslation(["Settings", "Profile", "Common"])(
    observer(WhiteLabelComponent),
  ),
);
