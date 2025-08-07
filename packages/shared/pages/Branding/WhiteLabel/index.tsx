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
import isEqual from "lodash/isEqual";

import { Text } from "../../../components/text";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { toastr } from "../../../components/toast";
import { WhiteLabelLogoType } from "../../../enums";
import { globalColors } from "../../../themes";

import { useResponsiveNavigation } from "../../../hooks/useResponsiveNavigation";

import { Logo } from "./Logo";
import { WhiteLabelWrapper, StyledSpacer } from "./WhiteLabel.styled";
import { IWhiteLabel, IWhiteLabelData } from "./WhiteLabel.types";
import { getLogoOptions, generateLogo, uploadLogo } from "./WhiteLabel.helper";
import { WhiteLabelHeader } from "./WhiteLabelHeader";
import { brandingRedirectUrl } from "../constants";

export const WhiteLabel = (props: IWhiteLabel) => {
  const {
    t,
    logoUrls,
    isSettingPaid,
    showAbout,
    showNotAvailable,
    standalone,
    onSave,
    onRestoreDefault,
    isSaving,
    enableRestoreButton,
    deviceType,
    setLogoUrls,
    defaultWhiteLabelLogoUrls,
  } = props;
  const [logoTextWhiteLabel, setLogoTextWhiteLabel] = useState("");

  const [isEmptyLogoText, setIsEmptyLogoText] = useState(!logoTextWhiteLabel);

  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "white-label",
    deviceType,
  });

  const onChangeLogoText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLogoTextWhiteLabel(value);
    const trimmedValue = value?.trim();
    setIsEmptyLogoText(!trimmedValue);
  };

  const clearLogoText = () => {
    setLogoTextWhiteLabel("");
    setIsEmptyLogoText(true);
  };

  const onUseTextAsLogo = () => {
    if (isEmptyLogoText) return;

    const newLogos = logoUrls.map((logo, i) => {
      if (!showAbout && logo.name === "AboutPage") return logo;
      if (logo.name === "Notification") return logo;

      const options = getLogoOptions(
        i,
        logoTextWhiteLabel,
        logo.size.width,
        logo.size.height,
      );

      const isLightEditor = logo.name.includes("EditorEmbed");

      const logoLight = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        options.isEditor
          ? isLightEditor
            ? globalColors.darkBlack
            : globalColors.white
          : globalColors.darkBlack,
        options.alignCenter,
        options.isEditor,
      );
      const logoDark = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        globalColors.white,
        options.alignCenter,
        options.isEditor,
      );

      logo.path.light = logoLight;
      logo.path.dark = logoDark;

      return logo;
    });
    setLogoUrls(newLogos);
    setLogoTextWhiteLabel("");
  };

  const onChangeLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id.split("_");
    const type = id[1];
    const theme = id[2];
    const logoName = e.target.name;

    const file = e.target.files && e.target.files[0];

    const response = await uploadLogo(file, type);
    if (!response) return;
    const { data } = response;

    if (data.Success) {
      const url = data.Message;
      const newArr = logoUrls.map((logo, i) => {
        if (logo.name !== logoName) return logo;
        if (theme === "light") logoUrls[i].path.light = url;
        if (theme === "dark") logoUrls[i].path.dark = url;
        return logo;
      });
      setLogoUrls(newArr);
    } else {
      toastr.error(data.Message);
    }
  };

  const onSaveAction = (): void => {
    const logosArr = [];

    for (let i = 0; i < logoUrls.length; i += 1) {
      const currentLogo = logoUrls[i];
      const defaultLogo = defaultWhiteLabelLogoUrls[i];

      if (!isEqual(currentLogo, defaultLogo)) {
        const value: Partial<{ light: string; dark: string }> = {};

        if (!isEqual(currentLogo.path.light, defaultLogo.path.light))
          value.light = currentLogo.path.light;
        if (!isEqual(currentLogo.path.dark, defaultLogo.path.dark))
          value.dark = currentLogo.path.dark;

        logosArr.push({
          key: String(i + 1),
          value,
        });
      }
    }
    const data: IWhiteLabelData = {
      logoText: "",
      logo: logosArr,
    };
    onSave(data);
  };

  const isEqualLogo = isEqual(logoUrls, defaultWhiteLabelLogoUrls);

  return (
    <WhiteLabelWrapper>
      <WhiteLabelHeader
        t={t}
        showNotAvailable={showNotAvailable}
        isSettingPaid={isSettingPaid}
        standalone={standalone}
        onUseTextAsLogo={onUseTextAsLogo}
        isEmpty={isEmptyLogoText}
        logoTextWhiteLabel={logoTextWhiteLabel}
        onClear={clearLogoText}
        onChange={onChangeLogoText}
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
              name={logoUrls[0].name}
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
              name={logoUrls[0].name}
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
              name={logoUrls[5].name}
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
              name={logoUrls[5].name}
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
              name={logoUrls[1].name}
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
              name={logoUrls[1].name}
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

        {showAbout ? (
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
                name={logoUrls[6].name}
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
                name={logoUrls[6].name}
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
        ) : null}
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
            name={logoUrls[2].name}
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
            {t("LogoForEditors", { editorName: t("Common:Documents") })} (
            {logoUrls[3].size.width}x{logoUrls[3].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              name={logoUrls[4].name}
              src={logoUrls[4].path.light}
              imageClass="border-img logo-docs-editor background-light-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.DocsEditorEmbed}_light`}
              linkId="link-embedded-editor"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              name={logoUrls[3].name}
              src={logoUrls[3].path.light}
              imageClass="border-img logo-docs-editor background-dark-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.DocsEditor}_light`}
              linkId="link-editors-header"
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
            {t("LogoForEditors", { editorName: t("Common:Spreadsheet") })} (
            {logoUrls[9].size.width}x{logoUrls[9].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              name={logoUrls[9].name}
              src={logoUrls[9].path.light}
              imageClass="border-img logo-docs-editor background-light-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.SpreadsheetEditorEmbed}_light`}
              linkId="link-embedded-editor"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              name={logoUrls[8].name}
              src={logoUrls[8].path.light}
              imageClass="border-img logo-docs-editor background-dark-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.SpreadsheetEditor}_light`}
              linkId="link-editors-header"
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
            {t("LogoForEditors", { editorName: t("Common:Presentation") })} (
            {logoUrls[11].size.width}x{logoUrls[11].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              name={logoUrls[11].name}
              src={logoUrls[11].path.light}
              imageClass="border-img logo-docs-editor background-light-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.PresentationEditorEmbed}_light`}
              linkId="link-embedded-editor"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              name={logoUrls[10].name}
              src={logoUrls[10].path.light}
              imageClass="border-img logo-docs-editor background-dark-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.PresentationEditor}_light`}
              linkId="link-editors-header"
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
            {t("LogoForEditors", { editorName: t("Common:PDF") })} (
            {logoUrls[13].size.width}x{logoUrls[13].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              name={logoUrls[13].name}
              src={logoUrls[13].path.light}
              imageClass="border-img logo-docs-editor background-light-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.PdfEditorEmbed}_light`}
              linkId="link-embedded-editor"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              name={logoUrls[12].name}
              src={logoUrls[12].path.light}
              imageClass="border-img logo-docs-editor background-dark-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.PdfEditor}_light`}
              linkId="link-editors-header"
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
            {t("LogoForViewer", { diagramViewer: t("Common:DiagramViewer") })} (
            {logoUrls[15].size.width}x{logoUrls[15].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              name={logoUrls[15].name}
              src={logoUrls[15].path.light}
              imageClass="border-img logo-docs-editor background-light-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.DiagramEditorEmbed}_light`}
              linkId="link-embedded-editor"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              name={logoUrls[14].name}
              src={logoUrls[14].path.light}
              imageClass="border-img logo-docs-editor background-dark-editor"
              inputId={`logoUploader_${WhiteLabelLogoType.DiagramEditor}_light`}
              linkId="link-editors-header"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
          </div>
        </div>
      </div>
      <StyledSpacer showReminder={!isEqualLogo} />
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveAction}
        onCancelClick={onRestoreDefault}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings
        hasScroll
        hideBorder
        showReminder={!isEqualLogo}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonDisabled={isEqualLogo}
        disableRestoreToDefault={!enableRestoreButton}
        isSaving={isSaving}
        additionalClassSaveButton="white-label-save"
        additionalClassCancelButton="white-label-cancel"
      />
    </WhiteLabelWrapper>
  );
};
