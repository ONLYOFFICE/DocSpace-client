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

import React from "react";

import { Text } from "@docspace/shared/components/text";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { WhiteLabelLogoType } from "@docspace/shared/enums";

import { Logo } from "./Logo";
import { WhiteLabelWrapper, StyledSpacer } from "./WhiteLabel.styled";
import { IWhiteLabel } from "./WhiteLabel.types";
import { WhiteLabelHeader } from "./WhiteLabelHeader";

export const WhiteLabel = (props: IWhiteLabel) => {
  const {
    t,
    logoUrls,
    onChangeLogo,
    isSettingPaid,
    showAbout,
    showNotAvailable,
    standalone,
    onUseTextAsLogo,
    isEmpty,
    logoTextWhiteLabel,
    onChangeCompanyName,
    onSave,
    onRestoreDefault,
    saveButtonDisabled,
    isSaving,
    enableRestoreButton,
  } = props;
  return (
    <WhiteLabelWrapper>
      <WhiteLabelHeader
        t={t}
        showNotAvailable={showNotAvailable}
        isSettingPaid={isSettingPaid}
        standalone={standalone}
        onUseTextAsLogo={onUseTextAsLogo}
        isEmpty={isEmpty}
        logoTextWhiteLabel={logoTextWhiteLabel}
        onChangeCompanyName={onChangeCompanyName}
      />

      <div className="logos-container">
        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoLightSmall")} ({logoUrls[0].size.width}x
            {logoUrls[0].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrls[0].path.light}
              imageClass="logo-header background-light"
              inputId={`logoUploader_${WhiteLabelLogoType.LightSmall}_light`}
              linkId="link-space-header-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrls[0].path.dark}
              imageClass="logo-header background-dark"
              inputId={`logoUploader_${WhiteLabelLogoType.LightSmall}_dark`}
              linkId="link-space-header-dark"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
          </div>
        </div>

        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoCompact")} ({logoUrls[5].size.width}x
            {logoUrls[5].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrls[5].path.light}
              imageClass="border-img logo-compact background-light"
              inputId={`logoUploader_${WhiteLabelLogoType.LeftMenu}_light`}
              linkId="link-compact-left-menu-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrls[5].path.dark}
              imageClass="border-img logo-compact background-dark"
              inputId={`logoUploader_${WhiteLabelLogoType.LeftMenu}_dark`}
              linkId="link-compact-left-menu-dark"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
          </div>
        </div>

        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoLogin")} ({logoUrls[1].size.width}x{logoUrls[1].size.height}
            )
          </Text>
          <div className="logos-login-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrls[1].path.light}
              imageClass="border-img logo-big background-white"
              inputId={`logoUploader_${WhiteLabelLogoType.LoginPage}_light`}
              linkId="link-login-emails-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrls[1].path.dark}
              imageClass="border-img logo-big background-dark"
              inputId={`logoUploader_${WhiteLabelLogoType.LoginPage}_dark`}
              linkId="link-login-emails-dark"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
          </div>
        </div>

        {showAbout && (
          <div className="logo-wrapper">
            <Text
              fontSize="15px"
              fontWeight="600"
              className="settings_unavailable"
            >
              {t("LogoAbout")} ({logoUrls[6].size.width}x
              {logoUrls[6].size.height})
            </Text>
            <div className="logos-wrapper">
              <Logo
                title={t("Profile:LightTheme")}
                src={logoUrls[6].path.light}
                imageClass="border-img logo-about background-white"
                inputId={`logoUploader_${WhiteLabelLogoType.AboutPage}_light`}
                linkId="link-about-light"
                onChangeText={t("ChangeLogoButton")}
                onChange={onChangeLogo}
                isSettingPaid={isSettingPaid}
              />
              <Logo
                title={t("Profile:DarkTheme")}
                src={logoUrls[6].path.dark}
                imageClass="border-img logo-about background-dark"
                inputId={`logoUploader_${WhiteLabelLogoType.AboutPage}_dark`}
                linkId="link-about-dark"
                onChangeText={t("ChangeLogoButton")}
                onChange={onChangeLogo}
                isSettingPaid={isSettingPaid}
              />
            </div>
          </div>
        )}
        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoFavicon")} ({logoUrls[2].size.width}x
            {logoUrls[2].size.height})
          </Text>
          <Logo
            src={logoUrls[2].path.light}
            imageClass="border-img logo-favicon"
            inputId={`logoUploader_${WhiteLabelLogoType.Favicon}_light`}
            linkId="link-favicon"
            onChangeText={t("ChangeLogoButton")}
            onChange={onChangeLogo}
            isSettingPaid={isSettingPaid}
          />
        </div>

        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoDocsEditor")} ({logoUrls[3].size.width}x
            {logoUrls[3].size.height})
          </Text>
          <Logo
            isEditor
            src={logoUrls[3].path.light}
            inputId={`logoUploader_${WhiteLabelLogoType.DocsEditor}_light`}
            linkId="link-editors-header"
            onChangeText={t("ChangeLogoButton")}
            onChange={onChangeLogo}
            isSettingPaid={isSettingPaid}
          />
        </div>

        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoDocsEditorEmbedded")} ({logoUrls[4].size.width}x
            {logoUrls[4].size.height})
          </Text>
          <Logo
            src={logoUrls[4].path.light}
            imageClass="border-img logo-embedded-editor background-white"
            inputId={`logoUploader_${WhiteLabelLogoType.DocsEditorEmbed}_light`}
            linkId="link-embedded-editor"
            onChangeText={t("ChangeLogoButton")}
            onChange={onChangeLogo}
            isSettingPaid={isSettingPaid}
            isEditorHeader
          />
        </div>
      </div>
      <StyledSpacer showReminder={!saveButtonDisabled} />
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSave}
        onCancelClick={onRestoreDefault}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings
        hasScroll
        hideBorder
        showReminder={!saveButtonDisabled}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonDisabled={saveButtonDisabled}
        disableRestoreToDefault={!enableRestoreButton}
        isSaving={isSaving}
        additionalClassSaveButton="white-label-save"
        additionalClassCancelButton="white-label-cancel"
      />
    </WhiteLabelWrapper>
  );
};
