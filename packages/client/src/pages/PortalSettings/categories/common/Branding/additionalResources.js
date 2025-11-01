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

import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  setAdditionalResources,
  restoreAdditionalResources,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";
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
