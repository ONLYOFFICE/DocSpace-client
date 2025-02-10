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

import { Link } from "../../../components/link";
import { FieldContainer } from "../../../components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "../../../components/text-input";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { AboutDialog } from "../../../components/about-dialog";

import { StyledCompanyInfo } from "./CompanyInfo.styled";
import { ICompanyInfo } from "./CompanyInfo.types";
import { useCompanySettings } from "./useCompanySettings";

export const CompanyInfo = ({
  isSettingPaid,
  companySettings,
  onSave,
  onRestore,
  isLoading,
  companyInfoSettingsIsDefault,
  buildVersionInfo,
  standalone,
  licenseUrl,
  isEnterprise,
}: ICompanyInfo) => {
  const { t } = useTranslation("Common");
  const [isAboutDialogVisible, setIsAboutDialogVisible] = useState(false);

  const {
    address,
    companyName,
    email,
    phone,
    site,
    companySettingsError,
    hasChanges,
    onChangeAddress,
    onChangeCompanyName,
    onChangeEmail,
    onChangePhone,
    onChangeSite,
  } = useCompanySettings(companySettings);

  const onSaveAction = () => {
    onSave(address, companyName, email, phone, site);
  };

  const {
    hasErrorAddress,
    hasErrorCompanyName,
    hasErrorEmail,
    hasErrorPhone,
    hasErrorSite,
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
        licenseUrl={licenseUrl}
        isEnterprise={isEnterprise}
      />
      <StyledCompanyInfo isSettingPaid={isSettingPaid}>
        <div className="section-description settings_unavailable">
          {t("BrandingSectionDescription", {
            productName: t("Common:ProductName"),
          })}
        </div>
        <div className="header settings_unavailable">
          {t("CompanyInfoSettings")}
        </div>
        <div className="description settings_unavailable">
          <Trans t={t} i18nKey="CompanyInfoSettingsDescription" ns="Common">
            &quot;This information will be displayed in the
            {isSettingPaid ? (
              <Link className="link" onClick={showExample} noHover>
                {link}
              </Link>
            ) : (
              <span className="link">{link}</span>
            )}
            window.&quot;
          </Trans>
        </div>
        <div className="settings-block">
          <FieldContainer
            id="fieldContainerCompanyName"
            className="field-container-width settings_unavailable"
            labelText={t("Common:CompanyName")}
            isVertical
          >
            <TextInput
              id="textInputContainerCompanyName"
              className="text-input"
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
              className="text-input"
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
              className="text-input"
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
              className="text-input"
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
              className="text-input"
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
          className="save-cancel-buttons"
          onSaveClick={onSaveAction}
          onCancelClick={onRestore}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:Restore")}
          reminderText={t("YouHaveUnsavedChanges")}
          displaySettings
          saveButtonDisabled={isDisabled}
          hasScroll
          hideBorder
          showReminder={(isSettingPaid && hasChanges) || isLoading}
          disableRestoreToDefault={companyInfoSettingsIsDefault || isLoading}
          additionalClassSaveButton="company-info-save"
          additionalClassCancelButton="company-info-cancel"
        />
      </StyledCompanyInfo>
    </>
  );
};
