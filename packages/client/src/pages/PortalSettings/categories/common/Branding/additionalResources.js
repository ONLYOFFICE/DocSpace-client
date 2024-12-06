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

import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import {
  size,
  saveToSessionStorage,
  getFromSessionStorage,
} from "@docspace/shared/utils";
import { isManagement } from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";

import withLoading from "SRC_DIR/HOCs/withLoading";
import LoaderAdditionalResources from "../sub-components/loaderAdditionalResources";

import { AdditionalResources as AdditionalResourcesPage } from "@docspace/shared/pages/Branding/AdditionalResources";

const AdditionalResourcesComponent = (props) => {
  const {
    t,
    tReady,
    isSettingPaid,
    getAdditionalResources,

    additionalResourcesData,
    additionalResourcesIsDefault,
    setIsLoadedAdditionalResources,
    isLoadedAdditionalResources,
    deviceType,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const isMobileView = deviceType === DeviceType.mobile;

  const [additionalSettings, setAdditionalSettings] = useState({});
  const [hasChange, setHasChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { feedbackAndSupportEnabled, videoGuidesEnabled, helpCenterEnabled } =
    additionalSettings;

  const getSettings = () => {
    const additionalSettings = getFromSessionStorage("additionalSettings");

    const defaultData = {
      feedbackAndSupportEnabled:
        additionalResourcesData?.feedbackAndSupportEnabled,
      // videoGuidesEnabled: additionalResourcesData?.videoGuidesEnabled,
      helpCenterEnabled: additionalResourcesData?.helpCenterEnabled,
    };

    saveToSessionStorage("defaultAdditionalSettings", defaultData);

    if (additionalSettings) {
      setAdditionalSettings({
        feedbackAndSupportEnabled:
          additionalSettings?.feedbackAndSupportEnabled,
        // videoGuidesEnabled: additionalSettings?.videoGuidesEnabled,
        helpCenterEnabled: additionalSettings?.helpCenterEnabled,
      });
    } else {
      setAdditionalSettings(defaultData);
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [isMobileView]);

  const checkWidth = () => {
    const url = isManagement()
      ? "/management/settings/branding"
      : "portal-settings/customization/branding";
    window.innerWidth > size.mobile &&
      !isMobileView &&
      location.pathname.includes("additional-resources") &&
      navigate(url);
  };

  useEffect(() => {
    getSettings();
  }, [additionalResourcesData]);

  useEffect(() => {
    const defaultAdditionalSettings = getFromSessionStorage(
      "defaultAdditionalSettings",
    );
    const newSettings = {
      feedbackAndSupportEnabled: additionalSettings.feedbackAndSupportEnabled,
      // videoGuidesEnabled: additionalSettings.videoGuidesEnabled,
      helpCenterEnabled: additionalSettings.helpCenterEnabled,
    };
    saveToSessionStorage("additionalSettings", newSettings);

    if (isEqual(defaultAdditionalSettings, newSettings)) {
      setHasChange(false);
    } else {
      setHasChange(true);
    }
  }, [additionalSettings, additionalResourcesData]);

  useEffect(() => {
    if (!(additionalResourcesData && tReady)) return;

    setIsLoadedAdditionalResources(true);
  }, [additionalResourcesData, tReady]);

  const onSave = useCallback(async () => {
    setIsLoading(true);

    const settings = JSON.parse(JSON.stringify(additionalResourcesData));

    settings.feedbackAndSupportEnabled = feedbackAndSupportEnabled;
    settings.videoGuidesEnabled = videoGuidesEnabled;
    settings.helpCenterEnabled = helpCenterEnabled;

    await api.settings
      .setAdditionalResources(settings)
      .then(() => {
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getAdditionalResources();

    const data = {
      feedbackAndSupportEnabled,
      videoGuidesEnabled,
      helpCenterEnabled,
    };

    saveToSessionStorage("additionalSettings", data);
    saveToSessionStorage("defaultAdditionalSettings", data);
    setIsLoading(false);
  }, [setIsLoading, getAdditionalResources, additionalSettings]);

  const onRestore = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .restoreAdditionalResources()
      .then((res) => {
        setAdditionalSettings(res);
        saveToSessionStorage("additionalSettings", res);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getAdditionalResources();

    setIsLoading(false);
  }, [setIsLoading, getAdditionalResources]);

  const onChangeFeedback = () => {
    setAdditionalSettings({
      ...additionalSettings,
      feedbackAndSupportEnabled: !feedbackAndSupportEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      feedbackAndSupportEnabled: !feedbackAndSupportEnabled,
    });
  };

  const onChangeVideoGuides = () => {
    setAdditionalSettings({
      ...additionalSettings,
      videoGuidesEnabled: !videoGuidesEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      videoGuidesEnabled: !videoGuidesEnabled,
    });
  };

  const onChangeHelpCenter = () => {
    setAdditionalSettings({
      ...additionalSettings,
      helpCenterEnabled: !helpCenterEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      helpCenterEnabled: !helpCenterEnabled,
    });
  };

  if (!isLoadedAdditionalResources) return <LoaderAdditionalResources />;

  return (
    <AdditionalResourcesPage
      t={t}
      isSettingPaid={isSettingPaid}
      feedbackAndSupportEnabled={feedbackAndSupportEnabled}
      onChangeFeedback={onChangeFeedback}
      helpCenterEnabled={helpCenterEnabled}
      onChangeHelpCenter={onChangeHelpCenter}
      onSave={onSave}
      onRestore={onRestore}
      hasChange={hasChange}
      isLoading={isLoading}
      additionalResourcesIsDefault={additionalResourcesIsDefault}
    />
  );
};

export const AdditionalResources = inject(
  ({ settingsStore, common, currentQuotaStore }) => {
    const { setIsLoadedAdditionalResources, isLoadedAdditionalResources } =
      common;

    const {
      getAdditionalResources,

      additionalResourcesData,
      additionalResourcesIsDefault,
      checkEnablePortalSettings,
    } = settingsStore;

    const { isCustomizationAvailable } = currentQuotaStore;
    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

    return {
      getAdditionalResources,

      additionalResourcesData,
      additionalResourcesIsDefault,
      setIsLoadedAdditionalResources,
      isLoadedAdditionalResources,
      isSettingPaid,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(AdditionalResourcesComponent),
    ),
  ),
);
