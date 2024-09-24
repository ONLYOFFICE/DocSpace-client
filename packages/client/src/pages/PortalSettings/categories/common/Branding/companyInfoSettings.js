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
import styled from "styled-components";
import { Trans, withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Link } from "@docspace/shared/components/link";
import { mobile, size } from "@docspace/shared/utils";
import { isManagement } from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";

import withLoading from "SRC_DIR/HOCs/withLoading";
import LoaderCompanyInfoSettings from "../sub-components/loaderCompanyInfoSettings";
import AboutDialog from "../../../../About/AboutDialog";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";

const StyledComponent = styled.div`
  .link {
    font-weight: 600;
    border-bottom: ${(props) =>
      props.theme.client.settings.common.companyInfo.border};
    border-color: ${(props) =>
      !props.isSettingPaid &&
      props.theme.client.settings.common.companyInfo.color};
  }

  .description,
  .link {
    color: ${(props) =>
      !props.isSettingPaid &&
      props.theme.client.settings.common.companyInfo.color};
  }

  .text-input {
    font-size: 13px;
  }

  .save-cancel-buttons {
    margin-top: 24px;
    bottom: 0;
  }

  .description {
    padding-bottom: 16px;
  }

  @media ${mobile} {
    .header {
      display: none;
    }
  }
`;

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
  const {
    hasErrorAddress,
    hasErrorCompanyName,
    hasErrorEmail,
    hasErrorPhone,
    hasErrorSite,
  } = companySettingsError;

  const link = t("Common:AboutCompanyTitle");

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [isMobileView]);

  const checkWidth = () => {
    const url = isManagement()
      ? "/settings/branding"
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

  const onChangeСompanyName = (e) => {
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

  const isDisabled =
    hasErrorAddress ||
    hasErrorCompanyName ||
    hasErrorEmail ||
    hasErrorPhone ||
    hasErrorSite;

  if (!isLoadedCompanyInfoSettingsData) return <LoaderCompanyInfoSettings />;

  return (
    <>
      <AboutDialog
        visible={showModal}
        onClose={onCloseModal}
        buildVersionInfo={buildVersionInfo}
        previewData={companySettings}
      />

      <StyledComponent isSettingPaid={isSettingPaid}>
        <div className="header settings_unavailable">
          {t("Settings:CompanyInfoSettings")}
        </div>
        <div className="description settings_unavailable">
          <Trans t={t} i18nKey="CompanyInfoSettingsDescription" ns="Settings">
            "This information will be displayed in the
            {isSettingPaid ? (
              <Link className="link" onClick={onShowExample} noHover={true}>
                {{ link }}
              </Link>
            ) : (
              <span className="link"> {{ link }}</span>
            )}
            window."
          </Trans>
        </div>
        <div className="settings-block">
          <FieldContainer
            id="fieldContainerCompanyName"
            className="field-container-width settings_unavailable"
            labelText={t("Common:CompanyName")}
            isVertical={true}
          >
            <TextInput
              id="textInputContainerCompanyName"
              className="text-input"
              isDisabled={!isSettingPaid}
              scale={true}
              value={companyName}
              hasError={hasErrorCompanyName}
              onChange={onChangeСompanyName}
              tabIndex={5}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerEmail"
            isDisabled={!isSettingPaid}
            className="field-container-width settings_unavailable"
            labelText={t("Common:Email")}
            isVertical={true}
          >
            <TextInput
              id="textInputContainerEmail"
              className="text-input"
              isDisabled={!isSettingPaid}
              scale={true}
              value={email}
              hasError={hasErrorEmail}
              onChange={onChangeEmail}
              tabIndex={6}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerPhone"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Phone")}
            isVertical={true}
          >
            <TextInput
              id="textInputContainerPhone"
              className="text-input"
              isDisabled={!isSettingPaid}
              scale={true}
              value={phone}
              hasError={hasErrorPhone}
              onChange={onChangePhone}
              tabIndex={7}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerWebsite"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Website")}
            isVertical={true}
          >
            <TextInput
              id="textInputContainerWebsite"
              className="text-input"
              isDisabled={!isSettingPaid}
              scale={true}
              value={site}
              hasError={hasErrorSite}
              onChange={onChangeSite}
              tabIndex={8}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerAddress"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Address")}
            isVertical={true}
          >
            <TextInput
              id="textInputContainerAddress"
              className="text-input"
              isDisabled={!isSettingPaid}
              scale={true}
              value={address}
              hasError={hasErrorAddress}
              onChange={onChangeAddress}
              tabIndex={9}
            />
          </FieldContainer>
        </div>
        <SaveCancelButtons
          tabIndex={10}
          className="save-cancel-buttons"
          onSaveClick={onSave}
          onCancelClick={onRestore}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:Restore")}
          reminderText={t("YouHaveUnsavedChanges")}
          displaySettings={true}
          saveButtonDisabled={isDisabled}
          hasScroll={true}
          hideBorder={true}
          showReminder={(isSettingPaid && showReminder) || isLoading}
          disableRestoreToDefault={companyInfoSettingsIsDefault || isLoading}
          additionalClassSaveButton="company-info-save"
          additionalClassCancelButton="company-info-cancel"
        />
      </StyledComponent>
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

    const { isBrandingAndCustomizationAvailable } = currentQuotaStore;
    const isSettingPaid = checkEnablePortalSettings(
      isBrandingAndCustomizationAvailable,
    );

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
