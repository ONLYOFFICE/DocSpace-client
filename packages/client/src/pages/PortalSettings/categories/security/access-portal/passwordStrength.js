import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Slider } from "@docspace/shared/components/slider";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { LearnMoreWrapper } from "../StyledSecurity";
import { toastr } from "@docspace/shared/components/toast";
import { size } from "@docspace/shared/utils";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import PasswordLoader from "../sub-components/loaders/password-loader";
import { DeviceType } from "@docspace/shared/enums";

const MainContainer = styled.div`
  width: 100%;

  .password-slider {
    width: 160px;
    height: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 24px 0px 24px 16px;
          `
        : css`
            margin: 24px 16px 24px 0px;
          `}
  }

  .checkboxes {
    display: inline-block;
    margin-top: 18px;
    margin-bottom: 24px;

    .second-checkbox {
      margin: 8px 0;
    }
  }
`;

const PasswordStrength = (props) => {
  const {
    t,
    setPortalPasswordSettings,
    passwordSettings,
    initSettings,
    isInit,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
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
    checkWidth();
    window.addEventListener("resize", checkWidth);

    if (!isInit) initSettings("password").then(() => setIsLoading(true));
    else setIsLoading(true);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isInit || !passwordSettings) return;
    getSettings();
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

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("password") &&
      navigate("/portal-settings/security/access-portal");
  };

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
        useSpecialSymbols
      );
      setShowReminder(false);
      saveToSessionStorage("currentPasswordSettings", data);
      saveToSessionStorage("defaultPasswordSettings", data);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(e);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");
    saveToSessionStorage("currentPasswordSettings", defaultSettings);
    setPasswordLen(defaultSettings.minLength);
    setUseUpperCase(defaultSettings.upperCase);
    setUseDigits(defaultSettings.digits);
    setUseSpecialSymbols(defaultSettings.specSymbols);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isInit && !isLoading) {
    return <PasswordLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400">
          {t("SettingPasswordDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main.accent}
          target="_blank"
          isHovered
          href={passwordStrengthSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </LearnMoreWrapper>
      <Text fontSize="14px" fontWeight="600" className="length-subtitle">
        {t("PasswordMinLenght")}
      </Text>
      <Box displayProp="flex" flexDirection="row" alignItems="center">
        <Slider
          className="password-slider"
          min="8"
          max="30"
          step="1"
          withPouring={true}
          value={passwordLen}
          onChange={onSliderChange}
        />
        <Text>
          {t("Characters", {
            length: passwordLen,
          })}
        </Text>
      </Box>
      <Box className="checkboxes">
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
      </Box>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings={true}
        hasScroll={false}
        isSaving={isSaving}
        additionalClassSaveButton="password-strength-save"
        additionalClassCancelButton="password-strength-cancel"
      />
    </MainContainer>
  );
};

export default inject(({ auth, setup }) => {
  const {
    setPortalPasswordSettings,
    passwordSettings,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
  } = auth.settingsStore;
  const { initSettings, isInit } = setup;

  return {
    setPortalPasswordSettings,
    passwordSettings,
    initSettings,
    isInit,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(PasswordStrength)));
