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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Slider } from "@docspace/shared/components/slider";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { toastr } from "@docspace/shared/components/toast";
import { size } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import PasswordLoader from "../sub-components/loaders/password-loader";
import { LearnMoreWrapper } from "../StyledSecurity";

const MainContainer = styled.div`
  width: 100%;

  .password-slider {
    width: 160px;
    height: 8px;
    margin-block: 24px;
    margin-inline: 0 16px;
  }

  .checkboxes {
    box-sizing: border-box;
    display: inline-block;
    margin-top: 18px;
    margin-bottom: 24px;

    .second-checkbox {
      margin: 8px 0;
    }
  }

  .slider-box {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const PasswordStrength = (props) => {
  const {
    t,
    setPortalPasswordSettings,
    passwordSettings,
    isInit,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
    getPortalPasswordSettings,
    onSettingsSkeletonNotShown,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [passwordLen, setPasswordLen] = useState(8);
  const [useUpperCase, setUseUpperCase] = useState(false);
  const [useDigits, setUseDigits] = useState(false);
  const [useSpecialSymbols, setUseSpecialSymbols] = useState(false);

  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("password") &&
      navigate("/portal-settings/security/access-portal");
  };

  const load = async () => {
    if (!isInit) await getPortalPasswordSettings();
    setIsLoading(true);
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");
    if (defaultSettings) {
      setPasswordLen(defaultSettings.minLength);
      setUseUpperCase(defaultSettings.upperCase);
      setUseDigits(defaultSettings.digits);
      setUseSpecialSymbols(defaultSettings.specSymbols);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentPasswordSettings");

    const defaultData = {
      minLength: passwordSettings.minLength,
      upperCase: passwordSettings.upperCase,
      digits: passwordSettings.digits,
      specSymbols: passwordSettings.specSymbols,
    };
    saveToSessionStorage("defaultPasswordSettings", defaultData);

    if (currentSettings) {
      setPasswordLen(currentSettings.minLength);
      setUseUpperCase(currentSettings.upperCase);
      setUseDigits(currentSettings.digits);
      setUseSpecialSymbols(currentSettings.specSymbols);
    } else {
      setPasswordLen(passwordSettings.minLength);
      setUseUpperCase(passwordSettings.upperCase);
      setUseDigits(passwordSettings.digits);
      setUseSpecialSymbols(passwordSettings.specSymbols);
    }
  };

  useEffect(() => {
    if (!onSettingsSkeletonNotShown) return;
    if (!(currentDeviceType !== DeviceType.desktop && !isLoading))
      onSettingsSkeletonNotShown("PasswordStrength");
  }, [currentDeviceType, isLoading, onSettingsSkeletonNotShown]);

  useEffect(() => {
    load();
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isLoading || !passwordSettings) return;
    const currentSettings = getFromSessionStorage("currentPasswordSettings");
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading, passwordSettings]);

  useEffect(() => {
    if (!isLoading) return;
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");

    const newSettings = {
      minLength: passwordLen,
      upperCase: useUpperCase,
      digits: useDigits,
      specSymbols: useSpecialSymbols,
    };

    saveToSessionStorage("currentPasswordSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [passwordLen, useUpperCase, useDigits, useSpecialSymbols]);

  const onSliderChange = (e) => {
    setPasswordLen(Number(e.target.value));
  };

  const onClickCheckbox = (e) => {
    switch (e.target.value) {
      case "upperCase":
        setUseUpperCase(e.target.checked);
        break;
      case "digits":
        setUseDigits(e.target.checked);
        break;
      case "special":
        setUseSpecialSymbols(e.target.checked);
        break;
      default:
        break;
    }
  };

  const onSaveClick = async () => {
    setIsSaving(true);

    try {
      const data = {
        minLength: passwordLen,
        upperCase: useUpperCase,
        digits: useDigits,
        specSymbols: useSpecialSymbols,
      };
      await setPortalPasswordSettings(
        passwordLen,
        useUpperCase,
        useDigits,
        useSpecialSymbols,
      );
      setShowReminder(false);
      saveToSessionStorage("currentPasswordSettings", data);
      saveToSessionStorage("defaultPasswordSettings", data);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");
    saveToSessionStorage("currentPasswordSettings", defaultSettings);
    setPasswordLen(defaultSettings?.minLength || 8);
    setUseUpperCase(defaultSettings?.upperCase);
    setUseDigits(defaultSettings?.digits);
    setUseSpecialSymbols(defaultSettings?.specSymbols);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isLoading) {
    return <PasswordLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper withoutExternalLink={!passwordStrengthSettingsUrl}>
        <Text fontSize="13px" fontWeight="400">
          {t("SettingPasswordDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        {passwordStrengthSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={passwordStrengthSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </LearnMoreWrapper>
      <Text fontSize="14px" fontWeight="600" className="length-subtitle">
        {t("PasswordMinLenght")}
      </Text>
      <div className="slider-box">
        <Slider
          className="password-slider"
          min="8"
          max="30"
          step="1"
          withPouring
          value={passwordLen}
          onChange={onSliderChange}
        />
        <Text>
          {t("Characters", {
            length: passwordLen,
          })}
        </Text>
      </div>
      <div className="checkboxes">
        <Checkbox
          className="use-upper-case"
          onChange={onClickCheckbox}
          label={t("UseUpperCase")}
          isChecked={useUpperCase}
          value="upperCase"
        />
        <Checkbox
          className="use-digits second-checkbox"
          onChange={onClickCheckbox}
          label={t("UseDigits")}
          isChecked={useDigits}
          value="digits"
        />
        <Checkbox
          className="use-special-char second-checkbox"
          onChange={onClickCheckbox}
          label={t("UseSpecialChar")}
          isChecked={useSpecialSymbols}
          value="special"
        />
      </div>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
        additionalClassSaveButton="password-strength-save"
        additionalClassCancelButton="password-strength-cancel"
      />
    </MainContainer>
  );
};

export const PasswordStrengthSection = inject(({ settingsStore, setup }) => {
  const {
    setPortalPasswordSettings,
    passwordSettings,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
    getPortalPasswordSettings,
  } = settingsStore;
  const { isInit } = setup;

  return {
    setPortalPasswordSettings,
    passwordSettings,
    isInit,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
    getPortalPasswordSettings,
  };
})(withTranslation(["Settings", "Common"])(observer(PasswordStrength)));
