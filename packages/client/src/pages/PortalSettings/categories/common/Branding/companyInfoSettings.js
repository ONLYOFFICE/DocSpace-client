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
import LoaderCompanyInfoSettings from "../sub-components/loaderCompanyInfoSettings";
import AboutDialog from "../../../../About/AboutDialog";

import { CompanyInfo } from "@docspace/shared/pages/Branding/CompanyInfo";

const CompanyInfoSettingsComponent = (props) => {
  const {
    t,
    isSettingPaid,
    getCompanyInfoSettings,

    companyInfoSettingsIsDefault,

    companyInfoSettingsData,
    tReady,
    setIsLoadedCompanyInfoSettingsData,
    isLoadedCompanyInfoSettingsData,
    buildVersionInfo,
    deviceType,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileView = deviceType === DeviceType.mobile;

  const defaultCompanySettingsError = {
    hasErrorAddress: false,
    hasErrorCompanyName: false,
    hasErrorEmail: false,
    hasErrorPhone: false,
    hasErrorSite: false,
  };

  const [companySettings, setCompanySettings] = useState({});
  const [companySettingsError, setCompanySettingsError] = useState(
    defaultCompanySettingsError,
  );
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { address, companyName, email, phone, site } = companySettings;

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
      location.pathname.includes("company-info-settings") &&
      navigate(url);
  };

  useEffect(() => {
    if (!(companyInfoSettingsData && tReady)) return;

    setIsLoadedCompanyInfoSettingsData(true);
  }, [companyInfoSettingsData, tReady]);

  const getSettings = () => {
    //await getCompanyInfoSettings();
    const companySettings = getFromSessionStorage("companySettings");
    const defaultCompanySettingsData = {
      address: companyInfoSettingsData?.address,
      companyName: companyInfoSettingsData?.companyName,
      email: companyInfoSettingsData?.email,
      phone: companyInfoSettingsData?.phone,
      site: companyInfoSettingsData?.site,
    };

    saveToSessionStorage("defaultCompanySettings", defaultCompanySettingsData);

    if (companySettings) {
      setCompanySettings({
        address: companySettings?.address,
        companyName: companySettings?.companyName,
        email: companySettings?.email,
        phone: companySettings?.phone,
        site: companySettings?.site,
      });
    } else {
      setCompanySettings(defaultCompanySettingsData);
    }
  };

  useEffect(() => {
    getSettings();
  }, [companyInfoSettingsData]);

  useEffect(() => {
    const defaultCompanySettings = getFromSessionStorage(
      "defaultCompanySettings",
    );

    const newSettings = {
      address: companySettings?.address,
      companyName: companySettings?.companyName,
      email: companySettings?.email,
      phone: companySettings?.phone,
      site: companySettings?.site,
    };

    saveToSessionStorage("companySettings", newSettings);

    if (isEqual(defaultCompanySettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [companySettings, companyInfoSettingsData]);

  const validateSite = (site) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    const hasErrorSite = !urlRegex.test(site);

    setCompanySettingsError({ ...companySettingsError, hasErrorSite });
  };

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    const hasErrorEmail = !emailRegex.test(email);

    setCompanySettingsError({ ...companySettingsError, hasErrorEmail });
  };

  const validateEmpty = (value, type) => {
    const hasError = value.trim() === "";
    const phoneRegex = /^[\d\(\)\-\s+]+$/;
    const hasErrorPhone = !phoneRegex.test(value);

    if (type === "companyName") {
      setCompanySettingsError({
        ...companySettingsError,
        hasErrorCompanyName: hasError,
      });
    }

    if (type === "phone") {
      setCompanySettingsError({
        ...companySettingsError,
        hasErrorPhone,
      });
    }

    if (type === "address") {
      setCompanySettingsError({
        ...companySettingsError,
        hasErrorAddress: hasError,
      });
    }
  };

  const onChangeSite = (e) => {
    const site = e.target.value;
    validateSite(site);
    setCompanySettings({ ...companySettings, site });
    saveToSessionStorage("companySettings", { ...companySettings, site });
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    validateEmail(email);
    setCompanySettings({ ...companySettings, email });
    saveToSessionStorage("companySettings", { ...companySettings, email });
  };

  const onChangeCompanyName = (e) => {
    const companyName = e.target.value;
    validateEmpty(companyName, "companyName");
    setCompanySettings({ ...companySettings, companyName });
    saveToSessionStorage("companySettings", {
      ...companySettings,
      companyName,
    });
  };

  const onChangePhone = (e) => {
    const phone = e.target.value;
    validateEmpty(phone, "phone");
    setCompanySettings({ ...companySettings, phone });
    saveToSessionStorage("companySettings", { ...companySettings, phone });
  };

  const onChangeAddress = (e) => {
    const address = e.target.value;
    validateEmpty(address, "address");
    setCompanySettings({ ...companySettings, address });
    saveToSessionStorage("companySettings", { ...companySettings, address });
  };

  const onSave = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .setCompanyInfoSettings(address, companyName, email, phone, site)
      .then(() => {
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getCompanyInfoSettings();

    const data = {
      address,
      companyName,
      email,
      phone,
      site,
    };

    saveToSessionStorage("companySettings", data);
    saveToSessionStorage("defaultCompanySettings", data);

    setCompanySettingsError({
      hasErrorAddress: false,
      hasErrorCompanyName: false,
      hasErrorEmail: false,
      hasErrorPhone: false,
      hasErrorSite: false,
    });

    setIsLoading(false);
  }, [setIsLoading, getCompanyInfoSettings, companySettings]);

  const onRestore = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .restoreCompanyInfoSettings()
      .then((res) => {
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
        setCompanySettings(res);
        saveToSessionStorage("companySettings", res);
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getCompanyInfoSettings();

    setCompanySettingsError({
      hasErrorAddress: false,
      hasErrorCompanyName: false,
      hasErrorEmail: false,
      hasErrorPhone: false,
      hasErrorSite: false,
    });

    setIsLoading(false);
  }, [setIsLoading, getCompanyInfoSettings]);

  const onShowExample = () => {
    if (!isSettingPaid) return;

    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  if (!isLoadedCompanyInfoSettingsData) return <LoaderCompanyInfoSettings />;

  return (
    <>
      <AboutDialog
        visible={showModal}
        onClose={onCloseModal}
        buildVersionInfo={buildVersionInfo}
        previewData={companySettings}
      />
      <CompanyInfo
        t={t}
        isSettingPaid={isSettingPaid}
        onShowExample={onShowExample}
        companySettings={companySettings}
        companySettingsError={companySettingsError}
        onChangeCompanyName={onChangeCompanyName}
        onChangeEmail={onChangeEmail}
        onChangePhone={onChangePhone}
        onChangeSite={onChangeSite}
        onChangeAddress={onChangeAddress}
        onSave={onSave}
        onRestore={onRestore}
        isLoading={isLoading}
        companyInfoSettingsIsDefault={companyInfoSettingsIsDefault}
        showReminder={showReminder}
      />
    </>
  );
};

export const CompanyInfoSettings = inject(
  ({ settingsStore, common, currentQuotaStore }) => {
    const {
      setIsLoadedCompanyInfoSettingsData,
      isLoadedCompanyInfoSettingsData,
    } = common;

    const {
      getCompanyInfoSettings,

      companyInfoSettingsIsDefault,

      companyInfoSettingsData,
      buildVersionInfo,
      checkEnablePortalSettings,
    } = settingsStore;

    const { isCustomizationAvailable } = currentQuotaStore;
    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);

    return {
      getCompanyInfoSettings,

      companyInfoSettingsIsDefault,

      companyInfoSettingsData,
      setIsLoadedCompanyInfoSettingsData,
      isLoadedCompanyInfoSettingsData,
      buildVersionInfo,
      isSettingPaid,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(CompanyInfoSettingsComponent),
    ),
  ),
);
