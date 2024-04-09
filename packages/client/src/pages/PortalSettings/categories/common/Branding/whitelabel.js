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

import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { Button } from "@docspace/shared/components/button";
import { Badge } from "@docspace/shared/components/badge";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { toastr } from "@docspace/shared/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
import { size } from "@docspace/shared/utils";

import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import WhiteLabelWrapper from "./StyledWhitelabel";
import LoaderWhiteLabel from "../sub-components/loaderWhiteLabel";

import Logo from "./sub-components/logo";
import {
  generateLogo,
  getLogoOptions,
  uploadLogo,
} from "../../../utils/whiteLabelHelper";

import isEqual from "lodash/isEqual";
import { DeviceType, WhiteLabelLogoType } from "@docspace/shared/enums";

const WhiteLabel = (props) => {
  const {
    t,
    isSettingPaid,
    logoText,
    setLogoText,
    restoreWhiteLabelSettings,
    saveWhiteLabelSettings,
    defaultWhiteLabelLogoUrls,
    getWhiteLabelLogoText,
    initSettings,
    logoUrlsWhiteLabel,
    setLogoUrlsWhiteLabel,
    defaultLogoTextWhiteLabel,
    enableRestoreButton,

    currentDeviceType,
    resetIsInit,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoadedData, setIsLoadedData] = useState(false);
  const [logoTextWhiteLabel, setLogoTextWhiteLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const init = async () => {
    const isWhiteLabelPage = location.pathname.includes("white-label");

    if ((isMobileView && isWhiteLabelPage) || !isMobileView) {
      const page = isMobileView ? "white-label" : "branding";
      await initSettings(page);
    }
  };

  useEffect(() => {
    init();
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
      resetIsInit();
    };
  }, []);

  const checkWidth = () => {
    const url = isManagement()
      ? "/branding"
      : "/portal-settings/customization/branding";

    window.innerWidth > size.mobile &&
      location.pathname.includes("white-label") &&
      navigate(url);
  };

  useEffect(() => {
    const companyNameFromSessionStorage = getFromSessionStorage("companyName");

    if (!companyNameFromSessionStorage) {
      if (!logoText) return;

      setLogoTextWhiteLabel(logoText);
      saveToSessionStorage("companyName", logoText);
    } else {
      setLogoTextWhiteLabel(companyNameFromSessionStorage);
      saveToSessionStorage("companyName", companyNameFromSessionStorage);
    }
  }, [logoText]);

  useEffect(() => {
    if (logoTextWhiteLabel && logoUrlsWhiteLabel.length && !isLoadedData) {
      setIsLoadedData(true);
    }
  }, [isLoadedData, logoTextWhiteLabel, logoUrlsWhiteLabel]);

  const onResetCompanyName = async () => {
    const whlText = await getWhiteLabelLogoText();
    saveToSessionStorage("companyName", whlText);
    setLogoTextWhiteLabel(logoText);
  };

  const onChangeCompanyName = (e) => {
    const value = e.target.value;
    setLogoTextWhiteLabel(value);
    saveToSessionStorage("companyName", value);
  };

  const onUseTextAsLogo = () => {
    let newLogos = logoUrlsWhiteLabel;
    for (let i = 0; i < logoUrlsWhiteLabel.length; i++) {
      const options = getLogoOptions(i, logoTextWhiteLabel);
      const isDocsEditorName = logoUrlsWhiteLabel[i].name === "DocsEditor";

      const logoLight = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        isDocsEditorName ? "#fff" : "#000",
        options.alignCenter,
      );
      const logoDark = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        "#fff",
        options.alignCenter,
      );
      newLogos[i].path.light = logoLight;
      newLogos[i].path.dark = logoDark;
    }

    setLogoUrlsWhiteLabel(newLogos);
  };

  const onRestoreDefault = async () => {
    try {
      await restoreWhiteLabelSettings();
      await onResetCompanyName();
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
  };

  const onChangeLogo = async (e) => {
    const id = e.target.id.split("_");
    const type = id[1];
    const theme = id[2];

    let file = e.target.files[0];

    const { data } = await uploadLogo(file, type);

    if (data.Success) {
      const url = data.Message;
      const newArr = logoUrlsWhiteLabel;

      if (theme === "light") {
        newArr[type - 1].path.light = url;
      } else if (theme === "dark") {
        newArr[type - 1].path.dark = url;
      }

      setLogoUrlsWhiteLabel(newArr);
    } else {
      console.error(data.Message);
      toastr.error(data.Message);
    }
  };

  const onSave = async () => {
    let logosArr = [];

    for (let i = 0; i < logoUrlsWhiteLabel.length; i++) {
      const currentLogo = logoUrlsWhiteLabel[i];
      const defaultLogo = defaultWhiteLabelLogoUrls[i];

      if (!isEqual(currentLogo, defaultLogo)) {
        let value = {};

        if (!isEqual(currentLogo.path.light, defaultLogo.path.light))
          value.light = currentLogo.path.light;
        if (!isEqual(currentLogo.path.dark, defaultLogo.path.dark))
          value.dark = currentLogo.path.dark;

        logosArr.push({
          key: String(i + 1),
          value: value,
        });
      }
    }
    const data = {
      logoText: logoTextWhiteLabel,
      logo: logosArr,
    };

    try {
      setIsSaving(true);
      await saveWhiteLabelSettings(data);
      setLogoText(data.logoText);
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEqualLogo = isEqual(logoUrlsWhiteLabel, defaultWhiteLabelLogoUrls);
  const isEqualText = defaultLogoTextWhiteLabel === logoTextWhiteLabel;
  const saveButtonDisabled = isEqualLogo && isEqualText;

  return !isLoadedData ? (
    <LoaderWhiteLabel />
  ) : (
    <WhiteLabelWrapper showReminder={!saveButtonDisabled}>
      <Text className="subtitle">{t("BrandingSubtitle")}</Text>

      <div className="header-container">
        <Text fontSize="16px" fontWeight="700">
          {t("WhiteLabel")}
        </Text>
        {!isSettingPaid && (
          <Badge
            className="paid-badge"
            fontWeight="700"
            backgroundColor="#EDC409"
            label={t("Common:Paid")}
            isPaidBadge={true}
          />
        )}
      </div>
      <Text className="wl-subtitle settings_unavailable" fontSize="12px">
        {t("WhiteLabelSubtitle")}
      </Text>

      <div className="wl-helper">
        <Text className="wl-helper-label settings_unavailable" as="div">
          {t("WhiteLabelHelper")}
          <HelpButton
            tooltipContent={
              <Text fontSize="12px">{t("WhiteLabelTooltip")}</Text>
            }
            place="right"
            offsetRight={0}
            className="settings_unavailable"
          />
        </Text>
      </div>
      <div className="settings-block">
        <FieldContainer
          id="fieldContainerCompanyName"
          labelText={t("Common:CompanyName")}
          isVertical={true}
          className="settings_unavailable"
        >
          <TextInput
            className="company-name input"
            value={logoTextWhiteLabel}
            onChange={onChangeCompanyName}
            isDisabled={!isSettingPaid}
            isReadOnly={!isSettingPaid}
            scale={true}
            isAutoFocussed={true}
            tabIndex={1}
            maxLength={30}
          />
          <Button
            id="btnUseAsLogo"
            className="use-as-logo"
            size="small"
            label={t("UseAsLogoButton")}
            onClick={onUseTextAsLogo}
            tabIndex={2}
            isDisabled={!isSettingPaid}
          />
        </FieldContainer>
      </div>

      <div className="logos-container">
        <div className="logo-wrapper">
          <Text
            fontSize="15px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {t("LogoLightSmall")} ({logoUrlsWhiteLabel[0].size.width}x
            {logoUrlsWhiteLabel[0].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrlsWhiteLabel[0].path.light}
              imageClass="logo-header background-light"
              inputId={`logoUploader_${WhiteLabelLogoType.LightSmall}_light`}
              linkId="link-space-header-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrlsWhiteLabel[0].path.dark}
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
            {t("LogoCompact")} ({logoUrlsWhiteLabel[5].size.width}x
            {logoUrlsWhiteLabel[5].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrlsWhiteLabel[5].path.light}
              imageClass="border-img logo-compact background-light"
              inputId={`logoUploader_${WhiteLabelLogoType.LeftMenu}_light`}
              linkId="link-compact-left-menu-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrlsWhiteLabel[5].path.dark}
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
            {t("LogoLogin")} ({logoUrlsWhiteLabel[1].size.width}x
            {logoUrlsWhiteLabel[1].size.height})
          </Text>
          <div className="logos-login-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrlsWhiteLabel[1].path.light}
              imageClass="border-img logo-big background-white"
              inputId={`logoUploader_${WhiteLabelLogoType.LoginPage}_light`}
              linkId="link-login-emails-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrlsWhiteLabel[1].path.dark}
              imageClass="border-img logo-big background-dark"
              inputId={`logoUploader_${WhiteLabelLogoType.LoginPage}_dark`}
              linkId="link-login-emails-dark"
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
            {t("LogoAbout")} ({logoUrlsWhiteLabel[6].size.width}x
            {logoUrlsWhiteLabel[6].size.height})
          </Text>
          <div className="logos-wrapper">
            <Logo
              title={t("Profile:LightTheme")}
              src={logoUrlsWhiteLabel[6].path.light}
              imageClass="border-img logo-about background-white"
              inputId={`logoUploader_${WhiteLabelLogoType.AboutPage}_light`}
              linkId="link-about-light"
              onChangeText={t("ChangeLogoButton")}
              onChange={onChangeLogo}
              isSettingPaid={isSettingPaid}
            />
            <Logo
              title={t("Profile:DarkTheme")}
              src={logoUrlsWhiteLabel[6].path.dark}
              imageClass="border-img logo-about background-dark"
              inputId={`logoUploader_${WhiteLabelLogoType.AboutPage}_dark`}
              linkId="link-about-dark"
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
            {t("LogoFavicon")} ({logoUrlsWhiteLabel[2].size.width}x
            {logoUrlsWhiteLabel[2].size.height})
          </Text>
          <Logo
            src={logoUrlsWhiteLabel[2].path.light}
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
            {t("LogoDocsEditor")} ({logoUrlsWhiteLabel[3].size.width}x
            {logoUrlsWhiteLabel[3].size.height})
          </Text>
          <Logo
            isEditor={true}
            src={logoUrlsWhiteLabel[3].path.light}
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
            {t("LogoDocsEditorEmbedded")} ({logoUrlsWhiteLabel[4].size.width}x
            {logoUrlsWhiteLabel[4].size.height})
          </Text>
          <Logo
            src={logoUrlsWhiteLabel[4].path.light}
            imageClass="border-img logo-embedded-editor background-white"
            inputId={`logoUploader_${WhiteLabelLogoType.DocsEditorEmbed}_light`}
            linkId="link-embedded-editor"
            onChangeText={t("ChangeLogoButton")}
            onChange={onChangeLogo}
            isSettingPaid={isSettingPaid}
          />
        </div>
      </div>

      <div className="spacer"></div>

      <SaveCancelButtons
        tabIndex={3}
        className="save-cancel-buttons"
        onSaveClick={onSave}
        onCancelClick={onRestoreDefault}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings={true}
        hasScroll={true}
        hideBorder={true}
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

export default inject(({ settingsStore, common, currentQuotaStore }) => {
  const {
    setLogoText,
    whiteLabelLogoText,
    getWhiteLabelLogoText,
    restoreWhiteLabelSettings,
    initSettings,
    saveWhiteLabelSettings,
    logoUrlsWhiteLabel,
    setLogoUrlsWhiteLabel,
    defaultLogoTextWhiteLabel,
    enableRestoreButton,
    resetIsInit,
  } = common;

  const { whiteLabelLogoUrls: defaultWhiteLabelLogoUrls, currentDeviceType } =
    settingsStore;
  const { isBrandingAndCustomizationAvailable } = currentQuotaStore;

  return {
    setLogoText,
    theme: settingsStore.theme,
    logoText: whiteLabelLogoText,
    getWhiteLabelLogoText,
    saveWhiteLabelSettings,
    restoreWhiteLabelSettings,
    defaultWhiteLabelLogoUrls,
    isSettingPaid: isBrandingAndCustomizationAvailable,
    initSettings,
    logoUrlsWhiteLabel,
    setLogoUrlsWhiteLabel,
    defaultLogoTextWhiteLabel,
    enableRestoreButton,

    currentDeviceType,
    resetIsInit,
  };
})(withTranslation(["Settings", "Profile", "Common"])(observer(WhiteLabel)));
