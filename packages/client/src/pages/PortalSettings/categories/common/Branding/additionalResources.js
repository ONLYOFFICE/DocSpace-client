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

import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  setAdditionalResources,
  restoreAdditionalResources,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveNavigation";
import { AdditionalResources as AdditionalResourcesPage } from "@docspace/shared/pages/Branding/AdditionalResources";

import withLoading from "SRC_DIR/HOCs/withLoading";
import { brandingRedirectUrl } from "./constants";
import LoaderAdditionalResources from "../sub-components/loaderAdditionalResources";

const AdditionalResourcesComponent = (props) => {
  const {
    t,
    tReady,
    isSettingPaid,
    additionalResourcesData,
    additionalResourcesIsDefault,
    setIsLoadedAdditionalResources,
    isLoadedAdditionalResources,
    deviceType,
    getAdditionalResources,
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "additional-resources",
    deviceType,
  });

  const feedbackAndSupportEnabled = Boolean(
    additionalResourcesData?.feedbackAndSupportEnabled,
  );
  const helpCenterEnabled = Boolean(additionalResourcesData?.helpCenterEnabled);

  useEffect(() => {
    if (!(additionalResourcesData && tReady)) return;
    setIsLoadedAdditionalResources(true);
  }, [additionalResourcesData, tReady]);

  const onSave = useCallback(
    async (feedbackEnabled, helpEnabled) => {
      setIsLoading(true);
      try {
        const settings = JSON.parse(JSON.stringify(additionalResourcesData));
        settings.feedbackAndSupportEnabled = feedbackEnabled;
        settings.helpCenterEnabled = helpEnabled;
        await setAdditionalResources(settings);
        await getAdditionalResources();
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading],
  );

  const onRestore = useCallback(async () => {
    setIsLoading(true);
    try {
      await restoreAdditionalResources();
      await getAdditionalResources();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  if (!isLoadedAdditionalResources) return <LoaderAdditionalResources />;
  return (
    <AdditionalResourcesPage
      t={t}
      isSettingPaid={isSettingPaid}
      feedbackAndSupportEnabled={feedbackAndSupportEnabled}
      helpCenterEnabled={helpCenterEnabled}
      onSave={onSave}
      onRestore={onRestore}
      isLoading={isLoading}
      additionalResourcesIsDefault={additionalResourcesIsDefault}
    />
  );
};

export const AdditionalResources = inject(
  ({ brandingStore, settingsStore, currentQuotaStore }) => {
    const { setIsLoadedAdditionalResources, isLoadedAdditionalResources } =
      brandingStore;

    const {
      additionalResourcesData,
      additionalResourcesIsDefault,
      checkEnablePortalSettings,
      deviceType,
      getAdditionalResources,
    } = settingsStore;

    const { isCustomizationAvailable } = currentQuotaStore;
    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

    return {
      additionalResourcesData,
      additionalResourcesIsDefault,
      setIsLoadedAdditionalResources,
      isLoadedAdditionalResources,
      isSettingPaid,
      deviceType,
      getAdditionalResources,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(AdditionalResourcesComponent),
    ),
  ),
);
