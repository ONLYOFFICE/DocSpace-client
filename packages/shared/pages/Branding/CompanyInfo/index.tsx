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

import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";

import { Link } from "../../../components/link";
import { FieldContainer } from "../../../components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "../../../components/text-input";

import { Checkbox } from "../../../components/checkbox";

import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { AboutDialog } from "../../../components/about-dialog";

import { ICompanyInfo } from "./CompanyInfo.types";
import { useCompanySettings } from "./useCompanySettings";
import styles from "./CompanyInfo.module.scss";

export const CompanyInfo = ({
  isSettingPaid,
  companySettings,
  onSave,
  onRestore,
  isLoading,
  companyInfoSettingsIsDefault,
  displayAbout,
  isBrandingAvailable,
  buildVersionInfo,
  standalone,
  licenseAgreementsUrl,
  isEnterprise,
  logoText,
}: ICompanyInfo) => {
  const { t } = useTranslation("Common");
  const [isAboutDialogVisible, setIsAboutDialogVisible] = useState(false);

  const {
    address,
    companyName,
    email,
    phone,
    site,
    displayAbout: showAbout,
    companySettingsError,
    hasChanges,
    onChangeAddress,
    onChangeCompanyName,
    onChangeEmail,
    onChangePhone,
    onChangeSite,
    onChangeDisplayAbout,
    reset,
  } = useCompanySettings({
    companySettings,
    displayAbout,
  });

  const onSaveAction = () => {
    onSave(address, companyName, email, phone, site, !showAbout);
  };

  const onRestoreAction = () => {
    reset();
    onRestore();
  };

  const {
    address: hasErrorAddress,
    companyName: hasErrorCompanyName,
    email: hasErrorEmail,
    phone: hasErrorPhone,
    site: hasErrorSite,
  } = companySettingsError;

  const isDisabled =
    hasErrorAddress ||
    hasErrorCompanyName ||
    hasErrorEmail ||
    hasErrorPhone ||
    hasErrorSite;

  const link = t("Common:AboutCompanyTitle");

  const showExample = () => {
    if (!isSettingPaid) return;
    setIsAboutDialogVisible(true);
  };

  return (
    <>
      <AboutDialog
        visible={isAboutDialogVisible}
        onClose={() => setIsAboutDialogVisible(false)}
        buildVersionInfo={buildVersionInfo}
        previewData={companySettings}
        companyInfoSettingsData={companySettings}
        standalone={standalone}
        licenseAgreementsUrl={licenseAgreementsUrl}
        isEnterprise={isEnterprise}
        logoText={logoText}
      />
      <div
        className={classNames(styles.companyInfo, {
          [styles.isSettingPaid]: isSettingPaid,
        })}
      >
        <div
          className={classNames(
            styles.sectionDescription,
            "section-description settings_unavailable",
          )}
        >
          {t("BrandingSectionDescription", {
            productName: t("ProductName"),
          })}
        </div>
        <div
          className={classNames(styles.header, "header settings_unavailable")}
        >
          {t("CompanyInfoSettings")}
        </div>
        <div
          className={classNames(
            styles.description,
            "description settings_unavailable",
          )}
        >
          {isSettingPaid ? (
            <Trans
              t={t}
              i18nKey="CompanyInfoSettingsDescription"
              ns="Common"
              values={{ link }}
              components={{
                1: (
                  <Link
                    key="component_key"
                    className={classNames(styles.link, "link")}
                    onClick={showExample}
                    noHover
                    dataTestId="company_info_settings_link"
                  />
                ),
              }}
            />
          ) : (
            <Trans
              t={t}
              i18nKey="CompanyInfoSettingsDescription"
              ns="Common"
              values={{ link }}
              components={{
                1: (
                  <span
                    key="component_key"
                    className={classNames(styles.link, "link")}
                  />
                ),
              }}
            />
          )}
        </div>
        <div className={classNames(styles.settingsBlock, "settings-block")}>
          <FieldContainer>
            <Checkbox
              isDisabled={!isBrandingAvailable || !isSettingPaid}
              isChecked={showAbout}
              onChange={onChangeDisplayAbout}
              dataTestId="show-about-window-checkbox"
              label={t("Common:ShowAboutWindow")}
            />
          </FieldContainer>

          <FieldContainer
            id="fieldContainerCompanyName"
            className="field-container-width settings_unavailable"
            labelText={t("Common:CompanyName")}
            isVertical
          >
            <TextInput
              id="textInputContainerCompanyName"
              testId="company_info_settings_company_name_input"
              className={classNames(styles.textInput, "text-input")}
              isDisabled={!isSettingPaid}
              scale
              value={companyName}
              hasError={hasErrorCompanyName}
              onChange={onChangeCompanyName}
              type={InputType.text}
              size={InputSize.base}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerEmail"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Email")}
            isVertical
          >
            <TextInput
              id="textInputContainerEmail"
              testId="company_info_settings_email_input"
              className={classNames(styles.textInput, "text-input")}
              isDisabled={!isSettingPaid}
              scale
              value={email}
              hasError={hasErrorEmail}
              onChange={onChangeEmail}
              type={InputType.text}
              size={InputSize.base}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerPhone"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Phone")}
            isVertical
          >
            <TextInput
              id="textInputContainerPhone"
              testId="company_info_settings_phone_input"
              className={classNames(styles.textInput, "text-input")}
              isDisabled={!isSettingPaid}
              scale
              value={phone}
              hasError={hasErrorPhone}
              onChange={onChangePhone}
              type={InputType.text}
              size={InputSize.base}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerWebsite"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Website")}
            isVertical
          >
            <TextInput
              id="textInputContainerWebsite"
              testId="company_info_settings_site_input"
              className={classNames(styles.textInput, "text-input")}
              isDisabled={!isSettingPaid}
              scale
              value={site}
              hasError={hasErrorSite}
              onChange={onChangeSite}
              type={InputType.text}
              size={InputSize.base}
            />
          </FieldContainer>
          <FieldContainer
            id="fieldContainerAddress"
            className="field-container-width settings_unavailable"
            labelText={t("Common:Address")}
            isVertical
          >
            <TextInput
              id="textInputContainerAddress"
              testId="company_info_settings_address_input"
              className={classNames(styles.textInput, "text-input")}
              isDisabled={!isSettingPaid}
              scale
              value={address}
              hasError={hasErrorAddress}
              onChange={onChangeAddress}
              type={InputType.text}
              size={InputSize.base}
            />
          </FieldContainer>
        </div>
        <SaveCancelButtons
          className={classNames(
            styles.saveCancelButtons,
            "save-cancel-buttons",
          )}
          onSaveClick={onSaveAction}
          onCancelClick={onRestoreAction}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:Restore")}
          reminderText={t("Common:YouHaveUnsavedChanges")}
          displaySettings
          saveButtonDisabled={isDisabled}
          hasScroll
          hideBorder
          showReminder={(isSettingPaid && hasChanges) || isLoading}
          disableRestoreToDefault={companyInfoSettingsIsDefault || isLoading}
          additionalClassSaveButton="company-info-save"
          additionalClassCancelButton="company-info-cancel"
          saveButtonDataTestId="company_info_settings_save_button"
          cancelButtonDataTestId="company_info_settings_cancel_button"
        />
      </div>
    </>
  );
};
