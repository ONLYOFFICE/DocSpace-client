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
  saveToSessionStorage,
  getFromSessionStorage,
} from "@docspace/shared/utils";

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

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!(companyInfoSettingsData && tReady)) return;

    setIsLoadedCompanyInfoSettingsData(true);
  }, [companyInfoSettingsData, tReady]);

  const onSave = useCallback(
    async (address, companyName, email, phone, site) => {
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
      setIsLoading(false);
    },
    [setIsLoading, getCompanyInfoSettings],
  );

  const onRestore = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .restoreCompanyInfoSettings()
      .then(() => {
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getCompanyInfoSettings();

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
        previewData={companyInfoSettingsData}
      />
      <CompanyInfo
        t={t}
        isSettingPaid={isSettingPaid}
        onShowExample={onShowExample}
        companySettings={companyInfoSettingsData}
        onSave={onSave}
        onRestore={onRestore}
        isLoading={isLoading}
        companyInfoSettingsIsDefault={companyInfoSettingsIsDefault}
        deviceType={deviceType}
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
